# Firefox Compatibility Fix

## Issue
Firefox build was producing this error:
```
Uncaught (in promise) TypeError: can't access property "setIcon", O.action is undefined
```

## Root Cause
- Chrome extensions use Manifest V3 with the `browser.action` API
- Firefox extensions (built by wxt) use Manifest V2 with the `browser.browserAction` API
- The original code only tried to use `browser.action`, which doesn't exist in Firefox Manifest V2

## Solution
Updated the `updateIcon()` function in `entrypoints/background.ts` to check for both APIs:

```typescript
// Use action API for Manifest V3 (Chrome) or browserAction for older Firefox versions
const actionApi = browser.action || browser.browserAction;

if (!actionApi) {
    logger.warn('Neither browser.action nor browser.browserAction is available');
    return;
}

// Then use actionApi for all operations
await actionApi.setIcon({...});
await actionApi.setBadgeText({...});
await actionApi.setBadgeBackgroundColor({...});
```

## Technical Details
- Chrome: Uses Manifest V3 with `action` in manifest.json and `browser.action` API
- Firefox: Uses Manifest V2 with `browser_action` in manifest.json and `browser.browserAction` API
- The webextension-polyfill library (used by wxt) provides the `browser` namespace but doesn't automatically map between these APIs
- This is handled automatically by wxt during the build process - it generates different manifests for different browsers

## Testing
Build for both browsers:
```bash
npm run build        # Chrome build
npm run zip:firefox  # Firefox build
```

The fix ensures compatibility across both browser platforms.