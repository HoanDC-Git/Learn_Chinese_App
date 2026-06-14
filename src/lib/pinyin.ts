import { pinyin } from "pinyin-pro";

export function convertPinyin(text: string): string {
  if (!text) return "";
  // pinyin-pro returns an array of pinyin syllables by default when type is 'array'
  // or a string with spaces when type is 'string'.
  // We want a string with spaces, e.g., "nǐ hǎo".
  return pinyin(text, { toneType: "symbol", type: "string" });
}
