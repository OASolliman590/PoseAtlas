import { aaClass } from "./chemistry.ts";
import { dist, type Atom } from "./pdb.ts";

export type InteractionType = "hbond" | "salt" | "hydrophobic" | "pi-stack" | "pi-cation" | "contact";

export type Vec3 = { x: number; y: number; z: number };

export type Interaction = {
  type: InteractionType;
  chain: string;
  resSeq: number;
  resName: string;
  residueAtom: string;
  ligandAtom: string;
  distance: number;
  start: Vec3;
  end: Vec3;
};

const DONOR = new Set(["N", "O", "S"]);
const ACCEPTOR = new Set(["N", "O", "S", "F"]);
const POS_ATOMS = new Set(["NZ", "NH1", "NH2", "NE", "ND1", "NE2"]);
const NEG_ATOMS = new Set(["OD1", "OD2", "OE1", "OE2", "OXT"]);
const HYDROPHOBIC_RES = new Set(["ALA", "VAL", "LEU", "ILE", "MET", "PHE", "TRP", "PRO", "TYR"]);

const RING: Record<string, string[][]> = {
  PHE: [["CG", "CD1", "CD2", "CE1", "CE2", "CZ"]],
  TYR: [["CG", "CD1", "CD2", "CE1", "CE2", "CZ"]],
  HIS: [["CG", "ND1", "CD2", "CE1", "NE2"]],
  TRP: [
    ["CG", "CD1", "NE1", "CE2", "CD2"],
    ["CD2", "CE2", "CE3", "CZ3", "CH2", "CZ2"],
  ],
};

function centroid(atoms: Atom[]): Vec3 {
  const n = atoms.length || 1;
  return {
    x: atoms.reduce((s, a) => s + a.x, 0) / n,
    y: atoms.reduce((s, a) => s + a.y, 0) / n,
    z: atoms.reduce((s, a) => s + a.z, 0) / n,
  };
}

function groupResidues(atoms: Atom[]): Map<string, Atom[]> {
  const map = new Map<string, Atom[]>();
  for (const a of atoms) {
    const key = `${a.chain}:${a.resSeq}:${a.resName}`;
    const list = map.get(key);
    if (list) list.push(a);
    else map.set(key, [a]);
  }
  return map;
}

function ligandRings(ligand: Atom[]): Vec3[] {
  const heavy = ligand.filter((a) => a.element !== "H").slice(0, 64);
  const n = heavy.length;
  const nbr: number[][] = Array.from({ length: n }, () => []);
  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) {
      const d = dist(heavy[i]!, heavy[j]!);
      if (d > 1.15 && d < 1.85) {
        nbr[i]!.push(j);
        nbr[j]!.push(i);
      }
    }
  }
  const rings: Vec3[] = [];
  const seen = new Set<string>();
  const walk = (start: number, current: number, path: number[], depth: number) => {
    if (rings.length >= 12 || depth > 6) return;
    for (const nxt of nbr[current]!) {
      if (depth >= 4 && depth <= 6 && nxt === start) {
        const key = [...path].sort((a, b) => a - b).join(",");
        if (!seen.has(key)) {
          seen.add(key);
          rings.push(centroid(path.map((i) => heavy[i]!)));
        }
        continue;
      }
      if (path.includes(nxt)) continue;
      walk(start, nxt, [...path, nxt], depth + 1);
    }
  };
  for (let i = 0; i < n && rings.length < 12; i++) {
    if ((nbr[i]?.length ?? 0) >= 2) walk(i, i, [i], 1);
  }
  return rings;
}


function residueRings(resName: string, atoms: Atom[]): Vec3[] {
  const defs = RING[resName];
  if (!defs) return [];
  const out: Vec3[] = [];
  for (const names of defs) {
    const picked = names
      .map((nm) => atoms.find((a) => a.name === nm))
      .filter((a): a is Atom => Boolean(a));
    if (picked.length >= 5) out.push(centroid(picked));
  }
  return out;
}

function ligandChargeAtoms(ligand: Atom[]): { pos: Atom[]; neg: Atom[] } {
  const pos: Atom[] = [];
  const neg: Atom[] = [];
  for (const a of ligand) {
    if (a.element === "H") continue;
    if (a.element === "N" && (a.name.startsWith("N") || a.name.includes("N"))) pos.push(a);
    if (a.element === "O" && /OXT|OD|OE|O[0-9]/.test(a.name)) neg.push(a);
  }
  return { pos, neg };
}

