import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import Papa from 'papaparse';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface WordToIpaEntry {
  word: string;
  ipa_pronunciations: string[];
}

interface IpaToHiraganaEntry {
  ipa: string;
  hiragana: string;
  score: number;
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

async function prepareWordToIpaData() {
  console.log('Processing combined_cmu_ipa_data.csv...');
  const csvPath = path.join(__dirname, 'combined_cmu_ipa_data.csv');
  const data = await readCsvFile(csvPath);
  
  // Group by word and collect all IPA pronunciations
  const wordMap = new Map<string, string[]>();
  
  for (const row of data) {
    if (row.word && row.ipa_phones) {
      const word = row.word.toUpperCase();
      if (!wordMap.has(word)) {
        wordMap.set(word, []);
      }
      wordMap.get(word)!.push(row.ipa_phones);
    }
  }
  
  // Convert to compact array format: [[word, [ipa1, ipa2, ...]], ...]
  const compactData: Array<[string, string[]]> = Array.from(wordMap.entries());
  
  const outputPath = path.join(__dirname, '../public/data/hiragana-word-to-ipa.json');
  fs.writeFileSync(outputPath, JSON.stringify(compactData), 'utf-8');
  console.log(`Generated ${outputPath} with ${compactData.length} words`);
}

async function prepareIpaToHiraganaData() {
  console.log('Processing ipa-to-hiragana.csv...');
  const csvPath = path.join(__dirname, '../components/ipa-to-hiragana.csv');
  const data = await readCsvFile(csvPath);
  
  // Convert to map format
  const ipaMap: Record<string, { hiragana: string; score: number }> = {};
  
  for (const row of data) {
    if (row.ipa && row.hiragana && row.score) {
      ipaMap[row.ipa] = {
        hiragana: row.hiragana,
        score: parseFloat(row.score)
      };
    }
  }
  
  const outputPath = path.join(__dirname, '../public/data/hiragana-ipa-to-hiragana.json');
  fs.writeFileSync(outputPath, JSON.stringify(ipaMap), 'utf-8');
  console.log(`Generated ${outputPath} with ${Object.keys(ipaMap).length} IPA phonemes`);
}

async function main() {
  try {
    await prepareWordToIpaData();
    await prepareIpaToHiraganaData();
    console.log('Data preparation complete!');
  } catch (error) {
    console.error('Error preparing data:', error);
    process.exit(1);
  }
}

main();