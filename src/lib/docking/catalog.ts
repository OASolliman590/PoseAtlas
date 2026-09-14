export type PoseId = "native" | "ox11" | "t2z14";

export type Pose = {
  id: PoseId;
  label: string;
  ligandName: string;
  ligandCode: string;
  file: string;
  affinity: number | null;
  poseRank: number | null;
  netCharge: number | null;
  formula: string;
};

export type Target = {
  id: string;
  pdbId: string;
  gene: string;
  protein: string;
  family: string;
  description: string;
  oligomer: string;
  poses: Record<PoseId, Pose>;
};

const OX11 = {
  ligandName: "OX-11",
  ligandCode: "OX11",
  formula: "C₂₀H₂₁N₇O₄S",
} as const;

const T2Z14 = {
  ligandName: "T2Z14",
  ligandCode: "T2Z14",
  formula: "C₂₈H₂₆BrN₁₁O₃",
} as const;

function pose(
  id: PoseId,
  label: string,
  ligandName: string,
  ligandCode: string,
  file: string,
  formula: string,
  affinity: number | null,
  poseRank: number | null,
  netCharge: number | null,
): Pose {
  return {
    id,
    label,
    ligandName,
    ligandCode,
    file: `/structures/${file}`,
    affinity,
    poseRank,
    netCharge,
    formula,
  };
}

