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
export declare const snapshotV2Files: (dataRoot: string) => Promise<Record<string, string>>;
export declare const changedV2Files: (before: Record<string, string>, after: Record<string, string>) => Record<string, string>;
export declare const writeV3RunManifest: ({ dataRoot, before, generatedAt, sourceSha, actionVersion, integrationsVersion, adapters, }: {
    dataRoot: string;
    before: Record<string, string>;
    generatedAt: string;
    sourceSha: string;
    actionVersion: string;
    integrationsVersion: string;
    adapters: AdapterOutcome[];
}) => Promise<void>;
