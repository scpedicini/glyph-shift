import {IPhoneticSwap} from './interfaces';
import {BrailleOptions} from '@/utils/common';
import {BrailleSys} from '@/utils/braille-sys';

export class BrailleSwap implements IPhoneticSwap {
    readonly title = 'English to Braille';
    readonly description = 'Converts English words to Braille';
    readonly isNeglectable = false;

    async swap(input: string, options?: BrailleOptions): Promise<string> {
        const useAdvancedWords = options?.advancedWords || false;

        const input2 = BrailleSys.convertWordToBraille1(input);

        return `<span class="braille-unicode pmapper-swapped pmapper-tooltip" data-pmapper-original="${input}">${input2}</span>`;
    }

    initialize(): void {
    }

    async canSwap(input: string): Promise<boolean> {
        return /^[a-zA-Z]+$/.test(input);
    }
}