export const TARGETS: Target[] = [
  {
    id: "4zbe",
    pdbId: "4ZBE",
    gene: "blaKPC-2",
    protein: "KPC-2 carbapenemase",
    family: "Class A β-lactamase",
    oligomer: "monomer",
    description:
      "Avibactam-bound KPC-2 from Klebsiella pneumoniae. OX-11 is the strongest GNINA pose here, ahead of both T2Z14 and re-docked avibactam.",
    poses: {
      native: pose(
        "native",
        "Avibactam",
        "Avibactam",
        "NXL",
        "4ZBE_NXL_complex.pdb",
        "C₇H₁₁N₃O₆S",
        -5.48,
        2,
        0,
      ),
      ox11: pose(
        "ox11",
        "OX-11",
        OX11.ligandName,
        OX11.ligandCode,
        "4ZBE_OX-11_complex.pdb",
        OX11.formula,
        -6.54,
        4,
        0,
      ),
      t2z14: pose(
        "t2z14",
        "T2Z14",
        T2Z14.ligandName,
        T2Z14.ligandCode,
        "4ZBE_T2Z14_complex.pdb",
        T2Z14.formula,
        -5.63,
        10,
        0,
      ),
    },
  },
  {
    id: "2ov5",
    pdbId: "2OV5",
    gene: "blaKPC-2",
    protein: "KPC-2 carbapenemase",
    family: "Class A β-lactamase",
    oligomer: "trimer",
    description:
      "Apo crystal of KPC-2 used as an alternate receptor. OX-11 again leads avibactam (NXL) and T2Z14, with a narrower margin than on 4ZBE.",
    poses: {
      native: pose(
        "native",
        "Avibactam",
        "Avibactam",
        "NXL",
        "2OV5_NXL_complex.pdb",
        "C₇H₁₁N₃O₆S",
        -5.97,
        14,
        0,
      ),
      ox11: pose(
        "ox11",
        "OX-11",
        OX11.ligandName,
        OX11.ligandCode,
        "2OV5_OX11_complex.pdb",
        OX11.formula,
        -6.42,
        17,
        0,
      ),
      t2z14: pose(
        "t2z14",
        "T2Z14",
        T2Z14.ligandName,
        T2Z14.ligandCode,
        "2OV5_T2Z14_complex.pdb",
        T2Z14.formula,
        -6.04,
        1,
        0,
      ),
    },
  },
  {
    id: "6ll5",
    pdbId: "6LL5",
    gene: "ftsZ",
    protein: "Cell-division protein FtsZ",
    family: "Tubulin-like GTPase",
    oligomer: "monomer",
    description:
      "Klebsiella FtsZ (residues 11–316) with the nucleotide site occupied. Native GDP outscores both candidates; T2Z14 is closer than OX-11.",
    poses: {
      native: pose(
        "native",
        "GDP",
        "GDP",
        "GDP",
        "6LL5_GDP_complex.pdb",
        "C₁₀H₁₅N₅O₁₁P₂",
        -7.57,
        8,
        -3,
      ),
      ox11: pose(
        "ox11",
        "OX-11",
        OX11.ligandName,
        OX11.ligandCode,
        "6LL5_OX11_complex.pdb",
        OX11.formula,
        -6.43,
        16,
        0,
      ),
      t2z14: pose(
        "t2z14",
        "T2Z14",
        T2Z14.ligandName,
        T2Z14.ligandCode,
        "6LL5_T2Z14_complex.pdb",
        T2Z14.formula,
        -6.66,
        12,
        0,
      ),
    },
  },
  {
    id: "7myl",
    pdbId: "7MYL",
    gene: "dfrA1",
    protein: "Dihydrofolate reductase DfrA1",
    family: "Trimethoprim-resistant DHFR",
    oligomer: "monomer",
    description:
      "Plasmid-encoded DfrA1 in complex with trimethoprim. Candidate poses are provided without GNINA affinities.",
    poses: {
      native: pose(
        "native",
        "Trimethoprim",
        "Trimethoprim",
        "TOP",
        "7MYL_native_TOP_trimethoprim_best_pose.pdb",
        "C₁₄H₁₈N₄O₃",
        null,
        null,
        null,
      ),
      ox11: pose(
        "ox11",
        "OX-11",
        OX11.ligandName,
        OX11.ligandCode,
        "7MYL_OX-11_best_pose.pdb",
        OX11.formula,
        null,
        null,
        null,
      ),
      t2z14: pose(
        "t2z14",
        "T2Z14",
        T2Z14.ligandName,
        T2Z14.ligandCode,
        "7MYL_T2Z14_best_pose.pdb",
        T2Z14.formula,
        null,
        null,
        null,
      ),
    },
  },
  {
    id: "8qk2",
    pdbId: "8QK2",
    gene: "lpxH",
    protein: "UDP-2,3-diacylglucosamine hydrolase",
    family: "Lipid A biosynthesis",
    oligomer: "monomer",
    description:
      "LpxH bound to EBL-3339 (VTF), a lipid A pathway inhibitor. Candidate poses are provided without GNINA affinities.",
    poses: {
      native: pose(
        "native",
        "EBL-3339",
        "EBL-3339",
        "VTF",
        "8QK2_native_VTF_best_pose.pdb",
        "VTF",
        null,
        null,
        null,
      ),
      ox11: pose(
        "ox11",
        "OX-11",
        OX11.ligandName,
        OX11.ligandCode,
        "8QK2_OX-11_best_pose.pdb",
        OX11.formula,
        null,
        null,
        null,
      ),
      t2z14: pose(
        "t2z14",
        "T2Z14",
        T2Z14.ligandName,
        T2Z14.ligandCode,
        "8QK2_T2Z14_best_pose.pdb",
        T2Z14.formula,
        null,
        null,
        null,
      ),
    },
  },
  {
    id: "9l5x",
    pdbId: "9L5X",
    gene: "fabI",
    protein: "Enoyl-ACP reductase FabI",
    family: "Fatty-acid biosynthesis",
    oligomer: "monomer",
    description:
      "FabI in complex with triclosan. Candidate poses are provided without GNINA affinities.",
    poses: {
      native: pose(
        "native",
        "Triclosan",
        "Triclosan",
        "TCL",
        "9L5X_native_TCL_triclosan_best_pose.pdb",
        "C₁₂H₇Cl₃O₂",
        null,
        null,
        null,
      ),
      ox11: pose(
        "ox11",
        "OX-11",
        OX11.ligandName,
        OX11.ligandCode,
        "9L5X_OX-11_best_pose.pdb",
        OX11.formula,
        null,
        null,
        null,
      ),
      t2z14: pose(
        "t2z14",
        "T2Z14",
        T2Z14.ligandName,
        T2Z14.ligandCode,
        "9L5X_T2Z14_best_pose.pdb",
        T2Z14.formula,
        null,
        null,
        null,
      ),
    },
  },
];

export const POSE_IDS: PoseId[] = ["native", "ox11", "t2z14"];

export const POSE_COLOR: Record<PoseId, string> = {
  native: "#d6d3d1",
  ox11: "#2dd4bf",
  t2z14: "#e8a090",
};

export function formatAffinity(value: number | null): string {
  if (value === null) return "—";
  return `${value.toFixed(2)}`;
}

export function winnerOf(target: Target): PoseId | null {
  let best: PoseId | null = null;
  let bestVal = Infinity;
  for (const id of POSE_IDS) {
    const a = target.poses[id].affinity;
    if (a !== null && a < bestVal) {
      bestVal = a;
      best = id;
    }
  }
  return best;
}

export function scoredTargets(): Target[] {
  return TARGETS.filter((t) => POSE_IDS.some((id) => t.poses[id].affinity !== null));
}
