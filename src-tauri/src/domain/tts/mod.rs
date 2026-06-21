use edge_tts_rust::{EdgeTtsClient, SpeakOptions};
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
    let client = EdgeTtsClient::new()?;
    
    let mut rate = "+0%".to_string();
    let mut volume = "+0%".to_string();
    
    if voice.contains("Yunjian") {
        rate = "-10%".to_string();
    }
    if !voice.contains("Xiaoxiao") {
        volume = "+40%".to_string();
    }
    
    let options = SpeakOptions {
        voice: voice.into(),
        rate,
        volume,
        ..SpeakOptions::default()
    };
    
    let result = client.synthesize(text, options).await?;
    
    if result.audio.is_empty() {
        anyhow::bail!("edge-tts generated an empty audio file");
    }
    
    tokio::fs::write(output_path, &result.audio).await?;
    
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
        assert_eq!(voices.len(), 3);
    }
}
