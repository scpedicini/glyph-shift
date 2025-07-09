import {SwapLangs} from "@/utils/common";
import {
    IPhoneticSwap,
    HiraganaSwap_Deprecated,
    FingerspellingSwap,
    BrailleSwap,
    MorseCodeSwap,
    VorticonSwap
} from "@/utils/swap-systems";

export {
    IPhoneticSwap, 
    ISwapConfig,
    HiraganaSwap_Deprecated,
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
                    // this.swapMap[swapLang] = new HiraganaSwap_Deprecated();
                    break;
                case SwapLangs.Fingerspelling:
                    this.swapMap[swapLang] = new FingerspellingSwap();
                    break;
                case SwapLangs.Braille:
                    this.swapMap[swapLang] = new BrailleSwap();
                    break;
                case SwapLangs.MorseCode:
                    this.swapMap[swapLang] = new MorseCodeSwap();
                    break;
                case SwapLangs.Vorticon:
                    this.swapMap[swapLang] = new VorticonSwap();
                    break;
            }

            _swapLang && _swapLang!.initialize();
        }

        return this.swapMap[swapLang]!;
    }

}