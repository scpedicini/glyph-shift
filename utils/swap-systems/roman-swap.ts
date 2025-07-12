import { DelimitedNumberSwapBase } from './delimited-number-swap-base';
import { toRoman } from '../roman-numerals';
import { logger } from '@/utils/logger';

export class RomanSwap extends DelimitedNumberSwapBase {
    readonly title = 'Number to Roman Numeral';
    readonly description = 'Converts numbers (1-3999) to Roman numerals';
    readonly isNeglectable = true;

    protected convertNumber(num: number): string {
        return toRoman(num);
    }

    protected isValidNumber(num: number): boolean {
        return num >= 1 && num <= 3999;
    }

    protected getRange(): { min: number; max: number } {
        return { min: 1, max: 3999 };
    }

    protected getSpanClass(): string {
        return 'roman-numeral';
    }

    // Override canSwap to add logging if needed
    async canSwap(input: string): Promise<boolean> {
        const result = await super.canSwap(input);
        logger.debug(`Checking if we can swap: ${input} -> ${result}`);
        return result;
    }
}