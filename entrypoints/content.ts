import { storage } from '#imports';
import './content-styles.css'
import {sendMessage, onMessage} from 'webext-bridge/content-script';
import {BrailleOptions, CanSwapMessage, SwapLangs, SwapMessage, PhoneticConfig, DEFAULT_CONFIG, GetSwapInfoMessage, SwapInfo} from "@/utils/common";
import {isStringPopulated} from "@/utils/misc-functions";
import { logger } from "@/utils/logger";
import { injectExtensionFonts } from "@/utils/font-loader";

export default defineContentScript({
    matches: ['<all_urls>'],
    main() {
        logger.debug('main() content script 1.0.6 loaded');
        
        // Inject fonts with proper cross-browser URLs
        injectExtensionFonts();
        
        let currentObserver: MutationObserver | null = null;
        
        window.addEventListener('pageshow', async () => {
            logger.debug('Content script loaded');

            const rndNumber = await sendMessage('get-random-number', {data: 'Hello from content script'});
            logger.debug('Received random number:', rndNumber);

            const storedConfig = await storage.getItem<PhoneticConfig>('local:phoneticConfig');
            const phoneticConfig = storedConfig ? {...DEFAULT_CONFIG, ...storedConfig} : DEFAULT_CONFIG;
            
            // Only setup highlighting if the extension is enabled
            if (phoneticConfig.enabled) {
                currentObserver = setupHighlighting(phoneticConfig);
                setupTooltipOverflowFix();
            }
        });
        
        // Listen for storage changes to enable/disable highlighting
        storage.watch<PhoneticConfig>('local:phoneticConfig', (newConfig, oldConfig) => {
            // Only reload if the enabled state actually changed from a known value
            // This prevents reloading on first-time config saves or when individual languages are toggled
            if (oldConfig?.enabled !== undefined && 
                newConfig?.enabled !== undefined && 
                oldConfig.enabled !== newConfig.enabled) {
                // Reload page when extension is toggled on/off
                window.location.reload();
            }
        });
        
        // Listen for regeneration messages using webext-bridge
        onMessage('regenerateContent', () => {
            logger.debug('Received regeneration request from popup');
            window.location.reload();
        });
    },
});

function getEnabledLangs(phoneticConfig: PhoneticConfig) {
    const langs: SwapLangs[] = [];

    if (phoneticConfig.aslEnabled) {
        langs.push(SwapLangs.Fingerspelling);
    }

    if (phoneticConfig.braille1Enabled || phoneticConfig.braille2Enabled) {
        langs.push(SwapLangs.Braille);
    }

    if (phoneticConfig.morseEnabled) {
        langs.push(SwapLangs.MorseCode);
    }

    if (phoneticConfig.vorticonEnabled) {
        langs.push(SwapLangs.Vorticon);
    }

    if (phoneticConfig.katakanaEnabled) {
        langs.push(SwapLangs.Katakana);
    }

    if (phoneticConfig.trueKanaEnabled) {
        langs.push(SwapLangs.TrueKana);
    }

    if (phoneticConfig.hiraganaEnabled) {
        langs.push(SwapLangs.Hiragana);
    }

    if (phoneticConfig.romanEnabled) {
        langs.push(SwapLangs.Roman);
    }

    if (phoneticConfig.hexEnabled) {
        langs.push(SwapLangs.Hex);
    }

    if (phoneticConfig.cockneyEnabled) {
        langs.push(SwapLangs.Cockney);
    }

    return langs;
}

function getOptionsForLanguage(lang: SwapLangs, phoneticConfig: PhoneticConfig): any {
    let options: any = {};
    if (lang === SwapLangs.Braille) {
        options = {
            advancedWords: phoneticConfig.braille2Enabled
        } as BrailleOptions;
    } else if (lang === SwapLangs.Cockney) {
        options = {
            useFullRhyme: phoneticConfig.cockneyFullRhyme
        };
    } else if (lang === SwapLangs.TrueKana) {
        options = {
            mode: phoneticConfig.trueKanaMode || 'OnlyTransliterations'
        };
    }
    return options;
}

