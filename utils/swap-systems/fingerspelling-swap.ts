import {IPhoneticSwap} from './interfaces';

export class FingerspellingSwap implements IPhoneticSwap {
    readonly title = 'English to ASL Fingerspelling';
    readonly description = 'Converts English words to ASL fingerspelling';
    readonly isNeglectable = false;

    async swap(input: string): Promise<string> {
        // Create span element using template string
        return `<span class="finger-spelling pmapper-swapped pmapper-tooltip" data-pmapper-original="${input}">${input.toLowerCase()}</span>`;
    }

    initialize(): void {
    }

    // only return true if the input is composed entirely of A-Z or a-z characters
    async canSwap(input: string): Promise<boolean> {
        return isAlphabetical(input, 4);
    }
}