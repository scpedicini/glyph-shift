Possible popup theme aesthetic: Imagine yourself in the world of Blade Runner, a cyberpunk universe where nothing make any sense because everything is written in at least four completely different languages.


Does one of the following describe you?

- Fancy yourself the one true polyglot?
- Want to make your browser into a completely inscrutable mess?
- Want to learn a new writing system?
- Want to make your browser look like a set piece from Blade Runner?


# FAQ

## What is this?

Phonetic Mapper is a browser extension that allows you to select various phonetic alphabets (such as morse or braille) - and it will replace random words on the page with the phonetic equivalent. This is useful for learning new alphabets or for fun.


## Prior Art

Language Immersion
https://github.com/google/chrome-language-immersion

Polyglot
https://code.google.com/archive/p/chrome-polyglot/

MindTheWord
https://chromewebstore.google.com/detail/mind-the-word/fabjlaokbhaoehejcoblhahcekmogbom?hl=en

## How is your project different from these other projects?

Unlike the other extensions which focus more on language translation, the Phonetic Mapper focuses more on learning "writing systems" or "alphabets". These methods of communication are relatively simple and can usually be learned in a few hours. This extension is meant to be a fun way to review your knowledge of these alphabets just in case you forget to feed your babel fish.


# TODO

- [ ] Kofi link
- [X] Links to Specular Realms and Mordenstar (https://specularrealms.com and https://mordenstar.com)
- [ ] Reference to learning resources
- [X] Vorticon alphabet


# Future Language Support

- [ ] Braille 2, aka contracted Grade 2 braille
- [ ] Support for numerals in swap systems

# Data Preparation

## Hiragana Data

The Hiragana conversion feature requires pre-processed data files. If you modify the source CSV files, you must regenerate the JSON data files:

1. After modifying any of these files:
   - `/scripts/combined_cmu_ipa_data.csv` - English word to IPA pronunciation mappings
   - `/components/ipa-to-hiragana.csv` - IPA phoneme to Hiragana mappings

2. Run the data preparation script:
   ```bash
   npm run prepare-data
   ```

3. This will regenerate the JSON files in `/public/data/`:
   - `hiragana-word-to-ipa.json`
   - `hiragana-ipa-to-hiragana.json`

**Note:** The data preparation script is NOT run automatically during builds. You must run it manually after any CSV modifications.