// Setup tooltip overflow fix for problematic sites
function setupTooltipOverflowFix() {
    // Add CSS to ensure tooltip isolation
    const style = document.createElement('style');
    style.textContent = `
        #pmapper-tooltip-container,
        #pmapper-tooltip-container *,
        #pmapper-tooltip,
        #pmapper-tooltip *,
        .pmapper-system-tooltip,
        .pmapper-system-tooltip * {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif !important;
        }
    `;
    document.head.appendChild(style);
    
    // Create a container for tooltips at the body level
    const tooltipContainer = document.createElement('div');
    tooltipContainer.id = 'pmapper-tooltip-container';
    tooltipContainer.style.cssText = `
        position: fixed;
        z-index: 2147483647;
        pointer-events: none;
        left: 0;
        top: 0;
    `;
    document.body.appendChild(tooltipContainer);
    
    // Create the actual tooltip element
    const tooltip = document.createElement('div');
    tooltip.id = 'pmapper-tooltip';
    // Add a unique class that won't match any font-specific selectors
    tooltip.className = 'pmapper-system-tooltip';
    tooltip.style.cssText = `
        position: absolute;
        background-color: rgba(0, 0, 0, 0.9);
        color: white;
        padding: 6px 12px;
        border-radius: 4px;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif !important;
        font-size: 14px !important;
        font-weight: normal !important;
        line-height: 1.4 !important;
        white-space: nowrap;
        box-shadow: 0 2px 4px rgba(0,0,0,0.2);
        opacity: 0;
        transition: opacity 0.2s;
        display: none;
        /* Prevent any font inheritance */
        font-style: normal !important;
        letter-spacing: normal !important;
        text-transform: none !important;
        -webkit-font-smoothing: antialiased !important;
        -moz-osx-font-smoothing: grayscale !important;
        /* Extra isolation */
        all: initial;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif !important;
        position: absolute !important;
        background-color: rgba(0, 0, 0, 0.9) !important;
        color: white !important;
        padding: 6px 12px !important;
        border-radius: 4px !important;
        font-size: 14px !important;
        line-height: 1.4 !important;
        white-space: nowrap !important;
        box-shadow: 0 2px 4px rgba(0,0,0,0.2) !important;
        display: none;
        opacity: 0;
        transition: opacity 0.2s;
    `;
    tooltipContainer.appendChild(tooltip);
    
    // Store tooltip data to prevent changes
    let currentTooltipData: { element: HTMLElement; originalText: string } | null = null;
    
    // Single mousemove handler for all tooltip functionality
    document.addEventListener('mousemove', (e) => {
        const target = e.target as HTMLElement;
        
        // Find the closest tooltip element (handles nested elements)
        let tooltipElement: HTMLElement | null = null;
        let checkElement = target;
        
        while (checkElement && checkElement !== document.body) {
            if (checkElement.classList.contains('pmapper-tooltip')) {
                tooltipElement = checkElement;
                break;
            }
            checkElement = checkElement.parentElement as HTMLElement;
        }
        
        // If we found a tooltip element
        if (tooltipElement) {
            // Only process if it's a new element
            if (!currentTooltipData || currentTooltipData.element !== tooltipElement) {
                const originalText = tooltipElement.getAttribute('data-pmapper-original');
                
                if (originalText && originalText.length > 0) {
                    // Lock in this tooltip data
                    currentTooltipData = {
                        element: tooltipElement,
                        originalText: originalText
                    };
                    
                    // Hide tooltip briefly to ensure clean update
                    tooltip.style.display = 'none';
                    tooltip.style.opacity = '0';
                    
                    // Clear tooltip completely
                    while (tooltip.firstChild) {
                        tooltip.removeChild(tooltip.firstChild);
                    }
                    
                    // Create a span with explicit font to ensure no inheritance
                    const span = document.createElement('span');
                    span.style.cssText = `
                        font-family: Arial, sans-serif !important;
                        font-size: 14px !important;
                        font-weight: normal !important;
                        font-style: normal !important;
                        line-height: 1.4 !important;
                        color: white !important;
                        letter-spacing: normal !important;
                    `;
                    span.textContent = currentTooltipData.originalText;
                    
                    tooltip.appendChild(span);
                    
                    // Show tooltip
                    tooltip.style.display = 'block';
                    requestAnimationFrame(() => {
                        tooltip.style.opacity = '1';
                    });
                    
                    // Debug log
                    const elementClasses = tooltipElement.className || 'no-classes';
                    logger.debug(`Tooltip shown: "${originalText}" for element with classes: "${elementClasses}"`);
                }
            }
            
            // Always update position based on mouse cursor
            if (currentTooltipData && tooltipElement === currentTooltipData.element) {
                const x = e.clientX;
                const y = e.clientY;
                
                // Position tooltip above cursor
                tooltip.style.left = `${x - tooltip.offsetWidth / 2}px`;
                tooltip.style.top = `${y - tooltip.offsetHeight - 10}px`;
            }
        } else {
            // Not hovering over a tooltip element - hide it
            if (currentTooltipData) {
                currentTooltipData = null;
                tooltip.style.opacity = '0';
                setTimeout(() => {
                    if (!currentTooltipData) {
                        tooltip.style.display = 'none';
                    }
                }, 200);
            }
        }
    }, true); // Use capture phase
}

