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

export const run = async () => {
  if (!token) throw new Error("GitHub token not found");
  if (config("daily").includes("spotify")) await spotifyDaily();
  if (config("daily").includes("rescueTime")) await rescueTimeDaily();
  if (config("daily").includes("pocketCasts")) await lastFmDaily();
  if (config("daily").includes("wakatime")) await pocketCastsDaily();
  if (config("daily").includes("lastFm")) await wakatimeDaily();
  if (config("daily").includes("clockify")) await clockifyDaily();
  if (config("daily").includes("googleFit")) await googleFitDaily();
  if (config("daily").includes("ouraRing")) await ouraRingDaily();
  if (config("daily").includes("goodreads")) await goodreadsDaily();

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
