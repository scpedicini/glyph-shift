// wxt.config.ts – v0.20‑compatible
import { defineConfig } from 'wxt';

export default defineConfig({
  // extensionApi: 'webextension-polyfill',  // <- deprecated
  manifest: {
    permissions: ['storage'],
  },
  webExt: {                       // was: runner
    chromiumArgs: ['--user-data-dir=./.wxt/chrome-data'],
    startUrls: ['https://simple.wikipedia.org/wiki/Commodore_64'],
  },
});
