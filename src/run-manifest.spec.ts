import { createHash } from "crypto";
import { ensureDir, mkdtemp, readFile, remove, writeFile } from "fs-extra";
import { tmpdir } from "os";
import { join } from "path";

const sha256 = (contents: string) => createHash("sha256").update(contents).digest("hex");

test("writes an additive redacted manifest for v2 files changed during a run", async () => {
  const dataRoot = await mkdtemp(join(tmpdir(), "stethoscope-run-manifest-"));

  try {
    await ensureDir(join(dataRoot, "activity"));
    await writeFile(join(dataRoot, "activity", "unchanged.json"), '{"stable":true}\n');

    const { snapshotV2Files, writeV3RunManifest } = require("./run-manifest");
    const before = await snapshotV2Files(dataRoot);
    const changedContents = '{"private":"not-for-manifest"}\n';
    await writeFile(join(dataRoot, "activity", "today.json"), changedContents);

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

    const manifest = await readFile(join(dataRoot, ".stethoscope", "manifest.v3.json"), "utf8");
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
  } finally {
    await remove(dataRoot);
  }
});

test("treats a missing data root as an empty v2 snapshot", async () => {
  const { snapshotV2Files } = require("./run-manifest");

  await expect(snapshotV2Files(join(tmpdir(), "stethoscope-missing-data-root"))).resolves.toEqual({});
});
