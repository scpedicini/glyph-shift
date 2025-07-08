# Assets[](https://wxt.dev/guide/essentials/assets.html#assets)

## `/assets` Directory[](https://wxt.dev/guide/essentials/assets.html#assets-directory)

Any assets imported or referenced inside the `<srcDir>/assets/` directory will be processed by WXT's bundler.

Here's how you access them:

JSHTMLCSSVueJSX

ts

```
import imageUrl from '~/assets/image.png';

const img = document.createElement('img');
img.src = imageUrl;
```

## `/public` Directory[](https://wxt.dev/guide/essentials/assets.html#public-directory)

Files inside `<rootDir>/public/` are copied into the output folder as-is, without being processed by WXT's bundler.

Here's how you access them:

JSHTMLCSSVueJSX

ts

```
import imageUrl from '/image.png';

const img = document.createElement('img');
img.src = imageUrl;
```

WARNING

Assets in the `public/` directory are ***not\*** accessible in content scripts by default. To use a public asset in a content script, you must add it to your manifest's [`web_accessible_resources` array](https://wxt.dev/api/reference/wxt/type-aliases/UserManifest.html#web-accessible-resources).

## Inside Content Scripts[](https://wxt.dev/guide/essentials/assets.html#inside-content-scripts)

Assets inside content scripts are a little different. By default, when you import an asset, it returns just the path to the asset. This is because Vite assumes you're loading assets from the same hostname.

But, inside content scripts, the hostname is whatever the tab is set to. So if you try to fetch the asset, manually or as an `<img>`'s `src`, it will be loaded from the tab's website, not your extension.

To fix this, you need to convert the image to a full URL using `browser.runtime.getURL`:

entrypoints/content.ts

ts

```
import iconUrl from '/icon/128.png';

export default defineContentScript({
  matches: ['*://*.google.com/*'],
  main() {
    console.log(iconUrl); // "/icon/128.png"
    console.log(browser.runtime.getURL(iconUrl)); // "chrome-extension://<id>/icon/128.png"
  },
});
```

## 