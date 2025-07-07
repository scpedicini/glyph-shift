# Using WXT in Phonetic Mapper

## Overview

WXT is a next-generation framework for developing web extensions that provides a modern development experience with TypeScript support, hot reload, and convention-based structure. This project uses WXT version 0.20.7.

## Browser Startup

During development, WXT uses [`web-ext` by Mozilla](https://www.npmjs.com/package/web-ext) to automatically open a browser window with your extension installed.

### Config Files

You can configure browser startup in 3 places:

1. `<rootDir>/web-ext.config.ts`: Ignored from version control, this file lets you configure your own options for a specific project without affecting other developers

   ```ts
   import { defineWebExtConfig } from 'wxt';
   
   export default defineWebExtConfig({
     // ...
   });
   ```

2. `<rootDir>/wxt.config.ts`: Via the `webExt` config, included in version control

3. `$HOME/web-ext.config.ts`: Provide default values for all WXT projects on your computer

## Configuration Examples

### Set Browser Binaries

To set or customize the browser opened during development:

```ts
// web-ext.config.ts
export default defineWebExtConfig({
  binaries: {
    chrome: '/path/to/chrome-beta', // Use Chrome Beta instead of regular Chrome
    firefox: 'firefoxdeveloperedition', // Use Firefox Developer Edition instead of regular Firefox
    edge: '/path/to/edge', // Open MS Edge when running "wxt -b edge"
  },
});
```

By default, WXT will try to automatically discover where Chrome/Firefox are installed. However, if you have chrome installed in a non-standard location, you need to set it manually as shown above.

### Persist Data

By default, `web-ext` creates a brand new profile every time you run the `dev` script. Chromium-based browsers support persisting data across development sessions.

To persist data, set the `--user-data-dir` flag:

```ts
// web-ext.config.ts
export default defineWebExtConfig({
  chromiumArgs: ['--user-data-dir=./.wxt/chrome-data'],
});
```

This creates a persistent profile in `.wxt/chrome-data/{profile-name}`, allowing you to:
- Install devtools extensions
- Remember logins and settings
- Maintain extension state between development sessions

> **Tip:** You can use any directory for `--user-data-dir`. To share a profile across all WXT projects, use a directory in your home folder.

### Disable Opening Browser

To load the extension manually without auto-opening a browser:

```ts
// web-ext.config.ts
export default defineWebExtConfig({
  disabled: true,
});
```