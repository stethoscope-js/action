"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const crypto_1 = require("crypto");
const fs_extra_1 = require("fs-extra");
const os_1 = require("os");
const path_1 = require("path");
const sha256 = (contents) => (0, crypto_1.createHash)("sha256").update(contents).digest("hex");
test("writes an additive redacted manifest for v2 files changed during a run", async () => {
    const dataRoot = await (0, fs_extra_1.mkdtemp)((0, path_1.join)((0, os_1.tmpdir)(), "stethoscope-run-manifest-"));
    try {
        await (0, fs_extra_1.ensureDir)((0, path_1.join)(dataRoot, "activity"));
        await (0, fs_extra_1.writeFile)((0, path_1.join)(dataRoot, "activity", "unchanged.json"), '{"stable":true}\n');
        const { snapshotV2Files, writeV3RunManifest } = require("./run-manifest");
        const before = await snapshotV2Files(dataRoot);
        const changedContents = '{"private":"not-for-manifest"}\n';
        await (0, fs_extra_1.writeFile)((0, path_1.join)(dataRoot, "activity", "today.json"), changedContents);
        await writeV3RunManifest({
            dataRoot,
            before,
            generatedAt: "2026-09-04T18:30:09.979Z",
            sourceSha: "abc123",
            actionVersion: "1.2.11",
            integrationsVersion: "2.4.1",
            adapters: [
                { name: "spotify", status: "succeeded" },
                { name: "oura", status: "failed" },
            ],
        });
        const manifest = await (0, fs_extra_1.readFile)((0, path_1.join)(dataRoot, ".stethoscope", "manifest.v3.json"), "utf8");
        expect(JSON.parse(manifest)).toEqual({
            format: 3,
            generatedAt: "2026-09-04T18:30:09.979Z",
            generator: {
                actionVersion: "1.2.11",
                integrationsVersion: "2.4.1",
                sourceSha: "abc123",
            },
            adapters: [
                { name: "spotify", status: "succeeded" },
                { name: "oura", status: "failed" },
            ],
            v2Files: {
                "activity/today.json": sha256(changedContents),
            },
        });
        expect(manifest).not.toContain("not-for-manifest");
    }
    finally {
        await (0, fs_extra_1.remove)(dataRoot);
    }
});
test("treats a missing data root as an empty v2 snapshot", async () => {
    const { snapshotV2Files } = require("./run-manifest");
    await expect(snapshotV2Files((0, path_1.join)((0, os_1.tmpdir)(), "stethoscope-missing-data-root"))).resolves.toEqual({});
});
//# sourceMappingURL=run-manifest.spec.js.map