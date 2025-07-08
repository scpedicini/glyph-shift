import { storage } from '#imports'
import {DEFAULT_CONFIG, PhoneticConfig} from "@/utils/common";


document.addEventListener('DOMContentLoaded', async () => {
    console.log("DOM loaded")
    const phoneticConfig = await storage.getItem<PhoneticConfig>('local:phoneticConfig') || DEFAULT_CONFIG

    // Set initial values
    const slider = document.getElementById('swapFrequency') as HTMLInputElement
    const aslCheckbox = document.getElementById('aslEnabled') as HTMLInputElement
    const morseCheckbox = document.getElementById('morseEnabled') as HTMLInputElement
    const braille1Checkbox = document.getElementById('braille1Enabled') as HTMLInputElement
    const braille2Checkbox = document.getElementById('braille2Enabled') as HTMLInputElement

    let lockEvents = true;

    slider.value = phoneticConfig.swapFrequency.toString();
    aslCheckbox.checked = phoneticConfig.aslEnabled;
    morseCheckbox.checked = phoneticConfig.morseEnabled;
    braille1Checkbox.checked = phoneticConfig.braille1Enabled;
    braille2Checkbox.checked = phoneticConfig.braille2Enabled

    // Update displayed percentage
    const percentageDisplay = document.getElementById('percentageDisplay')!
    percentageDisplay.textContent = `${phoneticConfig.swapFrequency}%`
    lockEvents = false;

    slider.addEventListener('input', async (e) => {
        if(lockEvents) return;
        console.log("slider input event!");
            const value = parseInt((e.target as HTMLInputElement).value)
            percentageDisplay.textContent = `${value}%`
            const currentConfig = await storage.getItem<PhoneticConfig>('local:phoneticConfig') || DEFAULT_CONFIG
            await storage.setItem('local:phoneticConfig', {
                ...currentConfig,
                swapFrequency: value
            })
    });

    // Add event listeners
    aslCheckbox.addEventListener('change', async (e) => {
        if(lockEvents) return;
        const currentConfig = await storage.getItem<PhoneticConfig>('local:phoneticConfig') || DEFAULT_CONFIG
        await storage.setItem('local:phoneticConfig', {
            ...currentConfig,
            aslEnabled: (e.target as HTMLInputElement).checked
        })
    });

    morseCheckbox.addEventListener('change', async (e) => {
        if(lockEvents) return;
        const currentConfig = await storage.getItem<PhoneticConfig>('local:phoneticConfig') || DEFAULT_CONFIG
        await storage.setItem('local:phoneticConfig', {
            ...currentConfig,
            morseEnabled: (e.target as HTMLInputElement).checked
        })
    });

    braille1Checkbox.addEventListener('change', async (e) => {
        if(lockEvents) return;
        const currentConfig = await storage.getItem<PhoneticConfig>('local:phoneticConfig') || DEFAULT_CONFIG
        await storage.setItem('local:phoneticConfig', {
            ...currentConfig,
            braille1Enabled: (e.target as HTMLInputElement).checked
        })
    });

    braille2Checkbox.addEventListener('change', async (e) => {
        if(lockEvents) return;
        const currentConfig = await storage.getItem<PhoneticConfig>('local:phoneticConfig') || DEFAULT_CONFIG
        await storage.setItem('local:phoneticConfig', {
            ...currentConfig,
            braille2Enabled: (e.target as HTMLInputElement).checked
        })
    });
})
