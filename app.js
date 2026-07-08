import { calculate, getDefaultRoof } from "./calc.js";

// 想定している DOM が無ければ早めに異常を検知します。
function getRequiredElement(id) {
    const element = document.getElementById(id);
    if (!element) {
        throw new Error(`Required element not found: ${id}`);
    }
    return element;
}

function getElements() {
    return {
        form: getRequiredElement("calculator-form"),
        modeInputs: Array.from(document.querySelectorAll('input[name="mode"]')),
        greenNumber: getRequiredElement("green-number"),
        baseBpm: getRequiredElement("base-bpm"),
        lowBpm: getRequiredElement("low-bpm"),
        roof: getRequiredElement("roof"),
        resetButton: getRequiredElement("reset-button"),
        summary: getRequiredElement("summary"),
        baseHispeedCard: getRequiredElement("base-hispeed-card"),
        baseHispeedValue: getRequiredElement("base-hispeed-value"),
        averageSuddenDiffValue: getRequiredElement("average-sudden-diff-value"),
        errorMessage: getRequiredElement("error-message"),
        resultWrap: getRequiredElement("result-wrap"),
        resultBody: getRequiredElement("result-body")
    };
}

let latestTargetHispeed = null;

function getSelectedMode(elements) {
    return elements.modeInputs.find((input) => input.checked)?.value ?? "NORMAL";
}

// モード変更時は ROOF をそのモードの既定値に合わせます。
function syncRoofWithMode(elements) {
    elements.roof.value = String(getDefaultRoof(getSelectedMode(elements)));
}

// 再描画前に表示状態とスクロール位置を初期化します。
function clearResults(elements) {
    elements.summary.hidden = true;
    elements.resultWrap.hidden = true;
    elements.resultWrap.scrollTop = 0;
    elements.resultBody.replaceChildren();
    latestTargetHispeed = null;
}

function showError(elements, message) {
    elements.errorMessage.textContent = message;
    elements.errorMessage.hidden = false;
}

function hideError(elements) {
    elements.errorMessage.hidden = true;
    elements.errorMessage.textContent = "";
}

function getNumericValue(input) {
    return input.value === "" ? Number.NaN : Number(input.value);
}

// フォームの現在値を計算用の形に集約します。
function getInputValues(elements) {
    return {
        mode: getSelectedMode(elements),
        greenNumber: getNumericValue(elements.greenNumber),
        baseBpm: getNumericValue(elements.baseBpm),
        lowBpm: getNumericValue(elements.lowBpm),
        roof: getNumericValue(elements.roof)
    };
}

function renderRows(elements, rows) {
    const fragment = document.createDocumentFragment();

    for (const row of rows) {
        const tr = document.createElement("tr");
        tr.dataset.hispeed = row.hispeed;
        tr.classList.toggle("unavailable-row", !row.isAvailable);
        for (const value of [row.hispeed, row.bpm, row.sudden]) {
            const td = document.createElement("td");
            td.textContent = value;
            tr.appendChild(td);
        }
        fragment.appendChild(tr);
    }

    elements.resultBody.replaceChildren(fragment);
}

// 基準ハイスピードの行が見つけやすい位置に来るようスクロールします。
function highlightTargetRow(elements, targetHispeed) {
    const rows = Array.from(elements.resultBody.querySelectorAll("tr"));
    rows.forEach((row) => {
        row.classList.toggle("target-row", row.dataset.hispeed === targetHispeed);
    });

    const targetRow = rows.find((row) => row.dataset.hispeed === targetHispeed);
    if (!targetRow) {
        return;
    }

    const wrapRect = elements.resultWrap.getBoundingClientRect();
    const rowRect = targetRow.getBoundingClientRect();
    const offset = targetRow.offsetTop - ((wrapRect.height / 2) - (rowRect.height / 2));
    elements.resultWrap.scrollTop = Math.max(0, offset);
}

function renderResult(elements, result) {
    elements.baseHispeedValue.textContent = result.baseHispeed;
    elements.averageSuddenDiffValue.textContent = result.averageSuddenDiff;
    renderRows(elements, result.rows);
    elements.summary.hidden = false;
    elements.resultWrap.hidden = false;
    latestTargetHispeed = result.targetHispeed;
    highlightTargetRow(elements, result.targetHispeed);
}

function focusFirstInput(elements) {
    elements.greenNumber.focus();
}

function resetForm(elements) {
    elements.form.reset();
    elements.modeInputs[0].checked = true;
    syncRoofWithMode(elements);
    hideError(elements);
    clearResults(elements);
    focusFirstInput(elements);
}

// モード変更、計算実行、初期化のイベントを結び付けます。
function registerEvents(elements) {
    elements.modeInputs.forEach((input) => {
        input.addEventListener("change", () => {
            syncRoofWithMode(elements);
        });
    });

    elements.form.addEventListener("submit", (event) => {
        event.preventDefault();
        hideError(elements);
        clearResults(elements);

        try {
            const result = calculate(getInputValues(elements));
            renderResult(elements, result);
        } catch (error) {
            showError(elements, error instanceof Error ? error.message : "計算に失敗しました。");
        }
    });

    elements.resetButton.addEventListener("click", () => {
        resetForm(elements);
    });

    elements.baseHispeedCard.addEventListener("click", () => {
        if (!latestTargetHispeed) {
            return;
        }
        highlightTargetRow(elements, latestTargetHispeed);
    });
}

function main() {
    const elements = getElements();
    syncRoofWithMode(elements);
    registerEvents(elements);
}

main();
