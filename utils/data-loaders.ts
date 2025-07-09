// Data loader interfaces and implementations for flexible data access

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

// For use in Node.js environments
export class FileSystemDataLoader_Deprecated implements IHiraganaDataLoader_Deprecated {
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

export class FileSystemHiraganaDataLoader implements IHiraganaDataLoader {
    constructor(private engKanaDictPath: string) {}

    async loadEngKanaDict(): Promise<Record<string, string[]>> {
        if (typeof process !== 'undefined' && process.versions && process.versions.node) {
            const fs = await import('fs/promises');
            const content = await fs.readFile(this.engKanaDictPath, 'utf-8');
            return JSON.parse(content);
        } else {
            throw new Error('FileSystemHiraganaDataLoader can only be used in Node.js environments');
        }
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

// For use in Node.js environments
export class FileSystemKatakanaDataLoader implements IKatakanaDataLoader {
    constructor(
        private loanWordsPath: string
    ) {}

    async loadLoanWords(): Promise<Record<string, string>> {
        if (typeof process !== 'undefined' && process.versions && process.versions.node) {
            const fs = await import('fs/promises');
            const content = await fs.readFile(this.loanWordsPath, 'utf-8');
            return JSON.parse(content);
        } else {
            throw new Error('FileSystemKatakanaDataLoader can only be used in Node.js environments');
        }
    }
}