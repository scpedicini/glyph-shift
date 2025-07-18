import {onMessage, sendMessage} from "webext-bridge/background";
import { storage } from '#imports';
import {CanSwapMessage, SwapMessage, GetSwapInfoMessage, SwapInfo, PhoneticConfig, DEFAULT_CONFIG} from "@/utils/common";
import {IPhoneticSwap, LanguageFactory} from "@/utils/phonetic-swap";
import { logger } from "@/utils/logger";
import { EXTENSION_CONFIG } from "@/utils/config";




export default defineBackground(() => {
    logger.debug('Glyphshift v1.0.5', {id: browser.runtime.id});

    // Update icon based on enabled state
    async function updateIcon() {
        const storedConfig = await storage.getItem<PhoneticConfig>('local:phoneticConfig');
        const phoneticConfig = storedConfig ? {...DEFAULT_CONFIG, ...storedConfig} : DEFAULT_CONFIG;
        
        const iconPath = phoneticConfig.enabled ? 'icon' : 'icon-disabled';
        
        // Use action API for Manifest V3 (Chrome) or browserAction for older Firefox versions
        const actionApi = browser.action || browser.browserAction;
        
        if (!actionApi) {
            logger.warn('Neither browser.action nor browser.browserAction is available');
            return;
        }
        
        // Set icon for all sizes
        await actionApi.setIcon({
            path: {
                16: `${iconPath}/16.png`,
                32: `${iconPath}/32.png`,
                48: `${iconPath}/48.png`,
                128: `${iconPath}/128.png`
            }
        });
        
        // Set badge to show on/off state
        await actionApi.setBadgeText({
            text: phoneticConfig.enabled ? '' : 'OFF'
        });
        
        await actionApi.setBadgeBackgroundColor({
            color: '#FF0000'
        });
    }

    // Dev-only function to simulate fresh extension install
    if (import.meta.env.DEV) {
        (globalThis as any).clearPhoneticMapperSettings = async () => {
            try {
                // Clear all stored settings to simulate fresh install
                await storage.removeItem('local:phoneticConfig');
                await storage.removeItem('local:settingsChanged');
                
                logger.info('✅ Phonetic Mapper reset to fresh install state!');
                logger.info('Storage cleared - extension will use DEFAULT_CONFIG:');
                logger.info('  - enabled: true');
                logger.info('  - swapFrequency: 5');
                logger.info('  - all swap types: disabled');
                logger.info('Refresh the extension or reload tabs to see changes.');
                
                // Update icon to reflect default state (enabled = true)
                await updateIcon();
                
                return true;
            } catch (error) {
                logger.error('❌ Failed to clear settings:', error);
                return false;
            }
        };
        
        logger.info('🔧 Dev mode: clearPhoneticMapperSettings() available - simulates fresh install');
    }

    // Handle popup port connections
    browser.runtime.onConnect.addListener((port) => {
        if (port.name === "popup") {
            logger.debug('Popup connected');
            
            // When popup disconnects, check if we need to regenerate
            port.onDisconnect.addListener(async () => {
                logger.debug('Popup disconnected');
                
                // Check if settings changed and extension is enabled
                const settingsChanged = await storage.getItem<boolean>('local:settingsChanged');
                const storedConfig = await storage.getItem<PhoneticConfig>('local:phoneticConfig');
                const phoneticConfig = storedConfig ? {...DEFAULT_CONFIG, ...storedConfig} : DEFAULT_CONFIG;
                
                logger.debug('Popup close state:', { settingsChanged, enabled: phoneticConfig.enabled, regenerateOnChanges: EXTENSION_CONFIG.REGENERATE_ON_CHANGES });
                
                if (EXTENSION_CONFIG.REGENERATE_ON_CHANGES && settingsChanged && phoneticConfig.enabled) {
                    logger.debug('Settings changed and extension enabled, triggering regeneration');
                    
                    // Reset the dirty flag
                    await storage.setItem('local:settingsChanged', false);
                    
                    // Get only the active tab in current window
                    const [activeTab] = await browser.tabs.query({ active: true, currentWindow: true });
                    if (activeTab && activeTab.id && activeTab.url && 
                        !activeTab.url.startsWith('chrome://') && !activeTab.url.startsWith('edge://')) {
                        logger.debug('Sending regeneration message to tab:', activeTab.url);
                        try {
                            await sendMessage('regenerateContent', {}, `content-script@${activeTab.id}`);
                        } catch (error) {
                            logger.warn('Failed to send regeneration message, reloading tab instead:', error);
                            await browser.tabs.reload(activeTab.id);
                        }
                    }
                }
            });
        }
    });

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
