use crate::infra::database::DatabaseManager;
use crate::infra::models::{Flashcard, BasicCharacter};
use std::collections::HashMap;
use std::sync::{Arc, RwLock};

#[derive(Clone)]
pub struct AppState {
    pub db: Arc<DatabaseManager>,
    pub flashcards_cache: Arc<RwLock<Vec<Flashcard>>>,
    pub variant_map: Arc<RwLock<HashMap<String, BasicCharacter>>>,
}

impl AppState {
    pub fn new(db: DatabaseManager) -> Self {
        Self {
            db: Arc::new(db),
            flashcards_cache: Arc::new(RwLock::new(Vec::new())),
            variant_map: Arc::new(RwLock::new(HashMap::new())),
        }
    }

    pub async fn refresh_flashcards_cache(&self) {
        let cards = sqlx::query_as::<_, Flashcard>(
            "SELECT id, hanzi, pinyin, meaning, date_added, level, next_review, deleted_at FROM flashcards",
        )
        .fetch_all(&self.db.app_db)
        .await
        .unwrap_or_default();

        if let Ok(mut cache) = self.flashcards_cache.write() {
            *cache = cards;
        }
    }


    pub async fn load_decomposition_variants(&self) {
        let radicals = sqlx::query_as::<_, BasicCharacter>(
            "SELECT character, radical_number, parent_radical, variants, simplified, pinyin, meaning_vi, meaning_en, strokecount, type FROM decomposition_radicals WHERE type = 'radical'"
        )
        .fetch_all(&self.db.dict_db)
        .await
        .unwrap_or_default();

        let mut map = HashMap::new();
        for rad in radicals {
            let char_str = &rad.character;
            
            let is_idc = |c: char| -> bool {
                let cp = c as u32;
                (0x2FF0..=0x2FFB).contains(&cp)
            };
            let is_component_char = |c: char| -> bool {
                let cp = c as u32;
                if cp <= 127 {
                    return false;
                }
                if is_idc(c) {
                    return false;
                }
                if "？? ①②③④⑤⑥⑦⑧⑨⑩ ".contains(c) {
                    return false;
                }
                true
            };

            if let Some(variants_str) = &rad.variants {
                for c in variants_str.chars() {
                    if is_component_char(c) && c.to_string() != *char_str {
                        map.insert(c.to_string(), rad.clone());
                    }
                }
            }

            if let Some(simp_str) = &rad.simplified {
                for c in simp_str.chars() {
                    if is_component_char(c) && c.to_string() != *char_str {
                        map.insert(c.to_string(), rad.clone());
                    }
                }
            }
        }

        if let Ok(mut cache) = self.variant_map.write() {
            *cache = map;
        }
    }
}
