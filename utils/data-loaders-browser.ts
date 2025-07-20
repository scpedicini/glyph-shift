// Browser-compatible data loader interfaces and implementations

// New Hiragana data loader
export interface IHiraganaDataLoader {
    loadEngKanaDict(): Promise<Record<string, string[]>>;
}

export class ExtensionHiraganaDataLoader implements IHiraganaDataLoader {
    async loadEngKanaDict(): Promise<Record<string, string[]>> {
        const url = browser.runtime.getURL('/data/eng_10k_common_to_kana.json');
        const response = await fetch(url);
        return response.json();
    }
}

export class InMemoryHiraganaDataLoader implements IHiraganaDataLoader {
    constructor(private engKanaDict: Record<string, string[]>) {}

    async loadEngKanaDict(): Promise<Record<string, string[]>> {
        return Promise.resolve(this.engKanaDict);
    }
}

// Katakana data loader interfaces - DEPRECATED: KatakanaSwap now uses IHiraganaDataLoader
// Keeping these for backward compatibility but they should not be used

// Cockney rhyming slang data structures
export interface CockneyEntry {
    english: string;
    rhyme: string;
    cockney: string;
    notes: string;
    synonyms: string;
}

export interface ProcessedCockneyData {
    [english: string]: CockneyEntry[];
}

// Cockney data loader interfaces
export interface ICockneyDataLoader {
    loadCockneyData(): Promise<ProcessedCockneyData>;
}

// For use in browser extensions
export class ExtensionCockneyDataLoader implements ICockneyDataLoader {
    async loadCockneyData(): Promise<ProcessedCockneyData> {
        const url = browser.runtime.getURL('/data/cockney-rhyming-slang.json');
        const response = await fetch(url);
        return response.json();
    }
}

// For use in tests with predefined data
export class InMemoryCockneyDataLoader implements ICockneyDataLoader {
    constructor(
        private cockneyData: ProcessedCockneyData
    ) {}

    async loadCockneyData(): Promise<ProcessedCockneyData> {
        return Promise.resolve(this.cockneyData);
    }
}

// For use with remote URLs (web apps)
export class RemoteCockneyDataLoader implements ICockneyDataLoader {
    constructor(
        private cockneyDataUrl: string
    ) {}

    async loadCockneyData(): Promise<ProcessedCockneyData> {
        const response = await fetch(this.cockneyDataUrl);
        return response.json();
    }
}

// TrueKana data structures
export interface TrueKanaEntry {
    isTransliteration: boolean;
    katakana: string;
}

export interface TrueKanaMapping {
    [key: string]: TrueKanaEntry[];
}

// TrueKana data loader interfaces
export interface ITrueKanaDataLoader {
    loadTrueKanaData(): Promise<TrueKanaMapping>;
}

// For use in browser extensions
export class ExtensionTrueKanaDataLoader implements ITrueKanaDataLoader {
    async loadTrueKanaData(): Promise<TrueKanaMapping> {
        const url = browser.runtime.getURL('/data/true-katakana-mappings.json');
        const response = await fetch(url);
        return response.json();
    }
}

// For use in tests with predefined data
export class InMemoryTrueKanaDataLoader implements ITrueKanaDataLoader {
    constructor(
        private trueKanaData: TrueKanaMapping
    ) {}

    async loadTrueKanaData(): Promise<TrueKanaMapping> {
        return Promise.resolve(this.trueKanaData);
    }
}

// For use with remote URLs (web apps)
export class RemoteTrueKanaDataLoader implements ITrueKanaDataLoader {
    constructor(
        private trueKanaDataUrl: string
    ) {}

    async loadTrueKanaData(): Promise<TrueKanaMapping> {
        const response = await fetch(this.trueKanaDataUrl);
        return response.json();
    }
}