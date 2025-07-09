import {onMessage} from "webext-bridge/background";
import {CanSwapMessage, SwapMessage, SwapLangs, GetSwapInfoMessage, SwapInfo} from "@/utils/common";
import {IPhoneticSwap, LanguageFactory} from "@/utils/phonetic-swap";




export default defineBackground(() => {
    console.log('Hello background!', {id: browser.runtime.id});


    onMessage("get-random-number", ({data}) => {
        console.log('Received message:', data);
        return Math.random();
    });

    onMessage('can-swap', async ({data}) => {
        console.log('Received message:', data);

        const { swapLanguage, input } = data as CanSwapMessage;

        const phoneticSwapper: IPhoneticSwap = LanguageFactory.getSwapInstance(swapLanguage);

        const response = phoneticSwapper && await phoneticSwapper.canSwap(input);
        return response;
    });

    onMessage('swap', async ({data}) => {
        console.log('Received message:', data);

        const { swapLanguage, input, options } = data as SwapMessage;

        const phoneticSwapper: IPhoneticSwap = LanguageFactory.getSwapInstance(swapLanguage);

        const response = phoneticSwapper && await phoneticSwapper.swap(input, options);
        return response;
    });

    onMessage('get-swap-info', async ({data}) => {
        console.log('Received message:', data);

        const { swapLanguage } = data as GetSwapInfoMessage;

        const phoneticSwapper: IPhoneticSwap = LanguageFactory.getSwapInstance(swapLanguage);

        const info: SwapInfo = {
            isNeglectable: phoneticSwapper?.isNeglectable ?? false
        };
        
        return info;
    });


});
