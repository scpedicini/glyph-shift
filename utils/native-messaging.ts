import { logger } from '@/utils/logger';

/**
 * Native messaging wrapper that properly handles bfcache errors
 */

// Message type definitions
export interface MessageRequest {
    type: string;
    data?: any;
    id?: string;
}

export interface MessageResponse {
    success: boolean;
    data?: any;
    error?: string;
}

// Generate unique message IDs
let messageCounter = 0;
function generateMessageId(): string {
    return `msg_${Date.now()}_${++messageCounter}`;
}

/**
 * Send a message from content script to background
 */
export async function sendToBackground<T = any>(type: string, data?: any): Promise<T | undefined> {
    try {
        // Always check for lastError before operations
        if (chrome.runtime?.lastError) {
            logger.debug('[NATIVE-MSG] Clearing existing lastError before send:', chrome.runtime.lastError.message);
        }

        const message: MessageRequest = {
            type,
            data,
            id: generateMessageId()
        };


        return new Promise((resolve) => {
            // Use a timeout to auto-resolve if the page is navigating
            const timeout = setTimeout(() => {
                logger.debug(`[NATIVE-MSG] Message ${type} timed out (likely due to navigation)`);
                resolve(undefined);
            }, 5000);

            try {
                chrome.runtime.sendMessage(message, (response) => {
                    clearTimeout(timeout);
                    
                    // ALWAYS check lastError after callback
                    if (chrome.runtime.lastError) {
                        const errorMsg = chrome.runtime.lastError.message || '';
                        if (errorMsg.includes('back/forward cache') || 
                            errorMsg.includes('message channel is closed') ||
                            errorMsg.includes('Extension context invalidated')) {
                            logger.debug(`[NATIVE-MSG] BFCache error for ${type} (expected during navigation)`);
                        } else {
                            logger.warn(`[NATIVE-MSG] Runtime error for ${type}:`, errorMsg);
                        }
                        resolve(undefined);
                        return;
                    }

                    if (response?.success) {
                        logger.debug(`[NATIVE-MSG] Received response for ${type}:`, response.data);
                        resolve(response.data);
                    } else {
                        logger.warn(`[NATIVE-MSG] Error response for ${type}:`, response?.error);
                        resolve(undefined);
                    }
                });
            } catch (error) {
                clearTimeout(timeout);
                logger.debug(`[NATIVE-MSG] Exception sending ${type}:`, error);
                resolve(undefined);
            }
        });
    } catch (error) {
        logger.error(`[NATIVE-MSG] Failed to send ${type}:`, error);
        return undefined;
    }
}

/**
 * Send a message from background to a specific tab
 */
export async function sendToTab<T = any>(tabId: number, type: string, data?: any): Promise<T | undefined> {
    try {
        // Always check for lastError before operations
        if (chrome.runtime?.lastError) {
            logger.debug('[NATIVE-MSG] Clearing existing lastError before tab send:', chrome.runtime.lastError.message);
        }

        const message: MessageRequest = {
            type,
            data,
            id: generateMessageId()
        };

        logger.debug(`[NATIVE-MSG] Sending to tab ${tabId}: ${type}`, data);

        return new Promise((resolve) => {
            const timeout = setTimeout(() => {
                logger.debug(`[NATIVE-MSG] Tab message ${type} timed out`);
                resolve(undefined);
            }, 5000);

            try {
                chrome.tabs.sendMessage(tabId, message, (response) => {
                    clearTimeout(timeout);
                    
                    // ALWAYS check lastError
                    if (chrome.runtime.lastError) {
                        const errorMsg = chrome.runtime.lastError.message || '';
                        if (errorMsg.includes('back/forward cache') || 
                            errorMsg.includes('message channel is closed') ||
                            errorMsg.includes('Receiving end does not exist')) {
                            logger.debug(`[NATIVE-MSG] Expected error for tab ${tabId}: ${errorMsg}`);
                        } else {
                            logger.warn(`[NATIVE-MSG] Tab runtime error:`, errorMsg);
                        }
                        resolve(undefined);
                        return;
                    }

                    if (response?.success) {
                        logger.debug(`[NATIVE-MSG] Tab ${tabId} response for ${type}:`, response.data);
                        resolve(response.data);
                    } else {
                        logger.warn(`[NATIVE-MSG] Tab ${tabId} error for ${type}:`, response?.error);
                        resolve(undefined);
                    }
                });
            } catch (error) {
                clearTimeout(timeout);
                logger.debug(`[NATIVE-MSG] Exception sending to tab ${tabId}:`, error);
                resolve(undefined);
            }
        });
    } catch (error) {
        logger.error(`[NATIVE-MSG] Failed to send to tab ${tabId}:`, error);
        return undefined;
    }
}

