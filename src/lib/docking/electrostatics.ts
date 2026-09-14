import { chargeForAtom, hydropathy, hydroColor, rwbColor, type ChargeCenter } from "./chemistry";
import type { Atom } from "./pdb";
import { dist } from "./pdb";

export function collectChargeCenters(atoms: Atom[]): ChargeCenter[] {
  const protein = atoms.filter((a) => a.record === "ATOM" && a.element !== "H");
  const byChain = new Map<string, Atom[]>();
  for (const a of protein) {
    const list = byChain.get(a.chain);
    if (list) list.push(a);
    else byChain.set(a.chain, [a]);
  }
  const centers: ChargeCenter[] = [];
  for (const [, chainAtoms] of byChain) {
    const seqs = [...new Set(chainAtoms.map((a) => a.resSeq))].sort((a, b) => a - b);
    const nTerm = seqs[0];
    const cTerm = seqs[seqs.length - 1];
    for (const a of chainAtoms) {
      const q = chargeForAtom(a.resName, a.name, a.resSeq === nTerm, a.resSeq === cTerm);
      if (Math.abs(q) < 0.05) continue;
      centers.push({
        x: a.x,
        y: a.y,
        z: a.z,
        q,
        resName: a.resName,
        chain: a.chain,
        resSeq: a.resSeq,
      });
    }
  }
  return centers;
}

export function coulombicColor(point: { x: number; y: number; z: number }, centers: ChargeCenter[]): string {
  let v = 0;
  for (const c of centers) {
    const r = dist(point, c);
    if (r < 0.9) continue;
    v += c.q / r;
  }
  return rwbColor(v, -0.35, 0.35);
}

export function residueHydroColor(resName: string): string {
  return hydroColor(hydropathy(resName));
}

export function pocketResidueKeys(protein: Atom[], ligand: Atom[], cutoff = 7.5): Set<string> {
  const keys = new Set<string>();
  const lig = ligand.filter((a) => a.element !== "H");
  const prot = protein.filter((a) => a.element !== "H" && a.record === "ATOM");
  for (const p of prot) {
    for (const l of lig) {
      if (dist(p, l) <= cutoff) {
        keys.add(`${p.chain}:${p.resSeq}`);
        break;
      }
    }
  }
  return keys;
}
