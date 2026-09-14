/**
 * Kabsch–Sander DSSP (simplified sheet pairing) plus backbone dihedrals.
 * H-bond energy uses the original electrostatic definition:
 *   E = 0.42 · 0.20 · 332 · (1/rON + 1/rCH − 1/rOH − 1/rCN) kcal/mol
 * A hydrogen bond is accepted at E < −0.5 kcal/mol.
 */
import type { SSCode } from "./chemistry";
import { ssGroup } from "./chemistry";
import type { Atom } from "./pdb";

export type Vec = [number, number, number];

export type Backbone = {
  chain: string;
  resSeq: number;
  resName: string;
  n: Vec;
  ca: Vec;
  c: Vec;
  o: Vec;
  h: Vec | null;
};

export type ResidueSS = {
  chain: string;
  resSeq: number;
  resName: string;
  ss: SSCode;
  phi: number | null;
  psi: number | null;
  energyBest: number;
};

export type SSAnalysis = {
  residues: ResidueSS[];
  byKey: Map<string, ResidueSS>;
  composition: Record<"helix" | "sheet" | "turn" | "coil", number>;
  percents: Record<"helix" | "sheet" | "turn" | "coil", number>;
  helixCount: number;
  strandCount: number;
  meanHelixLength: number;
  chainIds: string[];
};

const Q1Q2F = 0.42 * 0.20 * 332.0;
const HBOND_CUT = -0.5;

