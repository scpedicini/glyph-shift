# HiraganaSwap Implementation Plan

## Overview
Implement the HiraganaSwap class to convert English words to Hiragana using IPA (International Phonetic Alphabet) as an intermediate representation.

## Architecture

### Data Flow
```
English Word → CMU/IPA Dictionary → IPA Pronunciation(s) → IPA Phonemes → Hiragana Characters
```

### Key Components

1. **HiraganaSwap Class** (`/utils/phonetic-swap.ts`)
   - Implements `IPhoneticSwap` interface
   - Manages data loading and caching
   - Performs the conversion pipeline

2. **Data Sources**
   - `/scripts/combined_cmu_ipa_data.csv` - English to IPA mappings (21,000+ entries)
   - `/components/ipa-to-hiragana.csv` - IPA to Hiragana mappings with scores

3. **New Utility: IPA Parser**
   - Parse IPA strings into individual phonemes
   - Handle longest-match-first algorithm
   - Manage IPA diacritics and stress markers

## Implementation Details

### 1. Data Structures

```typescript
// Static cache for dictionary data
private static wordToIpaMap: Map<string, string[]> = new Map();
private static ipaToHiraganaMap: Map<string, {hiragana: string, score: number}> = new Map();
private static isInitialized: boolean = false;
```

### 2. IPA Phoneme Parser

Create a new utility to parse IPA strings:
- **Longest-match-first algorithm**: Start with longest possible phoneme sequences
- **Handle diacritics**: Stress markers (ˈ, ˌ), length markers (:), etc.
- **Phoneme boundaries**: Properly segment complex phonemes (dʒ, tʃ, etc.)

### 3. Conversion Algorithm

```
1. Normalize input (uppercase for dictionary lookup)
2. Look up word in wordToIpaMap
3. For each IPA pronunciation:
   a. Parse IPA into phonemes
   b. Map each phoneme to Hiragana
   c. Calculate cumulative score
4. Select pronunciation with highest score
5. Return formatted HTML
```

### 4. Error Handling

- **Word not found**: Return false from `canSwap()`
- **Unmappable phonemes**: Skip word if any phoneme cannot be mapped
- **Empty results**: Return false from `canSwap()`

### 5. Performance Optimization

- **Lazy initialization**: Load CSV data on first use
- **Background service caching**: Data persists across page loads
- **Efficient lookups**: Use Map data structures for O(1) access

## Implementation Steps

### Phase 1: Data Loading
1. Implement CSV parsing in `initialize()` method
2. Build `wordToIpaMap` from combined_cmu_ipa_data.csv
3. Build `ipaToHiraganaMap` from ipa-to-hiragana.csv
4. Add error handling for file loading

### Phase 2: IPA Parser Utility
1. Create IPA phoneme inventory from ipa-to-hiragana.csv
2. Implement longest-match-first parsing algorithm
3. Handle IPA modifiers and diacritics
4. Add unit tests for parser

### Phase 3: Core Conversion Logic
1. Implement word lookup and IPA retrieval
2. Parse IPA into phonemes
3. Map phonemes to Hiragana with scoring
4. Select best pronunciation based on cumulative score

### Phase 4: Integration
1. Update `swap()` method to use conversion pipeline
2. Implement proper `canSwap()` logic
3. Add CSS class "hiragana-text" to output
4. Test with various English words

### Phase 5: Testing
1. Unit tests for IPA parser
2. Unit tests for HiraganaSwap methods
3. Integration tests with sample words
4. Edge case testing (missing words, unmappable phonemes)

## Technical Decisions

1. **Multiple Pronunciations**: Use highest-scoring Hiragana translation
2. **Phoneme Segmentation**: Longest-match-first for fewer Hiragana symbols
3. **Missing Mappings**: Word is not swappable if any phoneme unmappable
4. **Score Usage**: Internal only, used for selecting best pronunciation
5. **Data Loading**: Preload into cache on first use, persist in background
6. **CSS Class**: Use "hiragana-text" for styling

## Edge Cases

1. Words with multiple IPA pronunciations
2. IPA phonemes not in mapping table
3. Compound words or hyphenated words
4. Proper nouns not in dictionary
5. Numbers and non-alphabetic characters

## Success Criteria

1. Accurate conversion of common English words to Hiragana
2. Efficient performance with 21,000+ word dictionary
3. Graceful handling of unmappable words
4. Consistent output format with other swap classes
5. Comprehensive test coverage