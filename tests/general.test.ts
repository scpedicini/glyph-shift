import { describe, it, expect } from 'vitest';
import {
    BrailleSwap,
    FingerspellingSwap,
    HiraganaSwap,
    IPhoneticSwap,
    MorseCodeSwap,
    VorticonSwap
} from '@/utils/swap-systems';
import { InMemoryHiraganaDataLoader } from '@/utils/data-loaders';

describe('Async Interface Implementation', () => {
    // Create HiraganaSwap with empty data loader to avoid browser dependency
    const emptyDataLoader = new InMemoryHiraganaDataLoader({});
    
    const swappers: { name: string; instance: IPhoneticSwap }[] = [
        { name: 'HiraganaSwap', instance: new HiraganaSwap(emptyDataLoader) },
        { name: 'FingerspellingSwap', instance: new FingerspellingSwap() },
        { name: 'MorseCodeSwap', instance: new MorseCodeSwap() },
        { name: 'VorticonSwap', instance: new VorticonSwap() },
        { name: 'BrailleSwap', instance: new BrailleSwap() }
    ];

    swappers.forEach(({ name, instance }) => {
        describe(name, () => {
            it('should have async canSwap method that returns a Promise<boolean>', async () => {
                const result = instance.canSwap('test');
                expect(result).toBeInstanceOf(Promise);
                const resolved = await result;
                expect(typeof resolved).toBe('boolean');
            });

            it('should have async swap method that returns a Promise<string | null>', async () => {
                const result = instance.swap('test');
                expect(result).toBeInstanceOf(Promise);
                const resolved = await result;
                expect(resolved === null || typeof resolved === 'string').toBe(true);
            });

            it('should have an initialize method', () => {
                const result = instance.initialize();
                if (name === 'HiraganaSwap') {
                    expect(result).toBeInstanceOf(Promise);
                } else {
                    expect(result).toBe(undefined);
                }
            });
        });
    });

    describe('Promise behavior', () => {
        it('canSwap should handle rejection gracefully', async () => {
            // Test with a simple swapper that doesn't do async operations
            const swapper = new MorseCodeSwap();
            
            // This should not throw
            await expect(swapper.canSwap('test')).resolves.toBeDefined();
        });

        it('swap should handle rejection gracefully', async () => {
            const swapper = new MorseCodeSwap();
            
            // This should not throw
            await expect(swapper.swap('test')).resolves.toBeDefined();
        });
    });

    describe('Backwards compatibility', () => {
        it('should maintain correct behavior for simple swappers', async () => {
            const morseSwap = new MorseCodeSwap();
            
            // Should still work correctly with alphabetic input
            expect(await morseSwap.canSwap('hello')).toBe(true);
            expect(await morseSwap.canSwap('123')).toBe(false);
            
            const result = await morseSwap.swap('hello');
            expect(result).toContain('morse-code');
            expect(result).toContain('data-pmapper-original="hello"');
        });

        it('should maintain correct behavior for Braille swapper', async () => {
            const brailleSwap = new BrailleSwap();
            
            expect(await brailleSwap.canSwap('hello')).toBe(true);
            expect(await brailleSwap.canSwap('123')).toBe(false);
            
            const result = await brailleSwap.swap('hello');
            expect(result).toContain('braille-unicode');
            expect(result).toContain('data-pmapper-original="hello"');
        });
    });
});