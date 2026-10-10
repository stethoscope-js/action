"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = require("fs");
const path_1 = require("path");
const entrySource = (0, fs_1.readFileSync)((0, path_1.join)(__dirname, "index.ts"), "utf8");
describe("synchronous module initialization", () => {
    it("runs every top-level statement inside the redacted fatal-error boundary", () => {
        // Every top-level side effect must be inside try { ... } so a synchronous
        // throw cannot escape the module before run().catch exists. The redacted
        // reportFatalActionError must be reachable from that same boundary.
        expect(entrySource).toMatch(/try\s*\{[\s\S]*cosmicSync\("stethoscope"\)[\s\S]*\}\s*catch/);
        expect(entrySource).toMatch(/try\s*\{[\s\S]*require\("\.\.\/package\.json"\)[\s\S]*\}\s*catch/);
        expect(entrySource).toMatch(/try\s*\{[\s\S]*require\("@stethoscope-js\/integrations\/package\.json"\)[\s\S]*\}\s*catch/);
    });
    it("routes synchronous initialization failures through the redacted reporter", () => {
        const logs = [];
        const failures = [];
        const { reportFatalActionError } = require("./fatal-error");
        const cause = Object.assign(new Error("private init detail"), {
            config: { path: "/runner/_work/secret-path" },
        });
        reportFatalActionError(cause, (...args) => logs.push(args), (...args) => failures.push(args));
        expect(logs).toEqual([["Stethoscope action failed"]]);
        expect(failures).toEqual([["Stethoscope action failed"]]);
        expect(JSON.stringify([...logs, ...failures])).not.toContain("private init detail");
        expect(JSON.stringify([...logs, ...failures])).not.toContain("secret-path");
    });
    it("never rethrows or writes a raw stack for a failed initialization", () => {
        // The catch boundary must consume the error: no rethrow, no console.error
        // of the thrown object, no process.exit code other than the reporter's.
        expect(entrySource).not.toMatch(/catch\s*\([^)]*\)\s*\{\s*throw\b/);
        expect(entrySource).not.toMatch(/catch\s*\([^)]*\)\s*\{\s*console\.error\(\s*\w+\s*\)/);
    });
});
//# sourceMappingURL=module-init.spec.js.map