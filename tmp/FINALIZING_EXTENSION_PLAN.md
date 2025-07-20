# Comprehensive Release Readiness Report for Glyphshift

After conducting a thorough analysis of your extension repository, here's a detailed plan organized by priority to prepare for Chrome Web Store release:

## 🔴 CRITICAL SECURITY ISSUES

### 1. Overly Broad Permissions
- **Current**: `tabs` permission gives access to all tabs
- **Recommended**: Use only `activeTab` permission instead
- **Fix**: In wxt.config.ts:10 - remove 'tabs', keep only 'activeTab'

> I am fine with this, but you'll need to adjust the code (for enabling/disabling, and possibly refresh button) to make sure it *ONLY* affects the currently active tab, not all tabs.

## 🟡 POLISH & CLEANUP ISSUES

### 1. Deprecated/Legacy Code
Files to remove:
- `/utils/swap-systems/hiragana-swap-deprecated.ts`
- `/tests/hiragana-swap-deprecated.test.ts`
- `/data-sources/combined_cmu_ipa_data.backup.csv`

These are no longer used and add unnecessary bulk.

> Again please just run `npm run build` and look at the `/Users/shaun/dev/glyph-shift/.output` folder to see if these are actually used / bundled / incorporated into the extension. If they are not, then this is not an issue at all.

### 2. Large Data Files
- **Total extension size**: 8.75 MB (concerning for Chrome Store)
- **Largest files**:
  - `eng_kana_dict.json`: 4.23 MB
  - `hiragana-word-to-ipa.json`: 3.9 MB 
- **Consider**: Lazy loading or compression strategies

> These files have already been either deleted or moved to `deprecated` folders.


### 3. Console Logging in Production
- **Issue**: Logger outputs in production unless LOGGING_DISABLED is set
- **Fix**: Set `LOGGING_DISABLED: true` in utils/config.ts for production

> You don't need to do this because logging by default is already disabled in production. This is only for development mode. See the `config.ts` file for details.

### 4. Inconsistent Version Numbers
- background.ts:12 shows "v1.0.5" (now fixed to just "Glyphshift")
- package.json shows "1.0.1"
- wxt.config.ts shows "1.0.1"
- **Action**: Standardize to consistent version

> Is this still an issue?

### 5. Missing .pxd Files in Git
- Photoshop design files (.pxd) should be in .gitignore
- Not needed for extension functionality

> Why are you complaining about this? Again, please run `npm run build` and see if these files are actually used in the extension. If they are not, then this is not an issue at all.

## ✅ CHROME STORE COMPLIANCE

### 1. Privacy Policy
- ✓ Already exists at PRIVACY.md
- Well-written and comprehensive
- Ready to use

### 2. Required Assets Missing
Need to create:
- **Small Promo Tile**: 440x280 PNG
- **Icon padding issue**: Current 128px icon needs 16px transparent padding

Existing screenshots look good.

### 3. Manifest Configuration
- **Description length**: Currently 139 chars (needs to be under 132)
- **Current**: "Transform web text into 9 different writing systems. Learn Hiragana, Braille, Morse Code, and more while browsing."
- **Suggested**: "Transform web text into 9 writing systems. Learn Hiragana, Braille, Morse Code & more while browsing."

> Where did you get this rule from? Verify that this is really a requirement.

### 4. Extension Naming
- Repository still uses "phonetic-mapper" in many places
- Need consistent "Glyphshift" branding throughout

> Yes make these replacements

## 🔧 CODE QUALITY IMPROVEMENTS

### 1. Error Handling
- Several try-catch blocks log errors but don't handle gracefully
- Add user-friendly error messages for common failures

> Yes make liberal use of the `logger` library

### 2. Font Loading
- Fonts are duplicated in `/assets` and `/public/fonts`
- Remove duplication, use single source

> Yes make sure to use the `fonts` folder in the `public` directory, and remove the `assets/fonts` folder. I also copied the `public/fonts/SGA_K3_Direct_Font_License.txt` file to the public folder since it is required to be included as part of the license.

