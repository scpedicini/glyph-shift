import { storage } from '#imports';
import './content-styles.css'
import {sendMessage} from 'webext-bridge/content-script';
import {BrailleOptions, CanSwapMessage, SwapLangs, SwapMessage, PhoneticConfig, DEFAULT_CONFIG, GetSwapInfoMessage, SwapInfo} from "@/utils/common";
import {isStringPopulated} from "@/utils/misc-functions";

export default defineContentScript({
    matches: ['*://*.wikipedia.org/*', 'http://0.0.0.0/*'],
    main() {
        console.log('main() content script');
        window.addEventListener('pageshow', async () => {
            console.log('Content script loaded');

            const rndNumber = await sendMessage('get-random-number', {data: 'Hello from content script'});
            console.log('Received random number:', rndNumber);

            const storedConfig = await storage.getItem<PhoneticConfig>('local:phoneticConfig');
            const phoneticConfig = storedConfig ? {...DEFAULT_CONFIG, ...storedConfig} : DEFAULT_CONFIG;
            setupHighlighting(phoneticConfig);
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

    if (phoneticConfig.hiraganaEnabled) {
        langs.push(SwapLangs.Hiragana);
    }

    if (phoneticConfig.romanEnabled) {
        langs.push(SwapLangs.Roman);
    }

    if (phoneticConfig.hexEnabled) {
        langs.push(SwapLangs.Hex);
    }

    return langs;
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



function setupHighlighting(phoneticConfig: PhoneticConfig) {
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
            // console.log(`Processing node: ${node.textContent}`);

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
                        const canSwap = await sendMessage<boolean>('can-swap', {swapLanguage: neglectedLang, input: cleanWord} as CanSwapMessage);
                        if (canSwap) {
                            // Found a neglected module that can handle this word
                            selectedLang = neglectedLang;
                            // Remove it from neglected list
                            neglectedSwapModules.splice(i, 1);
                            console.log(`[PMapper] Used neglected module ${neglectedLang} for word "${word}". Remaining neglected: ${neglectedSwapModules}`);
                            break;
                        }
                    }

                    // If no neglected module could handle it, use normal selection process
                    if (!selectedLang) {
                        const enabledLangs = getEnabledLangs(phoneticConfig);
                        const viableLangs: SwapLangs[] = [];
                        const failedLangs: SwapLangs[] = [];

                        for (const lang of enabledLangs) {
                            const canSwap = await sendMessage<boolean>('can-swap', {swapLanguage: lang, input: cleanWord} as CanSwapMessage);
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
                                    console.log(`[PMapper] Added ${failedLang} to neglected modules for word "${word}". Neglected list: ${neglectedSwapModules}`);
                                }
                            }
                        }

                        if (viableLangs.length > 0) {
                            // console.log('Viable langs:', viableLangs);
                            // pick a random lang
                            selectedLang = viableLangs[Math.floor(Math.random() * viableLangs.length)];
                        }
                    }

                    if (selectedLang) {
                        const lang = selectedLang;

                        let options: any = { };
                        if(lang === SwapLangs.Braille) {
                            options = {
                                advancedWords: phoneticConfig.braille2Enabled
                            } as BrailleOptions;
                        }

                        const swapped = await sendMessage<string>('swap', {swapLanguage: lang, input: cleanWord, options } as SwapMessage);

                        if (isStringPopulated(swapped)) {
                            if(shuffleText) {
                                console.log(`Swapped ${cleanWord} to ${swapped} using ${lang}`);
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
                // console.log('Replaced:', text, '->', sb);
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
            //     console.log('Skipping:', mutation.target.nodeName);
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

    window.addEventListener('unload', () => {
        observer.disconnect();
    });

    // Process initial content
    document.body.childNodes.forEach(processNode);
}
