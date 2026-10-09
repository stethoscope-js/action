"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.reportFatalActionError = void 0;
const FATAL_ACTION_MESSAGE = "Stethoscope action failed";
/** Never forward an uncaught error to the log or workflow command: either may contain credentials. */
function reportFatalActionError(_cause, log, fail) {
    log(FATAL_ACTION_MESSAGE);
    fail(FATAL_ACTION_MESSAGE);
}
exports.reportFatalActionError = reportFatalActionError;
//# sourceMappingURL=fatal-error.js.map