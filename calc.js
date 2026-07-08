// モードごとの既定 ROOF 値です。
const MODE_DEFAULT_ROOF = {
    NORMAL: 60,
    SLIM: 0
};

// SUDDEN の設定可能範囲は絶対値でこの範囲とみなします。
const SUDDEN_MIN = 0;
const SUDDEN_MAX = 270;

// 画面高さの基準値はモードごとに異なります。
const MODE_SCREEN_HEIGHT = {
    NORMAL: 388,
    SLIM: 291
};

// 選択可能なハイスピードを 1.0 から 10.0 まで 0.1 刻みで列挙します。
const HISPEED_VALUES = Array.from(
    { length: 91 },
    (_, index) => (1 + (index * 0.1)).toFixed(1)
);

// 表示用の数値をゲーム内の刻みに合わせて丸めます。
function roundToStep(value, step) {
    return Math.round(value / step) * step;
}

function roundToOneDecimal(value) {
    return Number(roundToStep(value, 0.1).toFixed(1));
}

function roundToInteger(value) {
    return Math.round(value);
}

// 計算前に未入力や不正な値を弾きます。
function validateInput(input) {
    const requiredFields = [
        ["緑数字", input.greenNumber],
        ["基準BPM", input.baseBpm],
        ["低速BPM", input.lowBpm],
        ["ROOF", input.roof]
    ];

    for (const [label, value] of requiredFields) {
        if (!Number.isFinite(value)) {
            throw new Error(`${label}を入力してください。`);
        }
    }

    if (input.greenNumber <= 0 || input.baseBpm <= 0 || input.lowBpm <= 0) {
        throw new Error("緑数字、基準BPM、低速BPMは 0 より大きい値を入力してください。");
    }

    if (!(input.mode in MODE_DEFAULT_ROOF)) {
        throw new Error("モードを選択してください。");
    }
}

export function getDefaultRoof(mode) {
    return MODE_DEFAULT_ROOF[mode] ?? MODE_DEFAULT_ROOF.NORMAL;
}

// 計算結果の全行を作り、SUDDEN 範囲外の行を判定します。
export function calculate(input) {
    validateInput(input);

    const screenHeight = input.mode === "NORMAL"
        ? MODE_SCREEN_HEIGHT.NORMAL - input.roof
        : MODE_SCREEN_HEIGHT.SLIM;

    const baseHispeed = roundToOneDecimal(input.greenNumber / input.baseBpm);
    const targetHispeed = baseHispeed.toFixed(1);

    const rows = HISPEED_VALUES.map((hispeedValue) => {
        const hispeed = Number(hispeedValue);
        const bpm = input.baseBpm * hispeed;
        const suddenBpmRatio = (input.lowBpm * hispeed) / input.greenNumber;
        const sudden = 270 - (screenHeight * (1 - suddenBpmRatio));
        const suddenValue = Math.abs(roundToInteger(sudden));

        return {
            hispeed: hispeedValue,
            bpm: String(roundToInteger(bpm)),
            sudden: `-${suddenValue}`,
            suddenValue,
            isAvailable: suddenValue >= SUDDEN_MIN && suddenValue <= SUDDEN_MAX
        };
    });

    const availableRows = rows.filter((row) => row.isAvailable);
    const averageSuddenDiff = availableRows.length > 1
        ? (
            availableRows
                .slice(1)
                .reduce(
                    (sum, row, index) => sum + Math.abs(row.suddenValue - availableRows[index].suddenValue),
                    0
                ) / (availableRows.length - 1)
        ).toFixed(1)
        : "-";

    return {
        screenHeight,
        baseHispeed: targetHispeed,
        averageSuddenDiff,
        targetHispeed,
        rows
    };
}
