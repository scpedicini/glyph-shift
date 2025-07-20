// Browser-compatible data loader interfaces and implementations

// New Hiragana data loader
export interface IHiraganaDataLoader {
    loadEngKanaDict(): Promise<Record<string, string[]>>;
}

export class ExtensionHiraganaDataLoader implements IHiraganaDataLoader {
    async loadEngKanaDict(): Promise<Record<string, string[]>> {
        const url = browser.runtime.getURL('/data/eng_kana_dict.json');
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

// Katakana data loader interfaces
export interface IKatakanaDataLoader {
    loadLoanWords(): Promise<Record<string, string>>;
}

// For use in browser extensions
export class ExtensionKatakanaDataLoader implements IKatakanaDataLoader {
    async loadLoanWords(): Promise<Record<string, string>> {
        const url = browser.runtime.getURL('/data/katakana-loan-words.json');
        const response = await fetch(url);
        return response.json();
    }
}

// For use in tests with predefined data
export class InMemoryKatakanaDataLoader implements IKatakanaDataLoader {
    constructor(
        private loanWordsData: Record<string, string>
    ) {}

    async loadLoanWords(): Promise<Record<string, string>> {
        return Promise.resolve(this.loanWordsData);
    }
}

// For use with remote URLs (web apps)
export class RemoteKatakanaDataLoader implements IKatakanaDataLoader {
    constructor(
        private loanWordsUrl: string
    ) {}

    async loadLoanWords(): Promise<Record<string, string>> {
        const response = await fetch(this.loanWordsUrl);
        return response.json();
    }
}

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