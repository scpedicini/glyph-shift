import { DelimitedNumberSwapBase } from './delimited-number-swap-base';

export class HexSwap extends DelimitedNumberSwapBase {
    readonly title = 'Number to Hexadecimal';
    readonly description = 'Converts numbers (0-255) to hexadecimal format';
    readonly isNeglectable = true;

    protected convertNumber(num: number): string {
        // Convert to hex with 0x prefix, padded to 2 digits
        return `0x${num.toString(16).padStart(2, '0').toUpperCase()}`;
    }

    protected isValidNumber(num: number): boolean {
        return num >= 0 && num <= 255;
    }

    protected getRange(): { min: number; max: number } {
        return { min: 0, max: 255 };
    }

    protected getSpanClass(): string {
        return 'hex-number';
    }
}