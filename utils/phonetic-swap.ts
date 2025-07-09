import {SwapLangs} from "@/utils/common";
import {
    IPhoneticSwap,
    HiraganaSwap_Deprecated,
    KatakanaSwap,
    FingerspellingSwap,
    BrailleSwap,
    MorseCodeSwap,
    VorticonSwap
} from "@/utils/swap-systems";

export {
    IPhoneticSwap, 
    ISwapConfig,
    HiraganaSwap_Deprecated,
    KatakanaSwap,
    FingerspellingSwap,
    BrailleSwap,
    MorseCodeSwap,
    VorticonSwap
} from "@/utils/swap-systems";

export class LanguageFactory {
    // holds a map of the enum SwapLangs to a singleton instance of the appropriate class (handles lazy instantiation)
    private static swapMap: Partial<Record<SwapLangs, IPhoneticSwap>> = {};

    static getSwapInstance(swapLang: SwapLangs) {
        if (!this.swapMap[swapLang]) {
            let _swapLang: IPhoneticSwap | undefined;
            switch (swapLang) {
                case SwapLangs.Hiragana:
                    // to be replaced with the new HiraganaSwap class in the future
                    _swapLang = new HiraganaSwap_Deprecated();
                    break;
                case SwapLangs.Katakana:
                    _swapLang = new KatakanaSwap();
                    break;
                case SwapLangs.Fingerspelling:
                    _swapLang = new FingerspellingSwap();
                    break;
                case SwapLangs.Braille:
                    _swapLang = new BrailleSwap();
                    break;
                case SwapLangs.MorseCode:
                    _swapLang = new MorseCodeSwap();
                    break;
                case SwapLangs.Vorticon:
                    _swapLang = new VorticonSwap();
                    break;
            }

            if (_swapLang) {
                _swapLang.initialize();
                this.swapMap[swapLang] = _swapLang;
            }
        }

        return this.swapMap[swapLang]!;
    }

}