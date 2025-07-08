// the following constants define the Unicode ranges for Hiragana and Katakana characters
export const HIRAGANA_START_POSITION = 0x3041;
export const HIRAGANA_END_POSITION = 0x3096;
export const KATAKANA_START_POSITION = 0x30a1;
export const KATAKANA_END_POSITION = 0x30fc;

/**
 * Converts hiragana characters to katakana
 * @param text - Input text containing hiragana characters
 * @returns Text with hiragana converted to katakana
 */
export function hiraganaToKatakana(text: string): string {
  let result = '';
  
  for (const char of text) {
    const codePoint = char.codePointAt(0);
    
    if (codePoint !== undefined && codePoint >= HIRAGANA_START_POSITION && codePoint <= HIRAGANA_END_POSITION) {
      // Convert hiragana to katakana by adding the offset
      const katakanaCodePoint = codePoint + (KATAKANA_START_POSITION - HIRAGANA_START_POSITION);
      result += String.fromCodePoint(katakanaCodePoint);
    } else {
      // Keep non-hiragana characters as is
      result += char;
    }
  }
  
  return result;
}

/**
 * Converts katakana characters to hiragana
 * @param text - Input text containing katakana characters
 * @returns Text with katakana converted to hiragana
 */
export function katakanaToHiragana(text: string): string {
  let result = '';
  
  for (const char of text) {
    const codePoint = char.codePointAt(0);
    
    if (codePoint !== undefined && codePoint >= KATAKANA_START_POSITION && codePoint <= KATAKANA_END_POSITION) {
      // Special cases: Some katakana characters have no direct hiragana equivalent
      if (codePoint === 0x30fc) {
        // Katakana elongation mark (ー)
        result += char; // Keep the elongation mark as is
      } else if (codePoint === 0x30fb) {
        // Katakana middle dot (・)
        result += char; // Keep the middle dot as is
      } else {
        // Convert katakana to hiragana by subtracting the offset
        const hiraganaCodePoint = codePoint - (KATAKANA_START_POSITION - HIRAGANA_START_POSITION);
        result += String.fromCodePoint(hiraganaCodePoint);
      }
    } else {
      // Keep non-katakana characters as is
      result += char;
    }
  }
  
  return result;
}

