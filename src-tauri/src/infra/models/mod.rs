use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use sqlx::FromRow;

#[derive(Debug, Clone, FromRow, Serialize, Deserialize)]
pub struct Flashcard {
    pub id: i64,
    pub hanzi: String,
    pub pinyin: Option<String>,
    pub meaning: Option<String>,
    pub date_added: Option<DateTime<Utc>>,
    pub level: i32,
    pub next_review: Option<DateTime<Utc>>,
    pub deleted_at: Option<DateTime<Utc>>,
}

#[derive(Debug, Clone, FromRow, Serialize, Deserialize)]
pub struct TrashItem {
    pub id: i64,
    pub flashcard_id: i64,
    pub hanzi: String,
    pub pinyin: Option<String>,
    pub meaning: Option<String>,
    pub level: i32,
    pub deleted_at: Option<DateTime<Utc>>,
    pub auto_delete_at: Option<DateTime<Utc>>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CreateFlashcard {
    pub hanzi: String,
    pub pinyin: Option<String>,
    pub meaning: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct UpdateFlashcard {
    pub id: i64,
    pub hanzi: Option<String>,
    pub pinyin: Option<String>,
    pub meaning: Option<String>,
    pub level: Option<i32>,
    pub next_review: Option<DateTime<Utc>>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ReviewResult {
    pub card_id: i64,
    pub remembered: bool,
    pub new_level: i32,
    pub next_review: DateTime<Utc>,
}

#[derive(Debug, Clone, FromRow, Serialize, Deserialize)]
pub struct DictionaryEntry {
    pub id: i64,
    pub hsk_level: Option<String>,
    pub word: String,
    pub pinyin: Option<String>,
    pub pos: Option<String>,
    pub meaning_vi: Option<String>,
    pub meaning_en: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct HoverResult {
    pub word: String,
    pub pinyin: String,
    pub hsk_level: String,
    pub pos: String,
    pub meaning_vi: String,
    pub meaning_en: String,
}

#[derive(Debug, Clone, FromRow, Serialize, Deserialize)]
pub struct GrammarNote {
    pub id: i64,
    pub note_type: Option<String>,
    pub title: Option<String>,
    pub level: Option<i32>,
    pub formula: Option<String>,
    pub explanation: Option<String>,
    pub examples: Option<String>,
    pub grammar_point_id: Option<i64>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CreateGrammarNote {
    pub note_type: Option<String>,
    pub title: Option<String>,
    pub level: Option<i32>,
    pub formula: Option<String>,
    pub explanation: Option<String>,
    pub examples: Option<String>,
    pub grammar_point_id: Option<i64>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct UpdateGrammarNote {
    pub id: i64,
    pub note_type: Option<String>,
    pub title: Option<String>,
    pub level: Option<i32>,
    pub formula: Option<String>,
    pub explanation: Option<String>,
    pub examples: Option<String>,
    pub grammar_point_id: Option<i64>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SrsStatistics {
    pub total_cards: i64,
    pub new_cards: i64,
    pub learning_cards: i64,
    pub familiar_cards: i64,
    pub proficient_cards: i64,
    pub mastered_cards: i64,
    pub due_today: i64,
    pub accuracy_rate: f64,
    pub total_cards_trend: i64,
    pub mastered_cards_trend: i64,
    pub accuracy_rate_trend: f64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct FlashcardSearchRequest {
    pub query: String,
    pub page: i64,
    pub page_size: i64,
    pub sort_field: String,
    pub sort_order: String,
    pub filter_level: Option<i32>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct FlashcardSearchResult {
    pub cards: Vec<Flashcard>,
    pub total: i64,
    pub page: i64,
    pub page_size: i64,
}

#[derive(Debug, Clone, sqlx::FromRow, Serialize, Deserialize)]
pub struct BasicCharacter {
    pub character: String,
    pub radical_number: Option<i64>,
    pub parent_radical: Option<String>,
    pub variants: Option<String>,
    pub simplified: Option<String>,
    pub pinyin: Option<String>,
    pub meaning_vi: Option<String>,
    pub meaning_en: Option<String>,
    pub strokecount: Option<i64>,
    pub r#type: String,
}

#[derive(Debug, Clone, sqlx::FromRow, Serialize, Deserialize)]
pub struct CompositeCharacter {
    pub character: String,
    pub pinyin: Option<String>,
    pub definition_en: Option<String>,
    pub radical: Option<String>,
    pub decomposition: String,
    pub etymology_type: Option<String>,
    pub etymology_hint: Option<String>,
    pub etymology_semantic: Option<String>,
    pub etymology_phonetic: Option<String>,
    pub definition_vi: Option<String>,
    pub etymology_hint_vi: Option<String>,
}

#[derive(Debug, Clone, sqlx::FromRow, Serialize, Deserialize)]
pub struct SpecialCharacter {
    pub character: String,
    pub hex_code: Option<String>,
    pub decomposition: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DecompositionNode {
    pub character: String,
    pub r#type: String, // "basic" | "variant" | "composite" | "circular" | "unknown"
    pub display_type: String,
    pub pinyin: Option<String>,
    pub meaning_vi: Option<String>,
    pub meaning_en: Option<String>,
    pub strokecount: Option<i64>,
    pub radical_number: Option<i64>,
    pub parent_radical: Option<String>,
    pub variants: Option<String>,
    pub simplified: Option<String>,
    pub radical: Option<String>,
    pub decomposition: Option<String>,
    pub etymology_type: Option<String>,
    pub etymology_hint: Option<String>,
    pub etymology_hint_vi: Option<String>,
    pub etymology_semantic: Option<String>,
    pub etymology_phonetic: Option<String>,
    pub hsk_level: Option<String>,
    pub hex_code: Option<String>,
    pub children: Vec<DecompositionNode>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DecompositionSearchResponse {
    pub vocab: Vec<DecompositionVocabMatch>,
    pub characters: Vec<DecompositionCharMatch>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DecompositionVocabMatch {
    pub word: String,
    pub pinyin: Option<String>,
    pub meaning_vi: Option<String>,
    pub hsk_level: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DecompositionCharMatch {
    pub character: String,
    pub pinyin: Option<String>,
    pub hsk_level: Option<String>,
}

#[derive(Debug, Clone, FromRow, Serialize, Deserialize)]
pub struct GrammarCategory {
    pub id: i64,
    pub level: i32,
    pub parent_id: Option<i64>,
    pub code: String,
    pub title_zh: String,
    pub title_vi: String,
    pub title_en: String,
    pub sort_order: i32,
}

#[derive(Debug, Clone, FromRow, Serialize, Deserialize)]
pub struct GrammarPoint {
    pub id: i64,
    pub category_id: Option<i64>,
    pub level: i32,
    pub code: String,
    pub title_zh: String,
    pub title_vi: String,
    pub title_en: String,
    pub explanation_zh: Option<String>,
    pub explanation_vi: Option<String>,
    pub explanation_en: Option<String>,
    pub sort_order: i32,
}

#[derive(Debug, Clone, FromRow, Serialize, Deserialize)]
pub struct GrammarExample {
    pub id: i64,
    pub grammar_point_id: i64,
    pub subgroup_zh: Option<String>,
    pub subgroup_vi: Option<String>,
    pub subgroup_en: Option<String>,
    pub sentence_zh: String,
    pub sentence_pinyin: String,
    pub sentence_vi: String,
    pub sentence_en: String,
    pub sort_order: i32,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct GrammarPointDetails {
    pub point: GrammarPoint,
    pub examples: Vec<GrammarExample>,
}

