# Basic Info

Here’s the bottom line: because your `.woff2` files are packaged inside the extension and served from the `chrome-extension://` origin, the default CSP `font-src 'self'` already covers them—you don’t need to add `data:`. Instead, the two things to fix are (1) making sure your CSS actually points to the right extension URL, and (2) declaring the font files as **web\_accessible\_resources** so that content scripts can fetch them.

---

## 1. Why you don’t need `data:` in CSP for packaged fonts

By default, Manifest V3’s CSP for extension pages (and—when you explicitly set it—content scripts) is equivalent to:

```text
default-src 'self';  
script-src 'self'; object-src 'self'; font-src 'self';  
…
```

Here, `'self'` refers to the extension’s own origin (`chrome-extension://<your-id>`), so any font files bundled in your `.crx` or `.zip` automatically qualify ([Chrome for Developers][1]). In Manifest V3, you can’t reference external schemes like `https:` or `data:` in CSP unless you explicitly include them ([MDN Web Docs][2])—but since you’re not using data‑URIs, you’re fine as-is.

---

## 2. Ensuring content scripts can fetch extension assets

Content scripts run in an isolated world, but **resource fetches** they issue (via `url()` in injected CSS, or `fetch()`) are still subject to the host page’s permissions. To allow a content script to load `chrome-extension://<your-id>/assets/braille-unicode-alt.woff2`, you **must** declare it in your manifest’s **web\_accessible\_resources** ([Chrome for Developers][3], [Chrome for Developers][4]). Without this, Chrome will refuse the request—even though the file is packaged with your extension ([Stack Overflow][5]).

**Manifest snippet**:

```jsonc
{
  // …
  "web_accessible_resources": [
    {
      "resources": ["assets/braille-unicode-alt.woff2"],
      "matches": ["<all_urls>"]
    }
  ]
}
```

---

## 3. Correcting your CSS asset path

The `~` syntax isn’t standard in browser CSS—it’s a build‑tool alias (and by default Vite only supports `@` for imports, not `~`). Instead, reference your font with a path that Vite will process into a real URL:

```css
/* in entrypoints/your-content-script/style.css */
@font-face {
  font-family: 'Braille Unicode Alt';
  src: url('../assets/braille-unicode-alt.woff2') format('woff2');
}
```

* **Vite asset handling** will detect that `../assets/...woff2` is a static asset, include it in the build graph (with hashing, if configured), and rewrite the URL accordingly ([vitejs][6]).
* **WXT’s entrypoints** mechanism means any files in `entrypoints/` (including CSS) are bundled with their adjacent assets—just keep your `.css` and your `assets/` folder in the same entrypoint directory ([WXT][7]).

---

## 4. Referencing extension‑origin URLs in CSS

If you ever need a fully‑qualified URL (for example, within inline `<style>` you inject via JS), you can use the special placeholder that Chrome replaces at runtime:

```css
/* static CSS in extension pages only—content scripts can’t use chrome.runtime.getURL here */
.some-class {
  background: url("chrome-extension://__MSG_@@extension_id__/assets/braille-unicode-alt.woff2");
}
```

Or, in JS before injecting your CSS, programmatically replace with `chrome.runtime.getURL('assets/braille-unicode-alt.woff2')` ([extension.ninja][8]).

---

## 5. Putting it all together

1. **Remove** the `data:` suggestion from CSP—you don’t need it when loading from `'self'`.
2. **Declare** your font file under `web_accessible_resources` so content scripts can fetch it.
3. **Fix** your CSS to use a relative path (e.g. `url('../assets/...')`), letting Vite/WXT bundle and rewrite it.
4. (Optional) Use `chrome.runtime.getURL(...)` or the `__MSG_@@extension_id__` macro for fully‑qualified URLs.

With these changes, your Braille font will load correctly in any page you inject into—no CSP tweaks required.

