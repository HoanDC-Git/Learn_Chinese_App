use crate::app::state::AppState;
use crate::infra::models::SrsStatistics;
use chrono::{Duration, Utc};
use serde::Serialize;
use tauri::State;

#[derive(Debug, Clone, Serialize)]
pub struct DailyPlan {
    pub date: String,
    pub day_label: String,
    pub count: i64,
}

#[tauri::command]
pub async fn get_statistics(state: State<'_, AppState>) -> Result<SrsStatistics, String> {
    let now = Utc::now();

    let total_cards: (i64,) =
        sqlx::query_as("SELECT COUNT(*) FROM flashcards WHERE deleted_at IS NULL")
            .fetch_one(&state.db.app_db)
            .await
            .map_err(|e| e.to_string())?;

    let new_cards: (i64,) =
        sqlx::query_as("SELECT COUNT(*) FROM flashcards WHERE deleted_at IS NULL AND level = 0")
            .fetch_one(&state.db.app_db)
            .await
            .map_err(|e| e.to_string())?;

    let learning_cards: (i64,) =
        sqlx::query_as("SELECT COUNT(*) FROM flashcards WHERE deleted_at IS NULL AND level BETWEEN 1 AND 2")
            .fetch_one(&state.db.app_db)
            .await
            .map_err(|e| e.to_string())?;

    let familiar_cards: (i64,) =
        sqlx::query_as("SELECT COUNT(*) FROM flashcards WHERE deleted_at IS NULL AND level BETWEEN 3 AND 4")
            .fetch_one(&state.db.app_db)
            .await
            .map_err(|e| e.to_string())?;

    let proficient_cards: (i64,) =
        sqlx::query_as("SELECT COUNT(*) FROM flashcards WHERE deleted_at IS NULL AND level BETWEEN 5 AND 6")
            .fetch_one(&state.db.app_db)
            .await
            .map_err(|e| e.to_string())?;

    let mastered_cards: (i64,) =
        sqlx::query_as("SELECT COUNT(*) FROM flashcards WHERE deleted_at IS NULL AND level >= 7")
            .fetch_one(&state.db.app_db)
            .await
            .map_err(|e| e.to_string())?;

    let due_today: (i64,) = sqlx::query_as(
        r#"
        SELECT COUNT(*) FROM flashcards
        WHERE deleted_at IS NULL
          AND (next_review IS NULL OR next_review <= ?)
        "#,
    )
    .bind(now)
    .fetch_one(&state.db.app_db)
    .await
    .map_err(|e| e.to_string())?;

    let accuracy_rate: Option<f64> = sqlx::query_scalar(
        r#"
        SELECT AVG(level)
        FROM flashcards
        WHERE deleted_at IS NULL
        "#,
    )
    .fetch_one(&state.db.app_db)
    .await
    .map_err(|e| e.to_string())?;

    let seven_days_ago = now - chrono::Duration::days(7);

    let total_cards_trend: (i64,) = sqlx::query_as(
        "SELECT COUNT(*) FROM flashcards WHERE deleted_at IS NULL AND date_added >= ?"
    )
    .bind(seven_days_ago)
    .fetch_one(&state.db.app_db)
    .await
    .map_err(|e| e.to_string())?;

    let mastered_cards_trend: (i64,) = sqlx::query_as(
        "SELECT COUNT(*) FROM flashcards WHERE deleted_at IS NULL AND level >= 7 AND date_added >= ?"
    )
    .bind(seven_days_ago)
    .fetch_one(&state.db.app_db)
    .await
    .map_err(|e| e.to_string())?;

    let old_accuracy_rate: Option<f64> = sqlx::query_scalar(
        r#"
        SELECT AVG(level)
        FROM flashcards
        WHERE deleted_at IS NULL AND date_added < ?
        "#
    )
    .bind(seven_days_ago)
    .fetch_one(&state.db.app_db)
    .await
    .map_err(|e| e.to_string())?;

    let current_acc = accuracy_rate.unwrap_or(0.0);
    let old_acc = old_accuracy_rate.unwrap_or(0.0);
    let accuracy_rate_trend = current_acc - old_acc;

    Ok(SrsStatistics {
        total_cards: total_cards.0,
        new_cards: new_cards.0,
        learning_cards: learning_cards.0,
        familiar_cards: familiar_cards.0,
        proficient_cards: proficient_cards.0,
        mastered_cards: mastered_cards.0,
        due_today: due_today.0,
        accuracy_rate: current_acc,
        total_cards_trend: total_cards_trend.0,
        mastered_cards_trend: mastered_cards_trend.0,
        accuracy_rate_trend,
    })
}

#[tauri::command]
pub async fn get_review_plan(state: State<'_, AppState>) -> Result<Vec<DailyPlan>, String> {
    let now = Utc::now();
    let mut plan = Vec::new();

    for i in 0..7 {
        let day = now + Duration::days(i);
        let day_end = day + Duration::days(1);

        let date_str = day.format("%Y-%m-%d").to_string();
        let day_label = if i == 0 {
            "Hôm nay".to_string()
        } else if i == 1 {
            "Ngày mai".to_string()
        } else {
            day.format("%d/%m").to_string()
        };

        let count: (i64,) = if i == 0 {
            sqlx::query_as(
                r#"
                SELECT COUNT(*) FROM flashcards
                WHERE deleted_at IS NULL
                  AND (next_review IS NULL OR next_review <= ?)
                "#,
            )
            .bind(now)
            .fetch_one(&state.db.app_db)
            .await
            .map_err(|e| e.to_string())?
        } else {
            sqlx::query_as(
                r#"
                SELECT COUNT(*) FROM flashcards
                WHERE deleted_at IS NULL
                  AND next_review IS NOT NULL
                  AND next_review >= ?
                  AND next_review < ?
                "#,
            )
            .bind(day.date_naive().and_hms_opt(0, 0, 0).unwrap().and_utc())
            .bind(day_end.date_naive().and_hms_opt(0, 0, 0).unwrap().and_utc())
            .fetch_one(&state.db.app_db)
            .await
            .map_err(|e| e.to_string())?
        };

        plan.push(DailyPlan {
            date: date_str,
            day_label,
            count: count.0,
        });
    }

    Ok(plan)
}
