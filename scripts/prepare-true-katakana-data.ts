import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import Papa from 'papaparse';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface KatakanaEntry {
  isTransliteration: boolean;
  katakana: string;
}

interface KatakanaMapping {
  [key: string]: KatakanaEntry[];
}

interface CsvRow {
  Katakana: string;
  Transliteration: string;
  Additional: string;
}

function readCsvFile(filePath: string): Promise<any[]> {
  return new Promise((resolve, reject) => {
    const fileContent = fs.readFileSync(filePath, 'utf-8');
    Papa.parse(fileContent, {
      header: true,
      complete: (results) => resolve(results.data),
      error: (error: any) => reject(error)
    });
  });
}

function normalizeKey(key: string): string {
  return key.toLowerCase().trim();
}

function parseKatakanaVariants(katakanaField: string): string[] {
  // Handle multiple katakana forms separated by "or"/"OR", semicolon, or spaces
  let variants: string[] = [];
  
  // First split by "or"/"OR"
  const orParts = katakanaField.split(/\s+or\s+/i);
  
  // Then split each part by semicolon
  for (const part of orParts) {
    const semicolonParts = part.split(/[;；]/); // Include both ASCII and full-width semicolon
    
    for (const sPart of semicolonParts) {
      // For each semicolon-separated part, check if it contains multiple katakana separated by spaces
      // Only split by space if the parts look like individual katakana words
      const trimmed = sPart.trim();
      if (trimmed) {
        // Check if this might be multiple katakana words separated by spaces
        const spaceParts = trimmed.split(/\s+/);
        
        // If we have multiple parts and they all look like katakana, add them separately
        if (spaceParts.length > 1 && spaceParts.every(p => /^[\u30A0-\u30FF\u31F0-\u31FF]+$/.test(p))) {
          variants.push(...spaceParts);
        } else {
          // Otherwise, keep it as a single entry
          variants.push(trimmed);
        }
      }
    }
  }
  
  // Remove duplicates and empty strings
  return [...new Set(variants)].filter(v => v.length > 0);
}

function parseAdditionalWords(additionalField: string): string[] {
  if (!additionalField) return [];
  
  // Split by comma and clean up each word
  return additionalField.split(',').map(word => word.trim()).filter(word => word.length > 0);
}

async function prepareTrueKatakanaData() {
  console.log('Processing gairaigo_katakana_loanwords.csv...');
  const csvPath = path.join(__dirname, '../data-sources/gairaigo_katakana_loanwords.csv');
  const data = await readCsvFile(csvPath) as CsvRow[];
  
  const katakanaMapping: KatakanaMapping = {};
  const transliterationSet = new Set<string>();
  
  // First pass: collect all transliterations
  for (const row of data) {
    if (row.Transliteration && row.Transliteration.trim()) {
      const normalizedTransliteration = normalizeKey(row.Transliteration);
      transliterationSet.add(normalizedTransliteration);
    }
  }
  
  // Second pass: build the mapping
  for (const row of data) {
    if (!row.Katakana) continue;
    
    const katakanaVariants = parseKatakanaVariants(row.Katakana);
    
    // Process transliteration if present
    if (row.Transliteration && row.Transliteration.trim()) {
      const normalizedTransliteration = normalizeKey(row.Transliteration);
      
      for (const katakana of katakanaVariants) {
        if (!katakanaMapping[normalizedTransliteration]) {
          katakanaMapping[normalizedTransliteration] = [];
        }
        
        // Check if this katakana already exists for this key
        const exists = katakanaMapping[normalizedTransliteration].some(
          entry => entry.katakana === katakana
        );
        
        if (!exists) {
          katakanaMapping[normalizedTransliteration].push({
            isTransliteration: true,
            katakana
          });
        }
      }
    }
    
    // Process additional words
    const additionalWords = parseAdditionalWords(row.Additional || '');
    
    for (const word of additionalWords) {
      const normalizedWord = normalizeKey(word);
      
      if (!normalizedWord) continue;
      
      for (const katakana of katakanaVariants) {
        if (!katakanaMapping[normalizedWord]) {
          katakanaMapping[normalizedWord] = [];
        }
        
        // Check if this word is already marked as a transliteration
        const isTransliteration = transliterationSet.has(normalizedWord);
        
        // Check if this katakana already exists for this key
        const existingEntry = katakanaMapping[normalizedWord].find(
          entry => entry.katakana === katakana
        );
        
        if (existingEntry) {
          // If it exists and is marked as transliteration, keep it that way
          if (isTransliteration && !existingEntry.isTransliteration) {
            existingEntry.isTransliteration = true;
          }
        } else {
          katakanaMapping[normalizedWord].push({
            isTransliteration,
            katakana
          });
        }
      }
    }
  }
  
  // Ensure public/data directory exists
  const dataDir = path.join(__dirname, '../public/data');
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
  
  const outputPath = path.join(dataDir, 'true-katakana-mappings.json');
  fs.writeFileSync(outputPath, JSON.stringify(katakanaMapping, null, 2), 'utf-8');
  
  console.log(`Generated ${outputPath}`);
  console.log(`Total unique mappings: ${Object.keys(katakanaMapping).length}`);
}

async function main() {
  try {
    await prepareTrueKatakanaData();
    console.log('True katakana data preparation complete!');
  } catch (error) {
    console.error('Error preparing true katakana data:', error);
    process.exit(1);
  }
}

main();