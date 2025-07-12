import {IPhoneticSwap} from './interfaces';
import {ICockneyDataLoader, ExtensionCockneyDataLoader, CockneyEntry, ProcessedCockneyData} from '@/utils/data-loaders';
import { logger } from '@/utils/logger';

export interface CockneySwapOptions {
    useFullRhyme?: boolean; // If true, use the full rhyme; if false/undefined, use the cockney (shortened) version
}

export class CockneySwap implements IPhoneticSwap {
    readonly title = 'Cockney';
    readonly description = 'Converts English words to Cockney rhyming slang';
    readonly isNeglectable = true;

    // Instance data storage
    private cockneyData: ProcessedCockneyData = {};
    private isInitialized: boolean = false;
    private initPromise: Promise<void> | null = null;
    private dataLoader: ICockneyDataLoader;

    constructor(dataLoader?: ICockneyDataLoader) {
        // Default to ExtensionCockneyDataLoader if not provided
        this.dataLoader = dataLoader || new ExtensionCockneyDataLoader();
    }

    initialize(): void {
        if (!this.initPromise) {
            this.initPromise = this.loadData();
        }
    }

    private async loadData(): Promise<void> {
        try {
            // Load data using the injected loader
            this.cockneyData = await this.dataLoader.loadCockneyData();
            this.isInitialized = true;
        } catch (error) {
            logger.error('Failed to load Cockney data:', error);
            this.isInitialized = false;
        }
    }

    async swap(input: string, options?: CockneySwapOptions): Promise<string | null> {
        await this.initPromise;
        
        if (!this.isInitialized) {
            return null;
        }

        // Normalize input for lookup
        const normalizedInput = input.toLowerCase().trim();
        
        // Look up the cockney equivalents
        const entries = this.cockneyData[normalizedInput];
        
        if (!entries || entries.length === 0) {
            logger.debug(`No Cockney equivalent found for: ${input}`);
            return null;
        }

        // Pick a random entry if there are multiple
        const selectedEntry = entries[Math.floor(Math.random() * entries.length)];
        
        // Determine which version to use based on options
        const useFullRhyme = options?.useFullRhyme ?? false;
        const translation = useFullRhyme ? selectedEntry.rhyme : selectedEntry.cockney;
        
        if (!translation) {
            logger.debug(`No ${useFullRhyme ? 'rhyme' : 'cockney'} translation found for: ${input}`);
            return null;
        }

        logger.debug(`Cockney equivalent for "${input}" is "${translation}" (${useFullRhyme ? 'full rhyme' : 'shortened'})`);
        
        // Add a data attribute with notes if available
        const notesAttr = selectedEntry.notes ? `data-pmapper-notes="${selectedEntry.notes}"` : '';

        // Return the Cockney wrapped in HTML
        return `<span class="cockney-text pmapper-swapped pmapper-tooltip" data-pmapper-original="${input}" ${notesAttr}>${translation}</span>`;
    }

    async canSwap(input: string): Promise<boolean> {
        await this.initPromise;
        
        if (!this.isInitialized) {
            logger.error('CockneySwap is not initialized');
            return false;
        }
        
        logger.debug(`Checking if we can swap: ${input}`);
        const normalizedInput = input.toLowerCase().trim();
        return typeof input === 'string' && input.length > 0 && normalizedInput in this.cockneyData;
    }
}