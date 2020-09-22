import { getInput, setFailed } from "@actions/core";
import { cosmicSync, config } from "@anandchowdhary/cosmic";
import {
  spotifyDaily,
  rescueTimeDaily,
  lastFmDaily,
  pocketCastsDaily,
  wakatimeDaily,
  clockifyDaily,
  googleFitDaily,
  ouraRingDaily,
  goodreadsDaily,
} from "@stethoscope-js/integrations";
import simpleGit from "simple-git";
const git = simpleGit();

cosmicSync("stethoscope");
const token = getInput("token") || process.env.GH_PAT || process.env.GITHUB_TOKEN;

const items = Object.keys(config("integrations") || {});

export const run = async () => {
  if (!token) throw new Error("GitHub token not found");
  if (!items) return console.log("Config not found", items);

  if (items.includes("spotify")) await spotifyDaily();
  if (items.includes("rescueTime")) await rescueTimeDaily();
  if (items.includes("pocketCasts")) await lastFmDaily();
  if (items.includes("wakatime")) await pocketCastsDaily();
  if (items.includes("lastFm")) await wakatimeDaily();
  if (items.includes("clockify")) await clockifyDaily();
  if (items.includes("googleFit")) await googleFitDaily();
  if (items.includes("ouraRing")) await ouraRingDaily();
  if (items.includes("goodreads")) await goodreadsDaily();

  await git.addConfig("user.name", "Stethoscoper");
  await git.addConfig("user.email", "stethoscope-js@anandchowdhary.com");
  await git.add(".");
  await git.commit(":card_file_box: Update daily life data [skip ci]");
  await git.push();
};

run()
  .then(() => {})
  .catch((error) => {
    console.error("ERROR", error);
    setFailed(error.message);
  });
