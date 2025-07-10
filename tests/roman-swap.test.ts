import { describe, it, expect, beforeAll } from 'vitest';
import { RomanSwap } from '../utils/swap-systems/roman-swap';

describe('RomanSwap', () => {
    let romanSwap: RomanSwap;

    beforeAll(() => {
        romanSwap = new RomanSwap();
        romanSwap.initialize();
    });

    describe('canSwap', () => {
        it('should return true for valid numbers between 1 and 3999', async () => {
            expect(await romanSwap.canSwap('1')).toBe(true);
            expect(await romanSwap.canSwap('42')).toBe(true);
            expect(await romanSwap.canSwap('100')).toBe(true);
            expect(await romanSwap.canSwap('999')).toBe(true);
            expect(await romanSwap.canSwap('1984')).toBe(true);
            expect(await romanSwap.canSwap('3999')).toBe(true);
        });

        it('should return false for numbers outside the range', async () => {
            expect(await romanSwap.canSwap('0')).toBe(false);
            expect(await romanSwap.canSwap('-5')).toBe(false);
            expect(await romanSwap.canSwap('4000')).toBe(false);
            expect(await romanSwap.canSwap('5000')).toBe(false);
        });

        it('should return false for non-numeric strings', async () => {
            expect(await romanSwap.canSwap('abc')).toBe(false);
            expect(await romanSwap.canSwap('12a')).toBe(false);
            expect(await romanSwap.canSwap('1.5')).toBe(false);
            expect(await romanSwap.canSwap('1,000')).toBe(false);
            expect(await romanSwap.canSwap(' 42 ')).toBe(false);
            expect(await romanSwap.canSwap('IV')).toBe(false);
        });

        it('should return false for numbers with leading zeros', async () => {
            expect(await romanSwap.canSwap('01')).toBe(false);
            expect(await romanSwap.canSwap('0042')).toBe(false);
        });

        it('should return false for empty strings', async () => {
            expect(await romanSwap.canSwap('')).toBe(false);
        });
    });

    describe('swap', () => {
        it('should convert single digit numbers correctly', async () => {
            expect(await romanSwap.swap('1')).toContain('I');
            expect(await romanSwap.swap('5')).toContain('V');
            expect(await romanSwap.swap('9')).toContain('IX');
        });

        it('should convert double digit numbers correctly', async () => {
            expect(await romanSwap.swap('10')).toContain('X');
            expect(await romanSwap.swap('42')).toContain('XLII');
            expect(await romanSwap.swap('58')).toContain('LVIII');
            expect(await romanSwap.swap('94')).toContain('XCIV');
        });

        it('should convert triple digit numbers correctly', async () => {
            expect(await romanSwap.swap('100')).toContain('C');
            expect(await romanSwap.swap('444')).toContain('CDXLIV');
            expect(await romanSwap.swap('500')).toContain('D');
            expect(await romanSwap.swap('900')).toContain('CM');
        });

        it('should convert four digit numbers correctly', async () => {
            expect(await romanSwap.swap('1000')).toContain('M');
            expect(await romanSwap.swap('1984')).toContain('MCMLXXXIV');
            expect(await romanSwap.swap('2024')).toContain('MMXXIV');
            expect(await romanSwap.swap('3999')).toContain('MMMCMXCIX');
        });

        it('should wrap result in proper HTML span with classes', async () => {
            const result = await romanSwap.swap('42');
            expect(result).toContain('<span class="roman-numeral pmapper-swapped pmapper-tooltip"');
            expect(result).toContain('data-pmapper-original="42"');
            expect(result).toContain('</span>');
        });

        it('should handle special Roman numeral patterns', async () => {
            expect(await romanSwap.swap('4')).toContain('IV');
            expect(await romanSwap.swap('40')).toContain('XL');
            expect(await romanSwap.swap('400')).toContain('CD');
            expect(await romanSwap.swap('90')).toContain('XC');
            expect(await romanSwap.swap('900')).toContain('CM');
        });
    });

    describe('delimited numbers', () => {
        it('should convert numbers with forward slashes', async () => {
            expect(await romanSwap.swap('10/5/32')).toContain('X/V/XXXII');
            expect(await romanSwap.swap('100/200')).toContain('C/CC');
        });

        it('should convert numbers with periods', async () => {
            expect(await romanSwap.swap('10.5.32')).toContain('X.V.XXXII');
            expect(await romanSwap.swap('1.2.3.4')).toContain('I.II.III.IV');
        });

        it('should convert numbers with dashes and em-dashes', async () => {
            expect(await romanSwap.swap('10-5-32')).toContain('X-V-XXXII');
            expect(await romanSwap.swap('10–5')).toContain('X–V');
            expect(await romanSwap.swap('10—5')).toContain('X—V');
        });

        it('should convert numbers with middle dots', async () => {
            expect(await romanSwap.swap('10·5·32')).toContain('X·V·XXXII');
            expect(await romanSwap.swap('10•5')).toContain('X•V');
        });

        it('should convert numbers with colons and semicolons', async () => {
            expect(await romanSwap.swap('10:5:32')).toContain('X:V:XXXII');
            expect(await romanSwap.swap('10;5')).toContain('X;V');
        });

        it('should convert numbers with mixed delimiters', async () => {
            expect(await romanSwap.swap('10-5.32')).toContain('X-V.XXXII');
            expect(await romanSwap.swap('1/2:3-4')).toContain('I/II:III-IV');
        });

        it('should handle invalid parts correctly', async () => {
            expect(await romanSwap.swap('10-abc-5')).toContain('X-abc-V');
            expect(await romanSwap.swap('0-10-4000')).toContain('0-X-4000');
        });

        it('should return true for canSwap with delimited valid numbers', async () => {
            expect(await romanSwap.canSwap('10/5/32')).toBe(true);
            expect(await romanSwap.canSwap('10-5.32')).toBe(true);
            expect(await romanSwap.canSwap('1:2:3')).toBe(true);
        });

        it('should return false for canSwap with no valid numbers', async () => {
            expect(await romanSwap.canSwap('abc/def')).toBe(false);
            expect(await romanSwap.canSwap('0-0-0')).toBe(false);
            expect(await romanSwap.canSwap('//')).toBe(false);
        });
    });

    describe('metadata', () => {
        it('should have correct title and description', () => {
            expect(romanSwap.title).toBe('Number to Roman Numeral');
            expect(romanSwap.description).toBe('Converts numbers (1-3999) to Roman numerals');
            expect(romanSwap.isNeglectable).toBe(true);
        });
    });
});