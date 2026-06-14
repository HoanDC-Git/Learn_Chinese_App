use std::fs;
use std::path::PathBuf;
use serde::{Serialize, Deserialize};

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct AppConfig {
    pub theme: String,
    pub grammar_show_pinyin: bool,
    pub grammar_show_english: bool,
}

impl Default for AppConfig {
    fn default() -> Self {
        Self {
            theme: "light".to_string(),
            grammar_show_pinyin: true,
            grammar_show_english: true,
        }
    }
}

fn get_config_dir() -> PathBuf {
    let manifest = std::path::PathBuf::from(env!("CARGO_MANIFEST_DIR"));
    manifest.parent().unwrap().join("data")
}

fn get_config_path() -> PathBuf {
    get_config_dir().join("config.json")
}

fn get_legacy_theme_config_path() -> PathBuf {
    get_config_dir().join("theme_config.json")
}

pub fn get_saved_config() -> AppConfig {
    let config_path = get_config_path();
    
    // Check if new config exists
    if config_path.exists() {
        if let Ok(content) = fs::read_to_string(&config_path) {
            if let Ok(config) = serde_json::from_str::<AppConfig>(&content) {
                return config;
            }
        }
    }
    
    // Try migrating from legacy theme_config.json
    let legacy_path = get_legacy_theme_config_path();
    let mut theme = "light".to_string();
    let mut legacy_found = false;
    
    if legacy_path.exists() {
        if let Ok(content) = fs::read_to_string(&legacy_path) {
            if content.contains("\"dark\"") {
                theme = "dark".to_string();
                legacy_found = true;
            } else if content.contains("\"light\"") {
                theme = "light".to_string();
                legacy_found = true;
            }
        }
    }
    
    let config = AppConfig {
        theme,
        grammar_show_pinyin: true,
        grammar_show_english: true,
    };
    
    // Save the new config
    let _ = save_config(&config);
    
    // If legacy was migrated, delete the legacy file
    if legacy_found {
        let _ = fs::remove_file(legacy_path);
    }
    
    config
}

pub fn save_config(config: &AppConfig) -> Result<(), String> {
    let path = get_config_path();
    let dir = path.parent().unwrap();
    fs::create_dir_all(dir).map_err(|e| e.to_string())?;
    let json = serde_json::to_string_pretty(config).map_err(|e| e.to_string())?;
    fs::write(&path, json).map_err(|e| e.to_string())
}
