// ================== DOM REFERENCES ==================
const tabs = document.querySelectorAll(".tab");
const views = document.querySelectorAll(".view");

const output1 = document.getElementById("output1");
const odds1   = document.getElementById("odds1");
const ev1     = document.getElementById("ev1");
const team1   = document.getElementById("team1");
const fair1   = document.getElementById("fair1");
const stake1 = document.getElementById("stake1");

const output2 = document.getElementById("output2");
const odds2   = document.getElementById("odds2");
const ev2     = document.getElementById("ev2");
const team2   = document.getElementById("team2");
const fair2   = document.getElementById("fair2");
const stake2 = document.getElementById("stake2");

const pollcard = document.getElementById("poll-card");

const pregame = document.getElementById("pregame");
const bankrollInput = document.getElementById("bankroll");
const switchWrapper = document.querySelector(".switch-wrapper");
const manualSwitch = document.getElementById("manual-switch");
const leftLabel = document.querySelector(".switch-label.left");
const rightLabel = document.querySelector(".switch-label.right");

// ================== STATE ==================
let realTextState = ["", ""];
let fdTextState   = ["", ""];
let realTeamNames = ["", ""];
let lastValidTeams = ["", ""];
let realPollState = [];
let manualMode = false;
let realReady = false;
let fdReady = false;
let pollsReady = false;

// ================== STORAGE ==================
chrome.storage.local.get("lastView", ({ lastView }) => {
    switchView(lastView || "predictions", false);
});

chrome.storage.local.get(["bankroll"], (res) => {
    if (res.bankroll) bankrollInput.value = res.bankroll;
});

chrome.storage.local.get(["manualMode"], (res) => {
    manualMode = !!res.manualMode;
    manualSwitch.checked = manualMode;
    updateSwitchLabels();
    toggleManualInputs(manualMode);
    updatePopup();
});

tabs.forEach(tab => {
    tab.addEventListener("click", () => {
        switchView(tab.dataset.view);
    });
});

bankrollInput.addEventListener("input", () => {
    const val = parseFloat(bankrollInput.value);
    if (!isNaN(val)) {
        chrome.storage.local.set({ bankroll: val });
    }
});

manualSwitch.addEventListener("change", () => {
    manualMode = manualSwitch.checked;

    // Save switch mode
    chrome.storage.local.set({ manualMode: manualMode });
    updateSwitchLabels();
    toggleManualInputs(manualMode);
    updatePolls();
});

