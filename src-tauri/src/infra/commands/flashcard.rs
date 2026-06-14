use crate::app::state::AppState;
use crate::domain::srs;
use crate::infra::models::{CreateFlashcard, Flashcard, FlashcardSearchRequest, FlashcardSearchResult, ReviewResult, UpdateFlashcard};
use chrono::Utc;
use tauri::State;

#[tauri::command]
pub async fn get_due_flashcards(state: State<'_, AppState>) -> Result<Vec<Flashcard>, String> {
    let now = Utc::now();

    let cache = state.flashcards_cache.read().map_err(|e| e.to_string())?;
    let mut due: Vec<Flashcard> = cache
        .iter()
        .filter(|c| c.deleted_at.is_none() && (c.next_review.is_none() || c.next_review.unwrap() <= now))
        .cloned()
        .collect();

    use rand::seq::SliceRandom;
    due.shuffle(&mut rand::thread_rng());

    Ok(due)
}

#[tauri::command]
pub async fn get_random_flashcards(
    state: State<'_, AppState>,
    limit: i64,
) -> Result<Vec<Flashcard>, String> {
    let cache = state.flashcards_cache.read().map_err(|e| e.to_string())?;
    let mut all: Vec<Flashcard> = cache.iter().filter(|c| c.deleted_at.is_none()).cloned().collect();
    drop(cache);

    use rand::seq::SliceRandom;
    all.shuffle(&mut rand::thread_rng());

    let limit = limit as usize;
    if all.len() > limit {
        all.truncate(limit);
    }

    Ok(all)
}

#[tauri::command]
pub async fn get_all_flashcards(state: State<'_, AppState>) -> Result<Vec<Flashcard>, String> {
    let cache = state.flashcards_cache.read().map_err(|e| e.to_string())?;
    let mut cards = cache.iter().filter(|c| c.deleted_at.is_none()).cloned().collect::<Vec<_>>();
    cards.sort_by(|a, b| b.date_added.cmp(&a.date_added));
    Ok(cards)
}

#[tauri::command]
pub async fn search_flashcards(
    state: State<'_, AppState>,
    req: FlashcardSearchRequest,
) -> Result<FlashcardSearchResult, String> {
    let cache = state.flashcards_cache.read().map_err(|e| e.to_string())?;
    let mut cards: Vec<Flashcard> = cache
        .iter()
        .filter(|c| c.deleted_at.is_none())
        .cloned()
        .collect();
    drop(cache);

    let query = req.query.trim();
    if !query.is_empty() {
        cards.retain(|c| {
            c.hanzi.contains(query)
                || c.pinyin.as_ref().map(|p| p.to_lowercase().contains(&query.to_lowercase())).unwrap_or(false)
                || c.meaning.as_ref().map(|m| m.to_lowercase().contains(&query.to_lowercase())).unwrap_or(false)
        });
    }

    if let Some(level) = req.filter_level {
        cards.retain(|c| c.level == level);
    }

    let total = cards.len() as i64;

    if req.sort_field == "level" {
        if req.sort_order == "asc" {
            cards.sort_by(|a, b| a.level.cmp(&b.level));
        } else {
            cards.sort_by(|a, b| b.level.cmp(&a.level));
        }
    } else {
        if req.sort_order == "asc" {
            cards.sort_by(|a, b| a.date_added.cmp(&b.date_added));
        } else {
            cards.sort_by(|a, b| b.date_added.cmp(&a.date_added));
        }
    }

    let start = (req.page * req.page_size) as usize;
    let end = (start + req.page_size as usize).min(cards.len());
    let page_cards = if start < cards.len() {
        cards[start..end].to_vec()
    } else {
        Vec::new()
    };

    Ok(FlashcardSearchResult {
        cards: page_cards,
        total,
        page: req.page,
        page_size: req.page_size,
    })
}

