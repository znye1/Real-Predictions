let observer = null;

// Extract text from all containers with .r-adyw6z
function extractText() {
    const rDivs = document.querySelectorAll("div.r-adyw6z");

    // Pair each rDiv with its previous sibling div
    const result = [];

    rDivs.forEach(rDiv => {
        const wrapper = rDiv.parentElement;                  // wrapper div around rDiv
        const prevDiv = wrapper.previousElementSibling;     // previous div (can be different for each rDiv)
        const prevText = prevDiv ? prevDiv.innerText.trim() : "";
        const rText = rDiv.innerText.trim();

        if (rText.endsWith("%")) {                          // filter by text ending with %
            result.push(prevText + "\n" + rText);
        }
    });

    // Return first two pairs for popup columns
    return [result[0] || "", result[1] || ""];
}

function isStrictNumberString(str) {
    return /^-?\d+(\.\d+)?$/.test(str);
}

function extractTeamName() {
    const rDivs = document.querySelectorAll("div.r-1e50gmw");

    const result = [];
    rDivs.forEach(rDiv => {
        const rTeamName = rDiv.innerText.trim();

        if (!rTeamName.includes("-") && !isStrictNumberString(rTeamName)) {
            result.push(rTeamName);
        }
    })

    return [result[0] || "", result[1] || ""];
}

// Start observing DOM changes for live updates
function startObserving() {
    if (observer) return; // Avoid multiple observers
    let lastSerialized = "";

    const sendUpdate = () => {
        const text = extractText();
        const teamName = extractTeamName();
        const serialized = JSON.stringify({ text, teamName });
        if (serialized !== lastSerialized) {
            lastSerialized = serialized;
            chrome.runtime.sendMessage({ type: "TEXT_UPDATE_REAL", text: text, teamName: teamName });
        }
    };

    // Send initial text immediately
    sendUpdate();

    // Observe DOM changes
    observer = new MutationObserver(sendUpdate);
    observer.observe(document.body, {
        childList: true,
        subtree: true,
        characterData: true
    });
}

// Listen for messages from popup or background
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.type === "START_OBSERVING") {
        startObserving();
    } else if (request.type === "GET_REAL_TEXT") {
        const text = extractText();
        const teamName = extractTeamName();
        sendResponse({ text: text, teamName: teamName });
    }
    return true; // Keep channel open for async responses
});

window.addEventListener("beforeunload", () => {
    observer?.disconnect();
    observer = null;
});