const TEAM_MAP = {
    "ALA": {
        "Alabama": "Alabama"
    },
    "ARI": {
        "Cardinals": "Arizona Cardinals"
    },
    "ATL": {
        "Falcons": "Atlanta Falcons",
        "Hawks": "Atlanta Hawks"
    },
    "BAL": {
        "Ravens": "Baltimore Ravens"
    },
    "BKN": {
        "Nets": "Brooklyn Nets"
    },
    "BOS": {
        "Celtics": "Boston Celtics"
    },
    "BUF": {
        "Bills": "Buffalo Bills"
    },
    "CAR": {
        "Panthers": "Carolina Panthers"
    },
    "CHA": {
        "Hornets": "Charlotte Hornets"
    },
    "CHI": {
        "Bears": "Chicago Bears",
        "Bulls": "Chicago Bulls"
    },
    "CIN": {
        "Bengals": "Cincinnati Bengals"
    },
    "CLE": {
        "Browns": "Cleveland Browns",
        "Cavaliers": "Cleveland Cavaliers"
    },
    "DAL": {
        "Cowboys": "Dallas Cowboys",
        "Mavs": "Dallas Mavericks"
    },
    "DEN": {
        "Broncos": "Denver Broncos",
        "Nuggets": "Denver Nuggets"
    },
    "DET": {
        "Lions": "Detroit Lions",
        "Pistons": "Detroit Pistons"
    },
    "GB": {
        "Packers": "Green Bay Packers"
    },
    "GSW": {
        "Warriors": "Golden State Warriors"
    },
    "HOU": {
        "Rockets": "Houston Rockets",
        "Texans": "Houston Texans"
    },
    "IND": {
        "Colts": "Indianapolis Colts",
        "Indiana": "Indiana",
        "Pacers": "Indiana Pacers"
    },
    "JAX": {
        "Jaguars": "Jacksonville Jaguars"
    },
    "KC": {
        "Chiefs": "Kansas City Chiefs"
    },
    "LAC": {
        "Chargers": "Los Angeles Chargers",
        "Clippers": "Los Angeles Clippers"
    },
    "LAL": {
        "Lakers": "Los Angeles Lakers"
    },
    "LAR": {
        "Rams": "Los Angeles Rams"
    },
    "LV": {
        "Raiders": "Las Vegas Raiders"
    },
    "MEM": {
        "Grizzlies": "Memphis Grizzlies"
    },
    "MIA": {
        "Dolphins": "Miami Dolphins",
        "Heat": "Miami Heat",
        "Miami": "Miami Florida"
    },
    "MIL": {
        "Bucks": "Milwaukee Bucks"
    },
    "MIN": {
        "Vikings": "Minnesota Vikings",
        "Wolves": "Minnesota Timberwolves"
    },
    "MISS": {
        "Ole Miss": "Ole Miss"
    },
    "NE": {
        "Patriots": "New England Patriots"
    },
    "NO": {
        "Saints": "New Orleans Saints"
    },
    "NOP": {
        "Pelicans": "New Orleans Pelicans"
    },
    "NYG": {
        "Giants": "New York Giants"
    },
    "NYJ": {
        "Jets": "New York Jets"
    },
    "NYK": {
        "Knicks": "New York Knicks"
    },
    "OKC": {
        "Thunder": "Oklahoma City Thunder"
    },
    "ORE": {
        "Oregon": "Oregon"
    },
    "ORL": {
        "Magic": "Orlando Magic"
    },
    "OSU": {
        "OSU": "Ohio State"
    },
    "OU": {
        "Oklahoma": "Oklahoma"
    },
    "PHI": {
        "76ers": "Philadelphia 76ers",
        "Eagles": "Philadelphia Eagles"
    },
    "PIT": {
        "Steelers": "Pittsburgh Steelers"
    },
    "PHX": {
        "Suns": "Phoenix Suns"
    },
    "POR": {
        "Blazers": "Portland Trail Blazers"
    },
    "SAC": {
        "Kings": "Sacramento Kings"
    },
    "SAS": {
        "Spurs": "San Antonio Spurs"
    },
    "SEA": {
        "Seahawks": "Seattle Seahawks"
    },
    "SF": {
        "49ers": "San Francisco 49ers"
    },
    "TA&M": {
        "Texas A&M": "Texas A&M"
    },
    "TB": {
        "Buccaneers": "Tampa Bay Buccaneers"
    },
    "TEN": {
        "Titans": "Tennessee Titans"
    },
    "TOR": {
        "Raptors": "Toronto Raptors"
    },
    "TTU": {
        "TTU": "Texas Tech"
    },
    "UGA": {
        "Georgia": "Georgia"
    },
    "UTA": {
        "Jazz": "Utah Jazz"
    },
    "WAS": {
        "Commanders": "Washington Commanders",
        "Wizards": "Washington Wizards"
    }
};

// ================== HELPERS ==================
function switchView(targetId, save = true) {
    const current = document.querySelector(".view.active");
    const target = document.getElementById(targetId);

    if (current === target) return;

    // Animate exit
    if (current) {
        current.classList.remove("active");
        current.classList.add(
            targetId === "polls" ? "exit-left" : "exit-right"
        );

        setTimeout(() => {
            current.classList.remove("exit-left", "exit-right");
        }, 250);
    }

    // Activate target
    target.classList.add("active");

    // Update tabs
    tabs.forEach(t => t.classList.toggle("active", t.dataset.view === targetId));

    // Save state
    if (save) {
        chrome.storage.local.set({ lastView: targetId });
    }
}

