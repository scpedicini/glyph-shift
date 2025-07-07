export type PhoneticConfig = {
    swapFrequency: number; // 0-100
    aslEnabled: boolean;
    morseEnabled: boolean;
    braille1Enabled: boolean;
    braille2Enabled: boolean;
}

export const DEFAULT_CONFIG: PhoneticConfig = {
    swapFrequency: 5,
    aslEnabled: false,
    morseEnabled: false,
    braille1Enabled: false,
    braille2Enabled: false
}

export enum SwapLangs {
    Hiragana = 'Hiragana',
    // Katakana = 'Katakana',
    Fingerspelling = 'Fingerspelling',
    Braille = 'Braille',
    MorseCode = 'MorseCode'
}

export type CanSwapMessage = {
    swapLanguage: SwapLangs;
    input: string;
}

export type SwapMessage = {
    swapLanguage: SwapLangs;
    input: string;
    options?: any;
}

export type BrailleOptions = {
    advancedWords: boolean;
}


