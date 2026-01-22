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

function extractPolls() {
    const rDivs = document.querySelectorAll("div.r-1jnzvcq")[document.querySelectorAll("div.r-1jnzvcq").length - 1];

    if (!rDivs) {
        return [];
    }

    const pollList = [];
    const rList = rDivs.children[0].children[0];

    for (const child of rList.childNodes) {
        const wrapper = child.firstChild;
        const pollType = wrapper?.children?.[0].children[1].innerText.trim();
        const pollData = wrapper?.children?.[1]?.firstChild;

        const pollName = pollData.children[0].firstChild.innerText.trim();
        const pollChoices = pollData.children[1].firstChild;
        const pollStatus = pollData.children[1].children[1].children[1].innerText.trim();
        if (pollStatus === "Closed") {
            continue;
        }

        const choices = [];
        const chosen = [];
        const bets = [];
        for (const choice of pollChoices.childNodes) {
            const playerPollTypes = ["Pick a player", "Anytime play", "Anytime goal scorer", "Anytime shot on goal", "Anytime TD"];
            let choiceText;
            if (playerPollTypes.includes(pollType)) {
                choiceText = choice.firstChild.firstChild.innerText.trim();

                if (choiceText === "Select a player...") {
                    chosen.push(false);
                    bets.push(-1);
                } else {
                    chosen.push(true);
                    bets.push("");
                }
            } else {
                choiceText = choice.firstChild.children[1].firstChild.innerText.trim();

                if (choice.style.backgroundColor) {
                    chosen.push(true);
                    console.log(choice);
                    if (choice.children.length < 2) {
                        bets.push(0);
                    } else {
                        const bet = choice.children[1].firstChild.children[1].innerText.trim();
                        bets.push(bet);
                    }
                } else {
                    chosen.push(false);
                    bets.push(-1);
                }
            }
            
            choices.push(choiceText);
        }

        pollList.push([pollName, choices, chosen, bets, pollStatus]);
    }

    return pollList;
}

// Start observing DOM changes for live updates
function startObserving() {
    if (observer) return; // Avoid multiple observers
    let lastSerialized = "";

    const sendUpdate = () => {
        const text = extractText();
        const teamName = extractTeamName();
        const pollList = extractPolls();
        const serialized = JSON.stringify({ text, teamName, pollList });
        if (serialized !== lastSerialized) {
            lastSerialized = serialized;
            chrome.runtime.sendMessage({ type: "POLL_UPDATE", text: pollList});
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
    } else if (request.type === "GET_REAL_POLLS") {
        const pollList = extractPolls();
        sendResponse({ text: pollList });
    }
    return true; // Keep channel open for async responses
});

window.addEventListener("beforeunload", () => {
    observer?.disconnect();
    observer = null;
});
