# Extension Port Channel Closed Error

Think very deeply - we are seeing this error in our Chrome Extension:
Unchecked runtime.lastError: The page keeping the extension port is moved into back/forward cache, so the message channel is closed.
Unchecked runtime.lastError: The page keeping the extension port is moved into back/forward cache, so the message channel is closed.

It occurs whenever a user clicks on a link to navigate to a new page while the extension is active. Every time the URL changes, the extension throws this error.

Read deeply through the WXT documentation/etc. and try to find a solution to this problem.

If it is relevant, this error message does NOT seem to happen with Firefox, only Chrome.

# Research Details

It indicates that your Chrome extension (in this case, WXT) is attempting to send a message or keep a port open to a page that has just been moved into the browser’s back/forward cache (bfcache). When a page enters this special cache (to enable instant navigation when users use the back/forward buttons), Chrome suspends the page—including any open extension ports or message channels. As a result, further communication attempts with that page fail, resulting in the error.

Technical Background
Back/forward cache (bfcache) optimizes browser navigation speed by "freezing" the entire page and its scripts, which includes disconnecting any open message ports related to Chrome extensions.
When an extension tries to send messages to a page that is no longer active (because it's cached), the message channel (port) closes, causing this error.

For Extension Developers (WXT or Others)
Check if content scripts still exist before sending messages from the background script.
Update your message handling logic to account for the possibility that the port may have been closed because of bfcache interaction.
Catch and gracefully handle runtime.lastError to avoid error spam in the console.
Consider adding listeners for page navigation events and disconnecting or cleaning up any open ports.

Read up on the Back/Forward Cache (bfcache) in Chrome:
https://developer.chrome.com/docs/devtools/application/back-forward-cache

```ts
chrome.tabs.sendMessage(tabId, {...}, (response) => {
  if (chrome.runtime.lastError) {
    // Handle or ignore the error gracefully
    return;
  }
  // process response
});
```

For longer-lived connections, always check connection state and respond properly to disconnects or error events. This issue is increasingly common with Manifest V3 extensions due to architectural changes and more frequent bfcache use in Chrome.