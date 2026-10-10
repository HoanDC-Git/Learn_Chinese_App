import { pinyin, customPinyin } from "pinyin-pro";

// Người dùng thường muốn chữ "了" đứng một mình hoặc không rõ ngữ cảnh đọc là "le" thay vì "liǎo"
customPinyin({
  '了': 'le',
  '了解': 'liǎo jiě',
  '了不起': 'liǎo bù qǐ',
  '不了了之': 'bù liǎo liǎo zhī'
});

export function convertPinyin(text: string): string {
  if (!text) return "";
  
  // Get pinyin array for the whole text first to preserve polyphone context
  const pinyinArray = pinyin(text, { toneType: 'symbol', type: 'array' });
  
  // Use Intl.Segmenter to segment Chinese text into words
  const segmenter = new (Intl as any).Segmenter('zh-CN', { granularity: 'word' });
  const segments = Array.from(segmenter.segment(text)).map((s: any) => s.segment);
  
  let currentIndex = 0;
  const result = segments.map(word => {
    const wordLen = word.length;
    // Group the characters' pinyin based on segment boundaries
    const wordPinyin = pinyinArray.slice(currentIndex, currentIndex + wordLen).join('');
    currentIndex += wordLen;
    return wordPinyin;
  });
  
  return result.join(' ').replace(/\s+/g, ' ').trim();
}