#[tauri::command]
pub async fn create_flashcard(
    state: State<'_, AppState>,
    data: CreateFlashcard,
) -> Result<Flashcard, String> {
    let now = Utc::now();
    let yesterday = now - chrono::Duration::days(1);

    let card = sqlx::query_as::<_, Flashcard>(
        r#"
        INSERT INTO flashcards (hanzi, pinyin, meaning, date_added, level, next_review)
        VALUES (?, ?, ?, ?, 0, ?)
        RETURNING id, hanzi, pinyin, meaning, date_added, level, next_review, deleted_at
        "#,
    )
    .bind(&data.hanzi)
    .bind(&data.pinyin)
    .bind(&data.meaning)
    .bind(now)
    .bind(yesterday)
    .fetch_one(&state.db.app_db)
    .await
    .map_err(|e| e.to_string())?;

    state.refresh_flashcards_cache().await;

    Ok(card)
}

#[tauri::command]
pub async fn update_flashcard(
    state: State<'_, AppState>,
    data: UpdateFlashcard,
) -> Result<Flashcard, String> {
    let card = sqlx::query_as::<_, Flashcard>(
        r#"
        UPDATE flashcards
        SET
            hanzi = COALESCE(?, hanzi),
            pinyin = COALESCE(?, pinyin),
            meaning = COALESCE(?, meaning),
            level = COALESCE(?, level),
            next_review = COALESCE(?, next_review)
        WHERE id = ?
        RETURNING id, hanzi, pinyin, meaning, date_added, level, next_review, deleted_at
        "#,
    )
    .bind(&data.hanzi)
    .bind(&data.pinyin)
    .bind(&data.meaning)
    .bind(&data.level)
    .bind(&data.next_review)
    .bind(data.id)
    .fetch_one(&state.db.app_db)
    .await
    .map_err(|e| e.to_string())?;

    state.refresh_flashcards_cache().await;

    Ok(card)
}

#[tauri::command]
pub async fn delete_flashcard(state: State<'_, AppState>, id: i64) -> Result<(), String> {
    let now = Utc::now();
    let auto_delete_at = now + chrono::Duration::days(10);

    let mut tx = state.db.app_db.begin().await.map_err(|e| e.to_string())?;

    let card = sqlx::query_as::<_, Flashcard>("SELECT * FROM flashcards WHERE id = ?")
        .bind(id)
        .fetch_optional(&mut *tx)
        .await
        .map_err(|e| e.to_string())?
        .ok_or("Card not found")?;

    sqlx::query(
        r#"
        INSERT INTO trash (flashcard_id, hanzi, pinyin, meaning, level, deleted_at, auto_delete_at)
        VALUES (?, ?, ?, ?, ?, ?, ?)
        "#,
    )
    .bind(card.id)
    .bind(&card.hanzi)
    .bind(&card.pinyin)
    .bind(&card.meaning)
    .bind(card.level)
    .bind(now)
    .bind(auto_delete_at)
    .execute(&mut *tx)
    .await
    .map_err(|e| e.to_string())?;

    sqlx::query("UPDATE flashcards SET deleted_at = ?, auto_delete_at = ? WHERE id = ?")
        .bind(now)
        .bind(auto_delete_at)
        .bind(id)
        .execute(&mut *tx)
        .await
        .map_err(|e| e.to_string())?;

    tx.commit().await.map_err(|e| e.to_string())?;

    state.refresh_flashcards_cache().await;

    Ok(())
}

#[tauri::command]
pub async fn get_trash_items(state: State<'_, AppState>) -> Result<Vec<crate::infra::models::TrashItem>, String> {
    use crate::infra::models::TrashItem;

    let items = sqlx::query_as::<_, TrashItem>(
        "SELECT * FROM trash ORDER BY deleted_at DESC"
    )
    .fetch_all(&state.db.app_db)
    .await
    .map_err(|e| e.to_string())?;

    Ok(items)
}

#[tauri::command]
pub async fn restore_from_trash(state: State<'_, AppState>, trash_id: i64) -> Result<(), String> {
    let mut tx = state.db.app_db.begin().await.map_err(|e| e.to_string())?;

    let trash = sqlx::query_as::<_, crate::infra::models::TrashItem>(
        "SELECT * FROM trash WHERE id = ?"
    )
    .bind(trash_id)
    .fetch_optional(&mut *tx)
    .await
    .map_err(|e| e.to_string())?
    .ok_or("Trash item not found")?;

    sqlx::query(
        "UPDATE flashcards SET deleted_at = NULL, auto_delete_at = NULL WHERE id = ?"
    )
    .bind(trash.flashcard_id)
    .execute(&mut *tx)
    .await
    .map_err(|e| e.to_string())?;

    sqlx::query("DELETE FROM trash WHERE id = ?")
        .bind(trash_id)
        .execute(&mut *tx)
        .await
        .map_err(|e| e.to_string())?;

    tx.commit().await.map_err(|e| e.to_string())?;

    state.refresh_flashcards_cache().await;

    Ok(())
}

