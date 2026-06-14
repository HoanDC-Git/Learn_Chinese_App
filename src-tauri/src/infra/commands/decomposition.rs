use crate::app::state::AppState;
use crate::infra::models::{
    BasicCharacter, CompositeCharacter, DecompositionCharMatch, DecompositionNode,
    DecompositionSearchResponse, DecompositionVocabMatch, SpecialCharacter,
};
use sqlx::Row;
use std::collections::HashSet;
use std::future::Future;
use std::pin::Pin;
use tauri::State;

fn is_idc_char(c: char) -> bool {
    let cp = c as u32;
    (0x2FF0..=0x2FFB).contains(&cp)
}

fn is_component_char(c: char) -> bool {
    let cp = c as u32;
    if cp <= 127 {
        return false;
    }
    if is_idc_char(c) {
        return false;
    }
    if "？? ①②③④⑤⑥⑦⑧⑨⑩ ".contains(c) {
        return false;
    }
    true
}

fn clean_ids_string(ids_str: &str) -> String {
    let mut result = String::new();
    let mut in_brackets = false;
    for c in ids_str.chars() {
        if c == '[' {
            in_brackets = true;
        } else if c == ']' {
            in_brackets = false;
        } else if !in_brackets {
            if !is_idc_char(c) {
                result.push(c);
            }
        }
    }
    result
}

fn extract_components(decomp_str: &str) -> Vec<String> {
    let cleaned = clean_ids_string(decomp_str);
    let mut components = Vec::new();
    for c in cleaned.chars() {
        if is_component_char(c) {
            components.push(c.to_string());
        }
    }
    components
}

