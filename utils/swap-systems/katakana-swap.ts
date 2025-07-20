import {IPhoneticSwap} from './interfaces';
import {IHiraganaDataLoader, ExtensionHiraganaDataLoader} from '@/utils/data-loaders';
import { logger } from '@/utils/logger';

export class KatakanaSwap implements IPhoneticSwap {
    readonly title = 'Katakana';
    readonly description = 'Converts English words to Katakana';
    readonly isNeglectable = true;

    // Instance data storage
    private engKanaMap: Map<string, string[]> = new Map();
    private isInitialized: boolean = false;
    private initPromise: Promise<void> | null = null;
    private dataLoader: IHiraganaDataLoader;

    constructor(dataLoader?: IHiraganaDataLoader) {
        // Default to ExtensionHiraganaDataLoader if not provided
        this.dataLoader = dataLoader || new ExtensionHiraganaDataLoader();
    }

    initialize(): void {
        if (!this.initPromise) {
            this.initPromise = this.loadData();
        }
    }

    private async loadData(): Promise<void> {
        try {
            // Load data using the injected loader
            const engKanaData = await this.dataLoader.loadEngKanaDict();
            
            // Populate engKanaMap
            this.engKanaMap.clear();
            for (const [english, kana] of Object.entries(engKanaData)) {
                this.engKanaMap.set(english, kana);
            }

            this.isInitialized = true;
        } catch (error) {
            logger.error('Failed to load Katakana data:', error);
            this.isInitialized = false;
        }
    }

    async swap(input: string): Promise<string | null> {
        await this.initPromise;
        
        if (!this.isInitialized) {
            return null;
        }

        // Normalize input to lowercase for lookup (matching HiraganaSwap pattern)
        const normalizedInput = input.toLowerCase();
        
        // Look up the katakana equivalent
        const katakanaOptions = this.engKanaMap.get(normalizedInput);
        

        if (!katakanaOptions || katakanaOptions.length === 0) {
            logger.debug(`No Katakana equivalent found for: ${input}`);
            return null;
        }

        // Choose a random katakana representation
        const katakana = katakanaOptions[Math.floor(Math.random() * katakanaOptions.length)];
        
        logger.debug(`Katakana equivalent for "${input}" is "${katakana}"`);

        // Return the Katakana wrapped in HTML
        return `<span class="katakana-text pmapper-swapped pmapper-tooltip" data-pmapper-original="${input}">${katakana}</span>`;
    }

    async canSwap(input: string, options?: any): Promise<boolean> {
        await this.initPromise;
        
        if (!this.isInitialized) {
            logger.error('KatakanaSwap is not initialized');
            return false;
        }
        logger.debug(`Checking if we can swap: ${input}`);
        const normalizedInput = input.toLowerCase();
        return typeof input === 'string' && input.length > 2 && this.engKanaMap.has(normalizedInput);
    }
}