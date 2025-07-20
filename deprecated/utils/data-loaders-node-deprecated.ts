// Node.js-specific deprecated data loaders
// These should ONLY be imported in Node.js environments

import { promises as fs } from 'fs';
import type { IHiraganaDataLoader_Deprecated } from './data-loaders-deprecated';

// For use in Node.js environments
export class FileSystemDataLoader_Deprecated implements IHiraganaDataLoader_Deprecated {
    constructor(
        private wordToIpaPath: string,
        private ipaToHiraganaPath: string
    ) {}

    async loadWordToIpa(): Promise<Array<[string, string[]]>> {
        const content = await fs.readFile(this.wordToIpaPath, 'utf-8');
        return JSON.parse(content);
    }

    async loadIpaToHiragana(): Promise<Record<string, { hiragana: string; score: number }>> {
        const content = await fs.readFile(this.ipaToHiraganaPath, 'utf-8');
        return JSON.parse(content);
    }
}