import { IPhoneticSwap } from './interfaces';

export abstract class DelimitedNumberSwapBase implements IPhoneticSwap {
    abstract readonly title: string;
    abstract readonly description: string;
    abstract readonly isNeglectable: boolean;

    // Define delimiters that can separate numbers
    protected readonly delimiters = [
        '/', '-', '.', '·', '•', '–', '—', '_', ':', ';', ',', ' ', '\u00A0', '\u2022', '\u2027'
    ];

    // Create regex pattern to split by any delimiter while keeping the delimiter
    // Put dash at the end to avoid regex range issues
    protected readonly delimiterPattern = new RegExp(
        `([/\\.·•–—_:;,\\s\\u00A0\\u2022\\u2027-])`,
        'g'
    );

    /**
     * Convert a single number to its target format
     */
    protected abstract convertNumber(num: number): string;

    /**
     * Check if a number is in the valid range for this converter
     */
    protected abstract isValidNumber(num: number): boolean;

    /**
     * Get the minimum and maximum values for this converter
     */
    protected abstract getRange(): { min: number; max: number };

    async swap(input: string): Promise<string> {
        // Split input by delimiters while keeping the delimiters
        const parts = input.split(this.delimiterPattern);
        
        // Convert each numeric part
        const convertedParts = parts.map(part => {
            const num = parseInt(part);
            if (!isNaN(num) && this.isValidNumber(num) && num.toString() === part) {
                return this.convertNumber(num);
            }
            return part; // Keep delimiters and invalid parts as-is
        });

        const result = convertedParts.join('');
        return `<span class="${this.getSpanClass()} pmapper-swapped pmapper-tooltip" data-pmapper-original="${input}">${result}</span>`;
    }

    initialize(): void {
        // Override if needed
    }

    async canSwap(input: string): Promise<boolean> {
        // First check if it's a simple number without delimiters
        const simpleNum = parseInt(input);
        const range = this.getRange();
        if (!isNaN(simpleNum) && simpleNum >= range.min && simpleNum <= range.max && simpleNum.toString() === input) {
            return true;
        }
        
        // Reject patterns that look like decimals, negative numbers (unless min < 0), or formatted numbers
        if ((range.min >= 0 && input.match(/^-\d/)) || // negative numbers when not allowed
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
            
            if (!isNaN(num) && this.isValidNumber(num) && num.toString() === part) {
                numberCount++;
            } else if (!this.delimiters.includes(part)) {
                // If it's not a delimiter and not a valid number, it's invalid
                hasInvalidPart = true;
            }
        }
        
        return numberCount >= 2 && !hasInvalidPart;
    }

    /**
     * Get the CSS class name for the span element
     */
    protected abstract getSpanClass(): string;
}