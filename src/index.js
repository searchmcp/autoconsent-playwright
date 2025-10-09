import AutoConsent from "@duckduckgo/autoconsent";
import {autoconsent} from "@duckduckgo/autoconsent/rules/rules.json";
import {consentomatic} from "@duckduckgo/autoconsent/rules/consentomatic.json";

const cfg = {
    enabled: true,
    enableCosmeticRules: true,
    logs: {
        lifecycle: false,
        rulesteps: false,
        detectionsteps: false,
        evals: false,
        errors: true,
        messages: false,
        waits: false
    },
    autoAction: "optOut",
    enablePrehide: false,
    enableGeneratedRules: true,
    enableHeuristicDetection: true,
    detectRetries: 0, // Waiting for resolution of this issue: https://github.com/duckduckgo/autoconsent/issues/1034
    isMainWorld: false,
    enableFilterList: true,
    ...(globalThis.__AUTOCONSENT_CONFIG ?? {})
};

const failSafe = setTimeout(() => {
    globalThis.acDone = true;
}, 8000);

const send = (msg) => {
    if (msg && typeof msg === "object") {
        const t = msg.type;
        if (t === "autoconsentDone" || t === "optOutResult" || t === "optInResult" || t === "autoconsentError") {
            console.debug(`Autoconsent finished running with type: ${t}`)
            globalThis.acDone = true;
            clearTimeout(failSafe);
        } else if (t === "report" && msg.state && msg.state.lifecycle === "nothingDetected") {
            console.debug(`Autoconsent did not find anything`);
            globalThis.acDone = true;
            clearTimeout(failSafe);
        }
    }
    return Promise.resolve();
};

if (!globalThis.__autoconsentLoaded) {
    globalThis.__autoconsentLoaded = true;
    try {
        new AutoConsent(send, cfg, {autoconsent, consentomatic});
    } catch (e) {
        console.error("[Autoconsent] init failed:", e);
        globalThis.acDone = true;
        clearTimeout(failSafe);
    }
}
