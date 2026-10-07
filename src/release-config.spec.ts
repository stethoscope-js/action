import { readFileSync } from "fs";
import { resolve } from "path";

describe("manual GitHub-only release boundary", () => {
  it("keeps the preset release policy while using npm only to prepare package versions", () => {
    const preset = require("@koj/config").releaseMaster;
    const config = require("../release.config");
    const npmPlugin = require("@semantic-release/npm");
    const presetWithoutReleaseEndpoints = preset.plugins.filter(
      (plugin: string | [string, object]) =>
        !["@semantic-release/npm", "@semantic-release/github"].includes(
          Array.isArray(plugin) ? plugin[0] : plugin
        )
    );

    expect(config.branches).toEqual(preset.branches);
    expect(config.plugins.filter((plugin: unknown) =>
      typeof plugin === "string"
        ? plugin !== "@semantic-release/github"
        : Array.isArray(plugin) && typeof plugin[0] === "string" && plugin[0] !== "@semantic-release/github"
    )).toEqual(presetWithoutReleaseEndpoints);
    const prepareOnly = config.plugins.find(
      (plugin: unknown) => Array.isArray(plugin) && typeof plugin[0] === "object"
    );
    expect(prepareOnly).toBeDefined();
    expect(prepareOnly[0]).toEqual({ prepare: npmPlugin.prepare });
    expect(prepareOnly[1]).toEqual({ npmPublish: false });
    const githubPlugin = config.plugins.find(
      (plugin: unknown) => Array.isArray(plugin) && plugin[0] === "@semantic-release/github"
    );
    expect(githubPlugin).toEqual(["@semantic-release/github", { failComment: false, successComment: false }]);
  });

  it("does not pass an npm token to the manual GitHub release job", () => {
    const workflow = readFileSync(resolve(__dirname, "../.github/workflows/release.yml"), "utf8");
    expect(workflow).not.toMatch(/NPM_TOKEN|NODE_AUTH_TOKEN/);
    expect(workflow).toMatch(/workflow_dispatch:/);
    expect(workflow).toMatch(/permissions:\s*\n\s*contents: write/);
    expect(workflow).not.toMatch(/pull_request:|\bpush:/);
  });
});
