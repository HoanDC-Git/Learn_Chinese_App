use crate::app::state::AppState;
use crate::infra::models::{
    CreateGrammarNote, GrammarNote, UpdateGrammarNote,
    GrammarCategory, GrammarPoint, GrammarExample, GrammarPointDetails,
};
use tauri::State;

#[tauri::command]
pub async fn get_all_grammar_notes(state: State<'_, AppState>) -> Result<Vec<GrammarNote>, String> {
    let notes = sqlx::query_as::<_, GrammarNote>(
        r#"
        SELECT id, note_type, title, level, formula, explanation, examples, grammar_point_id
        FROM grammar_notes
        ORDER BY level ASC, title ASC
        "#,
    )
    .fetch_all(&state.db.app_db)
    .await
    .map_err(|e| e.to_string())?;

    Ok(notes)
}

#[tauri::command]
pub async fn create_grammar_note(
    state: State<'_, AppState>,
    data: CreateGrammarNote,
) -> Result<GrammarNote, String> {
    let note = sqlx::query_as::<_, GrammarNote>(
        r#"
        INSERT INTO grammar_notes (note_type, title, level, formula, explanation, examples, grammar_point_id)
        VALUES (?, ?, ?, ?, ?, ?, ?)
        RETURNING id, note_type, title, level, formula, explanation, examples, grammar_point_id
        "#,
    )
    .bind(&data.note_type)
    .bind(&data.title)
    .bind(&data.level)
    .bind(&data.formula)
    .bind(&data.explanation)
    .bind(&data.examples)
    .bind(&data.grammar_point_id)
    .fetch_one(&state.db.app_db)
    .await
    .map_err(|e| e.to_string())?;

    Ok(note)
}

#[tauri::command]
pub async fn update_grammar_note(
    state: State<'_, AppState>,
    data: UpdateGrammarNote,
) -> Result<GrammarNote, String> {
    let note = sqlx::query_as::<_, GrammarNote>(
        r#"
        UPDATE grammar_notes
        SET
            note_type = COALESCE(?, note_type),
            title = COALESCE(?, title),
            level = COALESCE(?, level),
            formula = COALESCE(?, formula),
            explanation = COALESCE(?, explanation),
            examples = COALESCE(?, examples),
            grammar_point_id = COALESCE(?, grammar_point_id)
        WHERE id = ?
        RETURNING id, note_type, title, level, formula, explanation, examples, grammar_point_id
        "#,
    )
    .bind(&data.note_type)
    .bind(&data.title)
    .bind(&data.level)
    .bind(&data.formula)
    .bind(&data.explanation)
    .bind(&data.examples)
    .bind(&data.grammar_point_id)
    .bind(data.id)
    .fetch_one(&state.db.app_db)
    .await
    .map_err(|e| e.to_string())?;

    Ok(note)
}

#[tauri::command]
pub async fn delete_grammar_note(state: State<'_, AppState>, id: i64) -> Result<(), String> {
    sqlx::query("DELETE FROM grammar_notes WHERE id = ?")
        .bind(id)
        .execute(&state.db.app_db)
        .await
        .map_err(|e| e.to_string())?;

    Ok(())
}

#[tauri::command]
pub async fn get_grammar_categories(
    state: State<'_, AppState>,
    level: Option<i32>,
) -> Result<Vec<GrammarCategory>, String> {
    let mut query_str = "SELECT id, level, parent_id, code, title_zh, title_vi, title_en, sort_order FROM grammar_categories".to_string();
    if level.is_some() {
        query_str.push_str(" WHERE level = ?");
    }
    query_str.push_str(" ORDER BY level ASC, sort_order ASC");

    let mut q = sqlx::query_as::<_, GrammarCategory>(&query_str);
    if let Some(lvl) = level {
        q = q.bind(lvl);
    }

    let categories = q.fetch_all(&state.db.dict_db)
        .await
        .map_err(|e| e.to_string())?;

    Ok(categories)
}

