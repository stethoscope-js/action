const FATAL_ACTION_MESSAGE = "Stethoscope action failed";

/** Never forward an uncaught error to the log or workflow command: either may contain credentials. */
export function reportFatalActionError(
  _cause: unknown,
  log: (message: string) => void,
  fail: (message: string) => void
): void {
  log(FATAL_ACTION_MESSAGE);
  fail(FATAL_ACTION_MESSAGE);
}
