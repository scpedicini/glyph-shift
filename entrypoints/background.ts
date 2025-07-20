import { logger } from "@/utils/logger";
import { storage } from '#imports';
import {CanSwapMessage, SwapMessage, GetSwapInfoMessage, SwapInfo, PhoneticConfig, DEFAULT_CONFIG} from "@/utils/common";
import {IPhoneticSwap, LanguageFactory} from "@/utils/phonetic-swap";
import { EXTENSION_CONFIG } from "@/utils/config";
import { onBackgroundMessage, sendToTab } from "@/utils/native-messaging";





export default defineBackground(() => {
    logger.debug('[BACKGROUND] Extension starting - Glyphshift v1.1.0 with native messaging', {id: browser.runtime.id});

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

    // Store popup window ID to detect when it closes
    let popupWindowId: number | null = null;
    
    // Listen for popup connection via extension API
    browser.windows.onRemoved.addListener(async (windowId) => {
        if (windowId === popupWindowId) {
            logger.debug('[BACKGROUND] Popup window closed');
            popupWindowId = null;
            
            // Check if settings changed and extension is enabled
            const settingsChanged = await storage.getItem<boolean>('local:settingsChanged');
            const storedConfig = await storage.getItem<PhoneticConfig>('local:phoneticConfig');
            const phoneticConfig = storedConfig ? {...DEFAULT_CONFIG, ...storedConfig} : DEFAULT_CONFIG;
            
            logger.debug('[BACKGROUND] Popup close state:', { settingsChanged, enabled: phoneticConfig.enabled, regenerateOnChanges: EXTENSION_CONFIG.REGENERATE_ON_CHANGES });
            
            if (EXTENSION_CONFIG.REGENERATE_ON_CHANGES && settingsChanged && phoneticConfig.enabled) {
                logger.debug('[BACKGROUND] Settings changed and extension enabled, triggering regeneration');
                
                // Reset the dirty flag
                await storage.setItem('local:settingsChanged', false);
                
                // Get only the active tab in current window
                const [activeTab] = await browser.tabs.query({ active: true, currentWindow: true });
                if (activeTab && activeTab.id && activeTab.url && 
                    !activeTab.url.startsWith('chrome://') && !activeTab.url.startsWith('edge://')) {
                    logger.debug('[BACKGROUND] About to send regeneration message to tab:', activeTab.url, 'tabId:', activeTab.id);
                    const sent = await sendToTab(activeTab.id, 'regenerateContent', {});
                    
                    if (sent === undefined) {
                        logger.debug('[BACKGROUND] Message failed, reloading tab instead');
                        await browser.tabs.reload(activeTab.id);
                        logger.debug('[BACKGROUND] Tab reload completed');
                    } else {
                        logger.debug('[BACKGROUND] Regeneration message sent successfully');
                    }
                }
            }
        }
    });

    // Initialize icon on startup
    logger.debug('[BACKGROUND] Initializing icon on startup');
    updateIcon();

    // Listen for storage changes to update icon
    logger.debug('[BACKGROUND] Setting up storage watcher for phoneticConfig');
    storage.watch<PhoneticConfig>('local:phoneticConfig', (newConfig, oldConfig) => {
        if (newConfig?.enabled !== oldConfig?.enabled) {
            logger.debug('[BACKGROUND] Enabled state changed, updating icon');
            updateIcon();
        }
    });

    logger.debug('[BACKGROUND] Setting up native message listeners');
    
    // Set up message handlers using native messaging
    onBackgroundMessage(async (message, sender) => {
        const { type, data } = message;
        
        switch (type) {
            case 'popup-opened': {
                // Track popup window ID
                if (sender.tab?.windowId) {
                    popupWindowId = sender.tab.windowId;
                    logger.debug('[BACKGROUND] Popup opened, window ID:', popupWindowId);
                }
                return { status: 'connected' };
            }
            
            case 'get-random-number': {
                logger.debug('[BACKGROUND] Received get-random-number message:', data);
                const random = Math.random();
                logger.debug('[BACKGROUND] Returning random number:', random);
                return random;
            }
            
            case 'can-swap': {
                const { swapLanguage, input, options } = data as CanSwapMessage;
                const phoneticSwapper: IPhoneticSwap = LanguageFactory.getSwapInstance(swapLanguage);
                const response = phoneticSwapper && await phoneticSwapper.canSwap(input, options);
                return response;
            }
            
            case 'swap': {
                const { swapLanguage, input, options } = data as SwapMessage;

                const phoneticSwapper: IPhoneticSwap = LanguageFactory.getSwapInstance(swapLanguage);

                const response = phoneticSwapper && await phoneticSwapper.swap(input, options);
                return response;
            }
            
            case 'get-swap-info': {
                const { swapLanguage } = data as GetSwapInfoMessage;
                const phoneticSwapper: IPhoneticSwap = LanguageFactory.getSwapInstance(swapLanguage);

                const info: SwapInfo = {
                    isNeglectable: phoneticSwapper?.isNeglectable ?? false
                };
                
                return info;
            }
            
            default:
                logger.warn('[BACKGROUND] Unknown message type:', type);
                throw new Error(`Unknown message type: ${type}`);
        }
    });


});
