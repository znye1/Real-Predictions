let observer = null;
let activeTeams = [];

// ================== FIND MONEYLINE ==================
function findMoneyline(team) {
    return [...document.querySelectorAll("div[aria-label]")]
        .filter(div => {
            const label = div.getAttribute("aria-label") || "";
            return label.includes("Moneyline") && label.includes(team);
        });
}

// ================== EXTRACT TEXT ==================
function extractText() {
    if (!activeTeams.length) return ["", ""];

    const result = [];

    activeTeams.forEach(team => {
        const divs = findMoneyline(team);
        const fdDiv = divs[0];
        const fdText =
            fdDiv?.querySelector("span")?.textContent?.trim() || "";
        result.push(fdText);
    });

    return [result[0] || "", result[1] || ""];
}

// ================== OBSERVER ==================
function startObserving() {
    if (observer) return;

    let lastSerialized = "";

    const sendUpdate = () => {
        const text = extractText();
        const serialized = JSON.stringify(text);

        if (serialized !== lastSerialized) {
            lastSerialized = serialized;
            chrome.runtime.sendMessage({
                type: "TEXT_UPDATE_FD",
                text
            });
        }
    };

    sendUpdate();

    observer = new MutationObserver(sendUpdate);
    observer.observe(document.body, {
        childList: true,
        subtree: true,
        characterData: true
    });
}

// ================== MESSAGE LISTENER ==================
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.type === "SET_ACTIVE_TEAMS") {
        activeTeams = request.teams || [];
    }

    if (request.type === "START_OBSERVING_FD") {
        startObserving();
    }

    if (request.type === "GET_FD_TEXT") {
        sendResponse({ text: extractText() });
    }

    return true;
});

// ================== CLEANUP ==================
window.addEventListener("beforeunload", () => {
    observer?.disconnect();
    observer = null;
});
