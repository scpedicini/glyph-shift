import {SwapLangs} from "@/utils/common";
import { ExtensionHiraganaDataLoader } from "@/utils/data-loaders";
import {
    BrailleSwap,
    FingerspellingSwap,
    HiraganaSwap,
    HexSwap,
    IPhoneticSwap,
    KatakanaSwap,
    MorseCodeSwap,
    RomanSwap,
    VorticonSwap
} from "@/utils/swap-systems";

export {
    BrailleSwap,
    FingerspellingSwap,
    HiraganaSwap,
    HexSwap,
    IPhoneticSwap,
    ISwapConfig,
    KatakanaSwap,
    MorseCodeSwap,
    RomanSwap,
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
                    _swapLang = new HiraganaSwap(new ExtensionHiraganaDataLoader());
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
                case SwapLangs.Roman:
                    _swapLang = new RomanSwap();
                    break;
                case SwapLangs.Hex:
                    _swapLang = new HexSwap();
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