function updateSwitchLabels() {
    if (manualSwitch.checked) {
        leftLabel.style.color = "var(--muted)";
        rightLabel.style.color = "var(--accent)";
    } else {
        leftLabel.style.color = "var(--accent)";
        rightLabel.style.color = "var(--muted)";
    }
}

function toggleManualInputs(isManual) {
    const cells = [
        output1, odds1, ev1, fair1, stake1,
        output2, odds2, ev2, fair2, stake2
    ];

    cells.forEach(td => {
        // Get current value (span or plain text)
        let val = td.querySelector(".value")?.innerText || td.innerText || "";

        if (isManual) {
            const input = document.createElement("input");
            input.type = "text";
            input.value = val;
            input.classList.add("manual-input");
            td.innerHTML = "";
            td.appendChild(input);
        } else {
            td.innerHTML = `<span class="value">-</span>`;
        }
    });
}

function normalizeTeamName(raw, teamName) {
    return TEAM_MAP[raw]?.[teamName] ?? null;
}

function sendTeamsToFanDuel() {
    if (realTeamNames[0] && realTeamNames[1]) {
        lastValidTeams = [...realTeamNames];
    };

    if (!lastValidTeams[0] || !lastValidTeams[1]) return;

    const raw1 = realTextState[0].split("\n")[0];
    const raw2 = realTextState[1].split("\n")[0];
    if (!raw1 || !raw2) return;

    const teamName1 = realTeamNames[0].split("\n")[0];
    const teamName2 = realTeamNames[1].split("\n")[0];

    const teamA = normalizeTeamName(raw1, teamName1);
    const teamB = normalizeTeamName(raw2, teamName2);
    if (!teamA || !teamB) return;

    chrome.tabs.query(
        { url: "https://sportsbook.fanduel.com/*" },
        (tabs) => {
            if (!tabs?.length) return;
            chrome.tabs.sendMessage(tabs[0].id, {
                type: "SET_ACTIVE_TEAMS",
                teams: [teamA, teamB]
            });
        }
    );
}

function isValidTeamName(str) {
    if (!str) return false;
    if (/^\d+(\.\d+)?%?$/.test(str.trim())) return false;
    return true;
}

function parseRealProb(text) {
    const raw = parseFloat(text?.match(/\d+\.?\d*/)?.[0]);
    if (isNaN(raw)) return null;
    return Math.min(raw / 100, 0.999);
}

function americanToImpliedProb(odds) {
    return odds > 0
        ? 100 / (odds + 100)
        : Math.abs(odds) / (Math.abs(odds) + 100);
}

function impliedProbToAmerican(p) {
    if (p <= 0 || p >= 1) return "";
    const dec = 1 / p;
    return dec >= 2
        ? "+" + Math.round((dec - 1) * 100)
        : "" + Math.round(-100 / (dec - 1));
}

function devigMultiplicative(p1, p2) {
    const sum = p1 + p2;
    return [p1 / sum, p2 / sum];
}

function devigAdditive(p1, p2) {
    const vig = p1 + p2 - 1;
    return [p1 - vig / 2, p2 - vig / 2];
}

function devigPower(p1, p2, iters = 1000) {
    let lo = 0, hi = 5;
    for (let i = 0; i < iters; i++) {
        const mid = (lo + hi) / 2;
        const sum = Math.pow(p1, mid) + Math.pow(p2, mid);
        sum > 1 ? (lo = mid) : (hi = mid);
    }
    const k = (lo + hi) / 2;
    return [Math.pow(p1, k), Math.pow(p2, k)];
}

function worstCaseFairProb(oddsA, oddsB, idx) {
    const pA = americanToImpliedProb(oddsA);
    const pB = americanToImpliedProb(oddsB);

    return Math.min(
        ...[
            devigMultiplicative(pA, pB),
            devigAdditive(pA, pB),
            devigPower(pA, pB)
        ].map(([a, b]) => Math.min(Math.max(idx === 0 ? a : b, 0), 0.999))
    );
}

