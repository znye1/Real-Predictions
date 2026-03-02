// ================== DOM REFERENCES ==================
const tabs = document.querySelectorAll(".tab");
const modes = document.querySelectorAll(".mode");

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

const output3 = document.getElementById("output3");
const odds3   = document.getElementById("odds3");
const ev3     = document.getElementById("ev3");
const team3   = document.getElementById("team3");
const fair3   = document.getElementById("fair3");
const stake3 = document.getElementById("stake3");

const output4 = document.getElementById("output4");
const odds4   = document.getElementById("odds4");
const ev4     = document.getElementById("ev4");
const team4   = document.getElementById("team4");
const fair4   = document.getElementById("fair4");
const stake4 = document.getElementById("stake4");

const output5 = document.getElementById("output5");
const odds5   = document.getElementById("odds5");
const ev5     = document.getElementById("ev5");
const team5   = document.getElementById("team5");
const fair5   = document.getElementById("fair5");
const stake5 = document.getElementById("stake5");

const output6 = document.getElementById("output6");
const odds6   = document.getElementById("odds6");
const ev6     = document.getElementById("ev6");
const team6   = document.getElementById("team6");
const fair6   = document.getElementById("fair6");
const stake6 = document.getElementById("stake6");

const secondTable = document.getElementById("second-table");
const thirdTable = document.getElementById("third-table");

const pollcard = document.getElementById("poll-card");

const twoway_payout = document.getElementById("two-way-payout");
const twowayInputs = document.querySelectorAll(".two-way-input");
const twoway_name1 = document.getElementById("two-way-name1");
const twoway_realodds1 = document.getElementById("two-way-realodds1");
const twoway_sportsbookodds1 = document.getElementById("two-way-sportsbookodds1");
const twoway_name2 = document.getElementById("two-way-name2");
const twoway_realodds2 = document.getElementById("two-way-realodds2");
const twoway_sportsbookodds2 = document.getElementById("two-way-sportsbookodds2");
const twoway_warning = document.getElementById("two-way-warning");
const twoway_result_header = document.getElementById("two-way-result-header");
const twoway_result = document.getElementById("two-way-result");
const twoway_maxbet_header = document.getElementById("two-way-maxbet-header");
const twoway_result_name1 = document.getElementById("two-way-result-name1");
const twoway_name1_zero_ev = document.getElementById("two-way-name1-zero-ev");
const twoway_name1_max_ev = document.getElementById("two-way-name1-max-ev");
const twoway_name1_fair = document.getElementById("two-way-name1-fair");
const twoway_result_name2 = document.getElementById("two-way-result-name2");
const twoway_name2_zero_ev = document.getElementById("two-way-name2-zero-ev");
const twoway_name2_max_ev = document.getElementById("two-way-name2-max-ev");
const twoway_name2_fair = document.getElementById("two-way-name2-fair");

const pregame = document.getElementById("pregame");
const bankrollInput = document.getElementById("bankroll");
const switchWrapper = document.querySelector(".switch-wrapper");
const manualSwitch = document.getElementById("manual-switch");
const leftLabel = document.querySelector(".switch-label.left");
const rightLabel = document.querySelector(".switch-label.right");

// ================== STATE ==================
let realTextState = ["", "", "", "", "", ""];
let fdTextState   = ["", "", "", "", "", ""];
let realTeamNames = ["", ""];   
let lastValidTeams = ["", ""];
let realPollState = [];
let ufc = false
let manualMode = false;
let realReady = false;
let fdReady = false;
let pollsReady = false;

// ================== STORAGE ==================
chrome.storage.local.get("lastView", ({ lastView }) => {
    switchView(lastView || "predictions", false);
});

chrome.storage.local.get("lastMode", ({ lastMode }) => {
    switchMode(lastMode || "two-way", false);
});

chrome.storage.local.get(["bankroll"], (res) => {
    if (res.bankroll) bankrollInput.value = res.bankroll;
});

