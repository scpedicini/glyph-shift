export type PhoneticConfig = {
    swapFrequency: number; // 0-100
    aslEnabled: boolean;
    morseEnabled: boolean;
    braille1Enabled: boolean;
    braille2Enabled: boolean;
    vorticonEnabled: boolean;
    katakanaEnabled: boolean;
    hiraganaEnabled: boolean;
    romanEnabled: boolean;
}

export const DEFAULT_CONFIG: PhoneticConfig = {
    swapFrequency: 5,
    aslEnabled: false,
    morseEnabled: false,
    braille1Enabled: false,
    braille2Enabled: false,
    vorticonEnabled: false,
    katakanaEnabled: false,
    hiraganaEnabled: false,
    romanEnabled: false
}

export enum SwapLangs {
    Hiragana = 'Hiragana',
    Katakana = 'Katakana',
    Fingerspelling = 'Fingerspelling',
    Braille = 'Braille',
    MorseCode = 'MorseCode',
    Vorticon = 'Vorticon',
    Roman = 'Roman'
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

export type GetSwapInfoMessage = {
    swapLanguage: SwapLangs;
}

export type SwapInfo = {
    isNeglectable: boolean;
}


