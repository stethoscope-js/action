import { copy, mkdtemp, readFile, remove } from "fs-extra";
import { tmpdir } from "os";
import { join } from "path";
import { createV2ApiIndex, createV2DailySummary, generateV2Indexes } from "./v2-indexes";

const fixtureRoot = join(__dirname, "fixtures", "v2-indexes");

test("creates deterministic v2 structures without filesystem configuration", async () => {
  const expectedApi = JSON.parse(await readFile(join(fixtureRoot, "expected", "activity", "api.json"), "utf8"));
  const expectedDays = JSON.parse(
    await readFile(join(fixtureRoot, "expected", "activity", "summary", "days.json"), "utf8")
  );

  const summaryFiles = ["stats.json", "weekly/01.json", "days/2026/09.json"];
  expect(createV2ApiIndex(summaryFiles)).toEqual(expectedApi);
  expect(summaryFiles).toEqual(["stats.json", "weekly/01.json", "days/2026/09.json"]);
  expect(createV2DailySummary({ "2026": { "09.json": { "1": { minutes: 12 }, "3": { minutes: 34 } } } })).toEqual(
    expectedDays
  );
});

test("preserves the v2 index and daily-summary bytes for a fixture tree", async () => {
  const dataRoot = await mkdtemp(join(tmpdir(), "stethoscope-v2-indexes-"));

  try {
    await copy(join(fixtureRoot, "input"), dataRoot);
    await generateV2Indexes(dataRoot);

    await expect(readFile(join(dataRoot, "activity", "api.json"), "utf8")).resolves.toBe(
      await readFile(join(fixtureRoot, "expected", "activity", "api.json"), "utf8")
    );
    await expect(readFile(join(dataRoot, "activity", "summary", "days.json"), "utf8")).resolves.toBe(
      await readFile(join(fixtureRoot, "expected", "activity", "summary", "days.json"), "utf8")
    );
  } finally {
    await remove(dataRoot);
  }
});
