import { IPhoneticSwap } from './interfaces';
import { ITrueKanaDataLoader, ExtensionTrueKanaDataLoader, TrueKanaMapping, TrueKanaEntry } from '@/utils/data-loaders';
import { logger } from '@/utils/logger';

export enum TrueKanaMode {
    OnlyTransliterations = 'OnlyTransliterations',
    AllWords = 'AllWords'
}

export interface TrueKanaOptions {
    mode?: TrueKanaMode;
}

export class TrueKanaSwap implements IPhoneticSwap {
    readonly title = 'True Katakana';
    readonly description = 'Converts English words to authentic Katakana loan words';
    readonly isNeglectable = true;

    // Instance data storage
    private trueKanaMap: TrueKanaMapping = {};
    private isInitialized: boolean = false;
    private initPromise: Promise<void> | null = null;
    private dataLoader: ITrueKanaDataLoader;
    private mode: TrueKanaMode = TrueKanaMode.OnlyTransliterations;

    constructor(dataLoader?: ITrueKanaDataLoader) {
        // Default to ExtensionTrueKanaDataLoader if not provided
        this.dataLoader = dataLoader || new ExtensionTrueKanaDataLoader();
    }

    initialize(): void {
        if (!this.initPromise) {
            this.initPromise = this.loadData();
        }
    }

    private async loadData(): Promise<void> {
        try {
            // Load data using the injected loader
            this.trueKanaMap = await this.dataLoader.loadTrueKanaData();
            this.isInitialized = true;
        } catch (error) {
            logger.error('Failed to load True Katakana data:', error);
            this.isInitialized = false;
        }
    }

    setMode(mode: TrueKanaMode): void {
        this.mode = mode;
    }

    async swap(input: string, options?: TrueKanaOptions): Promise<string | null> {
        await this.initPromise;
        
        if (!this.isInitialized) {
            return null;
        }

        const mode = options?.mode || this.mode;
        logger.debug(`TrueKanaSwap.swap called with input: "${input}", options: ${JSON.stringify(options)}, effective mode: ${mode}`);

        // Normalize input to lowercase for lookup
        const normalizedInput = input.toLowerCase();
        
        // Look up the katakana entries
        const entries = this.trueKanaMap[normalizedInput];
        
        if (!entries || entries.length === 0) {
            logger.debug(`No True Katakana equivalent found for: ${input}`);
            return null;
        }

        // Filter based on mode
        let validEntries: TrueKanaEntry[];
        if (mode === TrueKanaMode.OnlyTransliterations) {
            validEntries = entries.filter(entry => entry.isTransliteration);
        } else {
            validEntries = entries;
        }

        if (validEntries.length === 0) {
            logger.debug(`No valid True Katakana entries for mode ${mode}: ${input}`);
            return null;
        }

        // For now, use the first valid entry (could randomize in the future)
        const katakana = validEntries[0].katakana;
        
        logger.debug(`True Katakana equivalent for "${input}" is "${katakana}" (mode: ${mode})`);

        // Return the Katakana wrapped in HTML
        return `<span class="true-kana-text pmapper-swapped pmapper-tooltip" data-pmapper-original="${input}">${katakana}</span>`;
    }

    async canSwap(input: string, options?: TrueKanaOptions): Promise<boolean> {
        await this.initPromise;
        
        if (!this.isInitialized) {
            logger.error('TrueKanaSwap is not initialized');
            return false;
        }

        const mode = options?.mode || this.mode;
        logger.debug(`TrueKanaSwap.canSwap called with input: "${input}", options: ${JSON.stringify(options)}, effective mode: ${mode}`);
        
        const normalizedInput = input.toLowerCase();
        
        if (typeof input !== 'string' || input.length < 2) {
            return false;
        }

        const entries = this.trueKanaMap[normalizedInput];
        if (!entries || entries.length === 0) {
            return false;
        }

        // Check based on mode
        if (mode === TrueKanaMode.OnlyTransliterations) {
            return entries.some(entry => entry.isTransliteration);
        }

        return true;
    }
}