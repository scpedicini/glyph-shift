// Browser-compatible data loader interfaces and implementations

export interface IHiraganaDataLoader_Deprecated {
    loadWordToIpa(): Promise<Array<[string, string[]]>>;
    loadIpaToHiragana(): Promise<Record<string, { hiragana: string; score: number }>>;
}

// For use in browser extensions
export class ExtensionDataLoader_Deprecated implements IHiraganaDataLoader_Deprecated {
    async loadWordToIpa(): Promise<Array<[string, string[]]>> {
        const url = browser.runtime.getURL('/data/hiragana-word-to-ipa.json');
        const response = await fetch(url);
        return response.json();
    }

    async loadIpaToHiragana(): Promise<Record<string, { hiragana: string; score: number }>> {
        const url = browser.runtime.getURL('/data/hiragana-ipa-to-hiragana.json');
        const response = await fetch(url);
        return response.json();
    }
}

// For use in tests with predefined data
export class InMemoryDataLoader_Deprecated implements IHiraganaDataLoader_Deprecated {
    constructor(
        private wordToIpaData: Array<[string, string[]]>,
        private ipaToHiraganaData: Record<string, { hiragana: string; score: number }>
    ) {}

    async loadWordToIpa(): Promise<Array<[string, string[]]>> {
        return Promise.resolve(this.wordToIpaData);
    }

    async loadIpaToHiragana(): Promise<Record<string, { hiragana: string; score: number }>> {
        return Promise.resolve(this.ipaToHiraganaData);
    }
}

// For use with remote URLs (web apps)
export class RemoteDataLoader_Deprecated implements IHiraganaDataLoader_Deprecated {
    constructor(
        private wordToIpaUrl: string,
        private ipaToHiraganaUrl: string
    ) {}

    async loadWordToIpa(): Promise<Array<[string, string[]]>> {
        const response = await fetch(this.wordToIpaUrl);
        return response.json();
    }

    async loadIpaToHiragana(): Promise<Record<string, { hiragana: string; score: number }>> {
        const response = await fetch(this.ipaToHiraganaUrl);
        return response.json();
    }
}

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