function sub(a: Vec, b: Vec): Vec {
  return [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
}
function add(a: Vec, b: Vec): Vec {
  return [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
}
function scale(a: Vec, s: number): Vec {
  return [a[0] * s, a[1] * s, a[2] * s];
}
function dot(a: Vec, b: Vec): number {
  return a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
}
function cross(a: Vec, b: Vec): Vec {
  return [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
}
function nrm(a: Vec): number {
  return Math.sqrt(dot(a, a));
}
function norm(a: Vec): Vec {
  const n = nrm(a) || 1;
  return [a[0] / n, a[1] / n, a[2] / n];
}
function vdist(a: Vec, b: Vec): number {
  return nrm(sub(a, b));
}

export function dihedral(a: Vec, b: Vec, c: Vec, d: Vec): number {
  const b1 = sub(b, a);
  const b2 = sub(c, b);
  const b3 = sub(d, c);
  const n1 = cross(b1, b2);
  const n2 = cross(b2, b3);
  const n1n = nrm(n1);
  const n2n = nrm(n2);
  if (n1n < 1e-8 || n2n < 1e-8) return 0;
  const nn1: Vec = [n1[0] / n1n, n1[1] / n1n, n1[2] / n1n];
  const nn2: Vec = [n2[0] / n2n, n2[1] / n2n, n2[2] / n2n];
  const m = cross(nn1, norm(b2));
  return Math.atan2(dot(m, nn2), dot(nn1, nn2)) * (180 / Math.PI);
}

function atomVec(atom: Atom): Vec {
  return [atom.x, atom.y, atom.z];
}

function buildBackbone(atoms: Atom[]): Backbone[] {
  const groups = new Map<string, Atom[]>();
  for (const a of atoms) {
    if (a.record !== "ATOM" || a.element === "H") continue;
    const key = `${a.chain}:${a.resSeq}`;
    const list = groups.get(key);
    if (list) list.push(a);
    else groups.set(key, [a]);
  }
  const bb: Backbone[] = [];
  for (const [, resAtoms] of groups) {
    const n = resAtoms.find((a) => a.name === "N");
    const ca = resAtoms.find((a) => a.name === "CA");
    const c = resAtoms.find((a) => a.name === "C");
    const o = resAtoms.find((a) => a.name === "O");
    if (!n || !ca || !c || !o) continue;
    const hAtom = resAtoms.find((a) => a.name === "H" || a.name === "HN");
    bb.push({
      chain: n.chain,
      resSeq: n.resSeq,
      resName: n.resName,
      n: atomVec(n),
      ca: atomVec(ca),
      c: atomVec(c),
      o: atomVec(o),
      h: hAtom ? atomVec(hAtom) : null,
    });
  }
  bb.sort((a, b) => a.chain.localeCompare(b.chain) || a.resSeq - b.resSeq);
  for (let i = 0; i < bb.length; i++) {
    const cur = bb[i]!;
    if (cur.h) continue;
    const prev = i > 0 && bb[i - 1]!.chain === cur.chain && cur.resSeq - bb[i - 1]!.resSeq <= 2 ? bb[i - 1] : null;
    if (!prev) continue;
    const v1 = norm(sub(cur.n, prev.c));
    const v2 = norm(sub(cur.n, cur.ca));
    cur.h = add(cur.n, scale(norm(add(v1, v2)), 1.01));
  }
  return bb;
}

function hbondEnergy(donor: Backbone, acceptor: Backbone): number {
  const h = donor.h;
  if (!h) return 0;
  const rON = vdist(acceptor.o, donor.n);
  const rCH = vdist(acceptor.c, h);
  const rOH = vdist(acceptor.o, h);
  const rCN = vdist(acceptor.c, donor.n);
  if (rON < 0.5 || rCH < 0.5 || rOH < 0.5 || rCN < 0.5) return 0;
  if (rOH > 5.2) return 0;
  return Q1Q2F * (1 / rON + 1 / rCH - 1 / rOH - 1 / rCN);
}

function isHbonded(donor: Backbone, acceptor: Backbone): boolean {
  if (hbondEnergy(donor, acceptor) < HBOND_CUT) return true;
  const rNO = vdist(acceptor.o, donor.n);
  if (rNO > 3.5 || rNO < 2.2) return false;
  const vCO = sub(acceptor.o, acceptor.c);
  const vON = sub(donor.n, acceptor.o);
  const denom = (nrm(vCO) || 1) * (nrm(vON) || 1);
  const cos = dot(vCO, vON) / denom;
  const angle = Math.acos(Math.max(-1, Math.min(1, cos))) * (180 / Math.PI);
  return angle > 95;
}

export function assignSecondaryStructure(atoms: Atom[]): SSAnalysis {
  const bb = buildBackbone(atoms);
  const n = bb.length;
  const bonded = Array.from({ length: n }, () => new Uint8Array(n));
  const bestE = new Float64Array(n);

  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      if (i === j) continue;
      if (bb[i]!.chain !== bb[j]!.chain) continue;
      const e = hbondEnergy(bb[i]!, bb[j]!);
      if (isHbonded(bb[i]!, bb[j]!)) {
        bonded[i]![j] = 1;
        if (e < bestE[i]!) bestE[i] = e;
      }
    }
  }

  const ss: SSCode[] = Array.from({ length: n }, () => "C");

  const markHelix = (offset: number, code: SSCode) => {
    const turns = new Uint8Array(n);
    for (let i = 0; i < n - offset; i++) {
      if (bb[i]!.chain !== bb[i + offset]!.chain) continue;
      if (bonded[i + offset]![i]) turns[i] = 1;
    }
    for (let i = 0; i < n - 1; i++) {
      if (turns[i] && turns[i + 1]) {
        for (let k = 0; k <= offset; k++) {
          if (i + k < n && ss[i + k] === "C") ss[i + k] = code;
        }
      }
    }
  };
  markHelix(4, "H");
  markHelix(3, "G");
  markHelix(5, "I");

  for (let i = 0; i < n; i++) {
    for (let j = i + 3; j < n; j++) {
      if (bb[i]!.chain !== bb[j]!.chain) continue;
      const anti = (bonded[i]![j] && bonded[j]![i]) || (i + 1 < n && j > 0 && bonded[i]![j - 1] && bonded[j]![i + 1]);
      const para =
        (j + 1 < n && bonded[i]![j] && bonded[j + 1]![i]) ||
        (i + 1 < n && j + 1 < n && bonded[i + 1]![j] && bonded[j + 1]![i]);
      if (anti || para) {
        if (ss[i] === "C" || ss[i] === "T") ss[i] = "E";
        if (ss[j] === "C" || ss[j] === "T") ss[j] = "E";
      }
    }
  }

  for (let i = 0; i < n - 3; i++) {
    if (ss[i] !== "C") continue;
    if (bb[i]!.chain !== bb[i + 3]!.chain) continue;
    if (bonded[i + 3]![i]) {
      for (let k = 0; k <= 3; k++) if (ss[i + k] === "C") ss[i + k] = "T";
    }
  }

  // Ramachandran fill for isolated coil inside helical phi/psi stretches
  const phi: (number | null)[] = Array.from({ length: n }, () => null);
  const psi: (number | null)[] = Array.from({ length: n }, () => null);
  for (let i = 0; i < n; i++) {
    const cur = bb[i]!;
    const prev = i > 0 && bb[i - 1]!.chain === cur.chain ? bb[i - 1] : null;
    const next = i + 1 < n && bb[i + 1]!.chain === cur.chain ? bb[i + 1] : null;
    if (prev) phi[i] = dihedral(prev.c, cur.n, cur.ca, cur.c);
    if (next) psi[i] = dihedral(cur.n, cur.ca, cur.c, next.n);
  }

  const helical = (i: number) => {
    const p = phi[i];
    const s = psi[i];
    return p !== null && s !== null && p < -30 && p > -90 && s < 0 && s > -80;
  };
  const beta = (i: number) => {
    const p = phi[i];
    const s = psi[i];
    return p !== null && s !== null && p < -70 && s > 70;
  };

  let k = 0;
  while (k < n) {
    const chain = bb[k]!.chain;
    if (helical(k)) {
      let j = k;
      while (j < n && bb[j]!.chain === chain && helical(j)) j++;
      if (j - k >= 4) {
        for (let t = k; t < j; t++) {
          if (ss[t] === "C" || ss[t] === "T") ss[t] = "H";
        }
      }
      k = j;
      continue;
    }
    if (beta(k)) {
      let j = k;
      while (j < n && bb[j]!.chain === chain && beta(j)) j++;
      if (j - k >= 3) {
        for (let t = k; t < j; t++) {
          if (ss[t] === "C" || ss[t] === "T") ss[t] = "E";
        }
      }
      k = j;
      continue;
    }
    k++;
  }

  const residues: ResidueSS[] = bb.map((b, i) => ({
    chain: b.chain,
    resSeq: b.resSeq,
    resName: b.resName,
    ss: ss[i]!,
    phi: phi[i]!,
    psi: psi[i]!,
    energyBest: bestE[i]!,
  }));

  const composition = { helix: 0, sheet: 0, turn: 0, coil: 0 };
  for (const r of residues) composition[ssGroup(r.ss)] += 1;
  const total = residues.length || 1;
  const percents = {
    helix: (composition.helix / total) * 100,
    sheet: (composition.sheet / total) * 100,
    turn: (composition.turn / total) * 100,
    coil: (composition.coil / total) * 100,
  };

  let helixCount = 0;
  let strandCount = 0;
  let helixResidues = 0;
  let i = 0;
  while (i < n) {
    const g = ssGroup(ss[i]!);
    let j = i;
    while (j < n && ssGroup(ss[j]!) === g && bb[j]!.chain === bb[i]!.chain) j++;
    const len = j - i;
    if (g === "helix" && len >= 3) {
      helixCount += 1;
      helixResidues += len;
    }
    if (g === "sheet" && len >= 2) strandCount += 1;
    i = j;
  }

  const byKey = new Map<string, ResidueSS>();
  for (const r of residues) byKey.set(`${r.chain}:${r.resSeq}`, r);

  return {
    residues,
    byKey,
    composition,
    percents,
    helixCount,
    strandCount,
    meanHelixLength: helixCount ? helixResidues / helixCount : 0,
    chainIds: [...new Set(residues.map((r) => r.chain))],
  };
}
