import {defineConfig} from 'wxt';

// See https://wxt.dev/api/config.html
export default defineConfig({
  extensionApi: 'webextension-polyfill',
  manifest: {
    permissions: [
      'storage',
    ],

  },
  runner: {
    chromiumArgs: ['--user-data-dir=./.wxt/chrome-data'],
    startUrls: ['https://simple.wikipedia.org/wiki/Commodore_64'],
  },

});
