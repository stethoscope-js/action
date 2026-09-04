import Dot from "dot-object";
import { ensureFile, lstat, pathExists, readdir, readJson, writeFile } from "fs-extra";
import { join } from "path";
import recursiveReaddir from "recursive-readdir";

type DailyMonthData = Record<string, Record<string, Record<string, unknown>>>;

const zero = (num: string) => (parseInt(num) > 9 ? num : `0${num}`);
const sortObject = <T>(items: Record<string, T>) =>
  Object.keys(items)
    .sort()
    .reduce((result, key) => ((result[key] = items[key]), result), {} as Record<string, T>);

export const createV2ApiIndex = (summaryFiles: string[]) => {
  const dot = new Dot("/");
  const data: Record<string, boolean> = {};
  [...summaryFiles]
    .sort((a, b) => a.localeCompare(b, "en", { numeric: true, sensitivity: "base" }))
    .forEach((file) => {
      const path = file.split("/").map((value) => `_check_${value}`);
      const prefix = path.join("/") === "" ? "root" : path.join("/");
      data[prefix] = true;
    });

  return recursivelyArrange(recursivelyClean2(recursivelyClean1(JSON.parse(JSON.stringify(dot.object(data)).replace(/_check_/g, "")))));
};

export const createV2DailySummary = (monthlySummaries: DailyMonthData) => {
  const summary: Record<string, unknown> = {};
  Object.entries(monthlySummaries).forEach(([year, months]) => {
    Object.entries(months).forEach(([month, days]) => {
      Object.entries(days).forEach(([day, value]) => {
        summary[`${zero(year)}-${month.replace(".json", "")}-${zero(day)}`] = value;
      });
    });
  });
  return sortObject(summary);
};

export const generateV2Indexes = async (dataRoot: string) => {
  const categories = await readdir(dataRoot);

  for await (const category of categories) {
    const summaryRoot = join(dataRoot, category, "summary");
    if ((await pathExists(summaryRoot)) && (await lstat(summaryRoot)).isDirectory()) {
      const files = (await recursiveReaddir(summaryRoot)).map((path) => path.split(`${summaryRoot}/`)[1]);
      await ensureFile(join(dataRoot, category, "api.json"));
      await writeFile(join(dataRoot, category, "api.json"), JSON.stringify(createV2ApiIndex(files), null, 2));
    }
  }

  for (const category of categories) {
    const daysRoot = join(dataRoot, category, "summary", "days");
    if (!(await pathExists(daysRoot)) || !(await lstat(daysRoot)).isDirectory()) continue;

    const monthlySummaries: DailyMonthData = {};
    for (const year of await readdir(daysRoot)) {
      const yearRoot = join(daysRoot, year);
      if (!(await pathExists(yearRoot)) || !(await lstat(yearRoot)).isDirectory()) continue;

      monthlySummaries[year] = {};
      for (const month of await readdir(yearRoot))
        monthlySummaries[year][month] = (await readJson(join(yearRoot, month))) as Record<string, unknown>;
    }

    const summary = createV2DailySummary(monthlySummaries);
    if (Object.keys(summary).length)
      await writeFile(join(dataRoot, category, "summary", "days.json"), JSON.stringify(summary, null, 2) + "\n");
  }
};

function recursivelyClean1(items: any) {
  if (typeof items === "object" && !Array.isArray(items)) {
    Object.keys(items).forEach((key) => {
      if (items[key] === true) {
        items[key.replace(".json", "")] = key;
        delete items[key];
      } else {
        items[key] = recursivelyClean1(items[key]);
      }
    });
  }
  return items;
}

function recursivelyClean2(items: any) {
  if (typeof items === "object") {
    Object.keys(items).forEach((key) => {
      if (typeof items[key] === "object") {
        let allStrings = true;
        Object.values(items[key]).forEach((value) => {
          if (typeof value !== "string") allStrings = false;
        });
        if (!allStrings) {
          items[key] = recursivelyClean2(items[key]);
        } else {
          items[key] = Object.values(items[key]);
        }
      }
    });
  }
  return items;
}

function recursivelyArrange(items: any) {
  if (Array.isArray(items)) {
    items = items.sort((a, b) =>
      a.localeCompare(b, "en", {
        numeric: true,
        sensitivity: "base",
      })
    );
  } else if (typeof items === "object") {
    Object.keys(items).forEach((key) => {
      items[key] = recursivelyArrange(items[key]);
    });
  }
  return items;
}
