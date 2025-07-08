# Unfinished Tasks

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

# Finished Tasks

## Vorticon Alphabet

The Standard Galactic Alphabet (SGA) is a writing system used throughout the Commander Keen series. It is a simple substitution cypher, where each letter in the Latin alphabet has been substituted with a different symbol. The SGA can be used to write in different languages; however, in the games the SGA is used to write messages in the English language only.

Use the `assets/sga-k3-direct.otf.woff2` font file to display the SGA characters in the extension. Implementation should be nearly identical to the Morse code swapper since its just a different font for A-Z/a-z characters.
