# Content Scripts

> To create a content script, see [Entrypoint Types](https://wxt.dev/guide/essentials/entrypoints.html#content-scripts).

## Context

The first argument to a content script's `main` function is its "context".

```typescript
// entrypoints/example.content.ts
export default defineContentScript({
  main(ctx) {},
});
```

This object is responsible for tracking whether or not the content script's context is "invalidated". Most browsers, by default, do not stop content scripts if the extension is uninstalled, updated, or disabled. When this happens, content scripts start reporting this error:

```
Error: Extension context invalidated.
```

The `ctx` object provides several helpers to stop asynchronous code from running once the context is invalidated:

```typescript
ctx.addEventListener(...);
ctx.setTimeout(...);
ctx.setInterval(...);
ctx.requestAnimationFrame(...);
// and more
```

You can also check if the context is invalidated manually:

```typescript
if (ctx.isValid) {
  // do something
}
// OR
if (ctx.isInvalid) {
  // do something
}
```

## CSS

In regular web extensions, CSS for content scripts is usually a separate CSS file, that is added to a CSS array in the manifest:

```json
{
  "content_scripts": [
    {
      "css": ["content/style.css"],
      "js": ["content/index.js"],
      "matches": ["*://*/*"]
    }
  ]
}
```

In WXT, to add CSS to a content script, simply import the CSS file into your JS entrypoint, and WXT will automatically add the bundled CSS output to the `css` array.

```typescript
// entrypoints/example.content/index.ts
import './style.css';

export default defineContentScript({
  // ...
});
```

To create a standalone content script that only includes a CSS file:

1. Create the CSS file: `entrypoints/example.content.css`

2. Use the `build:manifestGenerated` hook to add the content script to the manifest:

   ```typescript
   // wxt.config.ts
   export default defineConfig({
     hooks: {
       'build:manifestGenerated': (wxt, manifest) => {
         manifest.content_scripts ??= [];
         manifest.content_scripts.push({
           // Build extension once to see where your CSS get's written to
           css: ['content-scripts/example.css'],
           matches: ['*://*/*'],
         });
       },
     },
   });
   ```

## UI

WXT provides 3 built-in utilities for adding UIs to a page from a content script:

- [Integrated](#integrated) - `createIntegratedUi`
- [Shadow Root](#shadow-root) - `createShadowRootUi`
- [IFrame](#iframe) - `createIframeUi`

Each has their own set of advantages and disadvantages.

| Method      | Isolated Styles | Isolated Events    | HMR  | Use page's context |
| :---------- | :-------------: | :----------------: | :--: | :----------------: |
| Integrated  |        ❌        |         ❌          |  ❌   |         ✅          |
| Shadow Root |        ✅        | ✅ (off by default) |  ❌   |         ✅          |
| IFrame      |        ✅        |         ✅          |  ✅   |         ❌          |

### Integrated

Integrated content script UIs are injected alongside the content of a page. This means that they are affected by CSS on that page.

```typescript
// entrypoints/example-ui.content.ts
export default defineContentScript({
  matches: ['<all_urls>'],

  main(ctx) {
    const ui = createIntegratedUi(ctx, {
      position: 'inline',
      anchor: 'body',
      onMount: (container) => {
        // Append children to the container
        const app = document.createElement('p');
        app.textContent = '...';
        container.append(app);
      },
    });

    // Call mount to add the UI to the DOM
    ui.mount();
  },
});
```

See the [API Reference](https://wxt.dev/api/reference/wxt/utils/content-script-ui/integrated/functions/createIntegratedUi.html) for the complete list of options.

### Shadow Root

Often in web extensions, you don't want your content script's CSS affecting the page, or vise-versa. The [`ShadowRoot`](https://developer.mozilla.org/en-US/docs/Web/API/ShadowRoot) API is ideal for this.

WXT's [`createShadowRootUi`](https://wxt.dev/api/reference/wxt/utils/content-script-ui/shadow-root/functions/createShadowRootUi.html) abstracts all the `ShadowRoot` setup away, making it easy to create UIs whose styles are isolated from the page. It also supports an optional `isolateEvents` parameter to further isolate user interactions.

To use `createShadowRootUi`, follow these steps:

1. Import your CSS file at the top of your content script
2. Set [`cssInjectionMode: "ui"`](https://wxt.dev/api/reference/wxt/interfaces/BaseContentScriptEntrypointOptions.html#cssinjectionmode) inside `defineContentScript`
3. Define your UI with `createShadowRootUi()`
4. Mount the UI so it is visible to users

```typescript
// 1. Import the style
import './style.css';

export default defineContentScript({
  matches: ['<all_urls>'],
  // 2. Set cssInjectionMode
  cssInjectionMode: 'ui',

  async main(ctx) {
    // 3. Define your UI
    const ui = await createShadowRootUi(ctx, {
      name: 'example-ui',
      position: 'inline',
      anchor: 'body',
      onMount(container) {
        // Define how your UI will be mounted inside the container
        const app = document.createElement('p');
        app.textContent = 'Hello world!';
        container.append(app);
      },
    });

    // 4. Mount the UI
    ui.mount();
  },
});
```

See the [API Reference](https://wxt.dev/api/reference/wxt/utils/content-script-ui/shadow-root/functions/createShadowRootUi.html) for the complete list of options.

Full examples:

- [react-content-script-ui](https://github.com/wxt-dev/examples/tree/main/examples/react-content-script-ui)
- [tailwindcss](https://github.com/wxt-dev/examples/tree/main/examples/tailwindcss)

### IFrame

If you don't need to run your UI in the same frame as the content script, you can use an IFrame to host your UI instead. Since an IFrame just hosts an HTML page, **HMR is supported**.

WXT provides a helper function, [`createIframeUi`](https://wxt.dev/api/reference/wxt/utils/content-script-ui/iframe/functions/createIframeUi.html), which simplifies setting up the IFrame.

1. Create an HTML page that will be loaded into your IFrame:

   ```html
   <!-- entrypoints/example-iframe.html -->
   <!doctype html>
   <html lang="en">
     <head>
       <meta charset="UTF-8" />
       <meta name="viewport" content="width=device-width, initial-scale=1.0" />
       <title>Your Content Script IFrame</title>
     </head>
     <body>
       <!-- ... -->
     </body>
   </html>
   ```

2. Add the page to the manifest's `web_accessible_resources`:

   ```typescript
   // wxt.config.ts
   export default defineConfig({
     manifest: {
       web_accessible_resources: [
         {
           resources: ['example-iframe.html'],
           matches: [...],
         },
       ],
     },
   });
   ```

3. Create and mount the IFrame:

   ```typescript
   export default defineContentScript({
     matches: ['<all_urls>'],
   
     main(ctx) {
       // Define the UI
       const ui = createIframeUi(ctx, {
         page: '/example-iframe.html',
         position: 'inline',
         anchor: 'body',
         onMount: (wrapper, iframe) => {
           // Add styles to the iframe like width
           iframe.width = '123';
         },
       });
   
       // Show UI to user
       ui.mount();
     },
   });
   ```

See the [API Reference](https://wxt.dev/api/reference/wxt/utils/content-script-ui/iframe/functions/createIframeUi.html) for the complete list of options.

## Isolated World vs Main World

By default, all content scripts run in an isolated context where only the DOM is shared with the webpage it is running on - an "isolated world". In MV3, Chromium introduced the ability to run content scripts in the "main" world - where everything, not just the DOM, is available to the content script, just like if the script were loaded by the webpage.

You can enable this for a content script by setting the `world` option:

```typescript
export default defineContentScript({
  world: 'MAIN',
});
```

However, this approach has several notable drawbacks:

- Doesn't support MV2
- `world: "MAIN"` is only supported by Chromium browsers
- Main world content scripts don't have access to the extension API

Instead, WXT recommends injecting a script into the main world manually using it's `injectScript` function. This will address the drawbacks mentioned before.

- `injectScript` supports both MV2 and MV3
- `injectScript` supports all browsers
- Having a "parent" content script means you can send messages back and forth, making it possible to access the extension API

To use `injectScript`, we need two entrypoints, one content script and one unlisted script:

```
📂 entrypoints/
   📄 example.content.ts
   📄 example-main-world.ts
```

```typescript
// entrypoints/example-main-world.ts
export default defineUnlistedScript(() => {
  console.log('Hello from the main world');
});
```

```typescript
// entrypoints/example.content.ts
export default defineContentScript({
  matches: ['*://*/*'],
  async main() {
    console.log('Injecting script...');
    await injectScript('/example-main-world.js', {
      keepInDom: true,
    });
    console.log('Done!');
  },
});
```

```typescript
export default defineConfig({
  manifest: {
    // ...
    web_accessible_resources: [
      {
        resources: ["example-main-world.js"],
        matches: ["*://*/*"],
      }
    ]
  }
});
```

`injectScript` works by creating a `script` element on the page pointing to your script. This loads the script into the page's context so it runs in the main world.

`injectScript` returns a promise, that when resolved, means the script has been evaluated by the browser and you can start communicating with it.

> **Warning: `run_at` Caveat**
> 
> For MV3, `injectScript` is synchronous and the injected script will be evaluated at the same time as your the content script's `run_at`.
> 
> However for MV2, `injectScript` has to `fetch` the script's text content and create an inline `<script>` block. This means for MV2, your script is injected asynchronously and it will not be evaluated at the same time as your content script's `run_at`.

## Mounting UI to dynamic element

In many cases, you may need to mount a UI to a DOM element that does not exist at the time the web page is initially loaded. To handle this, use the `autoMount` API to automatically mount the UI when the target element appears dynamically and unmount it when the element disappears. In WXT, the `anchor` option is used to target the element, enabling automatic mounting and unmounting based on its appearance and removal.

```typescript
export default defineContentScript({
  matches: ['<all_urls>'],

  main(ctx) {
    const ui = createIntegratedUi(ctx, {
      position: 'inline',
      // It observes the anchor
      anchor: '#your-target-dynamic-element',
      onMount: (container) => {
        // Append children to the container
        const app = document.createElement('p');
        app.textContent = '...';
        container.append(app);
      },
    });

    // Call autoMount to observe anchor element for add/remove.
    ui.autoMount();
  },
});
```

> **TIP**
> 
> When the `ui.remove` is called, `autoMount` also stops.

See the [API Reference](https://wxt.dev/api/reference/wxt/utils/content-script-ui/types/interfaces/ContentScriptUi.html#automount) for the complete list of options.

## Dealing with SPAs

It is difficult to write content scripts for SPAs (single page applications) and websites using HTML5 history mode for navigation because content scripts are only ran on full page reloads. SPAs and websites that take advantage of HTML5 history mode **do not perform a full reload when changing paths**, and thus your content script isn't going to be ran when you expect it to be.

Let's look at an example. Say you want to add a UI to YouTube when watching a video:

```typescript
export default defineContentScript({
  matches: ['*://*.youtube.com/watch*'],
  main(ctx) {
    console.log('YouTube content script loaded');

    mountUi(ctx);
  },
});

function mountUi(ctx: ContentScriptContext): void {
  // ...
}
```

You're only going to see "YouTube content script loaded" when reloading the watch page or when navigating directly to it from another website.

To get around this, you'll need to manually listen for the path to change and run your content script when the URL matches what you expect it to match.

```typescript
const watchPattern = new MatchPattern('*://*.youtube.com/watch*');

export default defineContentScript({
  matches: ['*://*.youtube.com/*'],
  main(ctx) {
    ctx.addEventListener(window, 'wxt:locationchange', ({ newUrl }) => {
      if (watchPattern.includes(newUrl)) mainWatch(ctx);
    });
  },
});

function mainWatch(ctx: ContentScriptContext) {
  mountUi(ctx);
}