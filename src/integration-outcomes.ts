import { AdapterOutcome } from "./run-manifest";

type Integration = {
  name: string;
  update: () => Promise<void>;
  summary: () => Promise<void>;
  legacy?: (value: string) => Promise<void>;
};

type IntegrationFactory = () => Integration;
type IntegrationConfig = Record<string, { frequency?: string }>;
type Log = (...values: any[]) => void;

export const runDailyIntegrations = async ({
  integrations,
  configuredIntegrations,
  legacy,
  log,
  error,
}: {
  integrations: Array<Integration | IntegrationFactory>;
  configuredIntegrations: IntegrationConfig;
  legacy?: string;
  log: Log;
  error: Log;
}) => {
  const items = Object.keys(configuredIntegrations);
  const outcomes: AdapterOutcome[] = [];

  for await (const candidate of integrations) {
    const integration = typeof candidate === "function" ? candidate() : candidate;
    const included = items.includes(integration.name);
    const shouldUpdate = included && configuredIntegrations[integration.name].frequency === "daily";

    try {
      if (shouldUpdate) {
        log("Updating", integration.name);
        if (typeof legacy === "string" && typeof integration.legacy === "function") await integration.legacy(legacy);
        else await integration.update();
      } else {
        log("Skipping", integration.name);
        log("  >  Included in integrations?", included);
        log("  >  Frequency?", (configuredIntegrations[integration.name] || {}).frequency);
      }

      if (included) {
        log("Generating summary", integration.name);
        await integration.summary();
      }
      outcomes.push({ name: integration.name, status: shouldUpdate ? "succeeded" : "skipped" });
    } catch (cause) {
      error(`An error occurred with in updating ${integration.name} data`);
      log(cause);
      outcomes.push({ name: integration.name, status: "failed" });
    }
  }

  return outcomes;
};
