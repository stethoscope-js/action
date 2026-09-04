"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.runDailyIntegrations = void 0;
const runDailyIntegrations = async ({ integrations, configuredIntegrations, legacy, log, error, }) => {
    const items = Object.keys(configuredIntegrations);
    const outcomes = [];
    for await (const candidate of integrations) {
        const integration = typeof candidate === "function" ? candidate() : candidate;
        const included = items.includes(integration.name);
        const shouldUpdate = included && configuredIntegrations[integration.name].frequency === "daily";
        try {
            if (shouldUpdate) {
                log("Updating", integration.name);
                if (typeof legacy === "string" && typeof integration.legacy === "function")
                    await integration.legacy(legacy);
                else
                    await integration.update();
            }
            else {
                log("Skipping", integration.name);
                log("  >  Included in integrations?", included);
                log("  >  Frequency?", (configuredIntegrations[integration.name] || {}).frequency);
            }
            if (included) {
                log("Generating summary", integration.name);
                await integration.summary();
            }
            outcomes.push({ name: integration.name, status: shouldUpdate ? "succeeded" : "skipped" });
        }
        catch (cause) {
            error(`An error occurred with in updating ${integration.name} data`);
            log(cause);
            outcomes.push({ name: integration.name, status: "failed" });
        }
    }
    return outcomes;
};
exports.runDailyIntegrations = runDailyIntegrations;
//# sourceMappingURL=integration-outcomes.js.map