#[tauri::command]
pub async fn get_grammar_points(
    state: State<'_, AppState>,
    level: Option<i32>,
    category_id: Option<i64>,
    search_query: Option<String>,
) -> Result<Vec<GrammarPoint>, String> {
    let mut query_str = "SELECT id, category_id, level, code, title_zh, title_vi, title_en, explanation_zh, explanation_vi, explanation_en, sort_order FROM grammar_points WHERE 1=1".to_string();
    
    if level.is_some() {
        query_str.push_str(" AND level = ?");
    }
    if category_id.is_some() {
        query_str.push_str(" AND category_id = ?");
    }
    if search_query.is_some() {
        query_str.push_str(" AND (title_zh LIKE ? OR title_vi LIKE ? OR title_en LIKE ? OR explanation_vi LIKE ?)");
    }
    
    query_str.push_str(" ORDER BY level ASC, sort_order ASC");
    
    let mut q = sqlx::query_as::<_, GrammarPoint>(&query_str);
    if let Some(lvl) = level {
        q = q.bind(lvl);
    }
    if let Some(cat_id) = category_id {
        q = q.bind(cat_id);
    }
    if let Some(ref search) = search_query {
        let like = format!("%{}%", search);
        q = q.bind(like.clone()).bind(like.clone()).bind(like.clone()).bind(like);
    }
    
    let points = q.fetch_all(&state.db.dict_db)
        .await
        .map_err(|e| e.to_string())?;
        
    Ok(points)
}

#[tauri::command]
pub async fn get_grammar_point_details(
    state: State<'_, AppState>,
    id: i64,
) -> Result<GrammarPointDetails, String> {
    // 1. Get GrammarPoint
    let point = sqlx::query_as::<_, GrammarPoint>(
        "SELECT id, category_id, level, code, title_zh, title_vi, title_en, explanation_zh, explanation_vi, explanation_en, sort_order FROM grammar_points WHERE id = ?"
    )
    .bind(id)
    .fetch_one(&state.db.dict_db)
    .await
    .map_err(|e| e.to_string())?;

    // 2. Get Examples
    let examples = sqlx::query_as::<_, GrammarExample>(
        "SELECT id, grammar_point_id, subgroup_zh, subgroup_vi, subgroup_en, sentence_zh, sentence_pinyin, sentence_vi, sentence_en, sort_order FROM grammar_examples WHERE grammar_point_id = ? ORDER BY sort_order ASC"
    )
    .bind(id)
    .fetch_all(&state.db.dict_db)
    .await
    .map_err(|e| e.to_string())?;

    Ok(GrammarPointDetails { point, examples })
}

#[derive(sqlx::FromRow)]
struct LearnedGrammarPointRow {
    grammar_point_id: i64,
}

#[tauri::command]
pub async fn get_learned_grammar_points(state: State<'_, AppState>) -> Result<Vec<i64>, String> {
    let rows = sqlx::query_as::<_, LearnedGrammarPointRow>("SELECT grammar_point_id FROM learned_grammar_points")
        .fetch_all(&state.db.app_db)
        .await
        .map_err(|e| e.to_string())?;

    let ids = rows.into_iter().map(|r| r.grammar_point_id).collect();
    Ok(ids)
}

#[tauri::command]
pub async fn toggle_grammar_point_learned(
    state: State<'_, AppState>,
    id: i64,
) -> Result<bool, String> {
    let existing = sqlx::query_as::<_, LearnedGrammarPointRow>(
        "SELECT grammar_point_id FROM learned_grammar_points WHERE grammar_point_id = ?"
    )
    .bind(id)
    .fetch_optional(&state.db.app_db)
    .await
    .map_err(|e| e.to_string())?;

    if existing.is_some() {
        sqlx::query("DELETE FROM learned_grammar_points WHERE grammar_point_id = ?")
            .bind(id)
            .execute(&state.db.app_db)
            .await
            .map_err(|e| e.to_string())?;
        Ok(false)
    } else {
        sqlx::query("INSERT INTO learned_grammar_points (grammar_point_id) VALUES (?)")
            .bind(id)
            .execute(&state.db.app_db)
            .await
            .map_err(|e| e.to_string())?;
        Ok(true)
    }
}