/**
 * Listen for messages in background script
 */
export function onBackgroundMessage(callback: (message: MessageRequest, sender: chrome.runtime.MessageSender) => Promise<any> | any) {
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
        // Check lastError at start
        if (chrome.runtime.lastError) {
            logger.debug('[NATIVE-MSG] Existing lastError on message receive:', chrome.runtime.lastError.message);
        }

        // Only process our message format
        if (!message?.type) {
            return false;
        }

        // Wrap async callback handling
        (async () => {
            try {
                const result = await callback(message, sender);
                
                // Check lastError before sending response
                if (chrome.runtime.lastError) {
                    logger.debug('[NATIVE-MSG] LastError before response:', chrome.runtime.lastError.message);
                }

                sendResponse({
                    success: true,
                    data: result
                });
            } catch (error) {
                logger.error(`[NATIVE-MSG] Error handling ${message.type}:`, error);
                sendResponse({
                    success: false,
                    error: error instanceof Error ? error.message : 'Unknown error'
                });
            }
        })();

        // Return true to indicate async response
        return true;
    });
}

/**
 * Listen for messages in content script
 */
export function onContentMessage(callback: (message: MessageRequest) => Promise<any> | any) {
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
        // Check lastError at start
        if (chrome.runtime.lastError) {
            logger.debug('[NATIVE-MSG] Content script lastError on receive:', chrome.runtime.lastError.message);
        }

        // Only process our message format
        if (!message?.type || sender.id !== chrome.runtime.id) {
            return false;
        }

        logger.debug(`[NATIVE-MSG] Content received: ${message.type}`, message.data);

        // Wrap async callback handling
        (async () => {
            try {
                const result = await callback(message);
                
                // Check lastError before sending response
                if (chrome.runtime.lastError) {
                    logger.debug('[NATIVE-MSG] Content lastError before response:', chrome.runtime.lastError.message);
                }

                sendResponse({
                    success: true,
                    data: result
                });
            } catch (error) {
                logger.error(`[NATIVE-MSG] Content error handling ${message.type}:`, error);
                sendResponse({
                    success: false,
                    error: error instanceof Error ? error.message : 'Unknown error'
                });
            }
        })();

        // Return true to indicate async response
        return true;
    });
}

/**
 * Cleanup function for content scripts
 */
export function setupMessageCleanup() {
    // Clean up on navigation
    window.addEventListener('pagehide', () => {
        logger.debug('[NATIVE-MSG] Page hiding, checking for lastError');
        if (chrome.runtime?.lastError) {
            logger.debug('[NATIVE-MSG] Cleared lastError on pagehide:', chrome.runtime.lastError.message);
        }
    });

    window.addEventListener('beforeunload', () => {
        logger.debug('[NATIVE-MSG] Before unload, checking for lastError');
        if (chrome.runtime?.lastError) {
            logger.debug('[NATIVE-MSG] Cleared lastError on beforeunload:', chrome.runtime.lastError.message);
        }
    });

    // Periodically check and clear lastError in development
    if (import.meta.env.DEV) {
        setInterval(() => {
            if (chrome.runtime?.lastError) {
                logger.debug('[NATIVE-MSG] Periodic lastError check:', chrome.runtime.lastError.message);
            }
        }, 1000);
    }
}