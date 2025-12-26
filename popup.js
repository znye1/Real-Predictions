// ================== DOM REFERENCES ==================
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

const pregame = document.getElementById("pregame");
const league_select = document.getElementById("league");
const bankrollInput = document.getElementById("bankroll");

// ================== STATE ==================
let realTextState = ["", ""];
let fdTextState   = ["", ""];
let realTeamNames = ["", ""];
let lastValidTeams = ["", ""];

// ================== STORAGE ==================
chrome.storage.local.get(["selectedLeague"], (result) => {
    if (result.selectedLeague) {
        league_select.value = result.selectedLeague;
        sendSelectionToContent(result.selectedLeague);
    }
});

chrome.storage.local.get(["bankroll"], (res) => {
    if (res.bankroll) bankrollInput.value = res.bankroll;
});

league_select.addEventListener("change", () => {
    const val = league_select.value;
    chrome.storage.local.set({ selectedLeague: val });
    sendSelectionToContent(val);
});

bankrollInput.addEventListener("input", () => {
    const val = parseFloat(bankrollInput.value);
    if (!isNaN(val)) {
        chrome.storage.local.set({ bankroll: val });
    }
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
    "ORL": {
        "Magic": "Orlando Magic"
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
    "UTA": {
        "Jazz": "Utah Jazz"
    },
    "WAS": {
        "Commanders": "Washington Commanders",
        "Wizards": "Washington Wizards"
    }
};

function sendSelectionToContent(value) {
    chrome.tabs.query({ url: "https://realsports.io/*" }, (tabs) => {
        if (tabs?.length) {
            chrome.tabs.sendMessage(tabs[0].id, {
                type: "OPTION_SELECTED",
                value
            });
        }
    });
}

// ================== HELPERS ==================
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

// ================== RENDER ==================
function updatePopup() {
    if (!realTextState[0] || !fdTextState[0]) return;

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

    if (!fdOdds1 || !fdOdds2 || !realProb1 || !realProb2) return;

    const pFair1 = worstCaseFairProb(fdOdds1, fdOdds2, 0);
    const pFair2 = worstCaseFairProb(fdOdds1, fdOdds2, 1);

    const evVal1 = calculateEV(pFair1, realProb1+0.01);
    const evVal2 = calculateEV(pFair2, realProb2+0.01);

    ev1.innerText = `${evVal1.toFixed(1)}%`;
    ev2.innerText = `${evVal2.toFixed(1)}%`;

    ev1.className = evVal1 >= 0 ? "ev-positive" : "ev-negative";
    ev2.className = evVal2 >= 0 ? "ev-positive" : "ev-negative";

    fair1.innerText = `${impliedProbToAmerican(pFair1)} (${(pFair1 * 100).toFixed(1)}%)`;
    fair2.innerText = `${impliedProbToAmerican(pFair2)} (${(pFair2 * 100).toFixed(1)}%)`;

    pregame.innerText = `pregame ev: ${team1.innerText} @ ${Math.floor(pFair1 * 100)-1}% or lower, ${team2.innerText} @ ${Math.floor(pFair2 * 100)-1}% or lower`;

    const kellyVal1 = kellyFraction(pFair1, realProb1+0.01);
    const kellyVal2 = kellyFraction(pFair2, realProb2+0.01);

    const bankroll = parseFloat(bankrollInput.value) || 0;

    const stakeVal1 = calculateStake(bankroll, kellyVal1);
    const stakeVal2 = calculateStake(bankroll, kellyVal2);

    stake1.innerText = stakeVal1 > 0 ? `$${stakeVal1.toFixed(2)}` : "-";
    stake2.innerText = stakeVal2 > 0 ? `$${stakeVal2.toFixed(2)}` : "-";
}

// ================== LIVE UPDATES ==================
chrome.runtime.onMessage.addListener((message) => {
    if (message.type === "TEXT_UPDATE_REAL") {
        realTextState = message.text;
        realTeamNames = message.teamName;
        updatePopup();
        sendTeamsToFanDuel();
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
                    updatePopup();
                    sendTeamsToFanDuel();
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
                    updatePopup();
                }
            }
        );
        chrome.tabs.sendMessage(fdTabs[0].id, {
            type: "START_OBSERVING_FD"
        });
    }
})();
