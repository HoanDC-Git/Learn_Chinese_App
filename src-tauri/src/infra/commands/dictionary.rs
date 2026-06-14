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
    let cache = state.dict_cache.read().map_err(|e| e.to_string())?;
    let mut entries: Vec<DictionaryEntry> = cache.values().cloned().collect();
    drop(cache);

    let query = req.query.trim();

    if !query.is_empty() {
        let mut scored: Vec<(i32, DictionaryEntry)> = entries
            .into_iter()
            .filter_map(|e| {
                let word = &e.word;
                if word.contains(query) {
                    let score = if word == query {
                        0
                    } else {
                        word.len() as i32
                    };
                    Some((score, e))
                } else {
                    None
                }
            })
            .collect();

        scored.sort_by_key(|(score, _)| *score);
        entries = scored.into_iter().map(|(_, e)| e).collect();
    }

    if req.sort_by == "hsk" {
        entries.sort_by(|a, b| {
            let a_level = a
                .hsk_level
                .as_ref()
                .and_then(|s| s.parse::<i32>().ok())
                .unwrap_or(99);
            let b_level = b
                .hsk_level
                .as_ref()
                .and_then(|s| s.parse::<i32>().ok())
                .unwrap_or(99);
            a_level.cmp(&b_level).then_with(|| a.word.cmp(&b.word))
        });
    } else {
        entries.sort_by(|a, b| a.word.cmp(&b.word));
    }

    let total = entries.len() as i64;
    let start = (req.page * req.page_size) as usize;
    let end = (start + req.page_size as usize).min(entries.len());

    let page_results = if start < entries.len() {
        entries[start..end].to_vec()
    } else {
        Vec::new()
    };

    Ok(DictionarySearchResult {
        results: page_results,
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
    let cache_len;
    let entry = {
        let cache = state.dict_cache.read().map_err(|e| e.to_string())?;
        cache_len = cache.len();
        cache.get(&word).cloned()
    };

    if entry.is_some() {
        return Ok(entry);
    }

    if cache_len == 0 {
        log::warn!("Dictionary cache is empty, querying database directly");
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

        return Ok(db_entry);
    }

    Ok(None)
}

#[tauri::command]
pub async fn lookup_hover(
    state: State<'_, AppState>,
    text: String,
    cursor_index: usize,
) -> Result<Vec<HoverResult>, String> {
    let cache = state.dict_cache.read().map_err(|e| e.to_string())?;
    let chars: Vec<char> = text.chars().collect();
    let len = chars.len();

    if cursor_index >= len {
        return Ok(Vec::new());
    }

    let mut results: Vec<HoverResult> = Vec::new();

    // Longest-match: try 4, 3, 2, 1 chars starting from cursor position
    // Return ALL matches found, longest first
    for sub_len in (1..=4).rev() {
        if cursor_index + sub_len > len {
            continue;
        }

        let substring: String = chars[cursor_index..cursor_index + sub_len].iter().collect();

        if let Some(entry) = cache.get(&substring) {
            results.push(HoverResult {
                word: entry.word.clone(),
                pinyin: entry.pinyin.clone().unwrap_or_default(),
                hsk_level: entry.hsk_level.clone().unwrap_or_default(),
                pos: entry.pos.clone().unwrap_or_default(),
                meaning_vi: entry.meaning_vi.clone().unwrap_or_default(),
                meaning_en: entry.meaning_en.clone().unwrap_or_default(),
            });
        }
    }

    Ok(results)
}
