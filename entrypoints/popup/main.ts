import { storage } from '#imports'
import {DEFAULT_CONFIG, PhoneticConfig} from "@/utils/common";
import { logger } from "@/utils/logger";


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
    katakanaCheckbox.checked = phoneticConfig.katakanaEnabled || false
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
        
        // Reload active tabs to apply changes
        const tabs = await browser.tabs.query({ active: true });
        tabs.forEach(tab => {
            if (tab.id && tab.url && (tab.url.includes('wikipedia.org') || tab.url.includes('0.0.0.0'))) {
                browser.tabs.reload(tab.id);
            }
        });
    });

    // Add regenerate button handler
    regenerateButton.addEventListener('click', async () => {
        logger.debug('Manual regeneration triggered');
        
        // Disable button briefly to prevent spam
        regenerateButton.disabled = true;
        
        // Send regeneration message to active tabs
        const tabs = await browser.tabs.query({ active: true, currentWindow: true });
        for (const tab of tabs) {
            if (tab.id && tab.url && (tab.url.includes('wikipedia.org') || tab.url.includes('0.0.0.0'))) {
                await browser.tabs.sendMessage(tab.id, { type: 'regenerateContent' });
            }
        }
        
        // Re-enable button after a short delay
        setTimeout(() => {
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
        await storage.setItem('local:phoneticConfig', {
            ...mergedConfig,
            katakanaEnabled: (e.target as HTMLInputElement).checked
        })
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
