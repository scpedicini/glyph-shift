import {BrailleOptions, SwapLangs} from "@/utils/common";
import {BrailleSys} from "@/utils/braille-sys";
import {IHiraganaDataLoader, ExtensionDataLoader} from "@/utils/data-loaders";

export interface ISwapConfig {
}


export interface IPhoneticSwap {
    readonly title: string;
    readonly description: string;
    swap: (input: string, options?: any) => Promise<string | null>;
    initialize: () => void;
    canSwap: (input: string) => Promise<boolean>;
}



export class HiraganaSwap implements IPhoneticSwap {
    readonly title = 'Hiragana';
    readonly description = 'Converts English words to Hiragana';

    // Instance data storage
    private wordToIpaMap: Map<string, string[]> = new Map();
    private ipaToHiraganaMap: Map<string, { hiragana: string, score: number }> = new Map();
    private ipaPhonemeInventory: string[] = [];
    private isInitialized: boolean = false;
    private initPromise: Promise<void> | null = null;
    private dataLoader: IHiraganaDataLoader;

    constructor(dataLoader?: IHiraganaDataLoader) {
        // Default to ExtensionDataLoader if not provided
        this.dataLoader = dataLoader || new ExtensionDataLoader();
    }

    initialize(): void {
        if (!this.initPromise) {
            this.initPromise = this.loadData();
        }
    }

    private async loadData(): Promise<void> {
        try {
            // Load data using the injected loader
            const wordToIpaData = await this.dataLoader.loadWordToIpa();
            const ipaToHiraganaData = await this.dataLoader.loadIpaToHiragana();
            
            // Populate wordToIpaMap
            this.wordToIpaMap.clear();
            for (const [word, ipas] of wordToIpaData) {
                this.wordToIpaMap.set(word, ipas);
            }

            // Populate ipaToHiraganaMap
            this.ipaToHiraganaMap.clear();
            for (const [ipa, data] of Object.entries(ipaToHiraganaData)) {
                this.ipaToHiraganaMap.set(ipa, data);
            }

            // Create phoneme inventory sorted by length (longest first)
            this.ipaPhonemeInventory = [...this.ipaToHiraganaMap.keys()]
                .sort((a, b) => b.length - a.length);

            this.isInitialized = true;
        } catch (error) {
            console.error('Failed to load Hiragana data:', error);
            this.isInitialized = false;
        }
    }

    private parseIpaToPhonemes(ipa: string): string[] {
        const phonemes: string[] = [];
        // Remove stress markers and other diacritics that we don't need
        let cleanedIpa = ipa.replace(/[ˈˌ]/g, '');
        
        let currentPos = 0;
        while (currentPos < cleanedIpa.length) {
            let matchFound = false;
            
            // Try to match the longest phoneme first
            for (const phoneme of this.ipaPhonemeInventory) {
                if (cleanedIpa.startsWith(phoneme, currentPos)) {
                    phonemes.push(phoneme);
                    currentPos += phoneme.length;
                    matchFound = true;
                    break;
                }
            }
            
            // If no match found, skip this character
            if (!matchFound) {
                currentPos++;
            }
        }
        
        return phonemes;
    }

    async swap(input: string): Promise<string | null> {
        await this.initPromise;
        
        if (!this.isInitialized) {
            return null;
        }

        // Normalize input
        const normalizedInput = input.toUpperCase();
        
        // Get IPA pronunciations
        const ipaPronunciations = this.wordToIpaMap.get(normalizedInput);
        if (!ipaPronunciations || ipaPronunciations.length === 0) {
            return null;
        }

        // Try each pronunciation and find the best one
        let bestHiragana = '';
        let bestScore = -1;

        for (const ipa of ipaPronunciations) {
            // Parse IPA into phonemes
            const phonemes = this.parseIpaToPhonemes(ipa);
            
            // Map phonemes to Hiragana
            let hiraganaResult = '';
            let cumulativeScore = 0;
            let allPhonemesMapped = true;

            for (const phoneme of phonemes) {
                const mapping = this.ipaToHiraganaMap.get(phoneme);
                if (!mapping) {
                    allPhonemesMapped = false;
                    break;
                }
                hiraganaResult += mapping.hiragana;
                cumulativeScore += mapping.score;
            }

            // Skip this pronunciation if not all phonemes could be mapped
            if (!allPhonemesMapped) {
                continue;
            }

            // Check if this is the best pronunciation so far
            if (cumulativeScore > bestScore) {
                bestScore = cumulativeScore;
                bestHiragana = hiraganaResult;
            }
        }

        // Return null if no valid pronunciation was found
        if (bestScore === -1) {
            return null;
        }

        // Return the Hiragana wrapped in HTML
        return `<span class="hiragana-text pmapper-swapped pmapper-tooltip" data-pmapper-original="${input}">${bestHiragana}</span>`;
    }

    async canSwap(input: string): Promise<boolean> {
        await this.initPromise;
        
        if (!this.isInitialized) {
            return false;
        }

        const normalizedInput = input.toUpperCase();
        return this.wordToIpaMap.has(normalizedInput);
    }
}


export class FingerspellingSwap implements IPhoneticSwap {
    readonly title = 'English to ASL Fingerspelling';
    readonly description = 'Converts English words to ASL fingerspelling';

    async swap(input: string): Promise<string> {
        // Create span element using template string
        return `<span class="finger-spelling pmapper-swapped pmapper-tooltip" data-pmapper-original="${input}">${input.toLowerCase()}</span>`;
    }

    initialize(): void {
    }

    // only return true if the input is composed entirely of A-Z or a-z characters
    async canSwap(input: string): Promise<boolean> {
        return /^[a-zA-Z]+$/.test(input);
    }
}

export class MorseCodeSwap implements IPhoneticSwap {
    readonly title = 'English to Morse Code';
    readonly description = 'Converts English words to Morse Code';

    async swap(input: string): Promise<string> {
        // Create span element using template string
        return `<span class="morse-code pmapper-swapped pmapper-tooltip" data-pmapper-original="${input}">${input.toLowerCase()}</span>`;
    }

    initialize(): void {
    }

    // only return true if the input is composed entirely of A-Z or a-z characters
    async canSwap(input: string): Promise<boolean> {
        return /^[a-zA-Z]+$/.test(input);
    }
}

export class VorticonSwap implements IPhoneticSwap {
    readonly title = 'English to Vorticon';
    readonly description = 'Converts English text to Vorticon (Standard Galactic Alphabet)';

    async swap(input: string): Promise<string> {
        // Create span element using template string
        return `<span class="vorticon-sga pmapper-swapped pmapper-tooltip" data-pmapper-original="${input}">${input}</span>`;
    }

    initialize(): void {
    }

    // only return true if the input is composed entirely of A-Z or a-z characters
    async canSwap(input: string): Promise<boolean> {
        return /^[a-zA-Z]+$/.test(input);
    }
}



export class BrailleSwap implements IPhoneticSwap {
    readonly title = 'English to Braille';
    readonly description = 'Converts English words to Braille';

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
