export function calculate(config) {
    const roof =
        config.mode === "SLIM" ? 0 : 60;
    const hispeed = config.bpm / (config.green + roof);
    return {
        roof, hispeed
    };
}
