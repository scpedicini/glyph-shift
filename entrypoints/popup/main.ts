import { storage } from '#imports'
import {DEFAULT_CONFIG, PhoneticConfig} from "@/utils/common";


document.addEventListener('DOMContentLoaded', async () => {
    try {
        console.log("DOM loaded")
        const storedConfig = await storage.getItem<PhoneticConfig>('local:phoneticConfig')
        const phoneticConfig = storedConfig ? {...DEFAULT_CONFIG, ...storedConfig} : DEFAULT_CONFIG
        console.log('Loaded config:', phoneticConfig)

    // Set initial values
    const extensionToggle = document.getElementById('extensionEnabled') as HTMLInputElement
    const statusText = document.getElementById('statusText') as HTMLSpanElement
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

    // Update displayed percentage
    const percentageDisplay = document.getElementById('percentageDisplay')!
    percentageDisplay.textContent = `${phoneticConfig.swapFrequency}%`
    lockEvents = false;

    function updateStatusText(enabled: boolean) {
        statusText.textContent = enabled ? 'Active' : 'Inactive';
        statusText.classList.toggle('inactive', !enabled);
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
        
        // Reload active tabs to apply changes
        const tabs = await browser.tabs.query({ active: true });
        tabs.forEach(tab => {
            if (tab.id && tab.url && (tab.url.includes('wikipedia.org') || tab.url.includes('0.0.0.0'))) {
                browser.tabs.reload(tab.id);
            }
        });
    });

    slider.addEventListener('input', async (e) => {
        if(lockEvents) return;
        console.log("slider input event!");
            const value = parseInt((e.target as HTMLInputElement).value)
            percentageDisplay.textContent = `${value}%`
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
        const currentConfig = await storage.getItem<PhoneticConfig>('local:phoneticConfig')
        const mergedConfig = currentConfig ? {...DEFAULT_CONFIG, ...currentConfig} : DEFAULT_CONFIG
        await storage.setItem('local:phoneticConfig', {
            ...mergedConfig,
            aslEnabled: (e.target as HTMLInputElement).checked
        })
    });

    morseCheckbox.addEventListener('change', async (e) => {
        if(lockEvents) return;
        const currentConfig = await storage.getItem<PhoneticConfig>('local:phoneticConfig')
        const mergedConfig = currentConfig ? {...DEFAULT_CONFIG, ...currentConfig} : DEFAULT_CONFIG
        await storage.setItem('local:phoneticConfig', {
            ...mergedConfig,
            morseEnabled: (e.target as HTMLInputElement).checked
        })
    });

    braille1Checkbox.addEventListener('change', async (e) => {
        if(lockEvents) return;
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
        const currentConfig = await storage.getItem<PhoneticConfig>('local:phoneticConfig')
        const mergedConfig = currentConfig ? {...DEFAULT_CONFIG, ...currentConfig} : DEFAULT_CONFIG
        await storage.setItem('local:phoneticConfig', {
            ...mergedConfig,
            vorticonEnabled: (e.target as HTMLInputElement).checked
        })
    });

    katakanaCheckbox.addEventListener('change', async (e) => {
        if(lockEvents) return;
        const currentConfig = await storage.getItem<PhoneticConfig>('local:phoneticConfig')
        const mergedConfig = currentConfig ? {...DEFAULT_CONFIG, ...currentConfig} : DEFAULT_CONFIG
        await storage.setItem('local:phoneticConfig', {
            ...mergedConfig,
            katakanaEnabled: (e.target as HTMLInputElement).checked
        })
    });

    hiraganaCheckbox.addEventListener('change', async (e) => {
        if(lockEvents) return;
        const currentConfig = await storage.getItem<PhoneticConfig>('local:phoneticConfig')
        const mergedConfig = currentConfig ? {...DEFAULT_CONFIG, ...currentConfig} : DEFAULT_CONFIG
        await storage.setItem('local:phoneticConfig', {
            ...mergedConfig,
            hiraganaEnabled: (e.target as HTMLInputElement).checked
        })
    });

    romanCheckbox.addEventListener('change', async (e) => {
        if(lockEvents) return;
        const currentConfig = await storage.getItem<PhoneticConfig>('local:phoneticConfig')
        const mergedConfig = currentConfig ? {...DEFAULT_CONFIG, ...currentConfig} : DEFAULT_CONFIG
        await storage.setItem('local:phoneticConfig', {
            ...mergedConfig,
            romanEnabled: (e.target as HTMLInputElement).checked
        })
    });

    hexCheckbox.addEventListener('change', async (e) => {
        if(lockEvents) return;
        const currentConfig = await storage.getItem<PhoneticConfig>('local:phoneticConfig')
        const mergedConfig = currentConfig ? {...DEFAULT_CONFIG, ...currentConfig} : DEFAULT_CONFIG
        await storage.setItem('local:phoneticConfig', {
            ...mergedConfig,
            hexEnabled: (e.target as HTMLInputElement).checked
        })
    });
    } catch (error) {
        console.error('Error in popup initialization:', error)
    }
})