export function findInteractions(protein: Atom[], ligand: Atom[]): Interaction[] {
  const prot = protein.filter((a) => a.element !== "H" && a.record === "ATOM");
  const lig = ligand.filter((a) => a.element !== "H");
  if (!prot.length || !lig.length) return [];

  const resMap = groupResidues(prot);
  const ligRings = ligandRings(lig);
  const ligQ = ligandChargeAtoms(lig);
  const found: Interaction[] = [];
  const typed = new Set<string>();

  const push = (hit: Interaction) => {
    const key = `${hit.type}:${hit.chain}:${hit.resSeq}:${hit.residueAtom}:${hit.ligandAtom}`;
    if (typed.has(key)) return;
    typed.add(key);
    found.push(hit);
  };

  for (const [, atoms] of resMap) {
    const head = atoms[0]!;
    const cls = aaClass(head.resName);

    for (const p of atoms) {
      for (const l of lig) {
        const d = dist(p, l);
        if (d > 4.6) continue;

        const polarPair = DONOR.has(p.element) && ACCEPTOR.has(l.element);
        const polarRev = DONOR.has(l.element) && ACCEPTOR.has(p.element);
        if ((polarPair || polarRev) && d <= 3.5) {
          const salt =
            d <= 4.0 &&
            ((POS_ATOMS.has(p.name) && (l.element === "O" || l.element === "N")) ||
              (NEG_ATOMS.has(p.name) && l.element === "N"));
          push({
            type: salt ? "salt" : "hbond",
            chain: head.chain,
            resSeq: head.resSeq,
            resName: head.resName,
            residueAtom: p.name,
            ligandAtom: l.name,
            distance: d,
            start: { x: p.x, y: p.y, z: p.z },
            end: { x: l.x, y: l.y, z: l.z },
          });
        } else if (
          d <= 4.5 &&
          p.element === "C" &&
          l.element === "C" &&
          (HYDROPHOBIC_RES.has(head.resName) || cls === "aromatic" || cls === "hydrophobic")
        ) {
          push({
            type: "hydrophobic",
            chain: head.chain,
            resSeq: head.resSeq,
            resName: head.resName,
            residueAtom: p.name,
            ligandAtom: l.name,
            distance: d,
            start: { x: p.x, y: p.y, z: p.z },
            end: { x: l.x, y: l.y, z: l.z },
          });
        }
      }
    }

    const rings = residueRings(head.resName, atoms);
    for (const rr of rings) {
      for (const lr of ligRings) {
        const d = dist(rr, lr);
        if (d >= 3.2 && d <= 5.2) {
          push({
            type: "pi-stack",
            chain: head.chain,
            resSeq: head.resSeq,
            resName: head.resName,
            residueAtom: "ring",
            ligandAtom: "ring",
            distance: d,
            start: rr,
            end: lr,
          });
        }
      }
      for (const n of ligQ.pos) {
        const d = dist(rr, n);
        if (d <= 5.0) {
          push({
            type: "pi-cation",
            chain: head.chain,
            resSeq: head.resSeq,
            resName: head.resName,
            residueAtom: "ring",
            ligandAtom: n.name,
            distance: d,
            start: rr,
            end: { x: n.x, y: n.y, z: n.z },
          });
        }
      }
    }
  }

  // Keep the shortest contact of each type per residue (avoid 20 hydrophobic dashes)
  const best = new Map<string, Interaction>();
  for (const hit of found) {
    const key = `${hit.type}:${hit.chain}:${hit.resSeq}`;
    const prev = best.get(key);
    if (!prev || hit.distance < prev.distance) best.set(key, hit);
  }

  // Ensure every residue within 4 Å has at least a generic contact
  for (const [, atoms] of resMap) {
    const head = atoms[0]!;
    const has = [...best.values()].some((h) => h.chain === head.chain && h.resSeq === head.resSeq);
    if (has) continue;
    let closest: Interaction | null = null;
    for (const p of atoms) {
      for (const l of lig) {
        const d = dist(p, l);
        if (d > 4.0) continue;
        if (!closest || d < closest.distance) {
          closest = {
            type: "contact",
            chain: head.chain,
            resSeq: head.resSeq,
            resName: head.resName,
            residueAtom: p.name,
            ligandAtom: l.name,
            distance: d,
            start: { x: p.x, y: p.y, z: p.z },
            end: { x: l.x, y: l.y, z: l.z },
          };
        }
      }
    }
    if (closest) best.set(`contact:${head.chain}:${head.resSeq}`, closest);
  }

  return [...best.values()].sort((a, b) => a.distance - b.distance);
}

