chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {

    let messageToSend = null;

    if (request.type === "READ_REAL_TAB") {
        messageToSend = { type: "GET_REAL_TEXT" };
    }

    if (request.type === "READ_REAL_POLLS") {
        messageToSend = { type: "GET_REAL_POLLS" };
    }

    if (request.type === "READ_FD_TAB") {
        messageToSend = { type: "GET_FD_TEXT" };
    }

    // If it's not a read request we care about, ignore it
    if (!messageToSend) return;

    const tabId = request.tabId;
    if (!tabId) {
        sendResponse({ text: [], error: "Invalid tab ID" });
        return;
    }

    chrome.tabs.sendMessage(tabId, messageToSend, (response) => {

        if (chrome.runtime.lastError) {
            sendResponse({
                text: [],
                error: chrome.runtime.lastError.message
            });
            return;
        }

        if (!response || !Array.isArray(response.text)) {
            sendResponse({
                text: [],
                error: "No response from content script"
            });
            return;
        }

        sendResponse({
            text: response.text,
            teamName: response.teamName || []
        });
    });

    return true; // keep message channel open
});
