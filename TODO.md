# Unfinished Tasks

## Modify HiraganaSwap

We have renamed HiraganaSwap to HiraganaSwap_Deprecated in order to accomodate for a new HiraganaSwap class that will be built using a significantly simpler architecture. It will still need to rely on data loader type approach but it is only a single fil, called: `

## KatakanaSwap

This will be built likely similar to the `HiraganaSwap` class but converts English to Katakana. There is a file of loanwords called `katakana_loan_words.tsv` which contains data in the following format:

```tsv
katakana	english
パーセント	percent
アメリカ	America
ページ	page
センター	center
```

You will probably want to write another preprocessing script to convert this into a nice compact JSON file like we did with the hiragana 
related stuff. KatakanaSwap will need to rely on a data loader similar to HiraganaSwap_Deprecated but it will only need to load the `katakana_loan_words.json` file since the check for a equivalent katakana word will be a simple lookup in the JSON file.


## Add Japanese Util functions

Add two new functions to @utils/japanese-utils.ts - hiraganaToKatakana(string): string and katakanaToHiragana(string): string

Nuances to keep in mind:
Small kana like ッ (small tsu), ャュョ (ya, yu, yo) also have 1:1 equivalents in hiragana: っ, ゃ, ゅ, ょ.
Elongation mark (ー) in katakana has no hiragana equivalent. In hiragana, you'd usually repeat the vowel:
カー (kā) → かあ (ka-a)
But for transliterations, it's fine to just keep ー when mimicking English sound length.




# Finished Tasks

## Vorticon Alphabet

The Standard Galactic Alphabet (SGA) is a writing system used throughout the Commander Keen series. It is a simple substitution cypher, where each letter in the Latin alphabet has been substituted with a different symbol. The SGA can be used to write in different languages; however, in the games the SGA is used to write messages in the English language only.

Use the `assets/sga-k3-direct.otf.woff2` font file to display the SGA characters in the extension. Implementation should be nearly identical to the Morse code swapper since its just a different font for A-Z/a-z characters.


## Add Hiragana

HiraganaSwap class needs to be implemented to convert English words to Hiragana. There are two files that likely will need to be used in this process. The first one is the `combined_cmu_ipa_data.csv` file.

It should be noted that the format of the CSV 

So for example, the word "abductor":

```csv
word,cmu_phones,ipa_phones
ABDUCTOR,"AE0 B D AH1 K T ER0, AH0 B D AH1 K T ER0","æbˈdʌktɝ, əbˈdʌktɝ"
```

The file is structured such that the first column is the word, the second column is the CMU phonetic transcription, and the third column is the IPA transcription. Sometimes the CMU and/or IPA transcriptions may have multiple entries separated by commas so you will need to handle/choose appropriately based on the next file, `ipa-to-hiragana.csv` which contains the mapping from IPA to Hiragana, in this style:

```csv
ipa,hiragana,score
kiː,きー,0.95
ki,き,0.9,
kɪ,き,0.85,
kɛ,け,0.85,
moʊ,もう,0.85
```