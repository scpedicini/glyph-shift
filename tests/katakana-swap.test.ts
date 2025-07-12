import { describe, it, expect, beforeAll } from 'vitest';
import { KatakanaSwap } from '../utils/swap-systems/katakana-swap';
import { InMemoryKatakanaDataLoader } from '../utils/data-loaders';
import { FileSystemKatakanaDataLoader } from '../utils/data-loaders-node';
import * as path from 'path';

describe('KatakanaSwap with InMemoryKatakanaDataLoader', () => {
    let katakanaSwap: KatakanaSwap;

    beforeAll(() => {
        // Create test data
        const testLoanWords = {
            "PERCENT": "パーセント",
            "AMERICA": "アメリカ",
            "PAGE": "ページ",
            "CENTER": "センター",
            "SERVICE": "サービス",
            "SYSTEM": "システム",
            "HOTEL": "ホテル",
            "BLOG": "ブログ",
            "DATA": "データ",
            "ENERGY": "エネルギー"
        };

        // Create an in-memory data loader with test data
        const dataLoader = new InMemoryKatakanaDataLoader(testLoanWords);
        katakanaSwap = new KatakanaSwap(dataLoader);
        katakanaSwap.initialize();
    });

    describe('swap', () => {
        it('should convert English words to Katakana', async () => {
            const result = await katakanaSwap.swap('percent');
            expect(result).toBe('<span class="katakana-text pmapper-swapped pmapper-tooltip" data-pmapper-original="percent">パーセント</span>');
        });

        it('should handle case-insensitive lookups', async () => {
            const result1 = await katakanaSwap.swap('AMERICA');
            const result2 = await katakanaSwap.swap('america');
            const result3 = await katakanaSwap.swap('America');
            
            expect(result1).toBe('<span class="katakana-text pmapper-swapped pmapper-tooltip" data-pmapper-original="AMERICA">アメリカ</span>');
            expect(result2).toBe('<span class="katakana-text pmapper-swapped pmapper-tooltip" data-pmapper-original="america">アメリカ</span>');
            expect(result3).toBe('<span class="katakana-text pmapper-swapped pmapper-tooltip" data-pmapper-original="America">アメリカ</span>');
        });

        it('should return null for words not in the loan words dictionary', async () => {
            const result = await katakanaSwap.swap('notaword');
            expect(result).toBeNull();
        });

        it('should preserve the original casing in the data attribute', async () => {
            const result = await katakanaSwap.swap('HoTeL');
            expect(result).toContain('data-pmapper-original="HoTeL"');
            expect(result).toContain('ホテル');
        });

        it('should handle multiple word conversions', async () => {
            const words = ['blog', 'data', 'energy'];
            const expectedKatakana = ['ブログ', 'データ', 'エネルギー'];
            
            for (let i = 0; i < words.length; i++) {
                const result = await katakanaSwap.swap(words[i]);
                expect(result).toContain(expectedKatakana[i]);
            }
        });
    });

    describe('canSwap', () => {
        it('should return true for words in the loan words dictionary', async () => {
            expect(await katakanaSwap.canSwap('percent')).toBe(true);
            expect(await katakanaSwap.canSwap('AMERICA')).toBe(true);
            expect(await katakanaSwap.canSwap('System')).toBe(true);
        });

        it('should return false for words not in the loan words dictionary', async () => {
            expect(await katakanaSwap.canSwap('notaword')).toBe(false);
            expect(await katakanaSwap.canSwap('xyz')).toBe(false);
            expect(await katakanaSwap.canSwap('')).toBe(false);
        });

        it('should handle case-insensitive checks', async () => {
            expect(await katakanaSwap.canSwap('hotel')).toBe(true);
            expect(await katakanaSwap.canSwap('HOTEL')).toBe(true);
            expect(await katakanaSwap.canSwap('HoTeL')).toBe(true);
        });
    });

    describe('metadata', () => {
        it('should have correct title and description', () => {
            expect(katakanaSwap.title).toBe('Katakana');
            expect(katakanaSwap.description).toBe('Converts English words to Katakana');
        });
    });
});

describe('KatakanaSwap with FileSystemKatakanaDataLoader', () => {
    let katakanaSwap: KatakanaSwap;

    beforeAll(async () => {
        // Use the actual generated JSON file
        const loanWordsPath = path.join(__dirname, '..', 'public', 'data', 'katakana-loan-words.json');
        
        const dataLoader = new FileSystemKatakanaDataLoader(loanWordsPath);
        katakanaSwap = new KatakanaSwap(dataLoader);
        katakanaSwap.initialize();
        
        // Wait for initialization to complete
        await new Promise(resolve => setTimeout(resolve, 100));
    });

    describe('swap with real data', () => {
        it('should convert common English loan words to Katakana', async () => {
            // Test some common loan words that should be in the full dataset
            const testCases = [
                { input: 'hotel', expected: 'ホテル' },
                { input: 'blog', expected: 'ブログ' },
                { input: 'data', expected: 'データ' },
                { input: 'system', expected: 'システム' },
                { input: 'service', expected: 'サービス' }
            ];

            for (const testCase of testCases) {
                const result = await katakanaSwap.swap(testCase.input);
                expect(result).toContain(testCase.expected);
                expect(result).toContain(`data-pmapper-original="${testCase.input}"`);
            }
        });

        it('should handle case variations', async () => {
            const result1 = await katakanaSwap.swap('TELEVISION');
            const result2 = await katakanaSwap.swap('television');
            const result3 = await katakanaSwap.swap('Television');
            
            // All should produce the same katakana
            expect(result1).toContain('テレビジョン');
            expect(result2).toContain('テレビジョン');
            expect(result3).toContain('テレビジョン');
        });

        it('should return null for non-loan words', async () => {
            const nonLoanWords = ['xyz', 'qwerty', 'abcdef', 'foobar', 'baz'];
            
            for (const word of nonLoanWords) {
                const result = await katakanaSwap.swap(word);
                expect(result).toBeNull();
            }
        });
    });

    describe('canSwap with real data', () => {
        it('should correctly identify swappable loan words', async () => {
            const loanWords = ['hotel', 'system', 'data', 'energy', 'center'];
            
            for (const word of loanWords) {
                const canSwap = await katakanaSwap.canSwap(word);
                expect(canSwap).toBe(true);
            }
        });

        it('should correctly identify non-swappable words', async () => {
            const nonLoanWords = ['xyz', 'qwerty', 'abcdef', 'foobar', 'baz'];
            
            for (const word of nonLoanWords) {
                const canSwap = await katakanaSwap.canSwap(word);
                expect(canSwap).toBe(false);
            }
        });
    });

    describe('performance', () => {
        it('should handle multiple lookups efficiently', async () => {
            const words = ['hotel', 'system', 'data', 'notaword', 'energy', 'xyz'];
            const startTime = Date.now();
            
            for (const word of words) {
                await katakanaSwap.swap(word);
            }
            
            const endTime = Date.now();
            const duration = endTime - startTime;
            
            // Should complete all lookups in reasonable time
            expect(duration).toBeLessThan(100); // 100ms for 6 lookups
        });
    });
});