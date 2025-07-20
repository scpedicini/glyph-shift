import { describe, it, expect, beforeAll } from 'vitest';
import { TrueKanaSwap, TrueKanaMode } from '../utils/swap-systems/true-kana-swap';
import { InMemoryTrueKanaDataLoader, TrueKanaMapping } from '../utils/data-loaders';
import { FileSystemTrueKanaDataLoader } from '../utils/data-loaders-node';
import * as path from 'path';

describe('TrueKanaSwap with InMemoryTrueKanaDataLoader', () => {
    let trueKanaSwap: TrueKanaSwap;

    beforeAll(() => {
        // Create test data with both transliterations and additional words
        const testTrueKanaData: TrueKanaMapping = {
            "idol": [
                { isTransliteration: true, katakana: "アイドル" }
            ],
            "idols": [
                { isTransliteration: false, katakana: "アイドル" }
            ],
            "ice": [
                { isTransliteration: true, katakana: "アイス" }
            ],
            "ice cream": [
                { isTransliteration: false, katakana: "アイス" },
                { isTransliteration: true, katakana: "アイスクリーム" }
            ],
            "apartment": [
                { isTransliteration: false, katakana: "アパート" }
            ],
            "apart": [
                { isTransliteration: true, katakana: "アパート" }
            ],
            "part-time job": [
                { isTransliteration: false, katakana: "アルバイト" },
                { isTransliteration: false, katakana: "バイト" }
            ]
        };

        // Create an in-memory data loader with test data
        const dataLoader = new InMemoryTrueKanaDataLoader(testTrueKanaData);
        trueKanaSwap = new TrueKanaSwap(dataLoader);
        trueKanaSwap.initialize();
    });

    describe('swap with OnlyTransliterations mode', () => {
        beforeAll(() => {
            trueKanaSwap.setMode(TrueKanaMode.OnlyTransliterations);
        });

        it('should convert transliterations to Katakana', async () => {
            const result = await trueKanaSwap.swap('idol');
            expect(result).toBe('<span class="true-kana-text pmapper-swapped pmapper-tooltip" data-pmapper-original="idol">アイドル</span>');
        });

        it('should not convert non-transliterations in OnlyTransliterations mode', async () => {
            const result = await trueKanaSwap.swap('idols');
            expect(result).toBeNull();
        });

        it('should pick transliteration when multiple entries exist', async () => {
            const result = await trueKanaSwap.swap('ice cream');
            expect(result).toBe('<span class="true-kana-text pmapper-swapped pmapper-tooltip" data-pmapper-original="ice cream">アイスクリーム</span>');
        });

        it('should handle case-insensitive lookups', async () => {
            const result1 = await trueKanaSwap.swap('IDOL');
            const result2 = await trueKanaSwap.swap('Idol');
            
            expect(result1).toContain('アイドル');
            expect(result2).toContain('アイドル');
        });

        it('should not convert words that only have non-transliteration entries', async () => {
            const result = await trueKanaSwap.swap('apartment');
            expect(result).toBeNull();
        });
    });

    describe('swap with AllWords mode', () => {
        beforeAll(() => {
            trueKanaSwap.setMode(TrueKanaMode.AllWords);
        });

        it('should convert all words including non-transliterations', async () => {
            const result = await trueKanaSwap.swap('idols');
            expect(result).toBe('<span class="true-kana-text pmapper-swapped pmapper-tooltip" data-pmapper-original="idols">アイドル</span>');
        });

        it('should convert words with multiple katakana forms', async () => {
            const result = await trueKanaSwap.swap('part-time job');
            // Should get the first entry
            expect(result).toContain('アルバイト');
        });

        it('should still convert transliterations in AllWords mode', async () => {
            const result = await trueKanaSwap.swap('idol');
            expect(result).toContain('アイドル');
        });

        it('should handle words without entries', async () => {
            const result = await trueKanaSwap.swap('notaword');
            expect(result).toBeNull();
        });
    });

    describe('canSwap', () => {
        it('should respect mode when checking if can swap', async () => {
            trueKanaSwap.setMode(TrueKanaMode.OnlyTransliterations);
            
            expect(await trueKanaSwap.canSwap('idol')).toBe(true);
            expect(await trueKanaSwap.canSwap('idols')).toBe(false);
            expect(await trueKanaSwap.canSwap('apartment')).toBe(false);
            expect(await trueKanaSwap.canSwap('apart')).toBe(true);
        });

        it('should allow all words in AllWords mode', async () => {
            trueKanaSwap.setMode(TrueKanaMode.AllWords);
            
            expect(await trueKanaSwap.canSwap('idol')).toBe(true);
            expect(await trueKanaSwap.canSwap('idols')).toBe(true);
            expect(await trueKanaSwap.canSwap('apartment')).toBe(true);
            expect(await trueKanaSwap.canSwap('part-time job')).toBe(true);
        });

        it('should return false for words not in the mapping', async () => {
            expect(await trueKanaSwap.canSwap('notaword')).toBe(false);
            expect(await trueKanaSwap.canSwap('')).toBe(false);
        });

        it('should handle case-insensitive checks', async () => {
            trueKanaSwap.setMode(TrueKanaMode.OnlyTransliterations);
            
            expect(await trueKanaSwap.canSwap('IDOL')).toBe(true);
            expect(await trueKanaSwap.canSwap('Ice')).toBe(true);
            expect(await trueKanaSwap.canSwap('APART')).toBe(true);
        });
    });

    describe('mode switching with options', () => {
        it('should use options.mode over instance mode', async () => {
            trueKanaSwap.setMode(TrueKanaMode.OnlyTransliterations);
            
            // Use AllWords mode via options
            const result = await trueKanaSwap.swap('idols', { mode: TrueKanaMode.AllWords });
            expect(result).toContain('アイドル');
            
            // Without options, should still use instance mode
            const result2 = await trueKanaSwap.swap('idols');
            expect(result2).toBeNull();
        });
    });

    describe('metadata', () => {
        it('should have correct title and description', () => {
            expect(trueKanaSwap.title).toBe('True Katakana');
            expect(trueKanaSwap.description).toBe('Converts English words to authentic Katakana loan words');
        });
    });
});

