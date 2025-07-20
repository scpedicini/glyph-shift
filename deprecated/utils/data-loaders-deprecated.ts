// Deprecated data loader interfaces and implementations

export interface IHiraganaDataLoader_Deprecated {
    loadWordToIpa(): Promise<Array<[string, string[]]>>;
    loadIpaToHiragana(): Promise<Record<string, { hiragana: string; score: number }>>;
}

// For use in browser extensions
// NOTE: This class is deprecated and won't work unless the data files are moved back to /public/data/
export class ExtensionDataLoader_Deprecated implements IHiraganaDataLoader_Deprecated {
    async loadWordToIpa(): Promise<Array<[string, string[]]>> {
        throw new Error('ExtensionDataLoader_Deprecated is no longer functional. Data files have been moved out of public directory.');
    }

    async loadIpaToHiragana(): Promise<Record<string, { hiragana: string; score: number }>> {
        throw new Error('ExtensionDataLoader_Deprecated is no longer functional. Data files have been moved out of public directory.');
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