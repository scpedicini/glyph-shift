import { describe, it, expect } from 'vitest';
import { hiraganaToKatakana, katakanaToHiragana } from '../utils/japanese-utils';

describe('Japanese Utility Functions', () => {
  describe('hiraganaToKatakana', () => {
    it('should convert basic hiragana to katakana', () => {
      expect(hiraganaToKatakana('あいうえお')).toBe('アイウエオ');
      expect(hiraganaToKatakana('かきくけこ')).toBe('カキクケコ');
      expect(hiraganaToKatakana('さしすせそ')).toBe('サシスセソ');
    });

    it('should convert small hiragana kana to small katakana', () => {
      expect(hiraganaToKatakana('っ')).toBe('ッ');
      expect(hiraganaToKatakana('ゃゅょ')).toBe('ャュョ');
      expect(hiraganaToKatakana('ぁぃぅぇぉ')).toBe('ァィゥェォ');
    });

    it('should convert voiced hiragana to voiced katakana', () => {
      expect(hiraganaToKatakana('がぎぐげご')).toBe('ガギグゲゴ');
      expect(hiraganaToKatakana('ざじずぜぞ')).toBe('ザジズゼゾ');
      expect(hiraganaToKatakana('だぢづでど')).toBe('ダヂヅデド');
      expect(hiraganaToKatakana('ばびぶべぼ')).toBe('バビブベボ');
      expect(hiraganaToKatakana('ぱぴぷぺぽ')).toBe('パピプペポ');
    });

    it('should preserve non-hiragana characters', () => {
      expect(hiraganaToKatakana('Hello こんにちは')).toBe('Hello コンニチハ');
      expect(hiraganaToKatakana('123 あいう')).toBe('123 アイウ');
      expect(hiraganaToKatakana('カタカナ')).toBe('カタカナ');
    });

    it('should handle empty strings', () => {
      expect(hiraganaToKatakana('')).toBe('');
    });

    it('should handle mixed hiragana and katakana', () => {
      expect(hiraganaToKatakana('あカいキう')).toBe('アカイキウ');
    });

    it('should convert full hiragana range', () => {
      expect(hiraganaToKatakana('わをん')).toBe('ワヲン');
    });
  });

  describe('katakanaToHiragana', () => {
    it('should convert basic katakana to hiragana', () => {
      expect(katakanaToHiragana('アイウエオ')).toBe('あいうえお');
      expect(katakanaToHiragana('カキクケコ')).toBe('かきくけこ');
      expect(katakanaToHiragana('サシスセソ')).toBe('さしすせそ');
      expect(katakanaToHiragana('スポーツ')).toBe('すぽーつ'); // popular loan word for 'sport'
    });

    it('should convert small katakana kana to small hiragana', () => {
      expect(katakanaToHiragana('ッ')).toBe('っ');
      expect(katakanaToHiragana('ャュョ')).toBe('ゃゅょ');
      expect(katakanaToHiragana('ァィゥェォ')).toBe('ぁぃぅぇぉ');
    });

    it('should convert voiced katakana to voiced hiragana', () => {
      expect(katakanaToHiragana('ガギグゲゴ')).toBe('がぎぐげご');
      expect(katakanaToHiragana('ザジズゼゾ')).toBe('ざじずぜぞ');
      expect(katakanaToHiragana('ダヂヅデド')).toBe('だぢづでど');
      expect(katakanaToHiragana('バビブベボ')).toBe('ばびぶべぼ');
      expect(katakanaToHiragana('パピプペポ')).toBe('ぱぴぷぺぽ');
    });

    it('should preserve non-katakana characters', () => {
      expect(katakanaToHiragana('Hello コンニチハ')).toBe('Hello こんにちは');
      expect(katakanaToHiragana('123 アイウ')).toBe('123 あいう');
      expect(katakanaToHiragana('ひらがな')).toBe('ひらがな');
    });

    it('should handle empty strings', () => {
      expect(katakanaToHiragana('')).toBe('');
    });

    it('should handle mixed katakana and hiragana', () => {
      expect(katakanaToHiragana('アかイきウ')).toBe('あかいきう');
    });

    it('should preserve katakana elongation mark', () => {
      expect(katakanaToHiragana('カー')).toBe('かー');
      expect(katakanaToHiragana('ビール')).toBe('びーる');
      expect(katakanaToHiragana('コーヒー')).toBe('こーひー');
    });

    it('should convert full katakana range except elongation mark', () => {
      expect(katakanaToHiragana('ワヲン')).toBe('わをん');
    });

    it('should handle katakana middle dot and other special characters', () => {
      // The katakana middle dot (・) is preserved as it has no hiragana equivalent
      expect(katakanaToHiragana('ア・イ・ウ')).toBe('あ・い・う');
    });
  });

  describe('Round-trip conversion', () => {
    it('should maintain text through round-trip conversion (hiragana -> katakana -> hiragana)', () => {
      const hiraganaText = 'あいうえお かきくけこ';
      const converted = katakanaToHiragana(hiraganaToKatakana(hiraganaText));
      expect(converted).toBe(hiraganaText);
    });

    it('should maintain text through round-trip conversion (katakana -> hiragana -> katakana) except elongation marks', () => {
      const katakanaText = 'アイウエオ カキクケコ';
      const converted = hiraganaToKatakana(katakanaToHiragana(katakanaText));
      expect(converted).toBe(katakanaText);
    });

    it('should handle complex mixed text in round-trip', () => {
      const mixedText = 'Hello 世界 あいう ABC 123';
      const converted = katakanaToHiragana(hiraganaToKatakana(mixedText));
      expect(converted).toBe(mixedText);
    });
  });
});