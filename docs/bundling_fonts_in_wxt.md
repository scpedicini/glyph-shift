# Bundling Fonts in WXT Extensions

This guide documents the approach for properly bundling fonts in WXT-based browser extensions to avoid Content Security Policy (CSP) violations, particularly for Chromium-based browsers.

## Key Challenges Addressed

1. **CSP Violations**: Chrome's Manifest V3 default CSP blocks data-URI fonts (base64-encoded) with `font-src 'self'`
2. **Cross-Origin Issues**: Content scripts need special handling to load extension assets
3. **Cross-Browser Compatibility**: Different browsers use different extension protocols
4. **Vite Asset Handling**: Build system needs proper configuration to handle font files

## Solution Overview

### 1. Disable Font Inlining in Vite

Configure Vite to treat fonts as external files rather than inlining them as data URIs:

```typescript
// wxt.config.ts
export default defineConfig({
  vite: () => ({
    build: {
      assetsInlineLimit: 0, // Disable inlining of assets, force all to be files
    }
  }),
});
```

### 2. Declare Fonts as Web Accessible Resources

Make font files accessible to content scripts by declaring them in the manifest:

```typescript
// wxt.config.ts
export default defineConfig({
  manifest: {
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
});
```

### 3. Use Extension Protocol URLs in CSS

Reference fonts using the special Chrome extension protocol placeholder that gets replaced at runtime:

```css
/* entrypoints/content-styles.css */
@font-face {
  font-family: 'Custom Font';
  src: url('chrome-extension://__MSG_@@extension_id__/fonts/custom-font.woff2') format('woff2');
}
```

**Important**: This approach works because:
- Chrome automatically replaces `__MSG_@@extension_id__` with the actual extension ID
- The `chrome-extension://` protocol is trusted by the CSP's `'self'` directive
- Web accessible resources declaration allows content scripts to fetch the fonts

### 4. Font File Organization

Place font files in the public directory structure:
```
/public
  /fonts
    - custom-font.woff2
    - another-font.ttf
```

## Why This Approach Works

1. **No CSP Modification Required**: Since fonts are served from the extension's origin (`chrome-extension://`), they're covered by the default `font-src 'self'` policy
2. **No Data URIs**: By preventing Vite from inlining fonts, we avoid CSP violations entirely
3. **Content Script Access**: Web accessible resources declaration ensures content scripts can fetch the font files
4. **Cross-Browser Note**: While this uses `chrome-extension://`, it works for Chrome, Edge, and other Chromium browsers. Firefox would need `moz-extension://`

## Common Pitfalls to Avoid

1. **Don't use relative paths in CSS for content scripts** - they'll resolve to the host page's domain
2. **Don't forget web_accessible_resources** - without this, content scripts can't load the fonts
3. **Don't try to add `data:` to CSP** - it's unnecessary and weakens security
4. **Don't use `~` or `@` aliases in CSS** - use proper extension protocol URLs

## Alternative Approaches (Not Recommended)

1. **Enabling data: in CSP**: While possible, this weakens security and is unnecessary
2. **Using browser.runtime.getURL() in JS**: More complex and requires dynamic CSS injection
3. **Bundling fonts in assets directory**: Requires more complex Vite configuration

## Example Implementation

Complete working example from production:

```typescript
// wxt.config.ts
export default defineConfig({
  manifest: {
    name: 'Your Extension',
    web_accessible_resources: [
      {
        resources: ['fonts/*.woff2', 'fonts/*.ttf'],
        matches: ['<all_urls>']
      }
    ]
  },
  vite: () => ({
    build: {
      assetsInlineLimit: 0
    }
  })
});
```

```css
/* content-styles.css */
@font-face {
  font-family: 'Braille Unicode Alt';
  src: url('chrome-extension://__MSG_@@extension_id__/fonts/braille-unicode-alt.woff2') format('woff2');
}

.braille-text {
  font-family: 'Braille Unicode Alt' !important;
}
```

This approach ensures fonts load correctly without CSP violations across all Chromium-based browsers.