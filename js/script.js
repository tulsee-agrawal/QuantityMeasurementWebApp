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
