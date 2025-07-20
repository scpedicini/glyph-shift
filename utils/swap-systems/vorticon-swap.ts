import {IPhoneticSwap} from './interfaces';

export class VorticonSwap implements IPhoneticSwap {
    readonly title = 'English to Vorticon';
    readonly description = 'Converts English text to Vorticon (Standard Galactic Alphabet)';
    readonly isNeglectable = false;

    async swap(input: string): Promise<string> {
        // Create span element using template string
        return `<span class="vorticon-sga pmapper-swapped pmapper-tooltip" data-pmapper-original="${input}">${input}</span>`;
    }

    initialize(): void {
    }

    // only return true if the input is composed entirely of A-Z or a-z characters
    async canSwap(input: string, options?: any): Promise<boolean> {
        return isAlphabetical(input, 4);
    }
}