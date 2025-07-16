# Overview

Imagine yourself in the world of Blade Runner, a cyberpunk universe where nothing make any sense because everything is written in at least four completely different languages.

Does one of the following describe you?

- Fancy yourself the one true polyglot?
- Want to make your browser into a completely inscrutable mess?
- Want to learn a new writing system?
- Want to make your browser look like a set piece from Blade Runner?


# FAQ

## What is this?

Glyphshift is a browser extension that allows you to select various writing systems (such as morse or braille) - and it will replace random words on the page with their equivalents. This is useful for learning new alphabets or for fun.


## Prior Art

Language Immersion
https://github.com/google/chrome-language-immersion

Polyglot
https://code.google.com/archive/p/chrome-polyglot/

MindTheWord
https://chromewebstore.google.com/detail/mind-the-word/fabjlaokbhaoehejcoblhahcekmogbom?hl=en

## How is your project different from these other projects?

Unlike the other extensions which focus more on language translation, Glyphshift focuses more on learning "writing systems" or "alphabets". These methods of communication are relatively simple and can usually be learned in a few hours. This extension is meant to be a fun way to review your knowledge of these alphabets just in case you forget to feed your babel fish.


# TODO

- [ ] Kofi link
- [X] Links to Shaun Pedicini's about page
- [ ] Reference to learning resources
- [X] Vorticon alphabet


# Future Language Support

- [ ] Braille 2, aka contracted Grade 2 braille
- [X] Support for numerals in swap systems
- [ ] Cockney rhyming slang should incorporate English synonyms, base forms, etc. to make it more flexible

# Data Preparation

The extension requires pre-processed data files for various phonetic systems. If you modify the source CSV/TSV files, you must regenerate the JSON data files.

## Available Scripts

- `npm run prepare-data` - Run all data preparation scripts
- `npm run prepare-data:hiragana` - Prepare Hiragana phonetic data
- `npm run prepare-data:katakana` - Prepare Katakana loan words data
- `npm run prepare-data:cockney` - Prepare Cockney rhyming slang data

## Data Sources

### Hiragana Data
- Source files:
  - `/data-sources/combined_cmu_ipa_data.csv` - English word to IPA pronunciation mappings
  - `/data-sources/ipa-to-hiragana.csv` - IPA phoneme to Hiragana mappings
- Output: 
  - `/public/data/hiragana-word-to-ipa.json`
  - `/public/data/hiragana-ipa-to-hiragana.json`

### Katakana Data
- Source file: `/data-sources/katakana_loan_words.tsv` - Japanese loan words
- Output: `/public/data/katakana-loan-words.json`

### Cockney Rhyming Slang Data
- Source file: `/data-sources/cockney-rhyming-slang.csv` - Cockney rhyming slang mappings
- Features:
  - Supports multiple rhymes for the same word
  - Handles synonyms (comma-delimited in the Synonyms column)
  - Preserves all metadata (English, Rhyme, Cockney, Notes, Synonyms)
- Output: `/public/data/cockney-rhyming-slang.json`

**Note:** The data preparation scripts are NOT run automatically during builds. You must run them manually after any CSV/TSV modifications.