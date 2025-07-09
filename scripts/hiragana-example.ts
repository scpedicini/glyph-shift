#!/usr/bin/env tsx
/**
 * Example of using HiraganaSwap in a standalone Node.js script
 * Run with: tsx scripts/hiragana-example.ts
 */

import { HiraganaSwap_Deprecated } from '../utils/swap-systems/hiragana-swap-deprecated';
import { FileSystemDataLoader_Deprecated } from '../utils/data-loaders'
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function main() {
    console.log('HiraganaSwap Node.js Example\n');

    // Create paths to the JSON data files
    const dataDir = path.join(__dirname, '../public/data');
    const wordToIpaPath = path.join(dataDir, 'hiragana-word-to-ipa.json');
    const ipaToHiraganaPath = path.join(dataDir, 'hiragana-ipa-to-hiragana.json');

    // Create HiraganaSwap with FileSystemDataLoader
    console.log('Loading data from:', dataDir);
    const dataLoader = new FileSystemDataLoader_Deprecated(wordToIpaPath, ipaToHiraganaPath);
    const hiraganaSwap = new HiraganaSwap_Deprecated(dataLoader);
    
    // Initialize (this loads the data)
    hiraganaSwap.initialize();

    // Test some words
    const testWords = [
        'hello', 'world', 'computer', 'programming', 
        'javascript', 'typescript', 'code', 'function',
        'variable', 'constant', 'array', 'object'
    ];

    console.log('\nConverting words to Hiragana:\n');
    
    for (const word of testWords) {
        const canSwap = await hiraganaSwap.canSwap(word);
        
        if (canSwap) {
            const result = await hiraganaSwap.swap(word);
            // Extract the Hiragana text from the HTML
            const hiragana = result?.match(/>([^<]+)</)?.[1] || 'ERROR';
            console.log(`${word.padEnd(15)} → ${hiragana}`);
        } else {
            console.log(`${word.padEnd(15)} → [not in dictionary]`);
        }
    }

    // Example of converting a sentence
    console.log('\nConverting a sentence:\n');
    const sentence = 'Hello world this is a test';
    const words = sentence.split(' ');
    const convertedWords = [];

    for (const word of words) {
        const canSwap = await hiraganaSwap.canSwap(word);
        if (canSwap) {
            const result = await hiraganaSwap.swap(word);
            const hiragana = result?.match(/>([^<]+)</)?.[1] || word;
            convertedWords.push(hiragana);
        } else {
            convertedWords.push(`[${word}]`);
        }
    }

    console.log(`Original: ${sentence}`);
    console.log(`Hiragana: ${convertedWords.join(' ')}`);
}

// Run the example
main().catch(console.error);