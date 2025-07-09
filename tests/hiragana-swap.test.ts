import { describe, test, expect, beforeEach } from 'vitest';
import { HiraganaSwap } from '../utils/swap-systems/hiragana-swap';
import { InMemoryHiraganaDataLoader } from '../utils/data-loaders';
import { katakanaToHiragana } from '../utils/japanese-utils';

describe('HiraganaSwap', () => {
    let hiraganaSwap: HiraganaSwap;
    const mockData = {
        "the": ["ゼ", "ゼ", "ジー"],
        "hello": ["ハロー"],
    };

    beforeEach(async () => {
        const dataLoader = new InMemoryHiraganaDataLoader(mockData);
        hiraganaSwap = new HiraganaSwap(dataLoader);
        await hiraganaSwap.initialize();
    });

    test('should correctly identify if a word can be swapped', async () => {
        expect(await hiraganaSwap.canSwap('the')).toBe(true);
        expect(await hiraganaSwap.canSwap('world')).toBe(false);
    });

    test('should return a hiragana string for a valid word', async () => {
        const result = await hiraganaSwap.swap('the');
        expect(result).not.toBeNull();
        const hiraganaOptions = mockData["the"].map(katakana => katakanaToHiragana(katakana));
        const receivedHiragana = result!.match(/>(.*?)</)![1];
        expect(hiraganaOptions).toContain(receivedHiragana);
    });

    test('should return null for a word that cannot be swapped', async () => {
        const result = await hiraganaSwap.swap('world');
        expect(result).toBeNull();
    });

    test('should return a valid hiragana string for "hello"', async () => {
        const result = await hiraganaSwap.swap('hello');
        expect(result).not.toBeNull();
        expect(result).toContain(katakanaToHiragana('ハロー'));
        expect(result).toContain('はろー');
      });
});