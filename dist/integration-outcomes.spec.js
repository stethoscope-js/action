"use strict";
test("reports a configured daily adapter as succeeded after update and summary", async () => {
    const calls = [];
    const { runDailyIntegrations } = require("./integration-outcomes");
    const outcomes = await runDailyIntegrations({
        integrations: [
            {
                name: "spotify",
                update: async () => calls.push("update"),
                summary: async () => calls.push("summary"),
            },
        ],
        configuredIntegrations: { spotify: { frequency: "daily" } },
        log: () => { },
        error: () => { },
    });
    expect(calls).toEqual(["update", "summary"]);
    expect(outcomes).toEqual([{ name: "spotify", status: "succeeded" }]);
});
test("reports a configured non-daily adapter as skipped while retaining its summary", async () => {
    const calls = [];
    const { runDailyIntegrations } = require("./integration-outcomes");
    const outcomes = await runDailyIntegrations({
        integrations: [
            {
                name: "spotify",
                update: async () => calls.push("update"),
                summary: async () => calls.push("summary"),
            },
        ],
        configuredIntegrations: { spotify: { frequency: "weekly" } },
        log: () => { },
        error: () => { },
    });
    expect(calls).toEqual(["summary"]);
    expect(outcomes).toEqual([{ name: "spotify", status: "skipped" }]);
});
test("records an adapter failure without retaining its error details", async () => {
    const errors = [];
    const { runDailyIntegrations } = require("./integration-outcomes");
    const outcomes = await runDailyIntegrations({
        integrations: [
            {
                name: "oura",
                update: async () => Promise.reject(new Error("internal failure detail")),
                summary: async () => { },
            },
        ],
        configuredIntegrations: { oura: { frequency: "daily" } },
        log: () => { },
        error: (...values) => errors.push(values),
    });
    expect(outcomes).toEqual([{ name: "oura", status: "failed" }]);
    expect(JSON.stringify(outcomes)).not.toContain("internal failure detail");
    expect(errors).toHaveLength(1);
});
test("constructs adapters lazily so a later constructor cannot block an earlier adapter", async () => {
    const calls = [];
    const { runDailyIntegrations } = require("./integration-outcomes");
    await expect(runDailyIntegrations({
        integrations: [
            () => ({
                name: "spotify",
                update: async () => calls.push("update"),
                summary: async () => calls.push("summary"),
            }),
            () => {
                throw new Error("later adapter constructor failed");
            },
        ],
        configuredIntegrations: { spotify: { frequency: "daily" } },
        log: () => { },
        error: () => { },
    })).rejects.toThrow("later adapter constructor failed");
    expect(calls).toEqual(["update", "summary"]);
});
//# sourceMappingURL=integration-outcomes.spec.js.map