// Helper interface for word with punctuation info
interface WordWithPunctuation {
    cleanWord: string;
    trailingPunctuation: string;
}

// Extract trailing punctuation from a word
function extractTrailingPunctuation(word: string): WordWithPunctuation {
    // Match common ending punctuation marks
    const match = word.match(/^(.+?)([.,!?;:\)\]}'"…]+)$/);
    
    if (match) {
        return {
            cleanWord: match[1],
            trailingPunctuation: match[2]
        };
    }
    
    return {
        cleanWord: word,
        trailingPunctuation: ''
    };
}



function setupHighlighting(phoneticConfig: PhoneticConfig): MutationObserver {
    const pendingNodes: Node[] = [];
    const processedNodes = new WeakSet();
    let isProcessing = false; // Flag to prevent recursive processing
    const neglectedSwapModules: SwapLangs[] = []; // Track modules that couldn't swap recent words

    async function timeoutFn() {
        while(pendingNodes.length > 0) {
            try {
                const node = pendingNodes[0];
                await processNode(node);
            } finally {
                pendingNodes.shift();
            }
        }

        setTimeout(timeoutFn, 1000);
    }

    // set up a re-occurring setTimeout to process pending nodes
    setTimeout(timeoutFn, 500);

    async function processNode(node: Node) {
        const forbiddenParents = ['STYLE', 'SCRIPT', 'NOSCRIPT', 'TEMPLATE'];
        let parent = node.parentElement;
        while (parent) {
            if (forbiddenParents.includes(parent.tagName)) {
                return;
            }
            parent = parent.parentElement;
        }

        let shuffleText = false;
        if (node instanceof Element && node.hasAttribute('data-pmapper-processed')) return;

        if (node.nodeType === Node.TEXT_NODE) {
            // logger.debug(`Processing node: ${node.textContent}`);

            if (processedNodes.has(node)) return;

            // Skip text nodes that are children of our highlight spans
            if (node.parentElement?.hasAttribute('data-pmapper-processed')) return;

            const text = node.textContent || '';

            // segment the text into words (make our lives easier and only segment by single spaces)
            const words = text.match(/\S+|\s+/g) || [];

            let sb: string = '';
            let madeReplacementToTextNode: boolean = false;

            for(const word of words) {

                if (/^\s+$/.test(word)) {
                    sb += word;
                    continue;
                }

                let wordReplacement = word;
                const successfulRoll = Math.random() * 100 < phoneticConfig.swapFrequency;

                // instead of checking minimum string length, we'll add that into the individual swap modules under canSwap
                if(isStringPopulated(word) && successfulRoll) {
                    // Extract punctuation before processing
                    const { cleanWord, trailingPunctuation } = extractTrailingPunctuation(word);

                    let selectedLang: SwapLangs | null = null;
                    
                    // First, check neglected modules for one that can handle this word
                    for (let i = 0; i < neglectedSwapModules.length; i++) {
                        const neglectedLang = neglectedSwapModules[i];
                        const options = getOptionsForLanguage(neglectedLang, phoneticConfig);
                        const canSwap = await sendMessage<boolean>('can-swap', {swapLanguage: neglectedLang, input: cleanWord, options} as CanSwapMessage);
                        if (canSwap) {
                            // Found a neglected module that can handle this word
                            selectedLang = neglectedLang;
                            // Remove it from neglected list
                            neglectedSwapModules.splice(i, 1);
                            logger.info(`Used neglected module ${neglectedLang} for word "${word}". Remaining neglected: ${neglectedSwapModules}`);
                            break;
                        }
                    }

                    // If no neglected module could handle it, use normal selection process
                    if (!selectedLang) {
                        const enabledLangs = getEnabledLangs(phoneticConfig);
                        const viableLangs: SwapLangs[] = [];
                        const failedLangs: SwapLangs[] = [];

                        for (const lang of enabledLangs) {
                            const options = getOptionsForLanguage(lang, phoneticConfig);
                            const canSwap = await sendMessage<boolean>('can-swap', {swapLanguage: lang, input: cleanWord, options} as CanSwapMessage);
                            if (canSwap) {
                                viableLangs.push(lang);
                            } else {
                                failedLangs.push(lang);
                            }
                        }

                        // Add failed languages to neglected list if not already there and if they are neglectable
                        for (const failedLang of failedLangs) {
                            if (!neglectedSwapModules.includes(failedLang)) {
                                // Check if this module is neglectable
                                const swapInfo = await sendMessage<SwapInfo>('get-swap-info', {swapLanguage: failedLang} as GetSwapInfoMessage);
                                if (swapInfo.isNeglectable) {
                                    neglectedSwapModules.push(failedLang);
                                    logger.info(`Added ${failedLang} to neglected modules for word "${word}". Neglected list: ${neglectedSwapModules}`);
                                }
                            }
                        }

                        if (viableLangs.length > 0) {
                            // logger.debug('Viable langs:', viableLangs);
                            // pick a random lang
                            selectedLang = viableLangs[Math.floor(Math.random() * viableLangs.length)];
                        }
                    }

                    if (selectedLang) {
                        const lang = selectedLang;

                        const options = getOptionsForLanguage(lang, phoneticConfig);

                        const swapped = await sendMessage<string>('swap', {swapLanguage: lang, input: cleanWord, options } as SwapMessage);

                        if (isStringPopulated(swapped)) {
                            if(shuffleText) {
                                logger.debug(`Swapped ${cleanWord} to ${swapped} using ${lang}`);
                            }
                            // The swapped result already contains HTML span, so we need to append punctuation after the span
                            wordReplacement = swapped + trailingPunctuation;
                        }
                    }

                }

                madeReplacementToTextNode ||= wordReplacement !== word;
                sb += wordReplacement + ' ';
            }

            if(madeReplacementToTextNode) {
                // logger.debug('Replaced:', text, '->', sb);
                // wrap the entire text node in a span since we'll have multiple child spans depending on the matches
                const masterSpan = document.createElement('span');
                masterSpan.setAttribute('data-pmapper-processed', 'true');
                masterSpan.innerHTML = sb;
                node.parentNode?.replaceChild(masterSpan, node);
            }

            processedNodes.add(node);
        } else if (node.nodeType === Node.ELEMENT_NODE) {
            // Process child text nodes
            // Array.from(node.childNodes).forEach(processNode);

            // push them to the pending nodes array
            pendingNodes.push(...Array.from(node.childNodes));
        }
    }

    const observer = new MutationObserver((mutations) => {
        if (isProcessing) return;
        isProcessing = true;
        for (const mutation of mutations) {
            // const nodesTypesToSkip = ["SCRIPT", "STYLE", "NOSCRIPT"];
            // if (nodesTypesToSkip.includes(mutation.target.nodeName)) {
            //     logger.debug('Skipping:', mutation.target.nodeName);
            //     continue;
            // }

            pendingNodes.push(...mutation.addedNodes);
        }
        isProcessing = false;
    });

    observer.observe(document.body, {
        childList: true,
        subtree: true
    });

    // Use 'pagehide' instead of 'unload' to avoid permissions policy violations
    // 'unload' is deprecated and blocked by modern browser security policies
    window.addEventListener('pagehide', () => {
        observer.disconnect();
    });

    // Process initial content
    document.body.childNodes.forEach(processNode);
    
    return observer;
}
