import {IPhoneticSwap} from './interfaces';
import {IHiraganaDataLoader, ExtensionHiraganaDataLoader} from '@/utils/data-loaders';
import {katakanaToHiragana} from '@/utils/japanese-utils';

export class HiraganaSwap implements IPhoneticSwap {
    readonly title = 'Hiragana';
    readonly description = 'Converts English words to Hiragana';
    readonly isNeglectable = true;

    // Instance data storage
    private engKanaMap: Map<string, string[]> = new Map();
    private isInitialized: boolean = false;
    private initPromise: Promise<void> | null = null;
    private dataLoader: IHiraganaDataLoader;

    constructor(dataLoader?: IHiraganaDataLoader) {
        // Default to ExtensionKatakanaDataLoader if not provided
        this.dataLoader = dataLoader || new ExtensionHiraganaDataLoader();
    }

    initialize(): Promise<void> {
        if (!this.initPromise) {
            this.initPromise = this.loadData();
        }
        return this.initPromise;
    }

    private async loadData(): Promise<void> {
        try {
            // Load data using the injected loader
            const engKanaData = await this.dataLoader.loadEngKanaDict();
            
            // Populate loanWordsMap
            this.engKanaMap.clear();
            for (const [english, kana] of Object.entries(engKanaData)) {
                this.engKanaMap.set(english, kana);
            }

            this.isInitialized = true;
        } catch (error) {
            console.error('Failed to load Hiragana data:', error);
            this.isInitialized = false;
        }
    }

    async swap(input: string): Promise<string | null> {
        await this.initPromise;
        
        if (!this.isInitialized) {
            return null;
        }

        // Normalize input to lowercase for lookup
        const normalizedInput = input.toLowerCase();
        
        // Look up the katakana equivalent
        const katakanaOptions = this.engKanaMap.get(normalizedInput);
        

        if (!katakanaOptions || katakanaOptions.length === 0) {
            console.log(`No Hiragana equivalent found for: ${input}`);
            return null;
        }

        // Choose a random katakana representation
        const katakana = katakanaOptions[Math.floor(Math.random() * katakanaOptions.length)];
        const hiragana = katakanaToHiragana(katakana);

        console.log(`Hiragana equivalent for "${input}" is "${hiragana}"`);

        // Return the Hiragana wrapped in HTML
        return `<span class="hiragana-text pmapper-swapped pmapper-tooltip" data-pmapper-original="${input}">${hiragana}</span>`;
    }

    async canSwap(input: string): Promise<boolean> {
        await this.initPromise;
        
        if (!this.isInitialized) {
            console.error('HiraganaSwap is not initialized');
            return false;
        }
        console.log(`Checking if we can swap: ${input}`);
        const normalizedInput = input.toLowerCase();
        return this.engKanaMap.has(normalizedInput);
    }
}