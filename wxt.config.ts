// wxt.config.ts – v0.20‑compatible
import { defineConfig } from 'wxt';

export default defineConfig({
  // extensionApi: 'webextension-polyfill',  // <- deprecated
  manifest: {
    name: 'Glyphshift',
    version: '1.0.1',
    description: 'Transform web text into 9 different writing systems. Learn Hiragana, Braille, Morse Code, and more while browsing.',
    permissions: ['storage'],
    action: {
      default_popup: 'popup.html',
      default_icon: {
        16: 'icon/16.png',
        32: 'icon/32.png',
        48: 'icon/48.png',
        128: 'icon/128.png'
      }
    },
    web_accessible_resources: [
      {
        resources: [
          'fonts/*.woff2',
          'fonts/*.ttf'
        ],
        matches: ['<all_urls>']
      }
    ]
  },
  webExt: {                       // was: runner
    chromiumArgs: ['--user-data-dir=./.wxt/chrome-data'],
    startUrls: ['https://simple.wikipedia.org/wiki/Commodore_64'],
  },
  vite: () => ({
    build: {
      assetsInlineLimit: 0, // Disable inlining of assets, force all to be files
    }
  }),
});
