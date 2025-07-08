import { describe, it, expect, beforeAll } from 'vitest';
import { HiraganaSwap } from '@/utils/phonetic-swap';
import { InMemoryDataLoader } from '@/utils/data-loaders';

describe('HiraganaSwap', () => {
    let hiraganaSwap: HiraganaSwap;

    beforeAll(() => {
        // Test data
        const wordToIpaData: Array<[string, string[]]> = [
            ["HELLO", ["həˈloʊ"]],
            ["WORLD", ["wɝld"]],
            ["TEST", ["tɛst"]],
            ["MULTIPLE", ["ˈmʌltəpəl", "mʌlˈtɪpəl"]]
        ];

        const ipaToHiraganaData = {
            "h": { "hiragana": "は", "score": 0.9 },
            "ə": { "hiragana": "あ", "score": 0.8 },
            "l": { "hiragana": "ら", "score": 0.9 },
            "oʊ": { "hiragana": "おう", "score": 0.9 },
            "w": { "hiragana": "わ", "score": 0.9 },
            "ɝ": { "hiragana": "あー", "score": 0.7 },
            "d": { "hiragana": "ど", "score": 0.9 },
            "t": { "hiragana": "と", "score": 0.9 },
            "ɛ": { "hiragana": "え", "score": 0.9 },
            "s": { "hiragana": "す", "score": 0.9 },
            "m": { "hiragana": "ま", "score": 0.9 },
            "ʌ": { "hiragana": "あ", "score": 0.8 },
            "p": { "hiragana": "ぷ", "score": 0.9 },
            "ɪ": { "hiragana": "い", "score": 0.9 }
        };

        // Create HiraganaSwap with InMemoryDataLoader
        const dataLoader = new InMemoryDataLoader(wordToIpaData, ipaToHiraganaData);
        hiraganaSwap = new HiraganaSwap(dataLoader);
        hiraganaSwap.initialize();
    });

    describe('canSwap', () => {
        it('should return true for words in the dictionary', async () => {
            expect(await hiraganaSwap.canSwap('hello')).toBe(true);
            expect(await hiraganaSwap.canSwap('HELLO')).toBe(true);
            expect(await hiraganaSwap.canSwap('Hello')).toBe(true);
        });

        it('should return false for words not in the dictionary', async () => {
            expect(await hiraganaSwap.canSwap('xyz123')).toBe(false);
            expect(await hiraganaSwap.canSwap('notaword')).toBe(false);
        });
    });

    describe('swap', () => {
        it('should convert simple words to Hiragana', async () => {
            const result = await hiraganaSwap.swap('hello');
            expect(result).toContain('class="hiragana-text');
            expect(result).toContain('data-pmapper-original="hello"');
            expect(result).toContain('はあらおう');
        });

        it('should handle uppercase input', async () => {
            const result = await hiraganaSwap.swap('WORLD');
            expect(result).toContain('わあーらど');
        });

        it('should return null for words not in dictionary', async () => {
            const result = await hiraganaSwap.swap('notaword');
            expect(result).toBe(null);
        });

        it('should choose the best pronunciation based on cumulative score', async () => {
            const result = await hiraganaSwap.swap('multiple');
            expect(result).toBeDefined();
            expect(result).toContain('class="hiragana-text');
        });
    });

    describe('IPA Parser', () => {
        it('should parse IPA strings correctly', () => {
            // Access the private method through reflection for testing
            const parseMethod = (hiraganaSwap as any).parseIpaToPhonemes.bind(hiraganaSwap);
            
            const phonemes = parseMethod('həˈloʊ');
            expect(phonemes).toEqual(['h', 'ə', 'l', 'oʊ']);
        });

        it('should remove stress markers', () => {
            const parseMethod = (hiraganaSwap as any).parseIpaToPhonemes.bind(hiraganaSwap);
            
            const phonemes = parseMethod('ˈmʌltəpəl');
            expect(phonemes).toEqual(['m', 'ʌ', 'l', 't', 'ə', 'p', 'ə', 'l']);
        });

        it('should use longest-match-first algorithm', () => {
            const parseMethod = (hiraganaSwap as any).parseIpaToPhonemes.bind(hiraganaSwap);
            
            // 'oʊ' should be matched as one phoneme, not 'o' and 'ʊ'
            const phonemes = parseMethod('oʊ');
            expect(phonemes).toEqual(['oʊ']);
        });
    });

    describe('Error handling', () => {
        it('should handle data loading failures gracefully', async () => {
            // Create a failing data loader
            const failingLoader = {
                loadWordToIpa: async () => {
                    throw new Error('Network error');
                },
                loadIpaToHiragana: async () => {
                    throw new Error('Network error');
                }
            };

            const failingSwap = new HiraganaSwap(failingLoader);
            failingSwap.initialize();

            // The canSwap/swap methods will properly wait for the failed initialization
            expect(await failingSwap.canSwap('hello')).toBe(false);
            expect(await failingSwap.swap('hello')).toBe(null);
        });
    });
});