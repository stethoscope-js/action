// Preserve the preset's gitmoji, changelog, GitHub release, and version-commit
// policy. This action's release channel does not publish to npm: expose only
// the npm plugin's version-preparation step so auth/publish hooks cannot run.
const preset = require("@koj/config").releaseMaster;
const { prepare } = require("@semantic-release/npm");

module.exports = {
  ...preset,
  plugins: preset.plugins.map((plugin) => {
    if (plugin === "@semantic-release/github") {
      // Issues are disabled here; never hide the release error with a 410.
      return [plugin, { failComment: false, successComment: false }];
    }
    return Array.isArray(plugin) && plugin[0] === "@semantic-release/npm"
      ? [{ prepare }, { npmPublish: false }]
      : plugin;
  }),
};
