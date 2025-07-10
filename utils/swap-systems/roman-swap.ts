import {IPhoneticSwap} from './interfaces';
import { toRoman } from '../roman-numerals';

export class RomanSwap implements IPhoneticSwap {
    readonly title = 'Number to Roman Numeral';
    readonly description = 'Converts numbers (1-3999) to Roman numerals';
    readonly isNeglectable = true;

    // Define delimiters that can separate numbers
    private readonly delimiters = [
        '/', '-', '.', '·', '•', '–', '—', '_', ':', ';', ',', ' ', '\u00A0', '\u2022', '\u2027'
    ];

    // Create regex pattern to split by any delimiter while keeping the delimiter
    // Put dash at the end to avoid regex range issues
    private readonly delimiterPattern = new RegExp(
        `([/\\.·•–—_:;,\\s\\u00A0\\u2022\\u2027-])`,
        'g'
    );

    async swap(input: string): Promise<string> {
        // Split input by delimiters while keeping the delimiters
        const parts = input.split(this.delimiterPattern);
        
        // Convert each numeric part to Roman numerals
        const convertedParts = parts.map(part => {
            const num = parseInt(part);
            if (!isNaN(num) && num >= 1 && num <= 3999 && num.toString() === part) {
                return toRoman(num);
            }
            return part; // Keep delimiters and invalid parts as-is
        });

        const result = convertedParts.join('');
        return `<span class="roman-numeral pmapper-swapped pmapper-tooltip" data-pmapper-original="${input}">${result}</span>`;
    }

    initialize(): void {

    }

    async canSwap(input: string): Promise<boolean> {
        
        // First check if it's a simple number without delimiters
        const simpleNum = parseInt(input);
        if (!isNaN(simpleNum) && simpleNum >= 1 && simpleNum <= 3999 && simpleNum.toString() === input) {
            return true;
        }
        
        // Reject patterns that look like decimals, negative numbers, or formatted numbers
        if (input.match(/^-\d/) || // negative numbers
            input.match(/^\d+\.\d+$/) || // decimals like 1.5
            input.match(/^\d{1,3}(,\d{3})+$/) || // thousands separator like 1,000
            input.match(/^\s+\d+\s*$/) || // numbers with only leading/trailing spaces
            input.match(/^\d+\s+$/)) { // numbers with only trailing spaces
            return false;
        }
        
        // Split by delimiters
        const parts = input.split(this.delimiterPattern).filter(p => p !== '');
        
        // If only one part after splitting, it's not a delimited number we want
        if (parts.length <= 1) {
            return false;
        }
        
        // Need at least 2 numbers separated by delimiters
        let numberCount = 0;
        let hasInvalidPart = false;
        
        for (let i = 0; i < parts.length; i++) {
            const part = parts[i];
            const num = parseInt(part);
            
            if (!isNaN(num) && num >= 1 && num <= 3999 && num.toString() === part) {
                numberCount++;
            } else if (!this.delimiters.includes(part)) {
                // If it's not a delimiter and not a valid number, it's invalid
                hasInvalidPart = true;
            }
        }
        
        const _isSwappable = numberCount >= 2 && !hasInvalidPart;
        console.log(`Checking if we can swap: ${input} -> ${_isSwappable}`);
        return _isSwappable;
    }
}