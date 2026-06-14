export interface DecompositionVocabMatch {
  word: string;
  pinyin: string | null;
  meaning_vi: string | null;
  hsk_level: string | null;
}

export interface DecompositionCharMatch {
  character: string;
  pinyin: string | null;
  hsk_level: string | null;
}

export interface DecompositionSearchResponse {
  vocab: DecompositionVocabMatch[];
  characters: DecompositionCharMatch[];
}

export interface DecompositionNode {
  character: string;
  type: string; // "basic" | "variant" | "composite" | "circular" | "unknown"
  display_type: string;
  pinyin: string | null;
  meaning_vi: string | null;
  meaning_en: string | null;
  strokecount: number | null;
  radical_number: number | null;
  parent_radical: string | null;
  variants: string | null;
  simplified: string | null;
  radical: string | null;
  decomposition: string | null;
  etymology_type: string | null;
  etymology_hint: string | null;
  etymology_hint_vi: string | null;
  etymology_semantic: string | null;
  etymology_phonetic: string | null;
  hsk_level?: string;
  hex_code?: string;
  children: DecompositionNode[];
}
