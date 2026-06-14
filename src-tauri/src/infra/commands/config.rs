use crate::domain::config::{self, AppConfig};

#[tauri::command]
pub fn get_app_config() -> Result<AppConfig, String> {
    Ok(config::get_saved_config())
}

#[tauri::command]
pub fn save_app_config(config: AppConfig) -> Result<(), String> {
    if config.theme != "light" && config.theme != "dark" {
        return Err("Invalid theme".to_string());
    }
    config::save_config(&config)
}
