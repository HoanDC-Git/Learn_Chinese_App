export interface Flashcard {
  id: number;
  hanzi: string;
  pinyin: string | null;
  meaning: string | null;
  date_added: string | null;
  level: number;
  next_review: string | null;
  deleted_at: string | null;
}

export interface TrashItem {
  id: number;
  flashcard_id: number;
  hanzi: string;
  pinyin: string | null;
  meaning: string | null;
  level: number;
  deleted_at: string | null;
  auto_delete_at: string | null;
}

export interface CreateFlashcard {
  hanzi: string;
  pinyin?: string;
  meaning?: string;
}

export interface UpdateFlashcard {
  id: number;
  hanzi?: string;
  pinyin?: string;
  meaning?: string;
  level?: number;
  next_review?: string;
}

export interface ReviewResult {
  card_id: number;
  remembered: boolean;
  new_level: number;
  next_review: string;
}

export interface DictionaryEntry {
  id: number;
  hsk_level: string | null;
  word: string;
  pinyin: string | null;
  pos: string | null;
  meaning_vi: string | null;
  meaning_en: string | null;
}

export interface HoverResult {
  word: string;
  pinyin: string;
  hsk_level: string;
  pos: string;
  meaning_vi: string;
  meaning_en: string;
}

export interface DecompositionNode {
  character: string;
  type: string;
  display_type: string;
  pinyin?: string;
  meaning_vi?: string;
  meaning_en?: string;
  strokecount?: number;
  radical_number?: number;
  parent_radical?: string;
  variants?: string;
  simplified?: string;
  radical?: string;
  decomposition?: string;
  etymology_type?: string;
  etymology_hint?: string;
  etymology_hint_vi?: string;
  etymology_semantic?: string;
  etymology_phonetic?: string;
  hsk_level?: string;
  hex_code?: string;
  children: DecompositionNode[];
}

export interface GrammarNote {
  id: number;
  note_type: string | null;
  title: string | null;
  level: number | null;
  formula: string | null;
  explanation: string | null;
  examples: string | null;
  grammar_point_id: number | null;
}

export interface CreateGrammarNote {
  note_type?: string;
  title?: string;
  level?: number;
  formula?: string;
  explanation?: string;
  examples?: string;
  grammar_point_id?: number | null;
}

export interface UpdateGrammarNote {
  id: number;
  note_type?: string;
  title?: string;
  level?: number;
  formula?: string;
  explanation?: string;
  examples?: string;
  grammar_point_id?: number | null;
}

export interface TtsResponse {
  audio_path: string;
  voice_used: string;
  success: boolean;
}

export interface SrsStatistics {
  total_cards: number;
  new_cards: number;
  learning_cards: number;
  familiar_cards: number;
  proficient_cards: number;
  mastered_cards: number;
  due_today: number;
  accuracy_rate: number;
  total_cards_trend: number;
  mastered_cards_trend: number;
  accuracy_rate_trend: number;
}

export type FlashcardRevealStep = "meaning" | "pinyin" | "hanzi";

export type TabId = "review" | "manage" | "dashboard" | "grammar" | "dictionary" | "trash" | "decomposition";

export interface GrammarCategory {
  id: number;
  level: number;
  parent_id: number | null;
  code: string;
  title_zh: string;
  title_vi: string;
  title_en: string;
  sort_order: number;
}

export interface GrammarPoint {
  id: number;
  category_id: number | null;
  level: number;
  code: string;
  title_zh: string;
  title_vi: string;
  title_en: string;
  explanation_zh: string | null;
  explanation_vi: string | null;
  explanation_en: string | null;
  sort_order: number;
}

export interface GrammarExample {
  id: number;
  grammar_point_id: number;
  subgroup_zh: string | null;
  subgroup_vi: string | null;
  subgroup_en: string | null;
  sentence_zh: string;
  sentence_pinyin: string;
  sentence_vi: string;
  sentence_en: string;
  sort_order: number;
}

export interface GrammarPointDetails {
  point: GrammarPoint;
  examples: GrammarExample[];
}

