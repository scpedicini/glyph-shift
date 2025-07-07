/******************************* CMU Combiner ******************************/
/*
This script combines the CMU and IPA dictionaries into a single CSV file.
The format of the CSV file is as follows:
    word, cmu_phones, ipa_phones
    APPLE, AE1 P AH0 L, ˈæpəl

    Note that if a word has either multiple CMU or multiple IPA pronunciations,
    they are concatenated with a comma into the same column, e.g.:
    word, cmu_phones, ipa_phones
    TOMATO,"T AH0 M EY1 T OW2, T AH0 M AA1 T OW2","təˈmeɪˌtoʊ, təˈmɑːˌtoʊ"
 */

import { stringify } from 'csv-stringify/sync';
import * as fs from "node:fs";

const outputFile = 'combined_cmu_ipa_data.csv';
fs.writeFileSync(outputFile, stringify([['word', 'cmu_phones', 'ipa_phones']]));

const cmuFile = 'cmudict-0.7b';
const ipaFile = 'cmudict-0.7b-ipa.txt';

const cmuDict: Record<string, string> = {};

fs.readFileSync(cmuFile, 'utf8').split('\n').filter(x => x.trim().length > 0 && /^[A-Z]/i.test(x)).map(x => x.trim()).forEach(line => {
    // we need to check for multiple CMU that maps to same word - these are in the form of WORD(1) WORD(2) etc
    const [word, ...phones] = line.split(/\s+/).filter(x => x.trim().length > 0).map(x => x.trim());

    const reducedWord = word.replace(/\(\d+\)/, '');

    if(cmuDict[reducedWord]) {
        cmuDict[reducedWord] += `, ${phones.join(' ')}`;
    } else {
        cmuDict[reducedWord] = phones.join(' ');
    }
});


const ipaDict: Record<string, string> = {};

fs.readFileSync(ipaFile, 'utf8').split('\n').filter(x => x.trim().length > 0 && /^[A-Z]/i.test(x)).forEach(line => {
    const [word, ...ipaPhones] = line.split(/\s+/).filter(x => x.trim().length > 0).map(x => x.trim());
    ipaDict[word] = ipaPhones.join(' ');
});

for(const [word, cmuPhones] of Object.entries(cmuDict)) {

    // go find matching ipa line
    const ipaLine = ipaDict[word];
    if(ipaLine) {
        const csvLine = stringify([[word, cmuPhones, ipaLine]]);
        // append to output file with csvLine
        fs.appendFileSync(outputFile, csvLine);
    }
}