function calculateEV(pFair, pBook) {
    return (pFair / (pBook) - 1) * 100;
}

function kellyFraction(p, odds, kellyFactor = 0.5) {
    let b = 1 / odds - 1;

    const q = 1 - p;
    const f = (b * p - q) / b;

    if (f <= 0) return 0;
    return f * kellyFactor; // half-Kelly by default
}

function calculateStake(bankroll, kellyFraction) {
    if (!bankroll || bankroll <= 0) return 0;
    return bankroll * kellyFraction;
}

function animateValue(el, className = "update") {
    const span = el.querySelector("span");
    if (!span) return;
    span.classList.add(className);
    setTimeout(() => {
        span.classList.remove(className);
    }, 300);
}

function animateStake(stakeEl) {
    const span = stakeEl.querySelector(".stake-animate");
    if (!span) return;

    // Trigger animation
    span.classList.add("update");

    // Remove class after animation duration
    setTimeout(() => {
        span.classList.remove("update");
    }, 300); // duration matches CSS transition
}

// ================== RENDER ==================
function updatePopup() {
    if (manualSwitch.checked || !realTextState[0]) {
        updatePolls();
        return;
    }

    const t1 = realTextState[0]?.split("\n")[0]?.trim();
    const t2 = realTextState[1]?.split("\n")[0]?.trim();

    team1.innerText = isValidTeamName(t1) ? t1 : "-";
    team2.innerText = isValidTeamName(t2) ? t2 : "-";

    const realProb1 = parseRealProb(realTextState[0]);
    const realProb2 = parseRealProb(realTextState[1]);

    output1.innerText = realProb1 ? `${(realProb1 * 100).toFixed(0)}%` : "";
    output2.innerText = realProb2 ? `${(realProb2 * 100).toFixed(0)}%` : "";

    const fdOdds1 = parseInt(fdTextState[0]?.replace(/[^\d-+]/g, "")) || 0;
    const fdOdds2 = parseInt(fdTextState[1]?.replace(/[^\d-+]/g, "")) || 0;

    odds1.innerText = fdTextState[0] || "Locked";
    odds2.innerText = fdTextState[1] || "Locked";

    if (!fdOdds1 || !fdOdds2 || !realProb1 || !realProb2) {
        ev1.innerText = "-";
        ev2.innerText = "-";
        fair1.innerText = "-";
        fair2.innerText = "-";
        stake1.innerText = "-";
        stake2.innerText = "-";
        pregame.innerText = "";
        updatePolls();
        return;
    }

    const pFair1 = worstCaseFairProb(fdOdds1, fdOdds2, 0);
    const pFair2 = worstCaseFairProb(fdOdds1, fdOdds2, 1);

    const evVal1 = calculateEV(pFair1, realProb1+0.01);
    const evVal2 = calculateEV(pFair2, realProb2+0.01);

    ev1.innerHTML = `<span class="ev-animate ${evVal1 >= 0 ? "ev-positive" : "ev-negative"}">${evVal1.toFixed(1)}%</span>`;
    ev2.innerHTML = `<span class="ev-animate ${evVal2 >= 0 ? "ev-positive" : "ev-negative"}">${evVal2.toFixed(1)}%</span>`;

    fair1.innerHTML = `${impliedProbToAmerican(pFair1)}\n(${(pFair1 * 100).toFixed(1)}%)`;
    fair2.innerHTML = `${impliedProbToAmerican(pFair2)}\n(${(pFair2 * 100).toFixed(1)}%)`;

    pregame.innerText = `pregame ev: ${team1.innerText} @ ${Math.floor(pFair1 * 100)-1}% or lower, ${team2.innerText} @ ${Math.floor(pFair2 * 100)-1}% or lower`;

    const kellyVal1 = kellyFraction(pFair1, realProb1+0.01);
    const kellyVal2 = kellyFraction(pFair2, realProb2+0.01);

    const bankroll = parseFloat(bankrollInput.value) || 0;

    const stakeVal1 = calculateStake(bankroll, kellyVal1);
    const stakeVal2 = calculateStake(bankroll, kellyVal2);

    stake1.innerHTML = `<span class="stake-animate">${stakeVal1 > 0 ? `$${stakeVal1.toFixed(2)}` : "-"}</span>`;
    stake2.innerHTML = `<span class="stake-animate">${stakeVal2 > 0 ? `$${stakeVal2.toFixed(2)}` : "-"}</span>`;

    animateValue(ev1);
    animateValue(ev2);
    animateStake(stake1);
    animateStake(stake2);

    updatePolls();
}

