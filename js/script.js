import { getUnits, getConversion, saveHistory ,getHistory } from "./api.js";

document.addEventListener("DOMContentLoaded", async () => {

    const state = {
        type: "Length",
        action: "Conversion",
        fromVal: null,
        fromUnit: "",
        toVal: null,
        toUnit: "",
        operator: "+"
    };

    attachEventListeners();

    setDefaultActive();

    toggleOperators(false);

    try {
        await loadUnits("Length");
    } catch (error) {
        showError("Server unavailable. Unable to load units.");
    }

    loadHistory();

    function attachEventListeners() {
        const typeCards = document.querySelectorAll("#types .card");
        const actionButtons = document.querySelectorAll(".action-btn");

        typeCards.forEach(card => {
            card.addEventListener("click", () => {
                state.type = card.innerText.trim();
            });
        });

        actionButtons.forEach(btn => {
            btn.addEventListener("click", () => {
                state.action = btn.innerText.trim();
            });
        });
    }

    function setDefaultActive() {
        const firstCard = document.querySelector("#types .card");
        const firstAction = document.querySelector(".action-btn");

        if (firstCard) firstCard.classList.add("active");
        if (firstAction) firstAction.classList.add("active");
    }

    function toggleOperators(show) {
        const operatorRow = document.querySelector("#operators");

        if (!operatorRow) return;

        operatorRow.style.display = show ? "flex" : "none";
    }

    async function loadUnits(type) {

    const units = await getUnits(type);

    if (!units || units.length === 0) {
        showError("No units found for this type.");
        return;
    }

    const selects = document.querySelectorAll("select");

    selects.forEach(select => {
        select.innerHTML = "";

        units.forEach(unit => {
            const option = document.createElement("option");
            option.value = unit.symbol;
            option.textContent = unit.label;
            select.appendChild(option);
        });
    });

}

   async function loadHistory() {
    const history = await getHistory();

    if (history.length === 0) {
        console.log("No history yet.");
        return;
    }

    console.log(history);
}
document.getElementById("convertBtn").addEventListener("click", async () => {
    const value = Number(document.getElementById("fromValue").value);
    const from = document.getElementById("fromUnit").value;
    const to = document.getElementById("toUnit").value;

    const conv = await getConversion(from, to);

    let result;

    if (conv.factor !== null) {
        result = value * conv.factor;
    } else {
        const fn = new Function("x", `return ${conv.formula}`);
        result = fn(value);
    }

    document.getElementById("toValue").value = result;

    await saveHistory({
        from,
        to,
        input: value,
        result,
        timestamp: new Date().toISOString()
    });
    
loadHistory();

});
    function showError(message) {
        alert(message);
    }

});

export function applyConversion(value, convObj) {

    if (!Number.isFinite(value)) {
        throw new Error("Invalid number");
    }

    if (convObj.factor !== null) {
        return parseFloat((value * convObj.factor).toFixed(6));
    }

    try {
        const expr = convObj.formula.replace("x", value);
        const result = eval(expr);

        return parseFloat(result.toFixed(6));
    } catch (error) {
        throw new Error("Bad formula");
    }
}
function compareValues(v1, u1, v2, u2, base1, base2) {
    if (!Number.isFinite(v1) || !Number.isFinite(v2)) {
        return "Invalid values — cannot compare";
    }

    if (base1 > base2) {
        return `${v1} ${u1} is GREATER than ${v2} ${u2}`;
    }

    if (base1 < base2) {
        return `${v1} ${u1} is LESS than ${v2} ${u2}`;
    }

    return `${v1} ${u1} is EQUAL to ${v2} ${u2}`;
}
function performArithmetic(v1, v2normalised, op) {
    if (!Number.isFinite(v1) || !Number.isFinite(v2normalised)) {
        throw new Error("Invalid number");
    }

    switch (op) {
        case "+":
            return parseFloat((v1 + v2normalised).toFixed(6));

        case "-":
            return parseFloat((v1 - v2normalised).toFixed(6));

        case "*":
            return parseFloat((v1 * v2normalised).toFixed(6));

        case "/":
            if (v2normalised === 0) {
                throw new Error("Divide by zero");
            }
            return parseFloat((v1 / v2normalised).toFixed(6));

        default:
            throw new Error("Unknown operator");
    }
}
function populateDropdown(selectEl, units) {
    if (!selectEl) {
        console.warn("populateDropdown: select element is null");
        return;
    }

    selectEl.innerHTML = "";

    const defaultOpt = document.createElement("option");
    defaultOpt.textContent = "-- Select Unit --";
    defaultOpt.disabled = true;
    defaultOpt.selected = true;
    selectEl.appendChild(defaultOpt);

    if (!Array.isArray(units) || units.length === 0) {
        return;
    }

    units.forEach(u => {
        const opt = document.createElement("option");
        opt.value = u.symbol;
        opt.textContent = `${u.label} (${u.symbol})`;
        selectEl.appendChild(opt);
    });
}
function setActive(parentEl, clickedEl, childSelector) {
    if (!parentEl) {
        return;
    }

    parentEl
        .querySelectorAll(childSelector)
        .forEach(el => el.classList.remove("active"));

    clickedEl.classList.add("active");
}