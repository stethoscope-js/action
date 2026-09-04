import { setFailed } from "@actions/core";
import { config, cosmicSync } from "@anandchowdhary/cosmic";
import { Clockify, Goodreads, GoogleFit, LastFm, OuraRing, PocketCasts, Rescuetime, Spotify, Twitter, Wakatime } from "@stethoscope-js/integrations";
import { generateV2Indexes } from "./v2-indexes";
cosmicSync("stethoscope");

const items = Object.keys(config("integrations") || {});

export const run = async () => {
  if (!items) return console.log("Config not found", items);
  console.log("Enabled integrations", items);

  for await (const ClassName of [
    Spotify,
    Rescuetime,
    LastFm,
    PocketCasts,
    Wakatime,
    Clockify,
    GoogleFit,
    OuraRing,
    Goodreads,
    Twitter,
  ]) {
    const integration = new ClassName();
    try {
      if (
        items.includes(integration.name) &&
        config("integrations")[integration.name].frequency === "daily"
      ) {
        console.log("Updating", integration.name);
        if (typeof process.env.LEGACY === "string" && "legacy" in integration && typeof integration.legacy === "function")
          await integration.legacy(process.env.LEGACY as string);
        else await integration.update();
      } else {
        console.log("Skipping", integration.name);
        console.log("  >  Included in integrations?", items.includes(integration.name));
        console.log("  >  Frequency?", (config("integrations")[integration.name] || {}).frequency);
      }

      if (items.includes(integration.name)) {
        console.log("Generating summary", integration.name);
        await integration.summary();
      }
    } catch (error) {
      console.error(`An error occurred with in updating ${integration.name} data`);
      console.log(error);
    }
  }
  console.log("Generating API endpoints and daily summaries");
  await generateV2Indexes("data");
  console.log("Finished generating API endpoints");
};

run()
  .then(() => {})
  .catch((error) => {
    console.error("ERROR", error);
    setFailed(error.message);
  });
