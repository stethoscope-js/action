"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.writeV3RunManifest = exports.changedV2Files = exports.snapshotV2Files = void 0;
const crypto_1 = require("crypto");
const fs_extra_1 = require("fs-extra");
const path_1 = require("path");
const recursive_readdir_1 = __importDefault(require("recursive-readdir"));
const relativePath = (dataRoot, path) => (0, path_1.relative)(dataRoot, path).split(path_1.sep).join("/");
const sha256 = (contents) => (0, crypto_1.createHash)("sha256").update(contents).digest("hex");
const snapshotV2Files = async (dataRoot) => {
    const snapshot = {};
    if (!(await (0, fs_extra_1.pathExists)(dataRoot)))
        return snapshot;
    const paths = await (0, recursive_readdir_1.default)(dataRoot);
    for (const path of paths) {
        const file = relativePath(dataRoot, path);
        if (file === ".stethoscope" || file.startsWith(".stethoscope/"))
            continue;
        snapshot[file] = sha256(await (0, fs_extra_1.readFile)(path));
    }
    return snapshot;
};
exports.snapshotV2Files = snapshotV2Files;
const changedV2Files = (before, after) => Object.keys(after)
    .sort()
    .reduce((changed, file) => {
    if (before[file] !== after[file])
        changed[file] = after[file];
    return changed;
}, {});
exports.changedV2Files = changedV2Files;
const writeV3RunManifest = async ({ dataRoot, before, generatedAt, sourceSha, actionVersion, integrationsVersion, adapters, }) => {
    const after = await (0, exports.snapshotV2Files)(dataRoot);
    const manifest = {
        format: 3,
        generatedAt,
        generator: { actionVersion, integrationsVersion, sourceSha },
        adapters,
        v2Files: (0, exports.changedV2Files)(before, after),
    };
    const manifestRoot = (0, path_1.join)(dataRoot, ".stethoscope");
    await (0, fs_extra_1.ensureDir)(manifestRoot);
    await (0, fs_extra_1.writeFile)((0, path_1.join)(manifestRoot, "manifest.v3.json"), JSON.stringify(manifest, null, 2) + "\n");
};
exports.writeV3RunManifest = writeV3RunManifest;
//# sourceMappingURL=run-manifest.js.map