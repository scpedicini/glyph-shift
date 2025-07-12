import {onMessage} from "webext-bridge/background";
import { storage } from '#imports';
import {CanSwapMessage, SwapMessage, SwapLangs, GetSwapInfoMessage, SwapInfo, PhoneticConfig, DEFAULT_CONFIG} from "@/utils/common";
import {IPhoneticSwap, LanguageFactory} from "@/utils/phonetic-swap";
import { logger } from "@/utils/logger";




export default defineBackground(() => {
    logger.debug('Hello background!', {id: browser.runtime.id});

    // Update icon based on enabled state
    async function updateIcon() {
        const storedConfig = await storage.getItem<PhoneticConfig>('local:phoneticConfig');
        const phoneticConfig = storedConfig ? {...DEFAULT_CONFIG, ...storedConfig} : DEFAULT_CONFIG;
        
        const iconPath = phoneticConfig.enabled ? 'icon' : 'icon-disabled';
        
        // Set icon for all sizes
        await browser.action.setIcon({
            path: {
                16: `${iconPath}/16.png`,
                32: `${iconPath}/32.png`,
                48: `${iconPath}/48.png`,
                128: `${iconPath}/128.png`
            }
        });
        
        // Set badge to show on/off state
        await browser.action.setBadgeText({
            text: phoneticConfig.enabled ? '' : 'OFF'
        });
        
        await browser.action.setBadgeBackgroundColor({
            color: '#FF0000'
        });
    }

    // Initialize icon on startup
    updateIcon();

    // Listen for storage changes to update icon
    storage.watch<PhoneticConfig>('local:phoneticConfig', (newConfig, oldConfig) => {
        if (newConfig?.enabled !== oldConfig?.enabled) {
            updateIcon();
        }
    });

    onMessage("get-random-number", ({data}) => {
        logger.debug('Received message:', data);
        return Math.random();
    });

    onMessage('can-swap', async ({data}) => {
        logger.debug('Received message:', data);

        const { swapLanguage, input } = data as CanSwapMessage;

        const phoneticSwapper: IPhoneticSwap = LanguageFactory.getSwapInstance(swapLanguage);

        const response = phoneticSwapper && await phoneticSwapper.canSwap(input);
        return response;
    });

    onMessage('swap', async ({data}) => {
        logger.debug('Received message:', data);

        const { swapLanguage, input, options } = data as SwapMessage;

        const phoneticSwapper: IPhoneticSwap = LanguageFactory.getSwapInstance(swapLanguage);

        const response = phoneticSwapper && await phoneticSwapper.swap(input, options);
        return response;
    });

    onMessage('get-swap-info', async ({data}) => {
        logger.debug('Received message:', data);

        const { swapLanguage } = data as GetSwapInfoMessage;

        const phoneticSwapper: IPhoneticSwap = LanguageFactory.getSwapInstance(swapLanguage);

        const info: SwapInfo = {
            isNeglectable: phoneticSwapper?.isNeglectable ?? false
        };
        
        return info;
    });


});