chrome.storage.local.get(["two-way"], (res) => {
    if (res["two-way"] && Array.isArray(res["two-way"])) {
        twoway_payout.value = res["two-way"][0] || "50 (10 payout)";
        twoway_name1.querySelector("input").value = res["two-way"][1] || "";
        twoway_realodds1.querySelector("input").value = res["two-way"][2] || "";
        twoway_sportsbookodds1.querySelector("input").value = res["two-way"][3] || "";
        twoway_name2.querySelector("input").value = res["two-way"][4] || "";
        twoway_realodds2.querySelector("input").value = res["two-way"][5] || "";
        twoway_sportsbookodds2.querySelector("input").value = res["two-way"][6] || "";
        updatePopup();
    }
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
        if (tab.dataset.view) {
            switchView(tab.dataset.view);
        }
    });
});

pollcard.addEventListener("click", (e) => {
    const pollEl = e.target.closest(".poll");
    if (!pollEl) return;

    const i = parseInt(pollEl.id);
    const data = realPollState[i];

    chrome.storage.local.get(["two-way"], (res) => {

        let payout = "";
        let fdOdd1 = "";
        let fdOdd2 = "";

        if (res["two-way"] && Array.isArray(res["two-way"])) {
            payout = res["two-way"][0];
            fdOdd1 = res["two-way"][3];
            fdOdd2 = res["two-way"][6];
        }

        const values = [];

        values.push(payout ? payout : "50 (10 payout)");

        const team1_split = data[1][0].split(" ");
        if (
            (team1_split.at(-1).startsWith("-") ||
             team1_split.at(-1).startsWith("+")) &&
            !team1_split.at(-1).includes(".")
        ) {
            values.push(team1_split.slice(0, -1).join(" "));
            values.push(team1_split.at(-1));
        } else {
            values.push(data[1][0]);
            values.push("");
        }

        values.push(fdOdd1 ? fdOdd1 : "");

        const team2_split = data[1][1].split(" ");
        if (
            (team2_split.at(-1).startsWith("-") ||
             team2_split.at(-1).startsWith("+")) &&
            !team2_split.at(-1).includes(".")
        ) {
            values.push(team2_split.slice(0, -1).join(" "));
            values.push(team2_split.at(-1));
        } else {
            values.push(data[1][1]);
            values.push("");
        }

        values.push(fdOdd2 ? fdOdd2 : "");

        chrome.storage.local.set({ "two-way": values }, () => {
            twoway_payout.value = values[0];
            twoway_name1.querySelector("input").value = values[1];
            twoway_realodds1.querySelector("input").value = values[2];
            twoway_sportsbookodds1.querySelector("input").value = values[3];
            twoway_name2.querySelector("input").value = values[4];
            twoway_realodds2.querySelector("input").value = values[5];
            twoway_sportsbookodds2.querySelector("input").value = values[6];

            updatePopup();
            switchView("ev-calculator");
        });

    });
});

modes.forEach(mode => {
    mode.addEventListener("click", () => {
        if (mode.dataset.mode) {
            switchMode(mode.dataset.mode);
        }
    });
});

bankrollInput.addEventListener("input", () => {
    const val = parseFloat(bankrollInput.value);
    if (!isNaN(val)) {
        chrome.storage.local.set({ bankroll: val });
    }
});

twowayInputs.forEach(input => {
    input.addEventListener("input", () => {
        const values = [];
        twowayInputs.forEach(i => {
            values.push(i.value);
        });
        chrome.storage.local.set({ "two-way": values });
        updatePopup();
    });
});

manualSwitch.addEventListener("change", () => {
    manualMode = manualSwitch.checked;

    // Save switch mode
    chrome.storage.local.set({ manualMode: manualMode });
    updateSwitchLabels();
    toggleManualInputs(manualMode);
    updatePopup();
});

