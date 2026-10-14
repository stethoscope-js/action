import { readFileSync } from "fs";
import { resolve } from "path";

describe("manual GitHub-only release boundary", () => {
  it("keeps the gitmoji release policy with npm version preparation but no publish or auth hooks", () => {
    const config = require("../release.config");

    expect(config.branches).toEqual(["master"]);

    // The npm plugin runs only version preparation; with npmPublish: false,
    // @semantic-release/npm >= 13 skips npm authentication entirely.
    const npmPluginEntry = config.plugins.find(
      (plugin: unknown) =>
        Array.isArray(plugin) && plugin[0] === "@semantic-release/npm"
    );
    expect(npmPluginEntry).toBeDefined();
    expect(npmPluginEntry[0]).toBe("@semantic-release/npm");
    expect(npmPluginEntry[1]).toEqual({ npmPublish: false });

    // The gitmoji analyzer must stay first and keep the release rules.
    const gitmoji = config.plugins[0];
    expect(Array.isArray(gitmoji)).toBe(true);
    expect(gitmoji[0]).toBe("semantic-release-gitmoji");
    expect(gitmoji[1].releaseRules.patch.include).toContain(":bug:");
    expect(gitmoji[1].releaseRules.minor.include).toContain(":sparkles:");
    expect(gitmoji[1].releaseRules.major.include).toContain(":boom:");

    // Changelog and git plugins keep their existing behavior.
    expect(config.plugins).toContainEqual([
      "@semantic-release/changelog",
      { changelogFile: "CHANGELOG.md" },
    ]);
    expect(config.plugins).toContainEqual([
      "@semantic-release/git",
      {
        assets: ["CHANGELOG.md", "package.json", "package-lock.json"],
        message: ":bookmark: Release v${nextRelease.version} [skip ci]",
      },
    ]);

    // Issues are disabled here; never hide the release error with a 410.
    const githubPlugin = config.plugins.find(
      (plugin: unknown) =>
        Array.isArray(plugin) && plugin[0] === "@semantic-release/github"
    );
    expect(githubPlugin).toEqual([
      "@semantic-release/github",
      { failComment: false, successComment: false },
    ]);
  });

  it("does not pass an npm token to the manual GitHub release job", () => {
    const workflow = readFileSync(
      resolve(__dirname, "../.github/workflows/release.yml"),
      "utf8"
    );
    expect(workflow).not.toMatch(/NPM_TOKEN|NODE_AUTH_TOKEN/);
    expect(workflow).toMatch(/workflow_dispatch:/);
    expect(workflow).toMatch(/permissions:\s*\n\s*contents: write/);
    expect(workflow).not.toMatch(/pull_request:|\bpush:/);
  });
});
