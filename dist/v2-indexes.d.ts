type DailyMonthData = Record<string, Record<string, Record<string, unknown>>>;
export declare const createV2ApiIndex: (summaryFiles: string[]) => any;
export declare const createV2DailySummary: (monthlySummaries: DailyMonthData) => Record<string, unknown>;
export declare const generateV2Indexes: (dataRoot: string) => Promise<void>;
export {};