fn build_decomposition_tree<'a>(
    character: String,
    state: &'a AppState,
    visited: HashSet<String>,
) -> Pin<Box<dyn Future<Output = DecompositionNode> + Send + 'a>> {
    Box::pin(async move {
        // 1. Tránh vòng lặp đệ quy vô hạn
        if visited.contains(&character) {
            return DecompositionNode {
                character: character.clone(),
                r#type: "circular".to_string(),
                display_type: "Lỗi vòng lặp".to_string(),
                pinyin: None,
                meaning_vi: None,
                meaning_en: None,
                strokecount: None,
                radical_number: None,
                parent_radical: None,
                variants: None,
                simplified: None,
                radical: None,
                decomposition: None,
                etymology_type: None,
                etymology_hint: None,
                etymology_hint_vi: None,
                etymology_semantic: None,
                etymology_phonetic: None,
                hsk_level: None,
                hex_code: None,
                children: Vec::new(),
            };
        }

        // 2. Kiểm tra chữ độc thể trong DB decomposition_radicals
        let basic_row = sqlx::query_as::<_, BasicCharacter>(
            "SELECT character, radical_number, parent_radical, variants, simplified, pinyin, meaning_vi, meaning_en, strokecount, type FROM decomposition_radicals WHERE character = ?"
        )
        .bind(&character)
        .fetch_optional(&state.db.dict_db)
        .await
        .unwrap_or(None);

        if let Some(b) = basic_row {
            let display_type = if b.r#type == "radical" { "Bộ thủ gốc" } else { "Chữ độc thể" };
            return DecompositionNode {
                character: b.character,
                r#type: "basic".to_string(),
                display_type: display_type.to_string(),
                pinyin: b.pinyin,
                meaning_vi: b.meaning_vi,
                meaning_en: b.meaning_en,
                strokecount: b.strokecount,
                radical_number: b.radical_number,
                parent_radical: b.parent_radical,
                variants: b.variants,
                simplified: b.simplified,
                radical: None,
                decomposition: None,
                etymology_type: None,
                etymology_hint: None,
                etymology_hint_vi: None,
                etymology_semantic: None,
                etymology_phonetic: None,
                hsk_level: None,
                hex_code: None,
                children: Vec::new(),
            };
        }

        // 3. Kiểm tra biến thể bộ thủ dựa trên variant_map trong RAM
        let variant_opt = {
            let map = state.variant_map.read().ok();
            map.and_then(|m| m.get(&character).cloned())
        };

        if let Some(parent_rad) = variant_opt {
            let meaning_vi = parent_rad.meaning_vi.as_ref()
                .map(|m| format!("Biến thể của bộ {}", m));
            let meaning_en = parent_rad.meaning_en.as_ref()
                .map(|m| format!("Variant of {}", m));
            
            return DecompositionNode {
                character: character.clone(),
                r#type: "variant".to_string(),
                display_type: format!("Biến thể bộ {}", parent_rad.character),
                pinyin: parent_rad.pinyin,
                meaning_vi,
                meaning_en,
                strokecount: parent_rad.strokecount,
                radical_number: parent_rad.radical_number,
                parent_radical: Some(parent_rad.character),
                variants: parent_rad.variants,
                simplified: parent_rad.simplified,
                radical: None,
                decomposition: None,
                etymology_type: None,
                etymology_hint: None,
                etymology_hint_vi: None,
                etymology_semantic: None,
                etymology_phonetic: None,
                hsk_level: None,
                hex_code: None,
                children: Vec::new(),
            };
        }

        // 4. Kiểm tra chữ hợp thể trong DB decomposition_details
        let comp_row = sqlx::query_as::<_, CompositeCharacter>(
            "SELECT character, pinyin, definition_en, radical, decomposition, etymology_type, etymology_hint, etymology_semantic, etymology_phonetic, definition_vi, etymology_hint_vi FROM decomposition_details WHERE character = ?"
        )
        .bind(&character)
        .fetch_optional(&state.db.dict_db)
        .await
        .unwrap_or(None);

        if let Some(c) = comp_row {
            let mut visited_copy = visited.clone();
            visited_copy.insert(character.clone());

            let child_chars = extract_components(&c.decomposition);
            let mut children = Vec::new();
            for child in child_chars {
                let child_node = build_decomposition_tree(child, state, visited_copy.clone()).await;
                children.push(child_node);
            }

            return DecompositionNode {
                character: c.character,
                r#type: "composite".to_string(),
                display_type: "Chữ hợp thể".to_string(),
                pinyin: c.pinyin,
                meaning_vi: c.definition_vi,
                meaning_en: c.definition_en,
                strokecount: None,
                radical_number: None,
                parent_radical: None,
                variants: None,
                simplified: None,
                radical: c.radical,
                decomposition: Some(c.decomposition),
                etymology_type: c.etymology_type,
                etymology_hint: c.etymology_hint,
                etymology_hint_vi: c.etymology_hint_vi,
                etymology_semantic: c.etymology_semantic,
                etymology_phonetic: c.etymology_phonetic,
                hsk_level: None,
                hex_code: None,
                children,
            };
        }

        // 4.5. Kiểm tra các bộ kiện đặc biệt (specials)
        let special_row = sqlx::query_as::<_, SpecialCharacter>(
            "SELECT character, hex_code, decomposition FROM decomposition_specials WHERE character = ?"
        )
        .bind(&character)
        .fetch_optional(&state.db.dict_db)
        .await
        .unwrap_or(None);

        if let Some(s) = special_row {
            let mut visited_copy = visited.clone();
            visited_copy.insert(character.clone());

            let mut children = Vec::new();
            if let Some(decomp) = &s.decomposition {
                let child_chars = extract_components(decomp);
                for child in child_chars {
                    let child_node = build_decomposition_tree(child, state, visited_copy.clone()).await;
                    children.push(child_node);
                }
            }

            return DecompositionNode {
                character: s.character,
                r#type: "special".to_string(),
                display_type: "Bộ kiện đặc biệt".to_string(),
                pinyin: None,
                meaning_vi: None,
                meaning_en: None,
                strokecount: None,
                radical_number: None,
                parent_radical: None,
                variants: None,
                simplified: None,
                radical: None,
                decomposition: s.decomposition,
                etymology_type: None,
                etymology_hint: None,
                etymology_hint_vi: None,
                etymology_semantic: None,
                etymology_phonetic: None,
                hsk_level: None,
                hex_code: s.hex_code,
                children,
            };
        }

        // 5. Fallback nếu không tìm thấy
        DecompositionNode {
            character: character.clone(),
            r#type: "unknown".to_string(),
            display_type: "Thành phần phụ / Nét vẽ".to_string(),
            pinyin: None,
            meaning_vi: None,
            meaning_en: None,
            strokecount: None,
            radical_number: None,
            parent_radical: None,
            variants: None,
            simplified: None,
            radical: None,
            decomposition: None,
            etymology_type: None,
            etymology_hint: None,
            etymology_hint_vi: None,
            etymology_semantic: None,
            etymology_phonetic: None,
            hsk_level: None,
            hex_code: None,
            children: Vec::new(),
        }
    })
}

