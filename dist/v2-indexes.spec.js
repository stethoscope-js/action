"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs_extra_1 = require("fs-extra");
const os_1 = require("os");
const path_1 = require("path");
const v2_indexes_1 = require("./v2-indexes");
const fixtureRoot = (0, path_1.join)(__dirname, "fixtures", "v2-indexes");
test("creates deterministic v2 structures without filesystem configuration", async () => {
    const expectedApi = JSON.parse(await (0, fs_extra_1.readFile)((0, path_1.join)(fixtureRoot, "expected", "activity", "api.json"), "utf8"));
    const expectedDays = JSON.parse(await (0, fs_extra_1.readFile)((0, path_1.join)(fixtureRoot, "expected", "activity", "summary", "days.json"), "utf8"));
    const summaryFiles = ["stats.json", "weekly/01.json", "days/2026/09.json"];
    expect((0, v2_indexes_1.createV2ApiIndex)(summaryFiles)).toEqual(expectedApi);
    expect(summaryFiles).toEqual(["stats.json", "weekly/01.json", "days/2026/09.json"]);
    expect((0, v2_indexes_1.createV2DailySummary)({ "2026": { "09.json": { "1": { minutes: 12 }, "3": { minutes: 34 } } } })).toEqual(expectedDays);
});
test("preserves the v2 index and daily-summary bytes for a fixture tree", async () => {
    const dataRoot = await (0, fs_extra_1.mkdtemp)((0, path_1.join)((0, os_1.tmpdir)(), "stethoscope-v2-indexes-"));
    try {
        await (0, fs_extra_1.copy)((0, path_1.join)(fixtureRoot, "input"), dataRoot);
        await (0, v2_indexes_1.generateV2Indexes)(dataRoot);
        await expect((0, fs_extra_1.readFile)((0, path_1.join)(dataRoot, "activity", "api.json"), "utf8")).resolves.toBe(await (0, fs_extra_1.readFile)((0, path_1.join)(fixtureRoot, "expected", "activity", "api.json"), "utf8"));
        await expect((0, fs_extra_1.readFile)((0, path_1.join)(dataRoot, "activity", "summary", "days.json"), "utf8")).resolves.toBe(await (0, fs_extra_1.readFile)((0, path_1.join)(fixtureRoot, "expected", "activity", "summary", "days.json"), "utf8"));
    }
    finally {
        await (0, fs_extra_1.remove)(dataRoot);
    }
});
//# sourceMappingURL=v2-indexes.spec.js.map