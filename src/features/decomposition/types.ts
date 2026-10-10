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
  type: string; // "basic" | "variant" | "composite" | "circular" | "unknown" | "special"
  display_type: string;
  pinyin: string | null;
  meaning_vi: string | null;
  stroke_count: number | null;
  radical_number: number | null;
  parent_radical: string | null;
  variants: string | null;
  simplified: string | null;
  radical: string | null;
  decomposition: string | null;
  hint_vi: string | null;
  hint: string | null;
  hsk_level?: string;
  hex_code?: string;
  children: DecompositionNode[];
}
