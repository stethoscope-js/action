import { reportFatalActionError } from "./fatal-error";

test.each([
  Object.assign(new Error("synthetic private marker"), {
    config: { headers: { Authorization: "synthetic private marker" } },
    response: { data: "synthetic private marker" },
  }),
  "synthetic private marker",
])("does not disclose an uncaught action failure or its thrown object", (cause) => {
  const logs: unknown[][] = [];
  const failures: unknown[][] = [];

  reportFatalActionError(cause, (...args: unknown[]) => logs.push(args), (...args: unknown[]) => failures.push(args));

  expect(logs).toEqual([["Stethoscope action failed"]]);
  expect(failures).toEqual([["Stethoscope action failed"]]);
  expect(JSON.stringify([...logs, ...failures])).not.toContain("synthetic private marker");
  expect([...logs, ...failures].flat()).not.toContain(cause);
});
