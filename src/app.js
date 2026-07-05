import { calculate } from "./calc.js";
function main() {
    registerEvents();
}
function registerEvents() {
    document.getElementById("calculate-normal")
        .addEventListener("click", onCalculate);
    document.getElementById("calculate-slim")
        .addEventListener("click", onCalculate);
    document.getElementById("bpmTgt")
    .addEventListener("keydown", e => {
        if (e.key === "Enter") {
            document.getElementById("bpmMax").focus();
        }
    });
    document.getElementById("bpmMax")
    .addEventListener("keydown", e => {
        if (e.key === "Enter") {
            document.getElementById("bpmMin").focus();
        }
    });
}
function onCalculate() {
    const config = {
        green: Number(
            document.getElementById("bpmTgt").value
        ),
        bpmMax: Number(
            document.getElementById("bpmMax").value
        ),
        bpmMin: Number(
            document.getElementById("bpmMin").value
        ),
        mode:
            document.getElementById("mode").value
    };
    const result = calculate(config);
    showResult(result);
}
function showResult(result) {
    document.getElementById("result").textContent =
        JSON.stringify(result, null, 4);
}
main();
