// Data loader interfaces and implementations for flexible data access

export interface IHiraganaDataLoader {
    loadWordToIpa(): Promise<Array<[string, string[]]>>;
    loadIpaToHiragana(): Promise<Record<string, { hiragana: string; score: number }>>;
}

// For use in browser extensions
export class ExtensionDataLoader implements IHiraganaDataLoader {
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
export class InMemoryDataLoader implements IHiraganaDataLoader {
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
export class RemoteDataLoader implements IHiraganaDataLoader {
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

// For use in Node.js environments
export class FileSystemDataLoader implements IHiraganaDataLoader {
    constructor(
        private wordToIpaPath: string,
        private ipaToHiraganaPath: string
    ) {}

    async loadWordToIpa(): Promise<Array<[string, string[]]>> {
        // Check if we're in Node.js environment
        if (typeof process !== 'undefined' && process.versions && process.versions.node) {
            const fs = await import('fs/promises');
            const content = await fs.readFile(this.wordToIpaPath, 'utf-8');
            return JSON.parse(content);
        } else {
            throw new Error('FileSystemDataLoader can only be used in Node.js environments');
        }
    }

    async loadIpaToHiragana(): Promise<Record<string, { hiragana: string; score: number }>> {
        if (typeof process !== 'undefined' && process.versions && process.versions.node) {
            const fs = await import('fs/promises');
            const content = await fs.readFile(this.ipaToHiraganaPath, 'utf-8');
            return JSON.parse(content);
        } else {
            throw new Error('FileSystemDataLoader can only be used in Node.js environments');
        }
    }
}