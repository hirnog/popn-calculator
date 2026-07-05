import { calculate } from "./calc.js";
function main() {
    registerEvents();
}
function registerEvents() {
    document
        .getElementById("calculate")
        .addEventListener("click", onCalculate);
    document
        .getElementById("bpm").addEventListener("keydown", e => {
            if (e.key === "Enter") {
                green.focus();
            }
        });
}
function onCalculate() {
    const config = {
        bpm: Number(
            document.getElementById("bpm").value
        ),
        green: Number(
            document.getElementById("green").value
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
