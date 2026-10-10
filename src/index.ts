import { setFailed } from "@actions/core";
import { config, cosmicSync } from "@anandchowdhary/cosmic";
import { Clockify, Goodreads, GoogleFit, LastFm, OuraRing, PocketCasts, Rescuetime, Spotify, Twitter, Wakatime } from "@stethoscope-js/integrations";
import { reportFatalActionError } from "./fatal-error";
import { runDailyIntegrations } from "./integration-outcomes";
import { snapshotV2Files, writeV3RunManifest } from "./run-manifest";
import { generateV2Indexes } from "./v2-indexes";
let actionVersion = "unknown";
let integrationsVersion = "unknown";
try {
  cosmicSync("stethoscope");
  actionVersion = require("../package.json").version as string;
  integrationsVersion = require("@stethoscope-js/integrations/package.json").version as string;
} catch (cause) {
  reportFatalActionError(cause, console.error, setFailed);
}

export const run = async () => {
  const configuredIntegrations = config("integrations") || {};
  const items = Object.keys(configuredIntegrations);
  if (!items) return console.log("Config not found", items);
  console.log("Enabled integrations", items);

  const dataRoot = "data";
  const before = await snapshotV2Files(dataRoot);
  const adapters = await runDailyIntegrations({
    integrations: [
      () => new Spotify(),
      () => new Rescuetime(),
      () => new LastFm(),
      () => new PocketCasts(),
      () => new Wakatime(),
      () => new Clockify(),
      () => new GoogleFit(),
      () => new OuraRing(),
      () => new Goodreads(),
      () => new Twitter(),
    ],
    configuredIntegrations,
    legacy: process.env.LEGACY,
    log: console.log,
    error: console.error,
  });

  console.log("Generating API endpoints and daily summaries");
  await generateV2Indexes(dataRoot);
  console.log("Finished generating API endpoints");
  await writeV3RunManifest({
    dataRoot,
    before,
    generatedAt: new Date().toISOString(),
    sourceSha: process.env.GITHUB_SHA || "unknown",
    actionVersion,
    integrationsVersion,
    adapters,
  });
};

run()
  .then(() => {})
  .catch((error) => {
    reportFatalActionError(error, console.error, setFailed);
  });
