import { describe, it, expect, beforeAll } from 'vitest';
import { HexSwap } from '../utils/swap-systems/hex-swap';

describe('HexSwap', () => {
    let hexSwap: HexSwap;

    beforeAll(() => {
        hexSwap = new HexSwap();
        hexSwap.initialize();
    });

    describe('canSwap', () => {
        it('should return true for valid numbers between 0 and 255', async () => {
            expect(await hexSwap.canSwap('0')).toBe(true);
            expect(await hexSwap.canSwap('1')).toBe(true);
            expect(await hexSwap.canSwap('42')).toBe(true);
            expect(await hexSwap.canSwap('100')).toBe(true);
            expect(await hexSwap.canSwap('128')).toBe(true);
            expect(await hexSwap.canSwap('255')).toBe(true);
        });

        it('should return true for delimited valid numbers', async () => {
            expect(await hexSwap.canSwap('192-168-1-1')).toBe(true);
            expect(await hexSwap.canSwap('255/0/128')).toBe(true);
            expect(await hexSwap.canSwap('10.20.30')).toBe(true);
        });

        it('should return false for numbers outside the range', async () => {
            expect(await hexSwap.canSwap('-1')).toBe(false);
            expect(await hexSwap.canSwap('256')).toBe(false);
            expect(await hexSwap.canSwap('1000')).toBe(false);
            expect(await hexSwap.canSwap('-50')).toBe(false);
        });

        it('should return false for non-numeric strings', async () => {
            expect(await hexSwap.canSwap('abc')).toBe(false);
            expect(await hexSwap.canSwap('12a')).toBe(false);
            expect(await hexSwap.canSwap('1.5')).toBe(false);
            expect(await hexSwap.canSwap('FF')).toBe(false);
            expect(await hexSwap.canSwap('0xFF')).toBe(false);
        });

        it('should return false for empty strings', async () => {
            expect(await hexSwap.canSwap('')).toBe(false);
        });
    });

    describe('swap', () => {
        it('should convert single numbers correctly', async () => {
            expect(await hexSwap.swap('0')).toContain('0x00');
            expect(await hexSwap.swap('15')).toContain('0x0F');
            expect(await hexSwap.swap('16')).toContain('0x10');
            expect(await hexSwap.swap('255')).toContain('0xFF');
            expect(await hexSwap.swap('128')).toContain('0x80');
        });

        it('should convert delimited numbers correctly', async () => {
            expect(await hexSwap.swap('255-0-128')).toContain('0xFF-0x00-0x80');
            expect(await hexSwap.swap('192.168.1.1')).toContain('0xC0.0xA8.0x01.0x01');
            expect(await hexSwap.swap('10/20/30')).toContain('0x0A/0x14/0x1E');
            expect(await hexSwap.swap('1:2:3')).toContain('0x01:0x02:0x03');
        });

        it('should handle invalid parts correctly', async () => {
            expect(await hexSwap.swap('100-abc-200')).toContain('0x64-abc-0xC8');
            expect(await hexSwap.swap('256-10')).toContain('256-0x0A');
            // -1-50 splits as ['', '-', '1', '-', '50'] and 1 and 50 are valid
            expect(await hexSwap.swap('-1-50')).toContain('-0x01-0x32');
        });

        it('should wrap result in proper HTML span with classes', async () => {
            const result = await hexSwap.swap('42');
            expect(result).toContain('<span class="hex-number pmapper-swapped pmapper-tooltip"');
            expect(result).toContain('data-pmapper-original="42"');
            expect(result).toContain('</span>');
        });

        it('should use uppercase hex letters', async () => {
            expect(await hexSwap.swap('10')).toContain('0x0A');
            expect(await hexSwap.swap('11')).toContain('0x0B');
            expect(await hexSwap.swap('12')).toContain('0x0C');
            expect(await hexSwap.swap('13')).toContain('0x0D');
            expect(await hexSwap.swap('14')).toContain('0x0E');
            expect(await hexSwap.swap('15')).toContain('0x0F');
        });

        it('should pad single digit hex values with zero', async () => {
            expect(await hexSwap.swap('0')).toContain('0x00');
            expect(await hexSwap.swap('1')).toContain('0x01');
            expect(await hexSwap.swap('9')).toContain('0x09');
        });
    });

    describe('metadata', () => {
        it('should have correct title and description', () => {
            expect(hexSwap.title).toBe('Number to Hexadecimal');
            expect(hexSwap.description).toBe('Converts numbers (0-255) to hexadecimal format');
            expect(hexSwap.isNeglectable).toBe(true);
        });
    });
});