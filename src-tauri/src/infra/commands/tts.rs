use crate::app::state::AppState;
use crate::domain::tts::{self, TtsResponse};
use md5::Md5;
use md5::Digest;
use std::collections::HashSet;
use tauri::State;
use once_cell::sync::Lazy;
use std::sync::Mutex;

static LAST_PLAYED_TEMP_FILE: Lazy<Mutex<Option<String>>> = Lazy::new(|| Mutex::new(None));


fn get_audio_dir() -> std::path::PathBuf {
    let manifest = std::path::PathBuf::from(env!("CARGO_MANIFEST_DIR"));
    manifest
        .parent()
        .unwrap()
        .join("data")
        .join("audio")
}

fn hash_hanzi(text: &str) -> String {
    let mut hasher = Md5::new();
    hasher.update(text.as_bytes());
    hex::encode(hasher.finalize())
}

#[tauri::command]
pub async fn generate_audio(text: String, voice: Option<String>) -> Result<TtsResponse, String> {
    let selected_voice = tts::select_voice(voice.as_deref());
    let audio_dir = get_audio_dir();
    std::fs::create_dir_all(&audio_dir).map_err(|e| e.to_string())?;
    let hash_name = hash_hanzi(&text);
    let output_path = audio_dir.join(format!("{}.mp3", hash_name));

    let file_exists_and_not_empty = output_path.exists()
        && std::fs::metadata(&output_path).map(|m| m.len()).unwrap_or(0) > 0;

    if file_exists_and_not_empty {
        return Ok(TtsResponse {
            audio_path: output_path.to_string_lossy().to_string(),
            voice_used: selected_voice.to_string(),
            success: true,
        });
    }

    if output_path.exists() {
        let _ = std::fs::remove_file(&output_path);
    }

    match tts::generate_tts_audio(&text, &selected_voice, output_path.to_str().unwrap()).await {
        Ok(path) => Ok(TtsResponse {
            audio_path: path,
            voice_used: selected_voice.to_string(),
            success: true,
        }),
        Err(e) => Err(format!("TTS failed: {}", e)),
    }
}

#[tauri::command]
pub async fn get_available_voices(_state: State<'_, AppState>) -> Result<Vec<String>, String> {
    Ok(tts::get_available_voices())
}

pub async fn read_audio_file_as_base64(audio_path: &str) -> Result<String, String> {
    let bytes = tokio::fs::read(audio_path).await.map_err(|e| e.to_string())?;
    use base64::{engine::general_purpose::STANDARD, Engine as _};
    Ok(STANDARD.encode(bytes))
}

#[tauri::command]
pub async fn read_audio_file(audio_path: String) -> Result<String, String> {
    read_audio_file_as_base64(&audio_path).await
}

#[tauri::command]
pub async fn check_audio_exists(text: String) -> Result<bool, String> {
    let audio_dir = get_audio_dir();
    let hash_name = hash_hanzi(&text);
    let mp3_path = audio_dir.join(format!("{}.mp3", hash_name));
    let wav_path = audio_dir.join(format!("{}.wav", hash_name));
    Ok(mp3_path.exists() || wav_path.exists())
}

#[tauri::command]
pub async fn clear_audio_cache(state: State<'_, AppState>) -> Result<i64, String> {
    let audio_dir = get_audio_dir();

    if !audio_dir.exists() {
        return Ok(0);
    }

    let valid_hashes: HashSet<String> = {
        let cache = state.flashcards_cache.read().map_err(|e| e.to_string())?;
        cache
            .iter()
            .map(|c| hash_hanzi(&c.hanzi))
            .collect()
    };

    let mut removed = 0i64;

    for entry in std::fs::read_dir(&audio_dir).map_err(|e| e.to_string())? {
        let entry = entry.map_err(|e| e.to_string())?;
        let path = entry.path();

        if path.is_file() {
            let ext = path.extension().and_then(|e| e.to_str());
            if ext == Some("mp3") || ext == Some("wav") {
                let stem = path
                    .file_stem()
                    .map(|s| s.to_string_lossy().to_string())
                    .unwrap_or_default();

                if !valid_hashes.contains(&stem) {
                    if std::fs::remove_file(&path).is_ok() {
                        removed += 1;
                    }
                }
            }
        }
    }

    log::info!("Cleared {} orphaned audio files", removed);
    Ok(removed)
}

#[tauri::command]
pub async fn delete_single_audio(text: String) -> Result<bool, String> {
    let audio_dir = get_audio_dir();
    let hash_name = hash_hanzi(&text);
    let mp3_path = audio_dir.join(format!("{}.mp3", hash_name));
    let wav_path = audio_dir.join(format!("{}.wav", hash_name));

    if mp3_path.exists() {
        std::fs::remove_file(&mp3_path).map_err(|e| e.to_string())?;
        return Ok(true);
    }

    if wav_path.exists() {
        std::fs::remove_file(&wav_path).map_err(|e| e.to_string())?;
        return Ok(true);
    }

    Ok(false)
}

#[tauri::command]
pub async fn speak_text(
    text: String,
    voice: Option<String>,
) -> Result<String, String> {
    let selected_voice = tts::select_voice(voice.as_deref());
    let audio_dir = get_audio_dir();
    std::fs::create_dir_all(&audio_dir).map_err(|e| e.to_string())?;

    let hash_name = hash_hanzi(&text);
    let temp_filename = format!("temp_{}.mp3", hash_name);
    let temp_path = audio_dir.join(&temp_filename);
    let temp_path_str = temp_path.to_string_lossy().to_string();

    let file_exists_and_not_empty = temp_path.exists()
        && std::fs::metadata(&temp_path).map(|m| m.len()).unwrap_or(0) > 0;

    // 1. Generate TTS to the temp file only if it doesn't exist or is empty
    if !file_exists_and_not_empty {
        if temp_path.exists() {
            let _ = std::fs::remove_file(&temp_path);
        }
        if let Err(e) = tts::generate_tts_audio(&text, &selected_voice, &temp_path_str).await {
            return Err(format!("TTS Generation failed: {}", e));
        }
    }

    // 2. Remove the previous temp file since we are playing a new one
    {
        let mut last_file = LAST_PLAYED_TEMP_FILE.lock().unwrap();
        if let Some(prev_path) = last_file.as_ref() {
            if *prev_path != temp_path_str {
                let _ = std::fs::remove_file(prev_path);
            }
        }
        *last_file = Some(temp_path_str.clone());
    }

    read_audio_file_as_base64(&temp_path_str).await
}

// Clean up all leftover temp_*.mp3 files on startup
pub fn cleanup_temp_files() {
    let audio_dir = get_audio_dir();
    if audio_dir.exists() {
        if let Ok(entries) = std::fs::read_dir(audio_dir) {
            for entry in entries.flatten() {
                let path = entry.path();
                if path.is_file() {
                    if let Some(filename) = path.file_name().and_then(|f| f.to_str()) {
                        if filename.starts_with("temp_") && filename.ends_with(".mp3") {
                            let _ = std::fs::remove_file(path);
                        }
                    }
                }
            }
        }
    }
}

