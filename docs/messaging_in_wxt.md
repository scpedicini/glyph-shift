# Messaging in WXT with webext-bridge

`webext-bridge` makes messaging in WebExtensions super easy. Out of the box.

[![NPM Version](https://img.shields.io/npm/v/webext-bridge?color=2B90B6&label=)](https://www.npmjs.com/package/webext-bridge)

## Example

```typescript
// Inside devtools script

import { sendMessage } from "webext-bridge/devtools";

button.addEventListener("click", async () => {
  const res = await sendMessage(
    "get-selection",
    { ignoreCasing: true },
    "content-script"
  );
  console.log(res); // > "The brown fox is alive and well"
});
```

```typescript
// Inside content script

import { sendMessage, onMessage } from "webext-bridge/content-script";

onMessage("get-selection", async (message) => {
  const {
    sender,
    data: { ignoreCasing },
  } = message;

  console.log(sender.context, sender.tabId); // > devtools  156

  const { selection } = await sendMessage(
    "get-preferences",
    { sync: false },
    "background"
  );
  return calculateSelection(data.ignoreCasing, selection);
});
```

```typescript
// Inside background script

import { onMessage } from "webext-bridge/background";

onMessage("get-preferences", ({ data }) => {
  const { sync } = data;

  return loadUserPreferences(sync);
});
```

> **Note:** Examples above require transpilation and/or bundling using `webpack`/`babel`/`rollup`

`webext-bridge` handles everything for you as efficiently as possible. No more `chrome.runtime.sendMessage`, `chrome.runtime.onConnect`, or `chrome.runtime.connect`.

## Setup

### Install

```bash
npm i webext-bridge
```

### Usage

Just `import { } from 'webext-bridge/{context}'` wherever you need it and use as shown in the example above.

> **Important:** Even if your extension doesn't need a background page or won't be sending/receiving messages in background script, `webext-bridge` uses background/event context as staging area for messages. Therefore it **must** be loaded in background/event page for it to work.
> 
> Attempting to send message from any context will fail silently if `webext-bridge` isn't available in background page. See the [troubleshooting section](https://www.npmjs.com/package/webext-bridge#troubleshooting) for more information.