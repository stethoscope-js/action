"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fatal_error_1 = require("./fatal-error");
test.each([
    Object.assign(new Error("synthetic private marker"), {
        config: { headers: { Authorization: "synthetic private marker" } },
        response: { data: "synthetic private marker" },
    }),
    "synthetic private marker",
])("does not disclose an uncaught action failure or its thrown object", (cause) => {
    const logs = [];
    const failures = [];
    (0, fatal_error_1.reportFatalActionError)(cause, (...args) => logs.push(args), (...args) => failures.push(args));
    expect(logs).toEqual([["Stethoscope action failed"]]);
    expect(failures).toEqual([["Stethoscope action failed"]]);
    expect(JSON.stringify([...logs, ...failures])).not.toContain("synthetic private marker");
    expect([...logs, ...failures].flat()).not.toContain(cause);
});
//# sourceMappingURL=fatal-error.spec.js.map