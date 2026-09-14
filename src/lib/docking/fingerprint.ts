import type { Interaction, InteractionType } from "./interactions";

export type FingerprintCell = {
  poseId: string;
  residue: string;
  types: InteractionType[];
};

export type Fingerprint = {
  residues: string[];
  poseIds: string[];
  cells: Map<string, InteractionType[]>;
};

export const FINGERPRINT_COLORS: Record<InteractionType, string> = {
  hbond: "#2dd4bf",
  salt: "#d97878",
  hydrophobic: "#a39e94",
  "pi-stack": "#e8a090",
  "pi-cation": "#e8a090",
  contact: "#4a4a52",
};

export type FingerprintPlate = {
  width: number;
  height: number;
  perBand: number;
  cell: number;
  gap: number;
  labelW: number;
  pad: number;
  titleH: number;
  headerH: number;
  rowH: number;
  bandH: number;
  bandGap: number;
  legendH: number;
  bands: number;
};

export function residueTag(chain: string, resSeq: number, resName: string): string {
  const pretty =
    (
      {
        ALA: "Ala",
        ARG: "Arg",
        ASN: "Asn",
        ASP: "Asp",
        CYS: "Cys",
        GLN: "Gln",
        GLU: "Glu",
        GLY: "Gly",
        HIS: "His",
        ILE: "Ile",
        LEU: "Leu",
        LYS: "Lys",
        MET: "Met",
        PHE: "Phe",
        PRO: "Pro",
        SER: "Ser",
        THR: "Thr",
        TRP: "Trp",
        TYR: "Tyr",
        VAL: "Val",
      } as Record<string, string>
    )[resName] ?? resName;
  return chain === "A" ? `${pretty}${resSeq}` : `${pretty}${resSeq}.${chain}`;
}

export function buildFingerprint(
  rows: { poseId: string; hits: Interaction[] }[],
): Fingerprint {
  const residueSet = new Map<string, string>();
  const cells = new Map<string, InteractionType[]>();
  for (const row of rows) {
    for (const hit of row.hits) {
      const tag = residueTag(hit.chain, hit.resSeq, hit.resName);
      residueSet.set(`${hit.chain}:${hit.resSeq}`, tag);
      const key = `${row.poseId}::${tag}`;
      const list = cells.get(key) ?? [];
      if (!list.includes(hit.type)) list.push(hit.type);
      cells.set(key, list);
    }
  }
  const residues = [...residueSet.entries()]
    .sort((a, b) => {
      const [c1, n1] = a[0].split(":");
      const [c2, n2] = b[0].split(":");
      const chain = (c1 ?? "").localeCompare(c2 ?? "");
      if (chain) return chain;
      return (Number.parseInt(n1 ?? "0", 10) || 0) - (Number.parseInt(n2 ?? "0", 10) || 0);
    })
    .map(([, tag]) => tag);
  return {
    residues,
    poseIds: rows.map((r) => r.poseId),
    cells,
  };
}

export function cellKey(poseId: string, residue: string): string {
  return `${poseId}::${residue}`;
}

export function bandResidues(residues: string[], perBand: number): string[][] {
  const size = Math.max(1, perBand);
  const bands: string[][] = [];
  for (let i = 0; i < residues.length; i += size) bands.push(residues.slice(i, i + size));
  return bands.length ? bands : [[]];
}

export function fingerprintFit(
  nResidues: number,
  nPoses: number,
  width: number,
  height?: number,
): { perBand: number; cell: number; bands: number } {
  const nRes = Math.max(nResidues, 1);
  const poses = Math.max(nPoses, 1);
  const labelW = 96;
  const innerW = Math.max(80, width - labelW);
  const minCell = 12;
  const gap = 3;
  let perBand = nRes;
  let cell = Math.floor(innerW / perBand) - gap;
  if (cell < 14 && nRes > 8) {
    perBand = Math.max(6, Math.floor(innerW / (16 + gap)));
    cell = Math.floor(innerW / Math.min(perBand, nRes)) - gap;
  }
  cell = Math.max(minCell, Math.min(22, cell));
  if (height && height > 80) {
    const bands = Math.ceil(nRes / perBand);
    const headerH = 56;
    const bandGap = 12;
    const usable = height - 28 - (bands - 1) * bandGap;
    const perBandH = usable / bands;
    const fromH = Math.floor((perBandH - headerH) / poses) - 4;
    if (fromH > 0) cell = Math.max(8, Math.min(cell, fromH));
  }
  return { perBand, cell, bands: Math.ceil(nRes / perBand) };
}

/** Publication plate: every residue stays on the page. One band unless the row would go below 28 px cells. */
export function fingerprintPlateLayout(
  nResidues: number,
  nPoses: number,
  width = 2200,
  opts?: { titled?: boolean },
): FingerprintPlate {
  const nRes = Math.max(1, nResidues);
  const poses = Math.max(1, nPoses);
  const pad = 28;
  const titled = opts?.titled !== false;
  const titleH = titled ? 70 : 0;
  const legendH = 36;
  const labelW = 140;
  const gap = 4;
  const minCell = 28;
  const headerH = 86;
  const innerW = Math.max(160, width - pad * 2 - labelW);
  let perBand = nRes;
  let cell = Math.floor(innerW / perBand) - gap;
  if (cell < minCell && nRes > 12) {
    perBand = Math.max(10, Math.floor(innerW / (minCell + gap)));
    cell = Math.floor(innerW / Math.min(perBand, nRes)) - gap;
  }
  cell = Math.max(18, Math.min(42, cell));
  const bands = Math.ceil(nRes / perBand);
  const rowH = cell + 12;
  const bandH = headerH + poses * rowH + 4;
  const bandGap = 20;
  const height =
    pad + titleH + bands * bandH + Math.max(0, bands - 1) * bandGap + legendH + pad;
  return {
    width,
    height,
    perBand,
    cell,
    gap,
    labelW,
    pad,
    titleH,
    headerH,
    rowH,
    bandH,
    bandGap,
    legendH,
    bands,
  };
}
