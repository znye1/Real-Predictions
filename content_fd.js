let observer = null;
let activeTeams = [];
let ufc = false;

// ================== FIND MONEYLINE ==================
function findMoneyline(team, type="Moneyline") {
    return [...document.querySelectorAll(`div[aria-label*="${type}"]`)]
        .filter(div => {
            const label = div.getAttribute("aria-label") || "";
            if (ufc) {
                return label.split(" to win")[0] === team;
            }
            return label.split(", ")[1] === team;
        });
}

// ================== FIND TOTAL ==================
function findTotal(type, total) {
    const spans = document.querySelectorAll("span");

    let ans = "";
    spans.forEach(span => {
        const label = span.textContent || "";
        if (!Number.isNaN(Number(label)) && Number.isFinite(Number(label))) {
            if (Number(label) == total) {
                const totalDiv = span.parentElement?.parentElement?.parentElement?.parentElement.children[1];
                [...totalDiv.children].forEach(div => {
                    const odd = div.getAttribute("aria-label") || "";
                    if (odd.includes(total) && odd.includes(type)) {
                        ans = div.firstChild.textContent || "";
                    }
                });
            }
        }
    });

    if (!ans) {
        const divs = [...document.querySelectorAll(`div[aria-label*="${type}"]`)]
            .filter(div => {
                const label = div.getAttribute("aria-label") || "";
                return label.includes(total);
            });

        const fdDiv = divs[0];
        const fdText = 
            fdDiv?.children[1]?.textContent?.trim() || "";

        return fdText;
    }

    return ans;
}

// ================== FIND SPREAD ==================
function findSpread(team, spread) {
    let positive = false;
    if (spread.startsWith("+")) {
        spread = spread.slice(1);
        positive = true;
    }

    return [...document.querySelectorAll(`div[aria-label*="${spread}"]`)]
        .filter(div => {
            const label = div.getAttribute("aria-label") || "";
            if (label.includes(team) && !label.includes("Total")) {
                console.log(label);
            }
            if (positive) return label.includes(team) && !label.includes("Total") && (label.split(", ")[2] ? !label.split(", ")[2].startsWith("-") : true);
            return label.includes(team) && !label.includes("Total");
        });
}

// ================== EXTRACT TEXT ==================
function extractText() {
    if (!activeTeams.length) return ["", ""];

    const result = [];

    for (let i = 0; i < activeTeams.length; i++) {
        const team = activeTeams[i];

        if (Array.isArray(team)) {
            if (i === 2 || i === 3) {
                result.push(findTotal(team[0], team[1]));
            } else if (i === 4 || i === 5) {
                const divs = findSpread(team[0], team[1]);
                const fdDiv = divs[0];
                const fdText =
                    fdDiv?.children[1]?.textContent?.trim() || "";
                
                result.push(fdText);
            }
        } else {
            let divs;
            if (ufc) {
                divs = findMoneyline(team, "to win");
            } else {
                divs = findMoneyline(team);
            }

            const fdDiv = divs[0];
            const fdText =
                fdDiv?.querySelector("span")?.textContent?.trim() || "";

            result.push(fdText);
        }
    }

    if (result.length > 4) {
        return [result[0] || "", result[1] || "", result[2] || "", result[3] || "", result[4] || "", result[5] || ""];
    }
    if (result.length > 2) {
        return [result[0] || "", result[1] || "", result[2] || "", result[3] || ""];
    }
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
        ufc = request.ufc || false;
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