[1]: https://developer.chrome.com/docs/extensions/reference/manifest/content-security-policy?utm_source=chatgpt.com "Manifest - Content Security Policy | Chrome Extensions"
[2]: https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/manifest.json/content_security_policy?utm_source=chatgpt.com "content_security_policy - Mozilla - MDN Web Docs"
[3]: https://developer.chrome.com/docs/extensions/develop/concepts/content-scripts?utm_source=chatgpt.com "Content scripts | Chrome Extensions"
[4]: https://developer.chrome.com/docs/extensions/reference/manifest/web-accessible-resources?utm_source=chatgpt.com "Manifest - Web Accessible Resources | Chrome Extensions"
[5]: https://stackoverflow.com/questions/77208561/unable-to-load-stylesheet-chrome-extension-manifest-v3?utm_source=chatgpt.com "Unable to load stylesheet chrome extension manifest v3"
[6]: https://vite.dev/guide/assets?utm_source=chatgpt.com "Static Asset Handling - Vite"
[7]: https://wxt.dev/guide/essentials/entrypoints.html?utm_source=chatgpt.com "Entrypoints - WXT"
[8]: https://www.extension.ninja/blog/post/how-to-use-web-accessible-resources-in-chrome-extensions/?utm_source=chatgpt.com "How to use Web Accessible Resources in Chrome Extensions"

# More Info

In Chrome Manifest V3 extensions, the default Content Security Policy (CSP) for extension pages only allows resources from the extension itself and does not permit data‑URI fonts, so any base64‑encoded `@font-face` will be blocked under the implicit `font-src 'self'` policy ([Chrome for Developers][1], [GitHub][2]). To load embedded fonts via data URIs you must explicitly add the `data:` scheme to your `font-src` directive (e.g. `font-src 'self' data:`) ([MDN Web Docs][3], [Stack Overflow][4]). Because Manifest V3 further restricts CSP to only allow `'self'`, `'none'`, and `'wasm-unsafe-eval'` in `script-src` (and by inheritance for other directives unless overridden), any omission of `data:` will cause all data‑URI fonts to be refused ([Stack Overflow][5], [Chrome for Developers][6]). In a WXT‑based project you can override this by supplying a custom `content_security_policy` in your `wxt.config.ts`, adding `font-src 'self' data:` under `extension_pages` ([GitHub][7]).

## Why your data‑URI fonts are being blocked

The CSP `font-src` directive governs which sources `@font-face` may load from; if unspecified, it falls back to the default policy, which for extension pages only permits `'self'` ([MDN Web Docs][3], [GitHub][2]). Data URIs (e.g. `url("data:font/woff2;base64,…")`) count as a separate scheme, so they’re disallowed unless you explicitly include `data:` in the `font-src` list ([Stack Overflow][4], [Information Security Stack Exchange][8]).

## Enabling data‑URI fonts in Manifest V3

### 1. Add `data:` to your CSP

In your `manifest.json` (or via WXT’s config), extend the default `font-src` directive:

```jsonc
"content_security_policy": {
  "extension_pages":
    "script-src 'self'; object-src 'self'; font-src 'self' data:;"
}
```

This tells Chrome to allow both packaged fonts and base64‑encoded fonts via data URIs ([MDN Web Docs][3], [Stack Overflow][4]).

### 2. Configure this in WXT

With WXT, you control the manifest through `wxt.config.ts`. Here’s how to override the policy:

```ts
import { defineConfig } from "wxt";

export default defineConfig({
  manifest: {
    content_security_policy: {
      extension_pages:
        "script-src 'self'; object-src 'self'; font-src 'self' data:;",
    },
  },
});
```

This injects the updated CSP into your built `manifest.json`, enabling data‑URI fonts ([GitHub][7]).

## Security considerations

Allowing `data:` in `font-src` marginally expands your attack surface—if an attacker can inject CSS, they could load malicious fonts—but CSP’s other directives (e.g. prohibiting inline styles or untrusted sources) mitigate most risks ([Information Security Stack Exchange][8]). If feasible, consider packaging fonts as static files in your extension and referencing them via `chrome.runtime.getURL()` to avoid introducing `data:` altogether.

---

