import {
    getUnits,
    getConversion,
    saveHistory,
    getHistory
} from "./api.js";

document.addEventListener("DOMContentLoaded", async () => {

    const state = {
        type: "Length",
        action: "Conversion"
    };

    const fromInput = document.getElementById("fromValue");
    const toInput = document.getElementById("toValue");
    const fromSelect = document.getElementById("fromUnit");
    const toSelect = document.getElementById("toUnit");
    const convertBtn = document.getElementById("convertBtn");

    /* ---------- INIT ---------- */

    setActive(document.getElementById("types"),
        document.querySelector(".type-card"),
        ".type-card"
    );

    await loadUnits(state.type);
    loadHistory();

    document.querySelectorAll(".type-card").forEach(card => {
        card.addEventListener("click", async () => {
            state.type = card.dataset.type;

            setActive(
                document.getElementById("types"),
                card,
                ".type-card"
            );

            fromInput.value = "";
            toInput.value = "";
            showResult(null, "");

            await loadUnits(state.type);
        });
    });
    convertBtn.addEventListener("click", async () => {
        const value = Number(fromInput.value);
        const from = fromSelect.value;
        const to = toSelect.value;

        const conv = await getConversion(from, to);
        const result = applyConversion(value, conv);

        toInput.value = result;
        showResult(result, to);

        await saveHistory({
            expression: `${value} ${from} → ${to}`,
            result,
            timestamp: new Date().toISOString()
        });

        loadHistory();
    });


    async function loadUnits(type) {
        const units = await getUnits(type);
        populateDropdown(fromSelect, units);
        populateDropdown(toSelect, units);
    }

    async function loadHistory() {
        const records = await getHistory();
        renderHistory(records);
    }
});

/* ---------- UC FUNCTIONS ---------- */

function applyConversion(value, convObj) {
    if (!Number.isFinite(value)) throw new Error("Invalid number");

    if (convObj.factor !== null) {
        return parseFloat((value * convObj.factor).toFixed(6));
    }

    const expr = convObj.formula.replace("x", value);
    return parseFloat(eval(expr).toFixed(6));
}

function populateDropdown(selectEl, units) {
    selectEl.innerHTML = "";

    const def = document.createElement("option");
    def.textContent = "-- Select Unit --";
    def.disabled = true;
    def.selected = true;
    selectEl.appendChild(def);

    units.forEach(u => {
        const opt = document.createElement("option");
        opt.value = u.symbol;
        opt.textContent = `${u.label} (${u.symbol})`;
        selectEl.appendChild(opt);
    });
}

function setActive(parentEl, clickedEl, selector) {
    parentEl.querySelectorAll(selector)
        .forEach(el => el.classList.remove("active"));
    clickedEl.classList.add("active");
}

function showResult(value, unit) {
    const v = document.getElementById("result-value");
    const u = document.getElementById("result-unit");

    if (value === null) {
        v.textContent = "—";
        u.textContent = "";
        return;
    }

    v.textContent = value;
    u.textContent = unit;
}

function renderHistory(records) {
    const list = document.getElementById("history-list");
    list.innerHTML = "";

    if (!records.length) {
        list.innerHTML = "<li>No history yet.</li>";
        return;
    }

    records.forEach(r => {
        const li = document.createElement("li");
        li.textContent =
            `${r.expression} = ${r.result} (${new Date(r.timestamp).toLocaleString()})`;
        list.appendChild(li);
    });
}
const actionSelector = document.getElementById("actions");

document.querySelectorAll(".action-btn").forEach(btn => {
    btn.addEventListener("click", () => {

        state.action = btn.textContent.trim();

        setActive(
            actionSelector,
            btn,
            ".action-btn"
        );

        toggleOperators(state.action === "Arithmetic");

        showResult(0, "");
    });
});