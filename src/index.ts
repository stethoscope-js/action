import { setFailed } from "@actions/core";
import { config, cosmicSync } from "@anandchowdhary/cosmic";
import {
  Clockify,
  Goodreads,
  GoogleFit,
  LastFm,
  OuraRing,
  PocketCasts,
  Rescuetime,
  Spotify,
  Twitter,
  Wakatime,
} from "@stethoscope-js/integrations";
import Dot from "dot-object";
import { ensureFile, lstat, pathExists, readdir, writeFile } from "fs-extra";
import { join } from "path";
import recursiveReaddir from "recursive-readdir";

const dot = new Dot("/");
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
    if (
      items.includes(integration.name) &&
      config("integrations")[integration.name].frequency === "daily"
    ) {
      console.log("Updating", integration.name);
      await integration.update();
    } else {
      console.log("Skipping", integration.name);
      console.log("  >  Included in integrations?", items.includes(integration.name));
      console.log("  >  Frequency?", (config("integrations")[integration.name] || {}).frequency);
    }

    if (items.includes(integration.name)) {
      console.log("Generating summary", integration.name);
      await integration.summary();
    }
  }
  console.log("Generating API endpoints");
  const categories = await readdir(join(".", "data"));
  for await (const category of categories) {
    if (
      (await pathExists(join(".", "data", category, "summary"))) &&
      (await lstat(join(".", "data", category, "summary"))).isDirectory()
    ) {
      const files = (await recursiveReaddir(join(".", "data", category, "summary")))
        .map((path) => path.split(`${join(".", "data", category, "summary")}/`)[1])
        .sort((a, b) =>
          a.localeCompare(b, "en", {
            numeric: true,
            sensitivity: "base",
          })
        );
      const data: any = {};
      files.forEach((file) => {
        const path = file.split("/").map((v) => `_check_${v}`);
        const prefix = path.join("/") === "" ? "root" : path.join("/");
        data[prefix] = true;
      });
      const items = recursivelyArrange(
        recursivelyClean2(
          recursivelyClean1(JSON.parse(JSON.stringify(dot.object(data)).replace(/_check_/g, "")))
        )
      );
      await ensureFile(join(".", "data", category, "api.json"));
      await writeFile(join(".", "data", category, "api.json"), JSON.stringify(items, null, 2));
    }
  }
  console.log("Finished generating API endpoints");
};

function recursivelyClean1(items: any) {
  if (typeof items === "object" && !Array.isArray(items)) {
    Object.keys(items).forEach((key) => {
      if (items[key] === true) {
        items[key.replace(".json", "")] = key;
        delete items[key];
      } else {
        items[key] = recursivelyClean1(items[key]);
      }
    });
  }
  return items;
}

function recursivelyClean2(items: any) {
  if (typeof items === "object") {
    Object.keys(items).forEach((key) => {
      if (typeof items[key] === "object") {
        let allStrings = true;
        Object.values(items[key]).forEach((value) => {
          if (typeof value !== "string") allStrings = false;
        });
        if (!allStrings) {
          items[key] = recursivelyClean2(items[key]);
        } else {
          items[key] = Object.values(items[key]);
        }
      }
    });
  }
  return items;
}

function recursivelyArrange(items: any) {
  if (Array.isArray(items)) {
    items = items.sort((a, b) =>
      a.localeCompare(b, "en", {
        numeric: true,
        sensitivity: "base",
      })
    );
  } else if (typeof items === "object") {
    Object.keys(items).forEach((key) => {
      items[key] = recursivelyArrange(items[key]);
    });
  }
  return items;
}

run()
  .then(() => {})
  .catch((error) => {
    console.error("ERROR", error);
    setFailed(error.message);
  });
