import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import Papa from 'papaparse';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface CockneyEntry {
  english: string;
  rhyme: string;
  cockney: string;
  notes: string;
  synonyms: string;
}

interface ProcessedCockneyData {
  [english: string]: CockneyEntry[];
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

function normalizeString(str: string): string {
  return str ? str.toLowerCase().trim() : '';
}

async function prepareCockneyData() {
  console.log('Processing cockney-rhyming-slang.csv...');
  const csvPath = path.join(__dirname, '../data-sources/cockney-rhyming-slang.csv');
  const data = await readCsvFile(csvPath);
  
  // Group by normalized English word
  const cockneyMap: ProcessedCockneyData = {};
  
  for (const row of data) {
    if (row.English) {
      const normalizedEnglish = normalizeString(row.English);
      const synonymsStr = normalizeString(row.Synonyms || '');
      
      const entry: CockneyEntry = {
        english: normalizedEnglish,
        rhyme: normalizeString(row.Rhyme || ''),
        cockney: normalizeString(row.Cockney || ''),
        notes: normalizeString(row.Notes || ''),
        synonyms: synonymsStr
      };
      
      // Add entry for the main English word
      if (!cockneyMap[normalizedEnglish]) {
        cockneyMap[normalizedEnglish] = [];
      }
      cockneyMap[normalizedEnglish].push(entry);
      
      // Also add entries for each synonym
      if (synonymsStr) {
        const synonyms = synonymsStr.split(',').map(s => s.trim()).filter(s => s);
        for (const synonym of synonyms) {
          const normalizedSynonym = normalizeString(synonym);
          if (normalizedSynonym) {
            if (!cockneyMap[normalizedSynonym]) {
              cockneyMap[normalizedSynonym] = [];
            }
            // Create a copy of the entry for the synonym
            cockneyMap[normalizedSynonym].push({...entry});
          }
        }
      }
    }
  }
  
  // Ensure public/data directory exists
  const dataDir = path.join(__dirname, '../public/data');
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
  
  const outputPath = path.join(dataDir, 'cockney-rhyming-slang.json');
  fs.writeFileSync(outputPath, JSON.stringify(cockneyMap), 'utf-8');
  
  // Log statistics
  const totalWords = Object.keys(cockneyMap).length;
  const totalEntries = Object.values(cockneyMap).reduce((sum, entries) => sum + entries.length, 0);
  const duplicates = Object.entries(cockneyMap).filter(([_, entries]) => entries.length > 1);
  
  console.log(`Generated ${outputPath}`);
  console.log(`Total unique words: ${totalWords}`);
  console.log(`Total entries: ${totalEntries}`);
  console.log(`Words with multiple translations: ${duplicates.length}`);
  
  if (duplicates.length > 0) {
    console.log('\nDuplicates found:');
    duplicates.forEach(([word, entries]) => {
      console.log(`  ${word}: ${entries.length} variants`);
    });
  }
}

async function main() {
  try {
    await prepareCockneyData();
    console.log('Cockney data preparation complete!');
  } catch (error) {
    console.error('Error preparing Cockney data:', error);
    process.exit(1);
  }
}

main();