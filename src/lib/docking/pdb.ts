import { ION_NAMES, WATER_NAMES, prettyResidue } from "./chemistry.ts";
import { detectEngine, parseAffinityText } from "./engines.ts";

export type Atom = {
  record: "ATOM" | "HETATM";
  serial: number;
  name: string;
  resName: string;
  chain: string;
  resSeq: number;
  x: number;
  y: number;
  z: number;
  occupancy: number;
  bFactor: number;
  element: string;
};

export type Contact = {
  chain: string;
  resSeq: number;
  resName: string;
  atom: string;
  ligandAtom: string;
  distance: number;
  polar: boolean;
};

export type GninaMeta = {
  title: string;
  affinity: number | null;
  poseRank: number | null;
  netCharge: number | null;
  engine: string;
  remarks: string[];
};

const cache = new Map<string, Promise<string>>();

export function fetchPdb(path: string): Promise<string> {
  let pending = cache.get(path);
  if (!pending) {
    pending = fetch(path).then((res) => {
      if (!res.ok) throw new Error(`Could not load structure ${path}`);
      return res.text();
    });
    cache.set(path, pending);
  }
  return pending;
}

export function prefetchAll(paths: string[]): void {
  for (const path of paths) void fetchPdb(path);
}

export function parseAtom(line: string): Atom | null {
  if (!line.startsWith("ATOM") && !line.startsWith("HETATM")) return null;
  const alt = line.length > 16 ? line[16] : " ";
  if (alt && alt !== " " && alt !== "A") return null;
  const name = line.slice(12, 16).trim();
  const resName = line.slice(17, 21).trim();
  const chain = line.slice(21, 22).trim() || "A";
  const resSeq = Number.parseInt(line.slice(22, 26), 10);
  const x = Number.parseFloat(line.slice(30, 38));
  const y = Number.parseFloat(line.slice(38, 46));
  const z = Number.parseFloat(line.slice(46, 54));
  if (!Number.isFinite(x) || !Number.isFinite(y) || !Number.isFinite(z)) return null;
  const occupancy = Number.parseFloat(line.slice(54, 60));
  const bFactor = Number.parseFloat(line.slice(60, 66));
  const serial = Number.parseInt(line.slice(6, 11), 10);
  return {
    record: line.startsWith("HETATM") ? "HETATM" : "ATOM",
    serial: Number.isFinite(serial) ? serial : 0,
    name,
    resName,
    chain,
    resSeq: Number.isFinite(resSeq) ? resSeq : 0,
    x,
    y,
    z,
    occupancy: Number.isFinite(occupancy) ? occupancy : 1,
    bFactor: Number.isFinite(bFactor) ? bFactor : 0,
    element: elementFromLine(line, name),
  };
}

function elementFromAtomName(atomName: string): string {
  const letters = atomName.trim().replace(/[^A-Za-z]/g, "");
  const up = letters.toUpperCase();
  if (up.startsWith("CL")) return "Cl";
  if (up.startsWith("BR")) return "Br";
  if (up === "NA" || up === "SOD") return "Na";
  const first = letters[0];
  return first ? first.toUpperCase() : "C";
}

function elementFromLine(line: string, atomName: string): string {
  const fromName = elementFromAtomName(atomName);
  const col = line.length > 76 ? line.slice(76, 78).trim() : "";
  if (!col) return fromName;
  // GAFF/Amber types (Na, Ca, Ha) are mixed-case and sit in the element columns
  // of some docked PDBs. Trust the atom name instead of calling them sodium.
  if (/^[A-Z][a-z]$/.test(col) && col !== "Cl" && col !== "Br") return fromName;
  if (col === "Cl" || col === "CL") return "Cl";
  if (col === "Br" || col === "BR") return "Br";
  if (/^[A-Z]$/.test(col)) return col;
  if (/^[A-Z]{2}$/.test(col)) {
    const up = col.toUpperCase();
    if ((up === "NA" || up === "CA") && fromName !== "Na" && fromName !== "Ca" && fromName !== up) {
      return fromName;
    }
    return col[0]! + col[1]!.toLowerCase();
  }
  return fromName;
}


export function parseAtoms(pdb: string): Atom[] {
  const atoms: Atom[] = [];
  for (const line of pdb.split("\n")) {
    const atom = parseAtom(line);
    if (atom) atoms.push(atom);
  }
  return atoms;
}

