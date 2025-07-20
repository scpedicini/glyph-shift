# Chrome Web Store Publishing Plan for Glyphshift

## Overview
This document outlines all tasks required to publish Glyphshift to the Chrome Web Store. Target audience: language learners who want to practice reading different writing systems.

## Required Store Assets (Minimum)

### Images You Need to Create:
1. **Small Promo Tile**: 440x280 PNG
   - Marketing image for Chrome Web Store listing
   - Should show the extension name and key features
   - Use vibrant colors and clear branding

2. **Screenshots**: 1280x800 or 640x400 PNG (minimum 1, maximum 5)
   - Screenshot 1: Extension popup interface showing all writing system options
   - Screenshot 2: Wikipedia page with text transformed to different alphabets
   - Screenshot 3: Before/after comparison of a webpage
   - Screenshot 4: Different writing systems in action (Hiragana, Braille, Morse, etc.)

3. **Marquee Image**: 1400x560 PNG (optional but recommended)
   - Premium placement image if featured
   - Should be eye-catching with minimal text
   - Example docs/example-marquee.png

### Existing Assets:
- ✓ Extension icons (16, 32, 48, 96, 128px) - already in place
-   The actual icon size should be 96x96 (for square icons); an additional 16 pixels per side should be transparent padding, adding up to 128x128 total image size. For details, see Icon size

## Critical Tasks Before Publishing

### 1. Privacy Policy (REQUIRED)
- [ ] Create PRIVACY.md in repository root
- [ ] Include: no data collection, local storage only, page content modification
- [ ] Use URL: https://github.com/scpedicini/glyph-shift/blob/main/PRIVACY.md

### 2. Extension Rebranding
- [ ] Change name from "glyph-shift" to "Glyphshift" in:
  - [ ] package.json
  - [ ] wxt.config.ts (manifest name)
  - [ ] popup HTML title
  - [ ] All documentation references
- [ ] Update description to be more engaging for language learners

### 3. Manifest Updates
- [ ] Change content script matches from Wikipedia-only to all pages: `"<all_urls>"`
- [ ] Update version to 1.0.0 for initial release
- [ ] Ensure description is under 132 characters and market-ready

### 4. Code Fixes
- [ ] Run type checking and fix any errors
- [ ] Run build process and ensure it completes
- [ ] Test the extension thoroughly on various websites

## Store Listing Content

### Item Title
"Glyphshift - Learn Writing Systems While Browsing"

### Item Summary (132 chars max)
"Transform web text into 9 different writing systems. Learn Hiragana, Braille, Morse Code, and more while browsing normally."

### Item Description
```
Glyphshift helps language learners practice reading different writing systems by randomly replacing words on any webpage with their equivalents in various alphabets and scripts.

Features:
• 9 writing systems: ASL Fingerspelling, Morse Code, Braille, Hiragana, Katakana, Roman Numerals, Hexadecimal, Vorticon (Commander Keen), and Cockney Rhyming Slang
• Adjustable swap frequency (0-100%)
• Toggle individual writing systems on/off
• Works on any website
• Clean, easy-to-use interface
• No data collection - completely private

Perfect for:
• Language learners wanting immersive practice
• Students studying Japanese (Hiragana/Katakana)
• Anyone learning Braille or Morse Code
• Fun way to make browsing more challenging
• Accessibility awareness

How it works:
1. Click the extension icon
2. Choose which writing systems to enable
3. Adjust how often words are swapped
4. Browse any website and see words transformed
5. Hover over transformed text to see the original

Start your journey to polyglot mastery with Glyphshift!
```

### Category
Education

### Language
English

## Technical Checklist

### Pre-submission Testing
- [ ] Test on fresh Chrome profile
- [ ] Verify all 9 writing systems work correctly
- [ ] Test enable/disable functionality
- [ ] Test persistence across browser restarts
- [ ] Test on various websites (not just Wikipedia)
- [ ] Verify hover functionality shows original text
- [ ] Check console for any errors

### Build & Package
- [ ] Run `npm run build`
- [ ] Run `npm run zip` to create submission package
- [ ] Verify ZIP contains all necessary files
- [ ] Test installing ZIP in Chrome developer mode

## Future Enhancements (Post-Launch)

1. **User Documentation**
   - Add help page with examples of each writing system
   - Create video tutorial
   - Add learning resources for each alphabet

2. **Features**
   - Add preview in popup
   - Visual indicators of what each alphabet looks like
   - Statistics tracking (locally) of exposure to each system
   - Customizable fonts/styles

3. **Performance**
   - Lazy load large data files
   - Optimize initial load time

## Submission Process

1. Create Developer Account ($5 one-time fee)
2. Fill out all listing information
3. Upload ZIP file
4. Add screenshots and promo images
5. Set privacy policy URL
6. Submit for review

## Review Timeline
- Initial review: 1-3 business days typically
- If rejected, address feedback and resubmit
- Once approved, visible in store within hours

## Marketing Ideas
- Share on language learning forums
- Create demo video
- Write blog post about the development
- Submit to Chrome extension directories