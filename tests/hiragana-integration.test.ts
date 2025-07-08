import { describe, it, expect, beforeAll } from 'vitest';
import { HiraganaSwap } from '@/utils/phonetic-swap';
import { FileSystemDataLoader } from '@/utils/data-loaders';
import * as path from 'path';

describe('HiraganaSwap Integration Tests', () => {
    let hiraganaSwap: HiraganaSwap;

    beforeAll(() => {
        // Create paths to the actual JSON files
        const wordToIpaPath = path.join(__dirname, '../public/data/hiragana-word-to-ipa.json');
        const ipaToHiraganaPath = path.join(__dirname, '../public/data/hiragana-ipa-to-hiragana.json');
        
        // Create HiraganaSwap with FileSystemDataLoader
        const dataLoader = new FileSystemDataLoader(wordToIpaPath, ipaToHiraganaPath);
        hiraganaSwap = new HiraganaSwap(dataLoader);
        hiraganaSwap.initialize();
    });

    describe('Real data tests', () => {
        it('should load data from actual JSON files', async () => {
            // Test that initialization works
            const canSwapHello = await hiraganaSwap.canSwap('hello');
            expect(canSwapHello).toBe(true);
        });

        it('should convert common English words', async () => {
            // Test some common words that should be in the CMU dictionary
            const words = ['hello', 'world', 'computer', 'phone', 'music'];
            
            for (const word of words) {
                const canSwap = await hiraganaSwap.canSwap(word);
                if (canSwap) {
                    const result = await hiraganaSwap.swap(word);
                    expect(result).toBeTruthy();
                    expect(result).toContain('class="hiragana-text');
                    expect(result).toContain(`data-pmapper-original="${word}"`);
                    console.log(`${word} -> ${result?.match(/>([^<]+)</)?.[1]}`);
                }
            }
        });

        it('should handle words with multiple pronunciations', async () => {
            // 'READ' is a good example - it has different pronunciations
            const canSwapRead = await hiraganaSwap.canSwap('read');
            if (canSwapRead) {
                const result = await hiraganaSwap.swap('read');
                expect(result).toBeTruthy();
            }
        });

        it('should handle case insensitivity', async () => {
            const testCases = ['HELLO', 'Hello', 'hello', 'hELLo'];
            
            for (const testCase of testCases) {
                const canSwap = await hiraganaSwap.canSwap(testCase);
                expect(canSwap).toBe(true);
                
                const result = await hiraganaSwap.swap(testCase);
                expect(result).toBeTruthy();
                expect(result).toContain(`data-pmapper-original="${testCase}"`);
            }
        });

        it('should return null for non-dictionary words', async () => {
            const nonWords = ['xyzabc', 'qwerty123', 'notarealword'];
            
            for (const nonWord of nonWords) {
                const canSwap = await hiraganaSwap.canSwap(nonWord);
                expect(canSwap).toBe(false);
                
                const result = await hiraganaSwap.swap(nonWord);
                expect(result).toBe(null);
            }
        });

        it('should handle single letters', async () => {
            // Single letters like 'A', 'I' might be in the dictionary
            const letters = ['a', 'i'];
            
            for (const letter of letters) {
                const canSwap = await hiraganaSwap.canSwap(letter);
                if (canSwap) {
                    const result = await hiraganaSwap.swap(letter);
                    expect(result).toBeTruthy();
                }
            }
        });
    });

    describe('Performance', () => {
        it('should handle multiple lookups efficiently', async () => {
            const startTime = Date.now();
            
            // Perform 100 lookups
            for (let i = 0; i < 100; i++) {
                await hiraganaSwap.canSwap('test');
            }
            
            const endTime = Date.now();
            const duration = endTime - startTime;
            
            // Should be fast since data is cached
            expect(duration).toBeLessThan(100); // Less than 100ms for 100 lookups
        });
    });
});