describe('TrueKanaSwap with FileSystemTrueKanaDataLoader', () => {
    let trueKanaSwap: TrueKanaSwap;

    beforeAll(async () => {
        // Use the actual generated JSON file
        const trueKanaPath = path.join(__dirname, '..', 'public', 'data', 'true-katakana-mappings.json');
        
        const dataLoader = new FileSystemTrueKanaDataLoader(trueKanaPath);
        trueKanaSwap = new TrueKanaSwap(dataLoader);
        trueKanaSwap.initialize();
        
        // Wait for initialization to complete
        await new Promise(resolve => setTimeout(resolve, 100));
    });

    describe('swap with real data', () => {
        it('should convert transliterations correctly', async () => {
            trueKanaSwap.setMode(TrueKanaMode.OnlyTransliterations);
            
            const testCases = [
                { input: 'idol', expected: 'アイドル' },
                { input: 'ice', expected: 'アイス' },
                { input: 'anime', expected: 'アニメ' },
                { input: 'aloe', expected: 'アロエ' }
            ];

            for (const testCase of testCases) {
                const result = await trueKanaSwap.swap(testCase.input);
                expect(result).toContain(testCase.expected);
                expect(result).toContain(`data-pmapper-original="${testCase.input}"`);
            }
        });

        it('should handle additional words in AllWords mode', async () => {
            trueKanaSwap.setMode(TrueKanaMode.AllWords);
            
            const testCases = [
                { input: 'survey', expected: 'アンケート' },
                { input: 'appointment', expected: 'アポ' },
                { input: 'ice cream', expected: ['アイス', 'アイスクリーム'] }
            ];

            for (const testCase of testCases) {
                const result = await trueKanaSwap.swap(testCase.input);
                expect(result).toBeTruthy();
                
                if (Array.isArray(testCase.expected)) {
                    const hasExpected = testCase.expected.some(exp => result!.includes(exp));
                    expect(hasExpected).toBe(true);
                } else {
                    expect(result).toContain(testCase.expected);
                }
            }
        });

        it('should handle words with multiple katakana forms', async () => {
            trueKanaSwap.setMode(TrueKanaMode.AllWords);
            
            const result = await trueKanaSwap.swap('part-time job');
            expect(result).toBeTruthy();
            // Should contain either アルバイト or バイト
            const hasExpected = result!.includes('アルバイト') || result!.includes('バイト');
            expect(hasExpected).toBe(true);
        });
    });

    describe('performance with real data', () => {
        it('should handle multiple lookups efficiently', async () => {
            const words = ['idol', 'ice', 'anime', 'notaword', 'survey', 'xyz'];
            const startTime = Date.now();
            
            for (const word of words) {
                await trueKanaSwap.swap(word);
            }
            
            const endTime = Date.now();
            const duration = endTime - startTime;
            
            // Should complete all lookups in reasonable time
            expect(duration).toBeLessThan(100); // 100ms for 6 lookups
        });
    });
});