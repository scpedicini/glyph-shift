import {BrailleOptions, SwapLangs} from "@/utils/common";
import {BrailleSys} from "@/utils/braille-sys";

export interface ISwapConfig {
}


export interface IPhoneticSwap {
    readonly title: string;
    readonly description: string;
    swap: (input: string, options?: any) => string;
    initialize: () => void;
    canSwap: (input: string) => boolean;
}



export class HiraganaSwap implements IPhoneticSwap {
    readonly title = 'Hiragana';
    readonly description = 'Converts English words to Hiragana';

    swap(input: string): string {
        let retValue = "";
        return retValue;
    }

    initialize(): void {
    }

    canSwap(input: string): boolean {
        return true;
    }
}


export class FingerspellingSwap implements IPhoneticSwap {
    readonly title = 'English to ASL Fingerspelling';
    readonly description = 'Converts English words to ASL fingerspelling';

    swap(input: string): string {
        // Create span element using template string
        return `<span class="finger-spelling pmapper-swapped pmapper-tooltip" data-pmapper-original="${input}">${input.toLowerCase()}</span>`;
    }

    initialize(): void {
    }

    // only return true if the input is composed entirely of A-Z or a-z characters
    canSwap(input: string): boolean {
        return /^[a-zA-Z]+$/.test(input);
    }
}

export class MorseCodeSwap implements IPhoneticSwap {
    readonly title = 'English to Morse Code';
    readonly description = 'Converts English words to Morse Code';

    swap(input: string): string {
        // Create span element using template string
        return `<span class="morse-code pmapper-swapped pmapper-tooltip" data-pmapper-original="${input}">${input.toLowerCase()}</span>`;
    }

    initialize(): void {
    }

    // only return true if the input is composed entirely of A-Z or a-z characters
    canSwap(input: string): boolean {
        return /^[a-zA-Z]+$/.test(input);
    }
}

export class VorticonSwap implements IPhoneticSwap {
    readonly title = 'English to Vorticon';
    readonly description = 'Converts English text to Vorticon (Standard Galactic Alphabet)';

    swap(input: string): string {
        // Create span element using template string
        return `<span class="vorticon-sga pmapper-swapped pmapper-tooltip" data-pmapper-original="${input}">${input}</span>`;
    }

    initialize(): void {
    }

    // only return true if the input is composed entirely of A-Z or a-z characters
    canSwap(input: string): boolean {
        return /^[a-zA-Z]+$/.test(input);
    }
}



export class BrailleSwap implements IPhoneticSwap {
    readonly title = 'English to Braille';
    readonly description = 'Converts English words to Braille';

    swap(input: string, options?: BrailleOptions): string {
        const useAdvancedWords = options?.advancedWords || false;

        const input2 = BrailleSys.convertWordToBraille1(input);

        return `<span class="braille-unicode pmapper-swapped pmapper-tooltip" data-pmapper-original="${input}">${input2}</span>`;
    }

    initialize(): void {
    }

    canSwap(input: string): boolean {
        return /^[a-zA-Z]+$/.test(input);
    }
}

export class LanguageFactory {
    // holds a map of the enum SwapLangs to a singleton instance of the appropriate class (handles lazy instantiation)
    private static swapMap: Partial<Record<SwapLangs, IPhoneticSwap>> = {};

    static getSwapInstance(swapLang: SwapLangs) {
        if (!this.swapMap[swapLang]) {
            let _swapLang: IPhoneticSwap | undefined;
            switch (swapLang) {
                case SwapLangs.Hiragana:
                    this.swapMap[swapLang] = new HiraganaSwap();
                    break;
                case SwapLangs.Fingerspelling:
                    this.swapMap[swapLang] = new FingerspellingSwap();
                    break;
                case SwapLangs.Braille:
                    this.swapMap[swapLang] = new BrailleSwap();
                    break;
                case SwapLangs.MorseCode:
                    this.swapMap[swapLang] = new MorseCodeSwap();
                    break;
                case SwapLangs.Vorticon:
                    this.swapMap[swapLang] = new VorticonSwap();
                    break;
            }

            _swapLang && _swapLang!.initialize();
        }

        return this.swapMap[swapLang]!;
    }

}
