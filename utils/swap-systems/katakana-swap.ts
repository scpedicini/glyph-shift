import {IPhoneticSwap} from './interfaces';
import {IKatakanaDataLoader, ExtensionKatakanaDataLoader} from '@/utils/data-loaders';

export class KatakanaSwap implements IPhoneticSwap {
    readonly title = 'Katakana';
    readonly description = 'Converts English words to Katakana';
    readonly isNeglectable = true;

    // Instance data storage
    private loanWordsMap: Map<string, string> = new Map();
    private isInitialized: boolean = false;
    private initPromise: Promise<void> | null = null;
    private dataLoader: IKatakanaDataLoader;

    constructor(dataLoader?: IKatakanaDataLoader) {
        // Default to ExtensionKatakanaDataLoader if not provided
        this.dataLoader = dataLoader || new ExtensionKatakanaDataLoader();
    }

    initialize(): void {
        if (!this.initPromise) {
            this.initPromise = this.loadData();
        }
    }

    private async loadData(): Promise<void> {
        try {
            // Load data using the injected loader
            const loanWordsData = await this.dataLoader.loadLoanWords();
            
            // Populate loanWordsMap
            this.loanWordsMap.clear();
            for (const [english, katakana] of Object.entries(loanWordsData)) {
                this.loanWordsMap.set(english, katakana);
            }

            this.isInitialized = true;
        } catch (error) {
            console.error('Failed to load Katakana data:', error);
            this.isInitialized = false;
        }
    }

    async swap(input: string): Promise<string | null> {
        await this.initPromise;
        
        if (!this.isInitialized) {
            return null;
        }

        // Normalize input to uppercase for lookup
        const normalizedInput = input.toUpperCase();
        
        // Look up the katakana equivalent
        const katakana = this.loanWordsMap.get(normalizedInput);
        

        if (!katakana) {
            console.log(`No Katakana equivalent found for: ${input}`);
            return null;
        } else {
            console.log(`Katakana equivalent for "${input}" is "${katakana}"`);
        }

        // Return the Katakana wrapped in HTML
        return `<span class="katakana-text pmapper-swapped pmapper-tooltip" data-pmapper-original="${input}">${katakana}</span>`;
    }

    async canSwap(input: string): Promise<boolean> {
        await this.initPromise;
        
        if (!this.isInitialized) {
            console.error('KatakanaSwap is not initialized');
            return false;
        }
        console.log(`Checking if we can swap: ${input}`);
        const normalizedInput = input.toUpperCase();
        return this.loanWordsMap.has(normalizedInput);
    }
}