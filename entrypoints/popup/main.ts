import { storage } from '#imports'
import {DEFAULT_CONFIG, PhoneticConfig} from "@/utils/common";
import { logger } from "@/utils/logger";
import { sendMessage } from 'webext-bridge/popup';


document.addEventListener('DOMContentLoaded', async () => {
    try {
        logger.debug("DOM loaded")
        const storedConfig = await storage.getItem<PhoneticConfig>('local:phoneticConfig')
        const phoneticConfig = storedConfig ? {...DEFAULT_CONFIG, ...storedConfig} : DEFAULT_CONFIG
        logger.debug('Loaded config:', phoneticConfig)

    // Track if settings have changed (dirty state)
    let settingsChanged = false;
    
    // Clear dirty state on popup open
    await storage.setItem('local:settingsChanged', false);
    
    // Connect to background script to detect popup close
    const port = browser.runtime.connect({ name: "popup" });

    // Set initial values
    const extensionToggle = document.getElementById('extensionEnabled') as HTMLInputElement
    const statusText = document.getElementById('statusText') as HTMLSpanElement
    const regenerateButton = document.getElementById('regenerateButton') as HTMLButtonElement
    const slider = document.getElementById('swapFrequency') as HTMLInputElement
    const aslCheckbox = document.getElementById('aslEnabled') as HTMLInputElement
    const morseCheckbox = document.getElementById('morseEnabled') as HTMLInputElement
    const braille1Checkbox = document.getElementById('braille1Enabled') as HTMLInputElement
    // const braille2Checkbox = document.getElementById('braille2Enabled') as HTMLInputElement
    const vorticonCheckbox = document.getElementById('vorticonEnabled') as HTMLInputElement
    const katakanaCheckbox = document.getElementById('katakanaEnabled') as HTMLInputElement
    const trueKanaCheckbox = document.getElementById('trueKanaEnabled') as HTMLInputElement
    const trueKanaModeRadios = document.getElementsByName('trueKanaMode') as NodeListOf<HTMLInputElement>
    const hiraganaCheckbox = document.getElementById('hiraganaEnabled') as HTMLInputElement
    const romanCheckbox = document.getElementById('romanEnabled') as HTMLInputElement
    const hexCheckbox = document.getElementById('hexEnabled') as HTMLInputElement
    const cockneyCheckbox = document.getElementById('cockneyEnabled') as HTMLInputElement
    const cockneyFullRhymeCheckbox = document.getElementById('cockneyFullRhyme') as HTMLInputElement

    let lockEvents = true;

    // Set initial extension toggle state
    // Add no-transition class to prevent animation on load
    const toggleSlider = extensionToggle.nextElementSibling as HTMLElement;
    if (toggleSlider) {
        toggleSlider.classList.add('no-transition');
    }
    
    extensionToggle.checked = phoneticConfig.enabled;
    updateStatusText(phoneticConfig.enabled);
    
    // Remove no-transition class after the DOM has updated
    requestAnimationFrame(() => {
        requestAnimationFrame(() => {
            if (toggleSlider) {
                toggleSlider.classList.remove('no-transition');
            }
        });
    });

    slider.value = phoneticConfig.swapFrequency.toString();
    aslCheckbox.checked = phoneticConfig.aslEnabled;
    morseCheckbox.checked = phoneticConfig.morseEnabled;
    braille1Checkbox.checked = phoneticConfig.braille1Enabled;
    // braille2Checkbox.checked = phoneticConfig.braille2Enabled;
    vorticonCheckbox.checked = phoneticConfig.vorticonEnabled || false
    // Ensure mutual exclusivity on load - if both are enabled, disable katakana
    if (phoneticConfig.katakanaEnabled && phoneticConfig.trueKanaEnabled) {
        phoneticConfig.katakanaEnabled = false;
        await storage.setItem('local:phoneticConfig', phoneticConfig);
    }
    
    katakanaCheckbox.checked = phoneticConfig.katakanaEnabled || false
    trueKanaCheckbox.checked = phoneticConfig.trueKanaEnabled || false
    // Set the correct radio button for TrueKana mode
    trueKanaModeRadios.forEach(radio => {
        radio.checked = radio.value === (phoneticConfig.trueKanaMode || 'OnlyTransliterations')
    })
    hiraganaCheckbox.checked = phoneticConfig.hiraganaEnabled || false
    romanCheckbox.checked = phoneticConfig.romanEnabled || false
    hexCheckbox.checked = phoneticConfig.hexEnabled || false
    cockneyCheckbox.checked = phoneticConfig.cockneyEnabled || false
    cockneyFullRhymeCheckbox.checked = phoneticConfig.cockneyFullRhyme || false

    // Update displayed percentage
    const percentageDisplay = document.getElementById('percentageDisplay')!
    percentageDisplay.textContent = `${phoneticConfig.swapFrequency}%`
    lockEvents = false;

    function updateStatusText(enabled: boolean) {
        statusText.classList.toggle('active', enabled);
        regenerateButton.disabled = !enabled;
    }

    // Add event listener for extension toggle
    extensionToggle.addEventListener('change', async (e) => {
        if(lockEvents) return;
        const enabled = (e.target as HTMLInputElement).checked;
        updateStatusText(enabled);
        
        const currentConfig = await storage.getItem<PhoneticConfig>('local:phoneticConfig');
        const mergedConfig = currentConfig ? {...DEFAULT_CONFIG, ...currentConfig} : DEFAULT_CONFIG;
        await storage.setItem('local:phoneticConfig', {
            ...mergedConfig,
            enabled: enabled
        });
        
        // Update the phoneticConfig reference for popup close handler
        phoneticConfig.enabled = enabled;
        
        // Reset dirty flag when extension is toggled to enabled since page will reload
        if (enabled) {
            settingsChanged = false;
            await storage.setItem('local:settingsChanged', false);
        }
        
        // Reload only the current active tab to apply changes
        const [activeTab] = await browser.tabs.query({ active: true, currentWindow: true });
        if (activeTab && activeTab.id && activeTab.url && 
            !activeTab.url.startsWith('chrome://') && !activeTab.url.startsWith('edge://')) {
            browser.tabs.reload(activeTab.id);
        }
    });

    // Add regenerate button handler
    regenerateButton.addEventListener('click', async () => {
        logger.debug('Manual regeneration triggered');
        
        // Add regenerating class and disable button
        regenerateButton.classList.add('regenerating');
        regenerateButton.disabled = true;
        
        try {
            // Get only the active tab in current window
            const [activeTab] = await browser.tabs.query({ active: true, currentWindow: true });
            
            if (activeTab && activeTab.id && activeTab.url && 
                !activeTab.url.startsWith('chrome://') && !activeTab.url.startsWith('edge://')) {
                try {
                    // Use webext-bridge to send message to content script
                    await sendMessage('regenerateContent', {}, `content-script@${activeTab.id}`);
                    logger.debug(`Regeneration message sent to tab ${activeTab.id}`);
                } catch (error) {
                    // If message fails (due to bfcache or other issues), reload the tab directly
                    logger.warn(`Failed to send message to tab ${activeTab.id}, reloading tab instead:`, error);
                    await browser.tabs.reload(activeTab.id);
                }
            }
        } catch (error) {
            logger.error('Failed to regenerate content:', error);
        }
        
        // Remove regenerating class and re-enable button after a delay
        setTimeout(() => {
            regenerateButton.classList.remove('regenerating');
            regenerateButton.disabled = false;
        }, 1000);
    });

    slider.addEventListener('input', async (e) => {
        if(lockEvents) return;
        logger.debug("slider input event!");
            const value = parseInt((e.target as HTMLInputElement).value)
            percentageDisplay.textContent = `${value}%`
            settingsChanged = true; // Mark settings as dirty
            await storage.setItem('local:settingsChanged', true);
            const currentConfig = await storage.getItem<PhoneticConfig>('local:phoneticConfig')
            const mergedConfig = currentConfig ? {...DEFAULT_CONFIG, ...currentConfig} : DEFAULT_CONFIG
            await storage.setItem('local:phoneticConfig', {
                ...mergedConfig,
                swapFrequency: value
            })
    });

    // Add event listeners
    aslCheckbox.addEventListener('change', async (e) => {
        if(lockEvents) return;
        settingsChanged = true; // Mark settings as dirty
        await storage.setItem('local:settingsChanged', true);
        const currentConfig = await storage.getItem<PhoneticConfig>('local:phoneticConfig')
        const mergedConfig = currentConfig ? {...DEFAULT_CONFIG, ...currentConfig} : DEFAULT_CONFIG
        await storage.setItem('local:phoneticConfig', {
            ...mergedConfig,
            aslEnabled: (e.target as HTMLInputElement).checked
        })
    });

    morseCheckbox.addEventListener('change', async (e) => {
        if(lockEvents) return;
        settingsChanged = true; // Mark settings as dirty
        await storage.setItem('local:settingsChanged', true);
        const currentConfig = await storage.getItem<PhoneticConfig>('local:phoneticConfig')
        const mergedConfig = currentConfig ? {...DEFAULT_CONFIG, ...currentConfig} : DEFAULT_CONFIG
        await storage.setItem('local:phoneticConfig', {
            ...mergedConfig,
            morseEnabled: (e.target as HTMLInputElement).checked
        })
    });

    braille1Checkbox.addEventListener('change', async (e) => {
        if(lockEvents) return;
        settingsChanged = true; // Mark settings as dirty
        await storage.setItem('local:settingsChanged', true);
        const currentConfig = await storage.getItem<PhoneticConfig>('local:phoneticConfig')
        const mergedConfig = currentConfig ? {...DEFAULT_CONFIG, ...currentConfig} : DEFAULT_CONFIG
        await storage.setItem('local:phoneticConfig', {
            ...mergedConfig,
            braille1Enabled: (e.target as HTMLInputElement).checked
        })
    });

    // braille2Checkbox.addEventListener('change', async (e) => {
    //     if(lockEvents) return;
    //     const currentConfig = await storage.getItem<PhoneticConfig>('local:phoneticConfig') || DEFAULT_CONFIG
    //     await storage.setItem('local:phoneticConfig', {
    //         ...currentConfig,
    //         braille2Enabled: (e.target as HTMLInputElement).checked
    //     })
    // });

    vorticonCheckbox.addEventListener('change', async (e) => {
        if(lockEvents) return;
        settingsChanged = true; // Mark settings as dirty
        await storage.setItem('local:settingsChanged', true);
        const currentConfig = await storage.getItem<PhoneticConfig>('local:phoneticConfig')
        const mergedConfig = currentConfig ? {...DEFAULT_CONFIG, ...currentConfig} : DEFAULT_CONFIG
        await storage.setItem('local:phoneticConfig', {
            ...mergedConfig,
            vorticonEnabled: (e.target as HTMLInputElement).checked
        })
    });

    katakanaCheckbox.addEventListener('change', async (e) => {
        if(lockEvents) return;
        settingsChanged = true; // Mark settings as dirty
        await storage.setItem('local:settingsChanged', true);
        const currentConfig = await storage.getItem<PhoneticConfig>('local:phoneticConfig')
        const mergedConfig = currentConfig ? {...DEFAULT_CONFIG, ...currentConfig} : DEFAULT_CONFIG
        const katakanaChecked = (e.target as HTMLInputElement).checked
        
        // If enabling katakana, disable trueKana
        if (katakanaChecked && mergedConfig.trueKanaEnabled) {
            lockEvents = true;
            trueKanaCheckbox.checked = false;
            lockEvents = false;
        }
        
        await storage.setItem('local:phoneticConfig', {
            ...mergedConfig,
            katakanaEnabled: katakanaChecked,
            trueKanaEnabled: katakanaChecked ? false : mergedConfig.trueKanaEnabled
        })
    });

    trueKanaCheckbox.addEventListener('change', async (e) => {
        if(lockEvents) return;
        settingsChanged = true; // Mark settings as dirty
        await storage.setItem('local:settingsChanged', true);
        const currentConfig = await storage.getItem<PhoneticConfig>('local:phoneticConfig')
        const mergedConfig = currentConfig ? {...DEFAULT_CONFIG, ...currentConfig} : DEFAULT_CONFIG
        const trueKanaChecked = (e.target as HTMLInputElement).checked
        
        // If enabling trueKana, disable katakana
        if (trueKanaChecked && mergedConfig.katakanaEnabled) {
            lockEvents = true;
            katakanaCheckbox.checked = false;
            lockEvents = false;
        }
        
        await storage.setItem('local:phoneticConfig', {
            ...mergedConfig,
            trueKanaEnabled: trueKanaChecked,
            katakanaEnabled: trueKanaChecked ? false : mergedConfig.katakanaEnabled
        })
    });

    // Add event listeners for TrueKana mode radio buttons
    trueKanaModeRadios.forEach(radio => {
        radio.addEventListener('change', async (e) => {
            if(lockEvents) return;
            settingsChanged = true; // Mark settings as dirty
            await storage.setItem('local:settingsChanged', true);
            const currentConfig = await storage.getItem<PhoneticConfig>('local:phoneticConfig')
            const mergedConfig = currentConfig ? {...DEFAULT_CONFIG, ...currentConfig} : DEFAULT_CONFIG
            await storage.setItem('local:phoneticConfig', {
                ...mergedConfig,
                trueKanaMode: (e.target as HTMLInputElement).value as 'OnlyTransliterations' | 'AllWords'
            })
        });
    });

    hiraganaCheckbox.addEventListener('change', async (e) => {
        if(lockEvents) return;
        settingsChanged = true; // Mark settings as dirty
        await storage.setItem('local:settingsChanged', true);
        const currentConfig = await storage.getItem<PhoneticConfig>('local:phoneticConfig')
        const mergedConfig = currentConfig ? {...DEFAULT_CONFIG, ...currentConfig} : DEFAULT_CONFIG
        await storage.setItem('local:phoneticConfig', {
            ...mergedConfig,
            hiraganaEnabled: (e.target as HTMLInputElement).checked
        })
    });

    romanCheckbox.addEventListener('change', async (e) => {
        if(lockEvents) return;
        settingsChanged = true; // Mark settings as dirty
        await storage.setItem('local:settingsChanged', true);
        const currentConfig = await storage.getItem<PhoneticConfig>('local:phoneticConfig')
        const mergedConfig = currentConfig ? {...DEFAULT_CONFIG, ...currentConfig} : DEFAULT_CONFIG
        await storage.setItem('local:phoneticConfig', {
            ...mergedConfig,
            romanEnabled: (e.target as HTMLInputElement).checked
        })
    });

    hexCheckbox.addEventListener('change', async (e) => {
        if(lockEvents) return;
        settingsChanged = true; // Mark settings as dirty
        await storage.setItem('local:settingsChanged', true);
        const currentConfig = await storage.getItem<PhoneticConfig>('local:phoneticConfig')
        const mergedConfig = currentConfig ? {...DEFAULT_CONFIG, ...currentConfig} : DEFAULT_CONFIG
        await storage.setItem('local:phoneticConfig', {
            ...mergedConfig,
            hexEnabled: (e.target as HTMLInputElement).checked
        })
    });

    cockneyCheckbox.addEventListener('change', async (e) => {
        if(lockEvents) return;
        settingsChanged = true; // Mark settings as dirty
        await storage.setItem('local:settingsChanged', true);
        const currentConfig = await storage.getItem<PhoneticConfig>('local:phoneticConfig')
        const mergedConfig = currentConfig ? {...DEFAULT_CONFIG, ...currentConfig} : DEFAULT_CONFIG
        await storage.setItem('local:phoneticConfig', {
            ...mergedConfig,
            cockneyEnabled: (e.target as HTMLInputElement).checked
        })
    });

    cockneyFullRhymeCheckbox.addEventListener('change', async (e) => {
        if(lockEvents) return;
        settingsChanged = true; // Mark settings as dirty
        await storage.setItem('local:settingsChanged', true);
        const currentConfig = await storage.getItem<PhoneticConfig>('local:phoneticConfig')
        const mergedConfig = currentConfig ? {...DEFAULT_CONFIG, ...currentConfig} : DEFAULT_CONFIG
        await storage.setItem('local:phoneticConfig', {
            ...mergedConfig,
            cockneyFullRhyme: (e.target as HTMLInputElement).checked
        })
    });
    } catch (error) {
        logger.error('Error in popup initialization:', error)
    }
})
