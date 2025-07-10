import { describe, it, expect } from 'vitest';
import { toRoman } from '../utils/roman-numerals';

describe('toRoman', () => {
    it('should convert single digit numbers correctly', () => {
        expect(toRoman(1)).toBe('I');
        expect(toRoman(2)).toBe('II');
        expect(toRoman(3)).toBe('III');
        expect(toRoman(4)).toBe('IV');
        expect(toRoman(5)).toBe('V');
        expect(toRoman(6)).toBe('VI');
        expect(toRoman(7)).toBe('VII');
        expect(toRoman(8)).toBe('VIII');
        expect(toRoman(9)).toBe('IX');
    });

    it('should convert powers of 10 correctly', () => {
        expect(toRoman(10)).toBe('X');
        expect(toRoman(50)).toBe('L');
        expect(toRoman(100)).toBe('C');
        expect(toRoman(500)).toBe('D');
        expect(toRoman(1000)).toBe('M');
    });

    it('should convert numbers with subtractive notation', () => {
        expect(toRoman(40)).toBe('XL');
        expect(toRoman(90)).toBe('XC');
        expect(toRoman(400)).toBe('CD');
        expect(toRoman(900)).toBe('CM');
    });

    it('should convert complex numbers correctly', () => {
        expect(toRoman(42)).toBe('XLII');
        expect(toRoman(58)).toBe('LVIII');
        expect(toRoman(94)).toBe('XCIV');
        expect(toRoman(444)).toBe('CDXLIV');
        expect(toRoman(1984)).toBe('MCMLXXXIV');
        expect(toRoman(2024)).toBe('MMXXIV');
        expect(toRoman(3888)).toBe('MMMDCCCLXXXVIII');
        expect(toRoman(3999)).toBe('MMMCMXCIX');
    });

    it('should handle edge cases', () => {
        expect(toRoman(1)).toBe('I');
        expect(toRoman(3999)).toBe('MMMCMXCIX');
    });

    it('should convert years correctly', () => {
        expect(toRoman(1776)).toBe('MDCCLXXVI');
        expect(toRoman(1945)).toBe('MCMXLV');
        expect(toRoman(2000)).toBe('MM');
        expect(toRoman(2025)).toBe('MMXXV');
    });

    it('should handle consecutive same symbols', () => {
        expect(toRoman(3)).toBe('III');
        expect(toRoman(30)).toBe('XXX');
        expect(toRoman(300)).toBe('CCC');
        expect(toRoman(3000)).toBe('MMM');
    });
});