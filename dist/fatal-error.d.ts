/** Never forward an uncaught error to the log or workflow command: either may contain credentials. */
export declare function reportFatalActionError(_cause: unknown, log: (message: string) => void, fail: (message: string) => void): void;
