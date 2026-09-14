/** Docking-engine detection, ligand identity, and affinity chart model. */

export const ENGINE_HINTS: Array<{ id: string; pattern: RegExp }> = [
  { id: "GNINA", pattern: /gnina|cnn[_\s-]?affinity/i },
  { id: "smina", pattern: /smina/i },
  { id: "AutoDock Vina", pattern: /vina/i },
  { id: "AutoDock", pattern: /autodock|estimated free energy of binding/i },
  { id: "Glide", pattern: /glide|glidescore/i },
  { id: "GOLD", pattern: /gold\.plp|goldscore|\bgold\b/i },
  { id: "DiffDock", pattern: /diffdock/i },
  { id: "Uni-Dock", pattern: /unidock|uni-dock/i },
  { id: "rDock", pattern: /rdock/i },
  { id: "PLANTS", pattern: /plants/i },
  { id: "LeDock", pattern: /ledock/i },
  { id: "MOE", pattern: /\bmoe\b|gbvi/i },
];

export const ENGINE_OPTIONS = ENGINE_HINTS.map((hint) => hint.id);

export function detectEngine(filename: string, remarks = ""): string {
  for (const hint of ENGINE_HINTS) {
    if (hint.pattern.test(filename)) return hint.id;
  }
  for (const hint of ENGINE_HINTS) {
    if (hint.pattern.test(remarks)) return hint.id;
  }
  return "Unknown";
}

const AFFINITY_PATTERNS: Array<{ engines?: string[]; pattern: RegExp }> = [
  { engines: ["AutoDock Vina", "smina"], pattern: /vina result:\s*(-?\d+(?:\.\d+)?)/i },
  { engines: ["Glide"], pattern: /glidescore\s*[:=]?\s*(-?\d+(?:\.\d+)?)/i },
  { engines: ["AutoDock"], pattern: /estimated free energy of binding\s*=\s*(-?\d+(?:\.\d+)?)/i },
  { pattern: /affinity\s*[:=]?\s*(-?\d+(?:\.\d+)?)/i },
  { pattern: /binding energy\s*[:=]?\s*(-?\d+(?:\.\d+)?)/i },
  { pattern: /delta[_ ]?g\s*[:=]?\s*(-?\d+(?:\.\d+)?)/i },
  { pattern: /score\s*[:=]\s*(-?\d+(?:\.\d+)?)\s*kcal/i },
  { pattern: /REMARK\s+(-?\d+\.\d+)\s*$/m },
];

export function parseAffinityText(text: string, engine?: string): number | null {
  const preferred = engine
    ? AFFINITY_PATTERNS.filter((item) => item.engines?.includes(engine))
    : [];
  const rest = AFFINITY_PATTERNS.filter((item) => !preferred.includes(item));
  for (const item of [...preferred, ...rest]) {
    const match = text.match(item.pattern);
    if (match) {
      const value = Number.parseFloat(match[1]!);
      if (Number.isFinite(value)) return value;
    }
  }
  return null;
}

export function compactId(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "");
}

const LIGAND_ALIASES: Array<{ name: string; tokens: string[] }> = [
  { name: "OX-11", tokens: ["ox11"] },
  { name: "T2Z14", tokens: ["t2z14"] },
  { name: "Avibactam", tokens: ["avibactam", "nxl"] },
  { name: "GDP", tokens: ["gdp"] },
  { name: "Trimethoprim", tokens: ["trimethoprim"] },
  { name: "Triclosan", tokens: ["triclosan"] },
];

export function canonicalLigandName(filename: string, fallback: string): string {
  const compact = compactId(`${filename} ${fallback}`);
  for (const alias of LIGAND_ALIASES) {
    if (alias.tokens.some((token) => compact.includes(compactId(token)))) return alias.name;
  }
  const trimmed = fallback.trim();
  if (trimmed && trimmed.toUpperCase() !== "UNL" && trimmed.toUpperCase() !== "LIG") return trimmed;
  return filename.replace(/\.[^.]+$/, "").replace(/[_-]+/g, " ").trim() || trimmed;
}

export function matchLigandToExisting(
  filename: string,
  fallback: string,
  existing: Array<{ filename: string; fallbackLabel: string; display: string }>,
): string {
  const incoming = canonicalLigandName(filename, fallback);
  const incomingKey = compactId(incoming);
  for (const pose of existing) {
    const keys = [
      compactId(pose.display),
      compactId(pose.fallbackLabel),
      compactId(canonicalLigandName(pose.filename, pose.fallbackLabel)),
    ];
    if (keys.includes(incomingKey)) return pose.display;
  }
  return incoming;
}

export type AffinityRow = {
  ligand: string;
} & Record<string, string | number | null>;

export type AffinityChartModel = {
  rows: AffinityRow[];
  engines: string[];
  ligands: string[];
  scored: number;
};

export function buildAffinityChart(
  poses: Array<{ ligand: string; engine: string; affinity: number | null }>,
): AffinityChartModel {
  const ligandOrder: string[] = [];
  const ligandLabel: Record<string, string> = {};
  const engines: string[] = [];
  for (const pose of poses) {
    const key = compactId(pose.ligand) || pose.ligand;
    if (!ligandLabel[key]) {
      ligandLabel[key] = pose.ligand;
      ligandOrder.push(key);
    }
    const engine = pose.engine.trim() || "Unknown";
    if (!engines.includes(engine)) engines.push(engine);
  }
  const rows: AffinityRow[] = ligandOrder.map((key) => {
    const row: AffinityRow = { ligand: ligandLabel[key]! };
    for (const engine of engines) {
      const hits = poses.filter(
        (p) =>
          (compactId(p.ligand) || p.ligand) === key &&
          (p.engine.trim() || "Unknown") === engine &&
          p.affinity !== null &&
          Number.isFinite(p.affinity),
      );
      row[engine] = hits.length ? Math.min(...hits.map((h) => h.affinity as number)) : null;
    }
    return row;
  });
  const scored = poses.filter((p) => p.affinity !== null && Number.isFinite(p.affinity)).length;
  return { rows, engines, ligands: ligandOrder.map((key) => ligandLabel[key]!), scored };
}

export const ENGINE_PALETTE = [
  "#d6d3d1",
  "#2dd4bf",
  "#e8a090",
  "#8ab4f8",
  "#c4b5a5",
  "#7dd3c0",
  "#b9a089",
];

export function engineColor(engine: string, engines: string[]): string {
  const index = Math.max(0, engines.indexOf(engine));
  return ENGINE_PALETTE[index % ENGINE_PALETTE.length]!;
}

export function affinityTableTsv(model: AffinityChartModel): string {
  const header = ["Ligand", ...model.engines.map((engine) => `${engine} (kcal/mol)`)].join("\t");
  const lines = model.rows.map((row) =>
    [
      row.ligand,
      ...model.engines.map((engine) => {
        const value = row[engine];
        return typeof value === "number" ? value.toFixed(2) : "";
      }),
    ].join("\t"),
  );
  return [header, ...lines].join("\n");
}
