# Chrome Web Store Submission Information

## Single Purpose Description

Glyphshift transforms text on web pages into different writing systems like Hiragana, Braille, and Morse Code to help users learn and practice reading these alphabets. It randomly replaces words with their phonetic or symbolic equivalents based on user-selected writing systems and frequency settings, creating an immersive learning experience while browsing the web.

*Character count: 536*

## Permission Justifications

### Storage Permission Justification
```
Glyphshift uses storage permission to save user preferences including: which writing systems are enabled (Hiragana, Braille, Morse Code, etc.), text transformation frequency settings, and display options. This allows users to customize their browsing experience and have their settings persist across browser sessions. No personal data is collected or transmitted.
```

### Host Permission Justification (<all_urls>)
```
Glyphshift requires <all_urls> permission to transform text content on any website the user visits. As an educational tool that converts text into different writing systems (Hiragana, Katakana, Braille, Morse Code, ASL fingerspelling, etc.), it must inject content scripts on all pages to identify and transform text elements in real-time. This core functionality cannot work without broad host access. The extension only reads and modifies text locally - no data is ever collected, stored externally, or transmitted to any servers.
```

### ActiveTab Permission Justification
```
Glyphshift uses the activeTab permission to ensure the extension only operates on the currently active tab when the user explicitly interacts with it. This permission is requested alongside host permissions to provide users with more granular control over when text transformations occur. The activeTab permission allows the extension to transform text only on the tab the user is actively viewing, enhancing privacy and giving users explicit control over the extension's behavior.
```

### Remote Code Usage
- **Selection**: No, I am not using remote code
- **Note**: The extension uses only bundled JavaScript code and does not download or execute any external scripts.

## Additional Notes

- The `<all_urls>` permission will trigger an in-depth review warning, which may delay publishing
- This is a legitimate use case for broad host permissions since the extension needs to work on any website
- Emphasize the educational nature and privacy-respecting implementation in all communications

## Data Usage Declaration

**What user data do you plan to collect from users now or in the future?**

Do NOT check any of the following boxes:
- [ ] Personally identifiable information
- [ ] Health information  
- [ ] Financial and payment information
- [ ] Authentication information
- [ ] Personal communications
- [ ] Location
- [ ] Web history
- [ ] User activity
- [ ] Website content

**Explanation**: Glyphshift does not collect, store, or transmit ANY user data. The extension:
- Only reads webpage text to transform it locally
- Stores user preferences locally using Chrome's storage API (which writing systems to enable, frequency settings)
- Never sends data to external servers
- Has no analytics, tracking, or telemetry
- Does not monitor user behavior or browsing history
- All text processing happens entirely within the user's browser

*Character count: 721*

## Key Points to Emphasize
1. Educational tool for learning different writing systems
2. All processing happens locally in the browser
3. No data collection or transmission
4. No external servers or analytics
5. User-controlled settings for which writing systems to use