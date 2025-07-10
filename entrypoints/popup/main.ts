import { storage } from '#imports'
import {DEFAULT_CONFIG, PhoneticConfig} from "@/utils/common";


document.addEventListener('DOMContentLoaded', async () => {
    try {
        console.log("DOM loaded")
        const storedConfig = await storage.getItem<PhoneticConfig>('local:phoneticConfig')
        const phoneticConfig = storedConfig ? {...DEFAULT_CONFIG, ...storedConfig} : DEFAULT_CONFIG
        console.log('Loaded config:', phoneticConfig)

    // Set initial values
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