import { TEAM_MAP } from "./team_map.js";

// ================== HELPERS ==================
function switchView(targetId, save = true) {
    const current = document.querySelector(".view.active");
    const target = document.getElementById(targetId);

    if (current === target) return;

    if (current) {
        current.classList.remove("active");
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

function switchMode(targetId, save = true) {
    const current = document.querySelector(".view2.active");
    const target = document.getElementById(targetId);

    if (current === target) return;

    if (current) {
        current.classList.remove("active");
    }

    // Activate target
    target.classList.add("active");

    // Update tabs
    modes.forEach(t => t.classList.toggle("active", t.dataset.mode === targetId));

    // Save state
    if (save) {
        chrome.storage.local.set({ lastMode: targetId });
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

    let teamA = teamName1;
    let teamB = teamName2;

    if (!ufc) {
        teamA = normalizeTeamName(raw1, teamName1);
        teamB = normalizeTeamName(raw2, teamName2);
    }
    
    if (!teamA || !teamB) return;

    if (realTextState[2] && realTextState[3]) {
        const raw3 = realTextState[2].split("\n")[0].split(" ");
        const raw4 = realTextState[3].split("\n")[0].split(" ");
        if (!raw3 || !raw4) return;

        const teamName3 = [raw3[0], raw3[1]];
        const teamName4 = [raw4[0], raw4[1]];

        if (realTextState[4] && realTextState[5]) {
            const raw5 = realTextState[4].split("\n")[0].split(" ");
            const raw6 = realTextState[5].split("\n")[0].split(" ");
            if (!raw5 || !raw6) return;

            const teamName5 = [teamA, raw5[1]];
            const teamName6 = [teamB, raw6[1]];

            chrome.tabs.query(
                { url: "https://sportsbook.fanduel.com/*" },
                (tabs) => {
                    if (!tabs?.length) return;
                    chrome.tabs.sendMessage(tabs[0].id, {
                        type: "SET_ACTIVE_TEAMS",
                        teams: [teamA, teamB, teamName3, teamName4, teamName5, teamName6],
                        ufc: ufc
                    });
                }
            );
        } else {
            chrome.tabs.query(
                { url: "https://sportsbook.fanduel.com/*" },
                (tabs) => {
                    if (!tabs?.length) return;
                    chrome.tabs.sendMessage(tabs[0].id, {
                        type: "SET_ACTIVE_TEAMS",
                        teams: [teamA, teamB, teamName3, teamName4],
                        ufc: ufc
                    });
                }
            );
        }
    } else {
        chrome.tabs.query(
            { url: "https://sportsbook.fanduel.com/*" },
            (tabs) => {
                if (!tabs?.length) return;
                chrome.tabs.sendMessage(tabs[0].id, {
                    type: "SET_ACTIVE_TEAMS",
                    teams: [teamA, teamB],
                    ufc: ufc
                });
            }
        );
    }
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

function americanToDecimal(odds) {
    if (odds.startsWith("+")) {
        odds = odds.substring(1);
        return 1 + (odds/100);
    } else {
        odds = parseInt(odds);
        const value = 1 - (100 / odds);
        if ((value * 10) % 1 == 0) {
            return parseInt(value);
        } else {
            return value.toFixed(3);
        }
    }
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

function calculateEV(pFair, pReal) {
    return (pFair / (pReal) - 1) * 100;
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

function correctOddsInput(str) {
    let cleaned = str.trim();
    if (str.startsWith("+") || str.startsWith("-")) {
        if (str.length === 1) return false;
        cleaned = str.substring(1);
    }

    if (!cleaned) return false;
    if (!/^\d+(\.\d+)?$/.test(cleaned)) return false;

    return Number(cleaned) >= 100;
}

function correctAmericanOdd(odd) {
    if (!(odd.startsWith("+") || odd.startsWith("-"))) odd = "+" + odd;
    return odd;
}

function calculateKarmaEV(pFair, pReal, karma) {
    const gain = Math.ceil(karma * (pReal - 1));
    const ev = (pFair * gain) - ((1 - pFair) * karma);
    return ev.toFixed(2);
}

function calculateZeroKarmaEV(pFair, pReal, payout) {
    const gain = Math.ceil(payout * (pReal*10 - 10) / 10);
    const ev = pFair * gain;
    return ev.toFixed(2);
}

// ================== RENDER ==================
function updatePopup() {
    if (manualSwitch.checked) {
        updatePolls();
        updateEVCalculator();
        return;
    }

    if (!realTextState[0]) {
        secondTable?.classList.remove("active");
        thirdTable?.classList.remove("active");
        updatePolls();
        updateEVCalculator();
        return;
    }

    const bankroll = parseFloat(bankrollInput.value) || 0;

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
    } else {
        const pFair1 = worstCaseFairProb(fdOdds1, fdOdds2, 0);
        const pFair2 = worstCaseFairProb(fdOdds1, fdOdds2, 1);

        const evVal1 = calculateEV(pFair1, realProb1+0.01);
        const evVal2 = calculateEV(pFair2, realProb2+0.01);

        ev1.innerHTML = `<span class="ev-animate ${evVal1 >= 0 ? "ev-positive" : "ev-negative"}">${evVal1.toFixed(1)}%</span>`;
        ev2.innerHTML = `<span class="ev-animate ${evVal2 >= 0 ? "ev-positive" : "ev-negative"}">${evVal2.toFixed(1)}%</span>`;

        fair1.innerHTML = `${impliedProbToAmerican(pFair1)}\n(${(pFair1 * 100).toFixed(1)}%)`;
        fair2.innerHTML = `${impliedProbToAmerican(pFair2)}\n(${(pFair2 * 100).toFixed(1)}%)`;

        pregame.innerText = `Pregame EV:\n${team1.innerText} @ ${Math.floor(pFair1 * 100)-1}% or lower, ${team2.innerText} @ ${Math.floor(pFair2 * 100)-1}% or lower`;

        const kellyVal1 = kellyFraction(pFair1, realProb1+0.01);
        const kellyVal2 = kellyFraction(pFair2, realProb2+0.01);

        const stakeVal1 = calculateStake(bankroll, kellyVal1);
        const stakeVal2 = calculateStake(bankroll, kellyVal2);

        stake1.innerHTML = `<span class="stake-animate">${stakeVal1 > 0 ? `$${stakeVal1.toFixed(2)}` : "-"}</span>`;
        stake2.innerHTML = `<span class="stake-animate">${stakeVal2 > 0 ? `$${stakeVal2.toFixed(2)}` : "-"}</span>`;

        animateValue(ev1);
        animateValue(ev2);
        animateStake(stake1);
        animateStake(stake2);
    }

    if (realTextState[2] && realTextState[3]) {
        secondTable.classList.add("active");

        const t3 = realTextState[2]?.split("\n")[0]?.trim();
        const t4 = realTextState[3]?.split("\n")[0]?.trim();

        team3.innerText = isValidTeamName(t3) ? t3 : "-";
        team4.innerText = isValidTeamName(t4) ? t4 : "-";

        const realProb3 = parseRealProb(realTextState[2]?.split("\n")[1]?.trim());
        const realProb4 = parseRealProb(realTextState[3]?.split("\n")[1]?.trim());

        output3.innerText = realProb3 ? `${(realProb3 * 100).toFixed(0)}%` : "";
        output4.innerText = realProb4 ? `${(realProb4 * 100).toFixed(0)}%` : "";

        const fdOdds3 = parseInt(fdTextState[2]?.replace(/[^\d-+]/g, "")) || 0;
        const fdOdds4 = parseInt(fdTextState[3]?.replace(/[^\d-+]/g, "")) || 0;

        odds3.innerText = fdTextState[2] || "Locked";
        odds4.innerText = fdTextState[3] || "Locked";

        if (!fdOdds3 || !fdOdds4 || !realProb3 || !realProb4) {
            ev3.innerText = "-";
            ev4.innerText = "-";
            fair3.innerText = "-";
            fair4.innerText = "-";
            stake3.innerText = "-";
            stake4.innerText = "-";
        } else {
            const pFair3 = worstCaseFairProb(fdOdds3, fdOdds4, 0);
            const pFair4 = worstCaseFairProb(fdOdds3, fdOdds4, 1);

            const evVal3 = calculateEV(pFair3, realProb3+0.01);
            const evVal4 = calculateEV(pFair4, realProb4+0.01);

            ev3.innerHTML = `<span class="ev-animate ${evVal3 >= 0 ? "ev-positive" : "ev-negative"}">${evVal3.toFixed(1)}%</span>`;
            ev4.innerHTML = `<span class="ev-animate ${evVal4 >= 0 ? "ev-positive" : "ev-negative"}">${evVal4.toFixed(1)}%</span>`;

            fair3.innerHTML = `${impliedProbToAmerican(pFair3)}\n(${(pFair3 * 100).toFixed(1)}%)`;
            fair4.innerHTML = `${impliedProbToAmerican(pFair4)}\n(${(pFair4 * 100).toFixed(1)}%)`;

            pregame.innerText += `\n${team3.innerText} @ ${Math.floor(pFair3 * 100)-1}% or lower, ${team4.innerText} @ ${Math.floor(pFair4 * 100)-1}% or lower`;

            const kellyVal3 = kellyFraction(pFair3, realProb3+0.01);
            const kellyVal4 = kellyFraction(pFair4, realProb4+0.01);

            const stakeVal3 = calculateStake(bankroll, kellyVal3);
            const stakeVal4 = calculateStake(bankroll, kellyVal4);

            stake3.innerHTML = `<span class="stake-animate">${stakeVal3 > 0 ? `$${stakeVal3.toFixed(2)}` : "-"}</span>`;
            stake4.innerHTML = `<span class="stake-animate">${stakeVal4 > 0 ? `$${stakeVal4.toFixed(2)}` : "-"}</span>`;

            animateValue(ev3);
            animateValue(ev4);
            animateStake(stake3);
            animateStake(stake4);
        }
    } else {
        secondTable.classList.remove("active");
    }

    if (realTextState[4] && realTextState[5]) {
        thirdTable.classList.add("active");

        const t5 = realTextState[4]?.split("\n")[0]?.trim();
        const t6 = realTextState[5]?.split("\n")[0]?.trim();

        team5.innerText = isValidTeamName(t5) ? t5 : "-";
        team6.innerText = isValidTeamName(t6) ? t6 : "-";

        const realProb5 = parseRealProb(realTextState[4]?.split("\n")[1]?.trim());
        const realProb6 = parseRealProb(realTextState[5]?.split("\n")[1]?.trim());

        output5.innerText = realProb5 ? `${(realProb5 * 100).toFixed(0)}%` : "";
        output6.innerText = realProb6 ? `${(realProb6 * 100).toFixed(0)}%` : "";

        const fdOdds5 = parseInt(fdTextState[4]?.replace(/[^\d-+]/g, "")) || 0;
        const fdOdds6 = parseInt(fdTextState[5]?.replace(/[^\d-+]/g, "")) || 0;

        odds5.innerText = fdTextState[4] || "Locked";
        odds6.innerText = fdTextState[5] || "Locked";

        if (!fdOdds5 || !fdOdds6 || !realProb5 || !realProb6) {
            ev5.innerText = "-";
            ev6.innerText = "-";
            fair5.innerText = "-";
            fair6.innerText = "-";
            stake5.innerText = "-";
            stake6.innerText = "-";
        } else {
            const pFair5 = worstCaseFairProb(fdOdds5, fdOdds6, 0);
            const pFair6 = worstCaseFairProb(fdOdds5, fdOdds6, 1);

            const evVal5 = calculateEV(pFair5, realProb5+0.01);
            const evVal6 = calculateEV(pFair6, realProb6+0.01);

            ev5.innerHTML = `<span class="ev-animate ${evVal5 >= 0 ? "ev-positive" : "ev-negative"}">${evVal5.toFixed(1)}%</span>`;
            ev6.innerHTML = `<span class="ev-animate ${evVal6 >= 0 ? "ev-positive" : "ev-negative"}">${evVal6.toFixed(1)}%</span>`;

            fair5.innerHTML = `${impliedProbToAmerican(pFair5)}\n(${(pFair5 * 100).toFixed(1)}%)`;
            fair6.innerHTML = `${impliedProbToAmerican(pFair6)}\n(${(pFair6 * 100).toFixed(1)}%)`;

            pregame.innerText += `\n${team5.innerText} @ ${Math.floor(pFair5 * 100)-1}% or lower, ${team6.innerText} @ ${Math.floor(pFair6 * 100)-1}% or lower`;

            const kellyVal5 = kellyFraction(pFair5, realProb5+0.01);
            const kellyVal6 = kellyFraction(pFair6, realProb6+0.01);

            const stakeVal5 = calculateStake(bankroll, kellyVal5);
            const stakeVal6 = calculateStake(bankroll, kellyVal6);

            stake5.innerHTML = `<span class="stake-animate">${stakeVal5 > 0 ? `$${stakeVal5.toFixed(2)}` : "-"}</span>`;
            stake6.innerHTML = `<span class="stake-animate">${stakeVal6 > 0 ? `$${stakeVal6.toFixed(2)}` : "-"}</span>`;

            animateValue(ev5);
            animateValue(ev6);
            animateStake(stake5);
            animateStake(stake6);
        }
    } else {
        thirdTable.classList.remove("active");
    }

    updatePolls();
    updateEVCalculator();
}

function updatePolls() {
    let polls = "";
    let totalFilled = 0;
    let i = 0;

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
            <div class="poll" id="${i}">
                <strong>${name}</strong>

                <div class="poll-options">
                    ${optionsHTML}
                </div>

                <div class="poll-status">${status}</div>
            </div>
        `;

        if (isFilled) totalFilled += 1;
        i++;
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

function updateEVCalculator() {
    twoway_result_header.classList.remove("active");
    twoway_result.classList.remove("active");

    if (!twoway_name1.querySelector("input").value || !twoway_name2.querySelector("input").value) {
        twoway_warning.innerText = "Enter a team name";
        return;
    }

    if (!twoway_sportsbookodds1.querySelector("input").value || !twoway_sportsbookodds2.querySelector("input").value) {
        twoway_warning.innerText = "Enter a sportsbook odd";
        return;
    }

    let realOdd1 = twoway_realodds1.querySelector("input").value;
    let realOdd2 = twoway_realodds2.querySelector("input").value;
    let bookOdd1 = twoway_sportsbookodds1.querySelector("input").value;
    let bookOdd2 = twoway_sportsbookodds2.querySelector("input").value;

    if (!realOdd1) {
        realOdd1 = "+100";
    }
    if (!realOdd2) {
        realOdd2 = "+100";
    }

    if (!correctOddsInput(realOdd1) || !correctOddsInput(realOdd2)) {
        twoway_warning.innerText = "Incorrect real odds format";
        return;
    }

    if (!correctOddsInput(bookOdd1) || !correctOddsInput(bookOdd2)) {
        twoway_warning.innerText = "Incorrect sportsbook odds format";
        return;
    }

    twoway_warning.innerText = "";
    twoway_result_header.classList.add("active");
    twoway_result.classList.add("active");

    realOdd1 = correctAmericanOdd(realOdd1);
    realOdd2 = correctAmericanOdd(realOdd2);
    bookOdd1 = correctAmericanOdd(bookOdd1);
    bookOdd2 = correctAmericanOdd(bookOdd2);

    const pReal1 = americanToDecimal(realOdd1);
    const pReal2 = americanToDecimal(realOdd2);

    const pFair1 = worstCaseFairProb(parseInt(bookOdd1), parseInt(bookOdd2), 0);
    const pFair2 = worstCaseFairProb(parseInt(bookOdd1), parseInt(bookOdd2), 1);

    const bet = twoway_payout.value;
    let maxKarma = 0, payout = 0;
    if (bet === "50 (5 payout)") {
        maxKarma = 50;
        payout = 5;
    } else if (bet === "50 (10 payout)") {
        maxKarma = 50;
        payout = 10;
    } else if (bet === "100 (5 payout)") {
        maxKarma = 100;
        payout = 5;
    } else if (bet === "100 (10 payout)") {
        maxKarma = 100;
        payout = 10;
    } else if (bet === "200") {
        maxKarma = 200;
        payout = 10;
    } else if (bet === "300") {
        maxKarma = 300;
        payout = 10;
    }

    const zeroKarmaEv1 = calculateZeroKarmaEV(pFair1, pReal1, payout);
    const ev1 = calculateKarmaEV(pFair1, pReal1, maxKarma);
    const zeroKarmaEv2 = calculateZeroKarmaEV(pFair2, pReal2, payout);
    const ev2 = calculateKarmaEV(pFair2, pReal2, maxKarma);

    twoway_maxbet_header.innerText = `${maxKarma} Bet EV`;

    twoway_result_name1.innerText = twoway_name1.querySelector("input").value;
    twoway_name1_zero_ev.innerText = zeroKarmaEv1;
    twoway_name1_max_ev.innerText = ev1;
    twoway_name1_fair.innerText = impliedProbToAmerican(pFair1);
    twoway_result_name2.innerText = twoway_name2.querySelector("input").value;
    twoway_name2_zero_ev.innerText = zeroKarmaEv2;
    twoway_name2_max_ev.innerText = ev2;
    twoway_name2_fair.innerText = impliedProbToAmerican(pFair2);

    const maxEv = Math.max(ev1, ev2, zeroKarmaEv1, zeroKarmaEv2);

    if (zeroKarmaEv1 == maxEv) {
        twoway_name1_zero_ev.classList.add("best-ev");
    } else {
        twoway_name1_zero_ev.classList.remove("best-ev");
    }
    if (ev1 == maxEv) {
        twoway_name1_max_ev.classList.add("best-ev");
    } else {
        twoway_name1_max_ev.classList.remove("best-ev");
    }
    if (zeroKarmaEv2 == maxEv) {
        twoway_name2_zero_ev.classList.add("best-ev");
    } else{
        twoway_name2_zero_ev.classList.remove("best-ev");
    }
    if (ev2 == maxEv) {
        twoway_name2_max_ev.classList.add("best-ev");
    } else {
        twoway_name2_max_ev.classList.remove("best-ev");
    }
}

// ================== LIVE UPDATES ==================
chrome.runtime.onMessage.addListener((message) => {
    if (message.type === "TEXT_UPDATE_REAL") {
        if (message.text?.[0]) {
            realTextState = message.text;
            realTeamNames = message.teamName;
            ufc = message.ufc;
            updatePopup();
            sendTeamsToFanDuel();
        }
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
                    ufc = res.ufc;
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
    updatePolls();
    updateEVCalculator();
    if (!realReady || !fdReady || !pollsReady) return;
    updatePopup();
}

switchWrapper.classList.add("no-transition");

window.addEventListener("load", () => {
    setTimeout(() => {
        switchWrapper.classList.remove("no-transition");
    }, 100);  
});
