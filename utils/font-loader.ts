export function injectExtensionFonts(): void {
    const style = document.createElement('style');
    
    // Generate font face rules with proper extension URLs
    const fontFaceRules = `
@font-face {
    font-family: 'ASL Hands';
    src: url('${browser.runtime.getURL('/fonts/asl-hands.woff2')}') format('woff2');
}

@font-face {
    font-family: 'Braille Unicode Alt';
    src: url('${browser.runtime.getURL('/fonts/braille-unicode-alt.woff2')}') format('woff2');
}

@font-face {
    font-family: 'Morse Code';
    src: url('${browser.runtime.getURL('/fonts/morse-code.woff2')}') format('woff2');
}

@font-face {
    font-family: 'Vorticon SGA';
    src: url('${browser.runtime.getURL('/fonts/sga-k3-direct.otf.woff2')}') format('woff2');
}`;
    
    style.textContent = fontFaceRules;
    document.head.appendChild(style);
}