function updatePolls() {
    let polls = "";
    let totalFilled = 0;

    realPollState.forEach(poll => {
        const [name, options, chosen, bets, status] = poll;

        let isFilled = false;
        const optionsHTML = options.map((opt, i) => {
            const isChosen = chosen[i];
            const bet = bets[i];
            if (isChosen) isFilled = true;

            return `
                <span class="option ${isChosen ? "chosen" : ""}">
                    <span class="option-text">${opt}</span>
                    ${isChosen && bet !== -1 ? `<span class="bet">${bet}</span>` : ""}
                </span>
            `;
        }).join("");

        polls += `
            <div class="poll">
                <strong>${name}</strong>

                <div class="poll-options">
                    ${optionsHTML}
                </div>

                <div class="poll-status">${status}</div>
            </div>
        `;

        if (isFilled) totalFilled += 1;
    });

    pollcard.innerHTML = polls
    ? `
        <div class="poll-summary">
            <span class="summary-label">Total Polls Filled</span>
            <span class="summary-count">
                ${totalFilled}<span class="summary-total">/${realPollState.length}</span>
            </span>
        </div>
        ${polls}
      `
    : "No current polls open";
}

// ================== LIVE UPDATES ==================
chrome.runtime.onMessage.addListener((message) => {
    if (message.type === "TEXT_UPDATE_REAL") {
        realTextState = message.text;
        realTeamNames = message.teamName;
        updatePopup();
        sendTeamsToFanDuel();
    }

    if (message.type ==="POLL_UPDATE") {
        realPollState = message.text;
        updatePopup();
    }

    if (message.type === "TEXT_UPDATE_FD") {
        fdTextState = message.text;
        updatePopup();
    }
});

// ================== INITIAL LOAD ==================
(async () => {
    const rTabs = await chrome.tabs.query({ url: "https://realsports.io/*" });
    if (rTabs.length) {
        chrome.runtime.sendMessage(
            { type: "READ_REAL_TAB", tabId: rTabs[0].id },
            (res) => {
                if (res?.text) {
                    realTextState = res.text;
                    realTeamNames = res.teamName;
                    realReady = true;
                    maybeRender();
                    sendTeamsToFanDuel();
                }
            }
        );

        chrome.runtime.sendMessage(
            { type: "READ_REAL_POLLS", tabId: rTabs[0].id },
            (res) => {
                if (res?.text) {
                    realPollState = res.text;
                    pollsReady = true;
                    maybeRender();
                }
            }
        );

        chrome.tabs.sendMessage(rTabs[0].id, { type: "START_OBSERVING" });
    }

    const fdTabs = await chrome.tabs.query({ url: "https://sportsbook.fanduel.com/*" });
    if (fdTabs.length) {
        chrome.runtime.sendMessage(
            { type: "READ_FD_TAB", tabId: fdTabs[0].id },
            (res) => {
                if (res?.text) {
                    fdTextState = res.text;
                    fdReady = true;
                    maybeRender();
                }
            }
        );
        chrome.tabs.sendMessage(fdTabs[0].id, {
            type: "START_OBSERVING_FD"
        });
    }
})();

function maybeRender() {
    if (!realReady || !fdReady || !pollsReady) return;
    updatePopup();
}

switchWrapper.classList.add("no-transition");

window.addEventListener("load", () => {
    setTimeout(() => {
        switchWrapper.classList.remove("no-transition");
    }, 100);  
});
