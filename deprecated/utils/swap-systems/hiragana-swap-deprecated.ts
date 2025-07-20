import {IPhoneticSwap} from '@/utils/swap-systems/interfaces';
import {IHiraganaDataLoader_Deprecated, ExtensionDataLoader_Deprecated} from '@/deprecated/utils/data-loaders-deprecated';
import { logger } from '@/utils/logger';

/**
 * This has been deprecated in favor of the new HiraganaSwap class
 */
export class HiraganaSwap_Deprecated implements IPhoneticSwap {
    readonly title = 'Hiragana';
    readonly description = 'Converts English words to Hiragana';
    readonly isNeglectable = true;

    // Instance data storage
    private wordToIpaMap: Map<string, string[]> = new Map();
    private ipaToHiraganaMap: Map<string, { hiragana: string, score: number }> = new Map();
    private ipaPhonemeInventory: string[] = [];
    private isInitialized: boolean = false;
    private initPromise: Promise<void> | null = null;
    private dataLoader: IHiraganaDataLoader_Deprecated;

    constructor(dataLoader?: IHiraganaDataLoader_Deprecated) {
        // Default to ExtensionDataLoader if not provided
        this.dataLoader = dataLoader || new ExtensionDataLoader_Deprecated();
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
            logger.error('Failed to load Hiragana data:', error);
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