/** Amino-acid chemistry used for coloring, electrostatics, and hydrophobicity. */

export type AAClass =
  | "acidic"
  | "basic"
  | "polar"
  | "aromatic"
  | "hydrophobic"
  | "special"
  | "ligand"
  | "water"
  | "ion"
  | "other";

export type SSCode = "H" | "G" | "I" | "E" | "T" | "C";

export const AA3_TO_1: Record<string, string> = {
  ALA: "A",
  ARG: "R",
  ASN: "N",
  ASP: "D",
  CYS: "C",
  GLN: "Q",
  GLU: "E",
  GLY: "G",
  HIS: "H",
  ILE: "I",
  LEU: "L",
  LYS: "K",
  MET: "M",
  PHE: "F",
  PRO: "P",
  SER: "S",
  THR: "T",
  TRP: "W",
  TYR: "Y",
  VAL: "V",
  SEC: "U",
  PYL: "O",
  MSE: "M",
  HYP: "P",
};

export const AA1_TO_3: Record<string, string> = Object.fromEntries(
  Object.entries(AA3_TO_1).map(([k, v]) => [v, k]),
);

export const AA_TITLE: Record<string, string> = {
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
  SEC: "Sec",
  PYL: "Pyl",
  MSE: "Mse",
};

export const STANDARD_AA = new Set(Object.keys(AA3_TO_1));

export const WATER_NAMES = new Set(["HOH", "WAT", "H2O", "SOL", "DOD", "TIP", "TIP3", "OH2"]);

export const ION_NAMES = new Set([
  "NA",
  "K",
  "LI",
  "RB",
  "CS",
  "MG",
  "CA",
  "ZN",
  "MN",
  "FE",
  "CU",
  "NI",
  "CO",
  "CD",
  "CL",
  "BR",
  "F",
  "I",
  "IOD",
  "NA+",
  "CL-",
  "SO4",
  "PO4",
  "NH4",
]);

/** Kyte–Doolittle hydropathy. */
export const KYTE_DOOLITTLE: Record<string, number> = {
  ILE: 4.5,
  VAL: 4.2,
  LEU: 3.8,
  PHE: 2.8,
  CYS: 2.5,
  MET: 1.9,
  ALA: 1.8,
  GLY: -0.4,
  THR: -0.7,
  SER: -0.8,
  TRP: -0.9,
  TYR: -1.3,
  PRO: -1.6,
  HIS: -3.2,
  GLN: -3.5,
  ASN: -3.5,
  GLU: -3.5,
  ASP: -3.5,
  LYS: -3.9,
  ARG: -4.5,
  MSE: 1.9,
  SEC: 2.5,
};

export function aaClass(resName: string): AAClass {
  const r = resName.toUpperCase();
  if (WATER_NAMES.has(r)) return "water";
  if (ION_NAMES.has(r)) return "ion";
  if (r === "ASP" || r === "GLU") return "acidic";
  if (r === "LYS" || r === "ARG" || r === "HIS") return "basic";
  if (r === "PHE" || r === "TRP" || r === "TYR") return "aromatic";
  if (r === "SER" || r === "THR" || r === "ASN" || r === "GLN" || r === "CYS" || r === "SEC")
    return "polar";
  if (r === "GLY" || r === "PRO") return "special";
  if (r === "ALA" || r === "VAL" || r === "LEU" || r === "ILE" || r === "MET" || r === "MSE")
    return "hydrophobic";
  if (STANDARD_AA.has(r)) return "hydrophobic";
  return "ligand";
}

export function aaClassLabel(cls: AAClass): string {
  switch (cls) {
    case "acidic":
      return "Acidic";
    case "basic":
      return "Basic";
    case "polar":
      return "Polar";
    case "aromatic":
      return "Aromatic";
    case "hydrophobic":
      return "Hydrophobic";
    case "special":
      return "Gly / Pro";
    case "ligand":
      return "Ligand";
    case "water":
      return "Water";
    case "ion":
      return "Ion";
    default:
      return "Other";
  }
}