If you follow these steps, your WXT‑powered extension will accept base64‑embedded fonts without violating CSP, resolving the “Refused to load the font 'data\:font/woff2;base64…'” error.

[1]: https://developer.chrome.com/docs/extensions/reference/manifest/content-security-policy?utm_source=chatgpt.com "Manifest - Content Security Policy | Chrome Extensions"
[2]: https://github.com/nextcloud/server/issues/8358?utm_source=chatgpt.com "CSP is blocking font in data: · Issue #8358 · nextcloud/server - GitHub"
[3]: https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Content-Security-Policy/font-src?utm_source=chatgpt.com "Content-Security-Policy: font-src directive - HTTP - MDN Web Docs"
[4]: https://stackoverflow.com/questions/52328336/csp-allow-specific-datafont-woffbase64-somebase64encoded-font-without-usin?utm_source=chatgpt.com "CSP allow specific: data:font/woff;base64,\"someBase64encoded ..."
[5]: https://stackoverflow.com/questions/79215555/how-to-fix-firebase-google-authentication-csp-errors-in-a-chrome-extension-mani "How to Fix Firebase Google Authentication CSP Errors in a Chrome Extension (Manifest v3, WXT Framework) - Stack Overflow"
[6]: https://developer.chrome.com/docs/extensions/develop/migrate/improve-security?utm_source=chatgpt.com "Improve extension security - Chrome for Developers"
[7]: https://github.com/wxt-dev/wxt/discussions/1055?utm_source=chatgpt.com "How to add \"content_security_policy\" to manifest? #1055 - GitHub"
[8]: https://security.stackexchange.com/questions/269804/is-it-safe-to-use-font-src-with-data-in-a-content-security-policy?utm_source=chatgpt.com "Is it safe to use font-src with data: in a Content Security Policy?"



# Additional WXT Information

Details
WXT doesn't automatically convert URLs in CSS files to use the target browser's extension protocol

url("chrome-extension://__MSG_@@extension_id__/...") works for Chrome, but not firefox:

Cross-Origin Request Blocked: The Same Origin Policy disallows reading the remote resource at chrome-extension://7b1c5813-0637-465b-9514-c36d236e4e43/fonts/poppins-v23-latin-regular.woff2. (Reason: CORS request not http).

downloadable font: failed to start download (font-family: "Poppins" style:normal weight:400 stretch:100 src index:0): bad URI or cross-site access not allowed source: chrome-extension://7b1c5813-0637-465b-9514-c36d236e4e43/fonts/poppins-v23-latin-regular.woff2 
Here's the protocols for each browser:

Browser	Protocols
Chrome	"chrome-extension:"
Firefox	"moz-extension:"
Edge	"chrome-extension:"
Safari	"safari-web-extension:"
Chromium	"chrome-extension:"
When loaded from the dev server during development, chrome-extension://__MSG_@@extension_id__ doesn't work for the popup because it's loaded over localhost, not a file from the extension's directory.

Vite logs a warning when including any asset with chrome-extension:// in it.

chrome-extension://__MSG_@@extension_id__/fonts/poppins-v23-latin-regular.woff2 referenced in chrome-extension://__MSG_@@extension_id__/fonts/poppins-v23-latin-regular.woff2 didn't resolve at build time, it will remain unchanged to be resolved at runtime
/* @vite-ignore */ does not fix this, or I haven't put it in the correct place.
So to fix these problems, we need to:


Document the new wxt-extension: protocol and how to use it
If someone is using moz-extension:, chrome-extension:, etc, respect it.
I debated myself for what the protocol should be, web-extension: or wxt-extension:, and settled on wxt-extension: since it will be easy to find/replace with regex, don't need to worry about future protocols or partial matches with existing ones. Downside is that it's non-standard and hard to migrate away from

During vite builds, replace wxt-extension: with the protocol of the target browser.

During development, strip any wxt-extension://__MSG_@@extension_id__ prefixes from URLs so they are served as absolute paths from the dev server

Figure out how to silence the unresolved asset warnings

https://github.com/wxt-dev/wxt/issues/1744