import {IPhoneticSwap} from './interfaces';

export class MorseCodeSwap implements IPhoneticSwap {
    readonly title = 'English to Morse Code';
    readonly description = 'Converts English words to Morse Code';
    readonly isNeglectable = false;

    async swap(input: string): Promise<string> {
        // Create span element using template string
        return `<span class="morse-code pmapper-swapped pmapper-tooltip" data-pmapper-original="${input}">${input.toLowerCase()}</span>`;
    }

    initialize(): void {
    }

    // only return true if the input is composed entirely of A-Z or a-z characters
    async canSwap(input: string, options?: any): Promise<boolean> {
        return isAlphabetical(input, 4);
    }
}