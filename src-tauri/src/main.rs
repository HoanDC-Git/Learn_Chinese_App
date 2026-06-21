#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod domain;
mod infra;
mod app;

use app::state::AppState;
use domain::config;
use infra::database::DatabaseManager;
use infra::commands::{flashcard, dictionary, tts, grammar, srs, config as app_config, decomposition};
use tauri::Manager;

#[tokio::main]
async fn main() -> anyhow::Result<()> {
    env_logger::init();

    let saved_config = config::get_saved_config();
    let bg_color = if saved_config.theme == "dark" { "#0f172a" } else { "#f8fafc" };

    let db_manager = DatabaseManager::new().await?;
    let app_state = AppState::new(db_manager);

    app_state.refresh_flashcards_cache().await;
    app_state.load_decomposition_variants().await;
    log::info!("Data loaded into RAM cache");

    let now = chrono::Utc::now();
    let expired = sqlx::query_as::<_, crate::infra::models::TrashItem>(
        "SELECT * FROM trash WHERE auto_delete_at <= ?"
    )
    .bind(now)
    .fetch_all(&app_state.db.app_db)
    .await
    .unwrap_or_default();

    for item in expired {
        let _ = sqlx::query("DELETE FROM flashcards WHERE id = ?")
            .bind(item.flashcard_id)
            .execute(&app_state.db.app_db)
            .await;
    }

    let _ = sqlx::query("DELETE FROM trash WHERE auto_delete_at <= ?")
        .bind(now)
        .execute(&app_state.db.app_db)
        .await;
    log::info!("Expired trash cleaned up on startup");

    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .manage(app_state)
        .setup(|app| {
            let window = app.get_webview_window("main").unwrap();
            window.set_background_color(Some(bg_color.parse().unwrap())).ok();
            
            // Clean up any remaining temp files from previous sessions
            infra::commands::tts::cleanup_temp_files();
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            flashcard::get_due_flashcards,
            flashcard::get_random_flashcards,
            flashcard::get_all_flashcards,
            flashcard::search_flashcards,
            flashcard::create_flashcard,
            flashcard::update_flashcard,
            flashcard::delete_flashcard,
            flashcard::record_review_result,
            flashcard::undo_review_result,
            flashcard::get_trash_items,
            flashcard::restore_from_trash,
            flashcard::permanent_delete,
            flashcard::cleanup_expired_trash,
            dictionary::search_dictionary,
            dictionary::lookup_word,
            dictionary::lookup_hover,
            tts::generate_audio,
            tts::get_available_voices,
            tts::read_audio_file,
            tts::check_audio_exists,
            tts::clear_audio_cache,
            tts::delete_single_audio,
            tts::speak_text,
            grammar::get_all_grammar_notes,
            grammar::create_grammar_note,
            grammar::update_grammar_note,
            grammar::delete_grammar_note,
            grammar::get_grammar_categories,
            grammar::get_grammar_points,
            grammar::get_grammar_point_details,
            grammar::get_learned_grammar_points,
            grammar::toggle_grammar_point_learned,
            srs::get_statistics,
            srs::get_review_plan,
            app_config::get_app_config,
            app_config::save_app_config,
            decomposition::search_decomposition,
            decomposition::lookup_decomposition,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");

    Ok(())
}