export const INTERACTION_LABEL: Record<InteractionType, string> = {
  hbond: "H-bond",
  salt: "Salt bridge",
  hydrophobic: "Hydrophobic",
  "pi-stack": "π-stacking",
  "pi-cation": "π-cation",
  contact: "Contact",
};

export function uniqueResidues(hits: Interaction[]): { chain: string; resSeq: number; resName: string }[] {
  const seen = new Map<string, { chain: string; resSeq: number; resName: string }>();
  for (const h of hits) {
    const key = `${h.chain}:${h.resSeq}`;
    if (!seen.has(key)) seen.set(key, { chain: h.chain, resSeq: h.resSeq, resName: h.resName });
  }
  return [...seen.values()];
}

export type ResidueRow = {
  chain: string;
  resSeq: number;
  resName: string;
  types: InteractionType[];
  residueAtom: string;
  ligandAtom: string;
  distance: number;
};

export function tabulateResidues(hits: Interaction[]): ResidueRow[] {
  const byRes = new Map<string, ResidueRow>();
  for (const hit of hits) {
    const key = `${hit.chain}:${hit.resSeq}`;
    const prev = byRes.get(key);
    if (!prev) {
      byRes.set(key, {
        chain: hit.chain,
        resSeq: hit.resSeq,
        resName: hit.resName,
        types: [hit.type],
        residueAtom: hit.residueAtom,
        ligandAtom: hit.ligandAtom,
        distance: hit.distance,
      });
      continue;
    }
    if (!prev.types.includes(hit.type)) prev.types.push(hit.type);
    if (hit.distance < prev.distance) {
      prev.distance = hit.distance;
      prev.residueAtom = hit.residueAtom;
      prev.ligandAtom = hit.ligandAtom;
    }
  }
  const rank: Record<InteractionType, number> = {
    salt: 0,
    hbond: 1,
    "pi-stack": 2,
    "pi-cation": 3,
    hydrophobic: 4,
    contact: 5,
  };
  return [...byRes.values()].sort((a, b) => {
    if (a.chain !== b.chain) return a.chain.localeCompare(b.chain);
    if (a.resSeq !== b.resSeq) return a.resSeq - b.resSeq;
    return (rank[a.types[0]!] ?? 9) - (rank[b.types[0]!] ?? 9);
  });
}

export type CommonContact = {
  chain: string;
  resSeq: number;
  resName: string;
  nPoses: number;
  types: InteractionType[];
  meanDist: number;
};

export function commonContacts(
  rows: Array<{ poseId: string; hits: Interaction[] }>,
): CommonContact[] {
  if (rows.length < 2) return [];
  const perPose = rows.map((row) => tabulateResidues(row.hits));
  const index = new Map<
    string,
    { chain: string; resSeq: number; resName: string; types: Set<InteractionType>; dists: number[]; n: number }
  >();
  for (const table of perPose) {
    const seen = new Set<string>();
    for (const row of table) {
      const key = `${row.chain}:${row.resSeq}`;
      if (seen.has(key)) continue;
      seen.add(key);
      const prev = index.get(key);
      if (!prev) {
        index.set(key, {
          chain: row.chain,
          resSeq: row.resSeq,
          resName: row.resName,
          types: new Set(row.types),
          dists: [row.distance],
          n: 1,
        });
      } else {
        prev.n += 1;
        prev.dists.push(row.distance);
        for (const t of row.types) prev.types.add(t);
      }
    }
  }
  return [...index.values()]
    .filter((row) => row.n === rows.length)
    .sort((a, b) => {
      if (a.chain !== b.chain) return a.chain.localeCompare(b.chain);
      return a.resSeq - b.resSeq;
    })

    .map((row) => ({
      chain: row.chain,
      resSeq: row.resSeq,
      resName: row.resName,
      nPoses: row.n,
      types: [...row.types],
      meanDist: row.dists.reduce((s, d) => s + d, 0) / row.dists.length,
    }));
}

