import { aaClass, STANDARD_AA, type AAClass } from "./chemistry";
import {
  isIonRes,
  isLigandHet,
  isWaterRes,
  parseAtoms,
  parseGnina,
  type Atom,
  type GninaMeta,
} from "./pdb";

export type ResidueKind = "protein" | "ligand" | "water" | "ion" | "other";

export type Residue = {
  key: string;
  chain: string;
  resSeq: number;
  resName: string;
  kind: ResidueKind;
  aaClass: AAClass;
  atoms: Atom[];
  ca: Atom | null;
};

export type ChainInfo = {
  id: string;
  residues: Residue[];
  proteinResidues: Residue[];
  atomCount: number;
  sequence: string;
};

export type HetGroup = {
  key: string;
  resName: string;
  chain: string;
  resSeq: number;
  kind: ResidueKind;
  atomCount: number;
  formula: string;
};

export type Inventory = {
  meta: GninaMeta;
  atoms: Atom[];
  chains: ChainInfo[];
  residues: Residue[];
  ligands: HetGroup[];
  waters: HetGroup[];
  ions: HetGroup[];
  proteinAtomCount: number;
  hetatmCount: number;
  residueCount: number;
};

function kindOf(atom: Atom): ResidueKind {
  if (atom.record === "ATOM" || STANDARD_AA.has(atom.resName)) return "protein";
  if (isWaterRes(atom.resName)) return "water";
  if (isIonRes(atom.resName)) return "ion";
  if (isLigandHet(atom)) return "ligand";
  return "other";
}

export function buildInventory(pdb: string, filename = ""): Inventory {
  const atoms = parseAtoms(pdb);
  const meta = parseGnina(pdb, filename);
  const grouped = new Map<string, Atom[]>();
  for (const atom of atoms) {
    const key = `${atom.chain}:${atom.resSeq}:${atom.resName}`;
    const list = grouped.get(key);
    if (list) list.push(atom);
    else grouped.set(key, [atom]);
  }

  const residues: Residue[] = [];
  for (const [key, resAtoms] of grouped) {
    const head = resAtoms[0]!;
    const k = kindOf(head);
    residues.push({
      key,
      chain: head.chain,
      resSeq: head.resSeq,
      resName: head.resName,
      kind: k,
      aaClass: aaClass(head.resName),
      atoms: resAtoms,
      ca: resAtoms.find((a) => a.name === "CA") ?? null,
    });
  }
  residues.sort((a, b) => a.chain.localeCompare(b.chain) || a.resSeq - b.resSeq);

  const chainIds = [...new Set(residues.map((r) => r.chain))];
  const chains: ChainInfo[] = chainIds.map((id) => {
    const cr = residues.filter((r) => r.chain === id);
    const proteinResidues = cr.filter((r) => r.kind === "protein");
    return {
      id,
      residues: cr,
      proteinResidues,
      atomCount: cr.reduce((n, r) => n + r.atoms.length, 0),
      sequence: proteinResidues
        .map((r) => {
          const map: Record<string, string> = {
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
            MSE: "M",
          };
          return map[r.resName] ?? "X";
        })
        .join(""),
    };
  });

  const toHet = (r: Residue): HetGroup => ({
    key: r.key,
    resName: r.resName,
    chain: r.chain,
    resSeq: r.resSeq,
    kind: r.kind,
    atomCount: r.atoms.filter((a) => a.element !== "H").length,
    formula: formulaOf(r.atoms),
  });

  const ligands = residues.filter((r) => r.kind === "ligand").map(toHet);
  ligands.sort((a, b) => b.atomCount - a.atomCount);

  return {
    meta,
    atoms,
    chains,
    residues,
    ligands,
    waters: residues.filter((r) => r.kind === "water").map(toHet),
    ions: residues.filter((r) => r.kind === "ion").map(toHet),
    proteinAtomCount: atoms.filter((a) => a.record === "ATOM").length,
    hetatmCount: atoms.filter((a) => a.record === "HETATM").length,
    residueCount: residues.filter((r) => r.kind === "protein").length,
  };
}

function formulaOf(atoms: Atom[]): string {
  const counts = new Map<string, number>();
  for (const a of atoms) {
    if (a.element === "H") continue;
    counts.set(a.element, (counts.get(a.element) ?? 0) + 1);
  }
  const order = ["C", "N", "O", "P", "S", "F", "Cl", "Br", "I"];
  const keys = [...counts.keys()].sort((a, b) => {
    const ia = order.indexOf(a);
    const ib = order.indexOf(b);
    if (ia === -1 && ib === -1) return a.localeCompare(b);
    if (ia === -1) return 1;
    if (ib === -1) return -1;
    return ia - ib;
  });
  return keys.map((el) => `${el}${counts.get(el) === 1 ? "" : counts.get(el)}`).join("");
}

export function proteinAtoms(inv: Inventory): Atom[] {
  return inv.atoms.filter((a) => a.record === "ATOM");
}

export function ligandAtoms(inv: Inventory): Atom[] {
  return inv.atoms.filter(isLigandHet);
}

export function primaryLigand(inv: Inventory): HetGroup | null {
  return inv.ligands[0] ?? null;
}
