import {onMessage} from "webext-bridge/background";
import {CanSwapMessage, SwapLangs} from "@/utils/common";
import {IPhoneticSwap, LanguageFactory} from "@/utils/phonetic-swap";




export default defineBackground(() => {
    console.log('Hello background!', {id: browser.runtime.id});


    onMessage("get-random-number", ({data}) => {
        console.log('Received message:', data);
        return Math.random();
    });

    onMessage('can-swap', ({data}) => {
        console.log('Received message:', data);

        const { swapLanguage, input } = data as CanSwapMessage;

        const phoneticSwapper: IPhoneticSwap = LanguageFactory.getSwapInstance(swapLanguage);

        const response = phoneticSwapper && phoneticSwapper.canSwap(input);
        return response;
    });

    onMessage('swap', ({data}) => {
        console.log('Received message:', data);

        const { swapLanguage, input, options } = data as SwapMessage;

        const phoneticSwapper: IPhoneticSwap = LanguageFactory.getSwapInstance(swapLanguage);

        const response = phoneticSwapper && phoneticSwapper.swap(input, options);
        return response;
    });


});
