import { createHash } from "crypto";
import { ensureDir, pathExists, readFile, writeFile } from "fs-extra";
import { join, relative, sep } from "path";
import recursiveReaddir from "recursive-readdir";

export type AdapterOutcome = {
  name: string;
  status: "succeeded" | "skipped" | "failed";
};

export type V3RunManifest = {
  format: 3;
  generatedAt: string;
  generator: {
    actionVersion: string;
    integrationsVersion: string;
    sourceSha: string;
  };
  adapters: AdapterOutcome[];
  v2Files: Record<string, string>;
};

const relativePath = (dataRoot: string, path: string) => relative(dataRoot, path).split(sep).join("/");
const sha256 = (contents: Buffer) => createHash("sha256").update(contents).digest("hex");

export const snapshotV2Files = async (dataRoot: string) => {
  const snapshot: Record<string, string> = {};
  if (!(await pathExists(dataRoot))) return snapshot;
  const paths = await recursiveReaddir(dataRoot);

  for (const path of paths) {
    const file = relativePath(dataRoot, path);
    if (file === ".stethoscope" || file.startsWith(".stethoscope/")) continue;
    snapshot[file] = sha256(await readFile(path));
  }

  return snapshot;
};

export const changedV2Files = (before: Record<string, string>, after: Record<string, string>) =>
  Object.keys(after)
    .sort()
    .reduce((changed, file) => {
      if (before[file] !== after[file]) changed[file] = after[file];
      return changed;
    }, {} as Record<string, string>);

export const writeV3RunManifest = async ({
  dataRoot,
  before,
  generatedAt,
  sourceSha,
  actionVersion,
  integrationsVersion,
  adapters,
}: {
  dataRoot: string;
  before: Record<string, string>;
  generatedAt: string;
  sourceSha: string;
  actionVersion: string;
  integrationsVersion: string;
  adapters: AdapterOutcome[];
}) => {
  const after = await snapshotV2Files(dataRoot);
  const manifest: V3RunManifest = {
    format: 3,
    generatedAt,
    generator: { actionVersion, integrationsVersion, sourceSha },
    adapters,
    v2Files: changedV2Files(before, after),
  };
  const manifestRoot = join(dataRoot, ".stethoscope");
  await ensureDir(manifestRoot);
  await writeFile(join(manifestRoot, "manifest.v3.json"), JSON.stringify(manifest, null, 2) + "\n");
};
