use crate::app::state::AppState;
use crate::infra::models::{DictionaryEntry, HoverResult};
use serde::{Deserialize, Serialize};
use tauri::State;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DictionarySearchRequest {
    pub query: String,
    pub page: i64,
    pub page_size: i64,
    pub sort_by: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DictionarySearchResult {
    pub results: Vec<DictionaryEntry>,
    pub total: i64,
    pub page: i64,
    pub page_size: i64,
}

#[tauri::command]
pub async fn search_dictionary(
    state: State<'_, AppState>,
    req: DictionarySearchRequest,
) -> Result<DictionarySearchResult, String> {
    let query = req.query.trim();
    let offset = req.page * req.page_size;
    
    let order_clause = if req.sort_by == "hsk" {
        // Sắp xếp theo cấp độ HSK, nếu null thì cho xuống cuối (99)
        "ORDER BY COALESCE(CAST(hsk_level AS INTEGER), 99) ASC, word ASC"
    } else {
        "ORDER BY word ASC"
    };

    let total: i64;
    let results: Vec<DictionaryEntry>;

    if query.is_empty() {
        let count_query = "SELECT COUNT(*) FROM vocabulary";
        total = sqlx::query_scalar(count_query)
            .fetch_one(&state.db.dict_db)
            .await
            .map_err(|e| e.to_string())?;

        let sql = format!(
            "SELECT id, hsk_level, word, pinyin, pos, meaning_vi, meaning_en FROM vocabulary {} LIMIT ? OFFSET ?",
            order_clause
        );
        results = sqlx::query_as::<_, DictionaryEntry>(&sql)
            .bind(req.page_size)
            .bind(offset)
            .fetch_all(&state.db.dict_db)
            .await
            .map_err(|e| e.to_string())?;
    } else {
        let count_query = "SELECT COUNT(*) FROM vocabulary WHERE word LIKE ? OR pinyin LIKE ? OR meaning_vi LIKE ? OR meaning_en LIKE ?";
        let like_query = format!("%{}%", query);
        total = sqlx::query_scalar(count_query)
            .bind(&like_query)
            .bind(&like_query)
            .bind(&like_query)
            .bind(&like_query)
            .fetch_one(&state.db.dict_db)
            .await
            .map_err(|e| e.to_string())?;

        // Mặc dù LIKE chậm hơn MATCH, nhưng với DB nhỏ dưới 100k, LIKE vẫn xử lý trong vài chục ms
        let sql = format!(
            "SELECT id, hsk_level, word, pinyin, pos, meaning_vi, meaning_en FROM vocabulary WHERE word LIKE ? OR pinyin LIKE ? OR meaning_vi LIKE ? OR meaning_en LIKE ? {} LIMIT ? OFFSET ?",
            order_clause
        );
        results = sqlx::query_as::<_, DictionaryEntry>(&sql)
            .bind(&like_query)
            .bind(&like_query)
            .bind(&like_query)
            .bind(&like_query)
            .bind(req.page_size)
            .bind(offset)
            .fetch_all(&state.db.dict_db)
            .await
            .map_err(|e| e.to_string())?;
    }

    Ok(DictionarySearchResult {
        results,
        total,
        page: req.page,
        page_size: req.page_size,
    })
}

#[tauri::command]
pub async fn lookup_word(
    state: State<'_, AppState>,
    word: String,
) -> Result<Option<DictionaryEntry>, String> {
    let db_entry = sqlx::query_as::<_, DictionaryEntry>(
        r#"
        SELECT id, hsk_level, word, pinyin, pos, meaning_vi, meaning_en
        FROM vocabulary
        WHERE word = ?
        LIMIT 1
        "#,
    )
    .bind(&word)
    .fetch_optional(&state.db.dict_db)
    .await
    .map_err(|e| e.to_string())?;

    Ok(db_entry)
}

#[tauri::command]
pub async fn lookup_hover(
    state: State<'_, AppState>,
    text: String,
    cursor_index: usize,
) -> Result<Vec<HoverResult>, String> {
    let chars: Vec<char> = text.chars().collect();
    let len = chars.len();

    if cursor_index >= len {
        return Ok(Vec::new());
    }

    let mut substrings = Vec::new();

    for sub_len in 1..=4 {
        if cursor_index + sub_len <= len {
            let substring: String = chars[cursor_index..cursor_index + sub_len].iter().collect();
            substrings.push(substring);
        }
    }

    if substrings.is_empty() {
        return Ok(Vec::new());
    }
    
    let mut padded = substrings.clone();
    while padded.len() < 4 {
        padded.push("".to_string());
    }

    let entries = sqlx::query_as::<_, DictionaryEntry>(
        r#"
        SELECT id, hsk_level, word, pinyin, pos, meaning_vi, meaning_en
        FROM vocabulary
        WHERE word IN (?, ?, ?, ?)
        "#
    )
    .bind(&padded[0])
    .bind(&padded[1])
    .bind(&padded[2])
    .bind(&padded[3])
    .fetch_all(&state.db.dict_db)
    .await
    .map_err(|e| e.to_string())?;

    let mut results: Vec<HoverResult> = entries.into_iter().map(|entry| HoverResult {
        word: entry.word.clone(),
        pinyin: entry.pinyin.unwrap_or_default(),
        hsk_level: entry.hsk_level.unwrap_or_default(),
        pos: entry.pos.unwrap_or_default(),
        meaning_vi: entry.meaning_vi.unwrap_or_default(),
        meaning_en: entry.meaning_en.unwrap_or_default(),
    }).collect();

    // Sắp xếp kết quả dài nhất lên đầu (như logic cũ)
    results.sort_by(|a, b| b.word.chars().count().cmp(&a.word.chars().count()));

    Ok(results)
}
