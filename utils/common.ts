export type PhoneticConfig = {
    enabled: boolean; // Master toggle for the extension
    swapFrequency: number; // 0-100
    aslEnabled: boolean;
    morseEnabled: boolean;
    braille1Enabled: boolean;
    braille2Enabled: boolean;
    vorticonEnabled: boolean;
    katakanaEnabled: boolean;
    trueKanaEnabled: boolean;
    trueKanaMode: 'OnlyTransliterations' | 'AllWords';
    hiraganaEnabled: boolean;
    romanEnabled: boolean;
    hexEnabled: boolean;
    cockneyEnabled: boolean;
    cockneyFullRhyme: boolean;
}

export const DEFAULT_CONFIG: PhoneticConfig = {
    enabled: true,
    swapFrequency: 5,
    aslEnabled: false,
    morseEnabled: false,
    braille1Enabled: false,
    braille2Enabled: false,
    vorticonEnabled: false,
    katakanaEnabled: false,
    trueKanaEnabled: false,
    trueKanaMode: 'OnlyTransliterations',
    hiraganaEnabled: false,
    romanEnabled: false,
    hexEnabled: false,
    cockneyEnabled: false,
    cockneyFullRhyme: false
}

export enum SwapLangs {
    Hiragana = 'Hiragana',
    Katakana = 'Katakana',
    TrueKana = 'TrueKana',
    Fingerspelling = 'Fingerspelling',
    Braille = 'Braille',
    MorseCode = 'MorseCode',
    Vorticon = 'Vorticon',
    Roman = 'Roman',
    Hex = 'Hex',
    Cockney = 'Cockney'
}

export type CanSwapMessage = {
    swapLanguage: SwapLangs;
    input: string;
    options?: any;
}

export type SwapMessage = {
    swapLanguage: SwapLangs;
    input: string;
    options?: any;
}

export type BrailleOptions = {
    advancedWords: boolean;
}

export type CockneyOptions = {
    useFullRhyme: boolean;
}

export type GetSwapInfoMessage = {
    swapLanguage: SwapLangs;
}

export type SwapInfo = {
    isNeglectable: boolean;
}