export function parseGnina(pdb: string, filename = ""): GninaMeta {
  const remarks: string[] = [];
  let title = "";
  let poseRank: number | null = null;
  let netCharge: number | null = null;
  for (const raw of pdb.split("\n")) {
    const line = raw.trimEnd();
    if (line.startsWith("TITLE")) {
      title = `${title} ${line.slice(6).trim()}`.trim();
    } else if (line.startsWith("REMARK") || line.startsWith("HEADER") || line.startsWith("COMPND")) {
      const text = line.replace(/^(REMARK|HEADER|COMPND)\s*/, "").trim();
      if (text) remarks.push(text);
      const pose = text.match(/pose\s*#\s*(\d+)/i);
      if (pose) poseRank = Number.parseInt(pose[1]!, 10);
      const chg = text.match(/net_charge\s+([+-]?\d+)/i);
      if (chg) netCharge = Number.parseInt(chg[1]!, 10);
    }
  }
  const blob = `${filename}\n${remarks.join("\n")}\n${title}`;
  const engine = detectEngine(filename, blob);
  return {
    title,
    affinity: parseAffinityText(blob, engine),
    poseRank,
    netCharge,
    engine,
    remarks: remarks.slice(0, 8),
  };
}

export function isWaterRes(resName: string): boolean {
  return WATER_NAMES.has(resName.toUpperCase());
}

export function isIonRes(resName: string): boolean {
  return ION_NAMES.has(resName.toUpperCase());
}

export function isLigandHet(atom: Atom): boolean {
  if (atom.record !== "HETATM") return false;
  if (isWaterRes(atom.resName) || isIonRes(atom.resName)) return false;
  return true;
}

export function splitComplex(pdb: string): { protein: string; ligand: string; solvent: string } {
  const protein: string[] = [];
  const ligand: string[] = [];
  const solvent: string[] = [];
  for (const line of pdb.split("\n")) {
    if (line.startsWith("ATOM")) protein.push(line);
    else if (line.startsWith("HETATM")) {
      const atom = parseAtom(line);
      if (!atom) continue;
      if (isWaterRes(atom.resName) || isIonRes(atom.resName)) solvent.push(line);
      else ligand.push(line);
    }
  }
  return {
    protein: `${protein.join("\n")}\nEND\n`,
    ligand: `${ligand.join("\n")}\nEND\n`,
    solvent: `${solvent.join("\n")}\nEND\n`,
  };
}

export function stripHydrogens(pdb: string): string {
  return pdb
    .split("\n")
    .filter((line) => {
      if (!line.startsWith("ATOM") && !line.startsWith("HETATM")) return true;
      const atom = parseAtom(line);
      return Boolean(atom && atom.element !== "H");
    })
    .join("\n");
}

export function pdbFromAtoms(atoms: Atom[]): string {
  const lines = atoms.map((atom, i) => formatAtom(atom, i + 1));
  return `${lines.join("\n")}\nEND\n`;
}

function formatAtom(atom: Atom, serial: number): string {
  const rec = atom.record.padEnd(6, " ");
  const ser = String(serial).padStart(5, " ");
  const name = atom.name.length < 4 ? ` ${atom.name.padEnd(3, " ")}` : atom.name.slice(0, 4);
  const res = atom.resName.padEnd(3, " ").slice(0, 3);
  const chain = (atom.chain || "A").slice(0, 1);
  const seq = String(atom.resSeq).padStart(4, " ");
  const x = atom.x.toFixed(3).padStart(8, " ");
  const y = atom.y.toFixed(3).padStart(8, " ");
  const z = atom.z.toFixed(3).padStart(8, " ");
  const occ = atom.occupancy.toFixed(2).padStart(6, " ");
  const bf = atom.bFactor.toFixed(2).padStart(6, " ");
  const el = atom.element.padStart(2, " ");
  return `${rec}${ser} ${name} ${res} ${chain}${seq}    ${x}${y}${z}${occ}${bf}          ${el}`;
}

const POLAR = new Set(["N", "O", "S"]);

export function dist(a: { x: number; y: number; z: number }, b: { x: number; y: number; z: number }): number {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  const dz = a.z - b.z;
  return Math.sqrt(dx * dx + dy * dy + dz * dz);
}

export function findContacts(protein: Atom[], ligand: Atom[], cutoff = 4.0): Contact[] {
  const ligHeavy = ligand.filter((a) => a.element !== "H" && isLigandHet(a));
  const protHeavy = protein.filter((a) => a.element !== "H" && a.record === "ATOM");
  const best = new Map<string, Contact>();

  for (const p of protHeavy) {
    for (const l of ligHeavy) {
      const d = dist(p, l);
      if (d > cutoff) continue;
      const key = `${p.chain}:${p.resSeq}:${p.resName}`;
      const polar = POLAR.has(p.element) && POLAR.has(l.element) && d <= 3.5;
      const prev = best.get(key);
      if (!prev || d < prev.distance) {
        best.set(key, {
          chain: p.chain,
          resSeq: p.resSeq,
          resName: p.resName,
          atom: p.name,
          ligandAtom: l.name,
          distance: d,
          polar: polar || Boolean(prev?.polar),
        });
      } else if (polar) {
        prev.polar = true;
      }
    }
  }

  return [...best.values()].sort((a, b) => a.distance - b.distance);
}

export function residueLabel(contact: Contact): string {
  return prettyResidue(contact.resName, contact.resSeq, contact.chain);
}

export function resKey(chain: string, resSeq: number): string {
  return `${chain}:${resSeq}`;
}
