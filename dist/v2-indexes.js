"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateV2Indexes = exports.createV2DailySummary = exports.createV2ApiIndex = void 0;
const dot_object_1 = __importDefault(require("dot-object"));
const fs_extra_1 = require("fs-extra");
const path_1 = require("path");
const recursive_readdir_1 = __importDefault(require("recursive-readdir"));
const zero = (num) => (parseInt(num) > 9 ? num : `0${num}`);
const sortObject = (items) => Object.keys(items)
    .sort()
    .reduce((result, key) => ((result[key] = items[key]), result), {});
const createV2ApiIndex = (summaryFiles) => {
    const dot = new dot_object_1.default("/");
    const data = {};
    [...summaryFiles]
        .sort((a, b) => a.localeCompare(b, "en", { numeric: true, sensitivity: "base" }))
        .forEach((file) => {
        const path = file.split("/").map((value) => `_check_${value}`);
        const prefix = path.join("/") === "" ? "root" : path.join("/");
        data[prefix] = true;
    });
    return recursivelyArrange(recursivelyClean2(recursivelyClean1(JSON.parse(JSON.stringify(dot.object(data)).replace(/_check_/g, "")))));
};
exports.createV2ApiIndex = createV2ApiIndex;
const createV2DailySummary = (monthlySummaries) => {
    const summary = {};
    Object.entries(monthlySummaries).forEach(([year, months]) => {
        Object.entries(months).forEach(([month, days]) => {
            Object.entries(days).forEach(([day, value]) => {
                summary[`${zero(year)}-${month.replace(".json", "")}-${zero(day)}`] = value;
            });
        });
    });
    return sortObject(summary);
};
exports.createV2DailySummary = createV2DailySummary;
const generateV2Indexes = async (dataRoot) => {
    const categories = await (0, fs_extra_1.readdir)(dataRoot);
    for await (const category of categories) {
        const summaryRoot = (0, path_1.join)(dataRoot, category, "summary");
        if ((await (0, fs_extra_1.pathExists)(summaryRoot)) && (await (0, fs_extra_1.lstat)(summaryRoot)).isDirectory()) {
            const files = (await (0, recursive_readdir_1.default)(summaryRoot)).map((path) => path.split(`${summaryRoot}/`)[1]);
            await (0, fs_extra_1.ensureFile)((0, path_1.join)(dataRoot, category, "api.json"));
            await (0, fs_extra_1.writeFile)((0, path_1.join)(dataRoot, category, "api.json"), JSON.stringify((0, exports.createV2ApiIndex)(files), null, 2));
        }
    }
    for (const category of categories) {
        const daysRoot = (0, path_1.join)(dataRoot, category, "summary", "days");
        if (!(await (0, fs_extra_1.pathExists)(daysRoot)) || !(await (0, fs_extra_1.lstat)(daysRoot)).isDirectory())
            continue;
        const monthlySummaries = {};
        for (const year of await (0, fs_extra_1.readdir)(daysRoot)) {
            const yearRoot = (0, path_1.join)(daysRoot, year);
            if (!(await (0, fs_extra_1.pathExists)(yearRoot)) || !(await (0, fs_extra_1.lstat)(yearRoot)).isDirectory())
                continue;
            monthlySummaries[year] = {};
            for (const month of await (0, fs_extra_1.readdir)(yearRoot))
                monthlySummaries[year][month] = (await (0, fs_extra_1.readJson)((0, path_1.join)(yearRoot, month)));
        }
        const summary = (0, exports.createV2DailySummary)(monthlySummaries);
        if (Object.keys(summary).length)
            await (0, fs_extra_1.writeFile)((0, path_1.join)(dataRoot, category, "summary", "days.json"), JSON.stringify(summary, null, 2) + "\n");
    }
};
exports.generateV2Indexes = generateV2Indexes;
function recursivelyClean1(items) {
    if (typeof items === "object" && !Array.isArray(items)) {
        Object.keys(items).forEach((key) => {
            if (items[key] === true) {
                items[key.replace(".json", "")] = key;
                delete items[key];
            }
            else {
                items[key] = recursivelyClean1(items[key]);
            }
        });
    }
    return items;
}
function recursivelyClean2(items) {
    if (typeof items === "object") {
        Object.keys(items).forEach((key) => {
            if (typeof items[key] === "object") {
                let allStrings = true;
                Object.values(items[key]).forEach((value) => {
                    if (typeof value !== "string")
                        allStrings = false;
                });
                if (!allStrings) {
                    items[key] = recursivelyClean2(items[key]);
                }
                else {
                    items[key] = Object.values(items[key]);
                }
            }
        });
    }
    return items;
}
function recursivelyArrange(items) {
    if (Array.isArray(items)) {
        items = items.sort((a, b) => a.localeCompare(b, "en", {
            numeric: true,
            sensitivity: "base",
        }));
    }
    else if (typeof items === "object") {
        Object.keys(items).forEach((key) => {
            items[key] = recursivelyArrange(items[key]);
        });
    }
    return items;
}
//# sourceMappingURL=v2-indexes.js.map