export function prettyResidue(resName: string, resSeq: number, chain?: string): string {
  const title = AA_TITLE[resName] ?? resName;
  const chainBit = chain && chain !== "A" ? `.${chain}` : "";
  return `${title}${resSeq}${chainBit}`;
}

export function oneLetter(resName: string): string {
  return AA3_TO_1[resName] ?? "X";
}

export function ssLabel(code: SSCode): string {
  switch (code) {
    case "H":
      return "α-helix";
    case "G":
      return "3₁₀-helix";
    case "I":
      return "π-helix";
    case "E":
      return "β-strand";
    case "T":
      return "Turn";
    default:
      return "Coil";
  }
}

export function ssGroup(code: SSCode): "helix" | "sheet" | "turn" | "coil" {
  if (code === "H" || code === "G" || code === "I") return "helix";
  if (code === "E") return "sheet";
  if (code === "T") return "turn";
  return "coil";
}

/** Formal charge centers used for a Coulombic surface (pH ~7). */
export type ChargeCenter = {
  x: number;
  y: number;
  z: number;
  q: number;
  resName: string;
  chain: string;
  resSeq: number;
};

const SIDECHAIN_CHARGE: Record<string, Partial<Record<string, number>>> = {
  ASP: { OD1: -0.5, OD2: -0.5 },
  GLU: { OE1: -0.5, OE2: -0.5 },
  LYS: { NZ: 1 },
  ARG: { NH1: 0.33, NH2: 0.33, NE: 0.34 },
  HIS: { ND1: 0.12, NE2: 0.12 },
};

export function chargeForAtom(resName: string, atomName: string, isNTerm: boolean, isCTerm: boolean): number {
  const n = atomName.toUpperCase();
  const r = resName.toUpperCase();
  let q = 0;
  if (isNTerm && n === "N") q += 1;
  if (isCTerm && (n === "OXT" || n === "OT1" || n === "OT2")) q += n === "OXT" ? -1 : -0.5;
  const side = SIDECHAIN_CHARGE[r]?.[n];
  if (side) q += side;
  return q;
}

export function hydropathy(resName: string): number {
  return KYTE_DOOLITTLE[resName.toUpperCase()] ?? 0;
}

export function rwbColor(value: number, lo: number, hi: number): string {
  const t = Math.max(0, Math.min(1, (value - lo) / (hi - lo || 1)));
  // red (neg) → white → blue (pos)
  if (t < 0.5) {
    const u = t * 2;
    return rgbHex(201 + (244 - 201) * u, 120 + (241 - 120) * u, 120 + (234 - 120) * u);
  }
  const u = (t - 0.5) * 2;
  return rgbHex(244 + (122 - 244) * u, 241 + (158 - 241) * u, 234 + (212 - 234) * u);
}

export function hydroColor(value: number): string {
  // hydrophilic teal → hydrophobic clay
  const t = Math.max(0, Math.min(1, (value + 4.5) / 9));
  return rgbHex(
    90 + (232 - 90) * t,
    168 + (160 - 168) * t,
    160 + (144 - 160) * t,
  );
}

function rgbHex(r: number, g: number, b: number): string {
  const h = (n: number) => Math.max(0, Math.min(255, Math.round(n))).toString(16).padStart(2, "0");
  return `#${h(r)}${h(g)}${h(b)}`;
}

export const POSE_PALETTE = ["#d6d3d1", "#2dd4bf", "#e8a090", "#8ab4f8", "#c4b5a5", "#7dd3c0", "#b9a089"];

export const CPK: Record<string, string> = {
  C: "#9098a4",
  N: "#5b8def",
  O: "#e07070",
  S: "#d4c48a",
  P: "#e8a090",
  F: "#6aaa8c",
  CL: "#6aaa8c",
  BR: "#e8a090",
  I: "#b492c8",
  H: "#d6d3d1",
};
