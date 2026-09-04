import { AdapterOutcome } from "./run-manifest";
type Integration = {
    name: string;
    update: () => Promise<void>;
    summary: () => Promise<void>;
    legacy?: (value: string) => Promise<void>;
};
type IntegrationFactory = () => Integration;
type IntegrationConfig = Record<string, {
    frequency?: string;
}>;
type Log = (...values: any[]) => void;
export declare const runDailyIntegrations: ({ integrations, configuredIntegrations, legacy, log, error, }: {
    integrations: Array<Integration | IntegrationFactory>;
    configuredIntegrations: IntegrationConfig;
    legacy?: string | undefined;
    log: Log;
    error: Log;
}) => Promise<AdapterOutcome[]>;
export {};
