import { pinyin } from "pinyin-pro";

export function convertPinyin(text: string): string {
  if (!text) return "";
  
  // Use Intl.Segmenter to segment Chinese text into words
  const segmenter = new (Intl as any).Segmenter('zh-CN', { granularity: 'word' });
  const segments = Array.from(segmenter.segment(text)).map((s: any) => s.segment);
  
  return segments.map(word => {
    // If segment is just whitespace, return it as is
    if (/^\s+$/.test(word)) return word;
    
    // Generate pinyin for the word
    const p = pinyin(word, { toneType: 'symbol', type: 'string', nonZh: 'consecutive' });
    
    // Remove spaces that pinyin-pro adds between characters inside the word
    return p.replace(/ /g, '');
  }).join(' ').replace(/\s+/g, ' ').trim();
}
