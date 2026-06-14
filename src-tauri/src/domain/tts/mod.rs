use rand::seq::SliceRandom;
use serde::{Deserialize, Serialize};

const VOICES: &[&str] = &[
    "zh-CN-XiaoxiaoNeural",
    "zh-CN-XiaoyiNeural",
    "zh-CN-YunjianNeural",
];

#[allow(dead_code)]
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TtsRequest {
    pub text: String,
    pub voice: Option<String>,
    pub output_path: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TtsResponse {
    pub audio_path: String,
    pub voice_used: String,
    pub success: bool,
}

pub fn select_random_voice() -> &'static str {
    VOICES.choose(&mut rand::thread_rng()).unwrap()
}

pub fn select_voice(preferred: Option<&str>) -> String {
    preferred
        .filter(|v| VOICES.contains(v))
        .map(|s| s.to_string())
        .unwrap_or_else(|| select_random_voice().to_string())
}

pub async fn generate_tts_audio(text: &str, voice: &str, output_path: &str) -> anyhow::Result<String> {
    let mut cmd = tokio::process::Command::new("edge-tts");
    cmd.arg("--voice").arg(voice);

    if voice.contains("Yunjian") {
        cmd.arg("--rate=-10%");
    }
    if !voice.contains("Xiaoxiao") {
        cmd.arg("--volume=+40%");
    }

    cmd.arg("--text")
        .arg(text)
        .arg("--write-media")
        .arg(output_path);

    let mut child = cmd.spawn()?;

    let status_result = tokio::time::timeout(
        tokio::time::Duration::from_secs(10),
        child.wait()
    ).await;

    let status = match status_result {
        Ok(Ok(s)) => s,
        Ok(Err(e)) => {
            let _ = std::fs::remove_file(output_path);
            anyhow::bail!("edge-tts failed to execute: {}", e);
        }
        Err(_) => {
            let _ = std::fs::remove_file(output_path);
            let _ = child.kill().await;
            anyhow::bail!("edge-tts timed out after 10 seconds");
        }
    };

    if !status.success() {
        let _ = std::fs::remove_file(output_path);
        anyhow::bail!("edge-tts failed with status: {}", status);
    }

    // Check if the generated file is empty or missing
    match std::fs::metadata(output_path) {
        Ok(m) if m.len() == 0 => {
            let _ = std::fs::remove_file(output_path);
            anyhow::bail!("edge-tts generated an empty audio file");
        }
        Err(e) => {
            let _ = std::fs::remove_file(output_path);
            anyhow::bail!("Failed to verify generated audio file: {}", e);
        }
        _ => {}
    }

    tokio::time::sleep(tokio::time::Duration::from_millis(200)).await;

    Ok(output_path.to_string())
}

#[allow(dead_code)]
fn sanitize_filename(text: &str) -> String {
    text.chars()
        .filter(|c| c.is_alphanumeric() || *c == '-' || *c == '_')
        .take(50)
        .collect()
}

pub fn get_available_voices() -> Vec<String> {
    VOICES.iter().map(|&s| s.to_string()).collect()
}






#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_select_random_voice_returns_valid_voice() {
        let voice = select_random_voice();
        assert!(VOICES.contains(&voice));
    }

    #[test]
    fn test_select_voice_with_valid_preference() {
        let voice = select_voice(Some("zh-CN-XiaoxiaoNeural"));
        assert_eq!(voice, "zh-CN-XiaoxiaoNeural".to_string());
    }

    #[test]
    fn test_select_voice_with_invalid_preference() {
        let voice = select_voice(Some("invalid-voice"));
        assert!(VOICES.contains(&voice.as_str()));
    }

    #[test]
    fn test_get_available_voices_count() {
        let voices = get_available_voices();
        assert_eq!(voices.len(), 4);
    }
}