#[tauri::command]
pub async fn search_decomposition(
    state: State<'_, AppState>,
    query: String,
) -> Result<DecompositionSearchResponse, String> {
    let trimmed = query.trim();
    if trimmed.is_empty() {
        return Ok(DecompositionSearchResponse {
            vocab: Vec::new(),
            characters: Vec::new(),
        });
    }

    // 1. Tìm từ vựng trong vocabulary
    let like_query = format!("%{}%", trimmed);
    let vocab_rows = sqlx::query(
        "SELECT word, pinyin, meaning_vi, hsk_level FROM vocabulary WHERE word LIKE ? OR pinyin LIKE ? LIMIT 10"
    )
    .bind(&like_query)
    .bind(&like_query)
    .fetch_all(&state.db.dict_db)
    .await
    .map_err(|e| e.to_string())?;

    let vocab = vocab_rows
        .into_iter()
        .map(|row| DecompositionVocabMatch {
            word: row.get::<String, _>("word"),
            pinyin: row.get::<Option<String>, _>("pinyin"),
            meaning_vi: row.get::<Option<String>, _>("meaning_vi"),
            hsk_level: row.get::<Option<String>, _>("hsk_level"),
        })
        .collect();

    // 2. Tìm chữ đơn lẻ nếu độ dài query = 1
    let mut characters = Vec::new();
    if trimmed.chars().count() == 1 {
        // Tra trong decomposition_details trước
        let comp_row = sqlx::query_as::<_, CompositeCharacter>(
            "SELECT character, pinyin, definition_en, radical, decomposition, etymology_type, etymology_hint, etymology_semantic, etymology_phonetic, definition_vi, etymology_hint_vi FROM decomposition_details WHERE character = ?"
        )
        .bind(trimmed)
        .fetch_optional(&state.db.dict_db)
        .await
        .unwrap_or(None);

        if let Some(c) = comp_row {
            characters.push(DecompositionCharMatch {
                character: c.character,
                pinyin: c.pinyin,
                hsk_level: None,
            });
        } else {
            // Tra trong decomposition_radicals
            let basic_row = sqlx::query_as::<_, BasicCharacter>(
                "SELECT character, radical_number, parent_radical, variants, simplified, pinyin, meaning_vi, meaning_en, strokecount, type FROM decomposition_radicals WHERE character = ?"
            )
            .bind(trimmed)
            .fetch_optional(&state.db.dict_db)
            .await
            .unwrap_or(None);

            if let Some(b) = basic_row {
                characters.push(DecompositionCharMatch {
                    character: b.character,
                    pinyin: b.pinyin,
                    hsk_level: Some("Basic".to_string()),
                });
            }
        }
    }

    Ok(DecompositionSearchResponse { vocab, characters })
}

#[tauri::command]
pub async fn lookup_decomposition(
    state: State<'_, AppState>,
    character: String,
) -> Result<DecompositionNode, String> {
    let trimmed = character.trim();
    if trimmed.chars().count() != 1 {
        return Err("Vui lòng cung cấp chính xác 1 ký tự chữ Hán".to_string());
    }

    let visited = HashSet::new();
    let tree = build_decomposition_tree(trimmed.to_string(), &state, visited).await;
    Ok(tree)
}
