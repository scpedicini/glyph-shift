import * as fs from 'fs/promises';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function prepareLoanWordsData() {
    console.log('Starting loan words data preparation...');
    
    // Read the TSV file
    const tsvPath = path.join(__dirname, 'katakana_loan_words.tsv');
    const tsvContent = await fs.readFile(tsvPath, 'utf-8');
    
    // Parse TSV
    const lines = tsvContent.trim().split('\n');
    const headers = lines[0].split('\t');
    
    // Create a mapping object
    const loanWordsMap: Record<string, string> = {};
    
    for (let i = 1; i < lines.length; i++) {
        const [katakana, english] = lines[i].split('\t');
        if (katakana && english) {
            // Normalize English word to uppercase for consistent lookups
            // Remove any carriage returns or extra whitespace
            loanWordsMap[english.trim().toUpperCase()] = katakana.trim();
        }
    }
    
    // Create output directory if it doesn't exist
    const outputDir = path.join(__dirname, '..', 'public', 'data');
    await fs.mkdir(outputDir, { recursive: true });
    
    // Write JSON file
    const outputPath = path.join(outputDir, 'katakana-loan-words.json');
    await fs.writeFile(
        outputPath,
        JSON.stringify(loanWordsMap, null, 2),
        'utf-8'
    );
    
    console.log(`Created ${outputPath}`);
    console.log(`Total loan words: ${Object.keys(loanWordsMap).length}`);
}

// Run the preparation
prepareLoanWordsData().catch(console.error);