import {storage} from 'wxt/storage';
import './content-styles.css'

export default defineContentScript({
    matches: ['*://*.wikipedia.org/*'],
    main() {
        console.log('main() content script');
        window.addEventListener('pageshow', async () => {
            console.log('Content script loaded');

            const highlightWords = await storage.getItem<string[]>('local:highlightWords');
            if (highlightWords && Array.isArray(highlightWords)) {
                const wordRegex = new RegExp(`\\b(${highlightWords.join('|')})\\b`, 'gi');
                setupHighlighting(wordRegex);
            }
        });
    },
});

function setupHighlighting(wordRegex: RegExp) {
    const processedNodes = new WeakSet();
    let isProcessing = false; // Flag to prevent recursive processing

    function processNode(node: Node) {
        if (node instanceof Element && node.hasAttribute('data-highlight')) return;

        if (node.nodeType === Node.TEXT_NODE) {

            // console.log('Processing node:', node);
            if (processedNodes.has(node)) return;

            // Skip text nodes that are children of our highlight spans
            if (node.parentElement?.hasAttribute('data-highlight')) return;

            const text = node.textContent || '';
            // console.log('Processing:', text);

            if (text.trim().length < 2) {
                return;
            }

            const newText = text.replace(wordRegex, (match) => {
                return `<span style="color: red; font-weight: bold;">${match}</span>`;
            });

            if (newText !== text) {
                console.log('Highlighting:', text, '->', newText);
                // wrap the entire text node in a span since we'll have multiple child spans depending on the matches
                const masterSpan = document.createElement('span');
                masterSpan.classList.add('highlighted');
                masterSpan.setAttribute('data-highlight', 'true'); // Mark our highlights
                masterSpan.innerHTML = newText;
                node.parentNode?.replaceChild(masterSpan, node);
            }

            processedNodes.add(node);
        } else if (node.nodeType === Node.ELEMENT_NODE) {
            // Process child text nodes
            Array.from(node.childNodes).forEach(processNode);
        }
    }

    const observer = new MutationObserver((mutations) => {
        if (isProcessing) return;

        isProcessing = true;
        for (const mutation of mutations) {
            mutation.addedNodes.forEach(node => {
                processNode(node);
            });
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