#[tauri::command]
pub async fn permanent_delete(state: State<'_, AppState>, trash_id: i64) -> Result<(), String> {
    let mut tx = state.db.app_db.begin().await.map_err(|e| e.to_string())?;

    let trash = sqlx::query_as::<_, crate::infra::models::TrashItem>(
        "SELECT * FROM trash WHERE id = ?"
    )
    .bind(trash_id)
    .fetch_optional(&mut *tx)
    .await
    .map_err(|e| e.to_string())?
    .ok_or("Trash item not found")?;

    sqlx::query("DELETE FROM flashcards WHERE id = ?")
        .bind(trash.flashcard_id)
        .execute(&mut *tx)
        .await
        .map_err(|e| e.to_string())?;

    sqlx::query("DELETE FROM trash WHERE id = ?")
        .bind(trash_id)
        .execute(&mut *tx)
        .await
        .map_err(|e| e.to_string())?;

    tx.commit().await.map_err(|e| e.to_string())?;

    state.refresh_flashcards_cache().await;

    Ok(())
}

#[tauri::command]
pub async fn cleanup_expired_trash(state: State<'_, AppState>) -> Result<i64, String> {
    let now = Utc::now();

    let expired = sqlx::query_as::<_, crate::infra::models::TrashItem>(
        "SELECT * FROM trash WHERE auto_delete_at <= ?"
    )
    .bind(now)
    .fetch_all(&state.db.app_db)
    .await
    .map_err(|e| e.to_string())?;

    for item in expired {
        let _ = sqlx::query("DELETE FROM flashcards WHERE id = ?")
            .bind(item.flashcard_id)
            .execute(&state.db.app_db)
            .await;
    }

    let result = sqlx::query(
        "DELETE FROM trash WHERE auto_delete_at <= ?"
    )
    .bind(now)
    .execute(&state.db.app_db)
    .await
    .map_err(|e| e.to_string())?;

    let count = result.rows_affected() as i64;

    state.refresh_flashcards_cache().await;

    Ok(count)
}

#[tauri::command]
pub async fn record_review_result(
    state: State<'_, AppState>,
    card_id: i64,
    remembered: bool,
) -> Result<ReviewResult, String> {
    let card = {
        let cache = state.flashcards_cache.read().map_err(|e| e.to_string())?;
        cache
            .iter()
            .find(|c| c.id == card_id)
            .cloned()
            .ok_or_else(|| "Card not found".to_string())?
    };

    let srs_result = srs::calculate_next_review(card.level, remembered);

    let updated = sqlx::query_as::<_, Flashcard>(
        r#"
        UPDATE flashcards
        SET level = ?, next_review = ?
        WHERE id = ?
        RETURNING id, hanzi, pinyin, meaning, date_added, level, next_review, deleted_at
        "#,
    )
    .bind(srs_result.new_level)
    .bind(srs_result.next_review)
    .bind(card_id)
    .fetch_one(&state.db.app_db)
    .await
    .map_err(|e| e.to_string())?;

    state.refresh_flashcards_cache().await;

    Ok(ReviewResult {
        card_id: updated.id,
        remembered,
        new_level: updated.level,
        next_review: updated.next_review.unwrap_or_else(Utc::now),
    })
}

#[tauri::command]
pub async fn undo_review_result(
    state: State<'_, AppState>,
    card_id: i64,
    old_level: i32,
    old_next_review: Option<chrono::DateTime<Utc>>,
) -> Result<(), String> {
    sqlx::query(
        r#"
        UPDATE flashcards
        SET level = ?, next_review = ?
        WHERE id = ?
        "#,
    )
    .bind(old_level)
    .bind(old_next_review)
    .bind(card_id)
    .execute(&state.db.app_db)
    .await
    .map_err(|e| e.to_string())?;

    state.refresh_flashcards_cache().await;

    Ok(())
}
