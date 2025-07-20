// Node.js-specific data loaders for tests and scripts
// These should ONLY be imported in Node.js environments

import { promises as fs } from 'fs';
import type { 
    IHiraganaDataLoader, 
    ICockneyDataLoader,
    ITrueKanaDataLoader,
    ProcessedCockneyData,
    TrueKanaMapping
} from './data-loaders-browser';

export class FileSystemHiraganaDataLoader implements IHiraganaDataLoader {
    constructor(private engKanaDictPath: string) {}

    async loadEngKanaDict(): Promise<Record<string, string[]>> {
        const content = await fs.readFile(this.engKanaDictPath, 'utf-8');
        return JSON.parse(content);
    }
}

// For use in Node.js environments - DEPRECATED: KatakanaSwap now uses FileSystemHiraganaDataLoader
// export class FileSystemKatakanaDataLoader implements IKatakanaDataLoader {
//     constructor(
//         private loanWordsPath: string
//     ) {}

//     async loadLoanWords(): Promise<Record<string, string>> {
//         const content = await fs.readFile(this.loanWordsPath, 'utf-8');
//         return JSON.parse(content);
//     }
// }

// For use in Node.js environments
export class FileSystemCockneyDataLoader implements ICockneyDataLoader {
    constructor(
        private cockneyDataPath: string
    ) {}

    async loadCockneyData(): Promise<ProcessedCockneyData> {
        const content = await fs.readFile(this.cockneyDataPath, 'utf-8');
        return JSON.parse(content);
    }
}

// For use in Node.js environments
export class FileSystemTrueKanaDataLoader implements ITrueKanaDataLoader {
    constructor(
        private trueKanaDataPath: string
    ) {}

    async loadTrueKanaData(): Promise<TrueKanaMapping> {
        const content = await fs.readFile(this.trueKanaDataPath, 'utf-8');
        return JSON.parse(content);
    }
}