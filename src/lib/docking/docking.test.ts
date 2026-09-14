import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import { aaClass, chargeForAtom, hydropathy, prettyResidue, rwbColor } from "./chemistry.ts";
import {
  affinityTableTsv,
  buildAffinityChart,
  canonicalLigandName,
  detectEngine,
  matchLigandToExisting,
  parseAffinityText,
} from "./engines.ts";
import { parseAtom, parseAtoms } from "./pdb.ts";
import { packScene, clampSpan, clampHeight, looksLegacySpans, migrateLegacySpan } from "./scene-layout.ts";
import { bandResidues, buildFingerprint, fingerprintPlateLayout, residueTag } from "./fingerprint.ts";
import { commonContacts, tabulateResidues } from "./interactions.ts";
import { buildSketch, meanRingAngle } from "./sketch-2d.ts";
import type { SketchInput } from "./sketch-2d.ts";
import type { Interaction } from "./interactions.ts";

test("pretty residue labels drop chain A", () => {
  assert.equal(prettyResidue("SER", 70), "Ser70");
  assert.equal(prettyResidue("SER", 70, "A"), "Ser70");
  assert.equal(prettyResidue("SER", 70, "B"), "Ser70.B");
});

test("amino-acid classes", () => {
  assert.equal(aaClass("ASP"), "acidic");
  assert.equal(aaClass("LYS"), "basic");
  assert.equal(aaClass("PHE"), "aromatic");
  assert.equal(aaClass("VAL"), "hydrophobic");
  assert.equal(aaClass("GLY"), "special");
  assert.equal(aaClass("HOH"), "water");
  assert.equal(aaClass("LIG"), "ligand");
});

test("Kyte–Doolittle signs", () => {
  assert.ok(hydropathy("ILE") > 0);
  assert.ok(hydropathy("ARG") < 0);
});

test("formal charges at pH 7", () => {
  assert.equal(chargeForAtom("LYS", "NZ", false, false), 1);
  assert.equal(chargeForAtom("ASP", "OD1", false, false), -0.5);
  assert.equal(chargeForAtom("ALA", "N", true, false), 1);
});

test("rwb interpolates to hex", () => {
  assert.match(rwbColor(-1, -1, 1), /^#[0-9a-f]{6}$/);
  assert.match(rwbColor(0, -1, 1), /^#[0-9a-f]{6}$/);
});

test("detects docking engines from names and remarks", () => {
  assert.equal(detectEngine("4ZBE_OX-11_complex.pdb", "GNINA best pose affinity -6.54"), "GNINA");
  assert.equal(detectEngine("complex_vina_best.pdb", "REMARK VINA RESULT: -7.20"), "AutoDock Vina");
  assert.equal(detectEngine("pose_glide.pdb", "GlideScore = -8.1"), "Glide");
  assert.equal(detectEngine("unknown.pdb", ""), "Unknown");
});

test("filename engine beats remarks from another program", () => {
  assert.equal(
    detectEngine("4ZBE_OX-11_vina.pdb", "GNINA best pose affinity -6.54"),
    "AutoDock Vina",
  );
  assert.equal(
    parseAffinityText("REMARK VINA RESULT: -7.20\naffinity -6.54 kcal/mol", "AutoDock Vina"),
    -7.2,
  );
});

test("parses affinity from common remark styles", () => {
  assert.equal(parseAffinityText("affinity -6.54 kcal/mol"), -6.54);
  assert.equal(parseAffinityText("REMARK VINA RESULT: -7.2"), -7.2);
  assert.equal(parseAffinityText("Estimated Free Energy of Binding = -9.11"), -9.11);
  assert.equal(parseAffinityText("GlideScore: -8.05"), -8.05);
});

test("affinity chart groups ligands across engines", () => {
  const model = buildAffinityChart([
    { ligand: "OX-11", engine: "GNINA", affinity: -6.54 },
    { ligand: "OX11", engine: "AutoDock Vina", affinity: -7.1 },
    { ligand: "T2Z14", engine: "GNINA", affinity: -5.63 },
    { ligand: "T2Z14", engine: "AutoDock Vina", affinity: -6.2 },
    { ligand: "OX-11", engine: "GNINA", affinity: -5.9 },
  ]);
  assert.deepEqual(model.ligands, ["OX-11", "T2Z14"]);
  assert.deepEqual(model.engines, ["GNINA", "AutoDock Vina"]);
  assert.equal(model.rows[0]?.GNINA, -6.54);
  assert.equal(model.rows[0]?.["AutoDock Vina"], -7.1);
  assert.equal(model.scored, 5);
  const tsv = affinityTableTsv(model);
  assert.match(tsv, /GNINA \(kcal\/mol\)/);
  assert.match(tsv, /AutoDock Vina \(kcal\/mol\)/);
});

test("canonical ligand names match OX-11 aliases onto an existing pose", () => {
  assert.equal(canonicalLigandName("4ZBE_OX11_vina.pdb", "UNL"), "OX-11");
  assert.equal(
    matchLigandToExisting("pose_ox-11_glide.pdb", "LIG", [
      { filename: "4ZBE_OX-11_complex.pdb", fallbackLabel: "OX-11", display: "OX-11" },
    ]),
    "OX-11",
  );
});

test("scene pack wraps panels onto the next row of a 12-column plate", () => {
  const packed = packScene([
    { id: "ss", span: 12 },
    { id: "a", span: 4 },
    { id: "b", span: 4 },
    { id: "c", span: 4 },
    { id: "chart", span: 12 },
  ]);
  assert.equal(packed.rows, 3);
  assert.equal(packed.cells[0]?.span, 12);
  assert.equal(packed.cells[1]?.row, 1);
  assert.equal(packed.cells[3]?.col, 8);
  assert.equal(packed.cells[4]?.row, 2);
});

test("wide panels wrap instead of overflowing the plate", () => {
  const packed = packScene([
    { id: "a", span: 8 },
    { id: "b", span: 8 },
  ]);
  assert.equal(packed.rows, 2);
  assert.equal(packed.cells[1]?.col, 0);
});

test("legacy 3-column spans migrate to twelfths", () => {
  assert.equal(looksLegacySpans([{ span: 1 }, { span: 3 }]), true);
  assert.equal(looksLegacySpans([{ span: 4 }, { span: 12 }]), false);
  assert.equal(migrateLegacySpan(1), 4);
  assert.equal(migrateLegacySpan(2), 8);
  assert.equal(migrateLegacySpan(3), 12);
  assert.equal(clampSpan(0), 1);
  assert.equal(clampSpan(99), 12);
  assert.equal(clampHeight(10), 120);
  assert.equal(clampHeight(900), 720);
});

test("png data URLs need payload", () => {
  const isPngDataUrl = (uri: string | null | undefined): uri is string =>
    !!uri && uri.startsWith("data:image/") && uri.length > 800;
  assert.equal(isPngDataUrl(null), false);
  assert.equal(isPngDataUrl("data:image/png;base64,abc"), false);
  assert.equal(isPngDataUrl(`data:image/png;base64,${"A".repeat(900)}`), true);
});

function hit(resName: string, resSeq: number, type: Interaction["type"] = "hbond"): Interaction {
  return {
    type,
    chain: "A",
    resSeq,
    resName,
    residueAtom: "OG",
    ligandAtom: "O1",
    distance: 2.9,
    start: { x: 0, y: 0, z: 0 },
    end: { x: 1, y: 0, z: 0 },
  };
}

test("fingerprint keeps every residue in sequence order", () => {
  const residues = Array.from({ length: 22 }, (_, i) => hit(i % 2 ? "LEU" : "SER", 70 + i, "hydrophobic"));
  residues.push(hit("THR", 237, "hbond"));
  const fp = buildFingerprint([
    { poseId: "ox", hits: residues },
    { poseId: "t2z", hits: [hit("SER", 70), hit("ALA", 100, "hydrophobic")] },
  ]);
  assert.equal(fp.residues.length, 24);
  assert.equal(fp.residues[0], "Ser70");
  assert.equal(fp.residues[1], "Leu71");
  assert.ok(fp.residues.includes("Ala100"));
  assert.equal(fp.residues.at(-1), "Thr237");
  assert.equal(residueTag("B", 12, "GLU"), "Glu12.B");
  const bands = bandResidues(fp.residues, 10);
  assert.equal(bands.length, 3);
  assert.equal(bands[0]?.length, 10);
  assert.equal(bands[2]?.length, 4);
  assert.equal(bands.flat().length, 24);
});

test("publication fingerprint plate keeps every residue in one band", () => {
  const wide = fingerprintPlateLayout(24, 3, 2200);
  assert.equal(wide.perBand, 24);
  assert.equal(wide.bands, 1);
  assert.ok(wide.cell >= 28);
  const tight = fingerprintPlateLayout(80, 4, 2200);
  assert.ok(tight.bands >= 2);
  const tags = Array.from({ length: 80 }, (_, i) => `R${i}`);
  assert.equal(bandResidues(tags, tight.perBand).flat().length, 80);
});

test("residue table is one row per residue in sequence", () => {
  const rows = tabulateResidues([
    hit("SER", 70, "hbond"),
    hit("SER", 70, "hydrophobic"),
    hit("ALA", 100, "hydrophobic"),
    hit("ASN", 99, "hbond"),
  ]);
  assert.equal(rows.length, 3);
  assert.equal(rows[0]?.resName, "SER");
  assert.equal(rows[1]?.resName, "ASN");
  assert.equal(rows[2]?.resName, "ALA");
  assert.ok(rows[0]?.types.includes("hbond"));
  assert.ok(rows[0]?.types.includes("hydrophobic"));
});

test("common contacts keep residues shared by every pose", () => {
  const shared = [
    hit("SER", 70, "hbond"),
    hit("THR", 237, "hbond"),
  ];
  const common = commonContacts([
    { poseId: "ox", hits: [...shared, hit("LEU", 166, "hydrophobic")] },
    { poseId: "t2z", hits: [...shared, hit("GLU", 109, "salt")] },
  ]);
  assert.equal(common.length, 2);
  assert.equal(common[0]?.resName, "SER");
  assert.equal(common[1]?.resName, "THR");
});

function fakeAtom(element: string, x: number, y: number, z: number, name: string): SketchInput {
  return { element, name, x, y, z };
}

function benzene(): SketchInput[] {
  return Array.from({ length: 6 }, (_, i) => {
    const ang = (i * Math.PI) / 3;
    return fakeAtom("C", 1.39 * Math.cos(ang), 1.39 * Math.sin(ang), 0.02 * (i % 2), `C${i + 1}`);
  });
}

test("benzene sketch is a hexagon with six bonds", () => {
  const sketch = buildSketch(benzene(), "schematic");
  assert.equal(sketch.atoms.length, 6);
  assert.equal(sketch.bonds.length, 6);
  assert.equal(sketch.rings.length, 1);
  assert.equal(sketch.rings[0]?.length, 6);
  assert.ok(sketch.bonds.every((b) => b.aromatic));
  const doubles = sketch.bonds.filter((b) => b.order === 2).length;
  const singles = sketch.bonds.filter((b) => b.order === 1).length;
  assert.equal(doubles, 3);
  assert.equal(singles, 3);
  const ang = meanRingAngle(sketch);
  assert.ok(ang > 114 && ang < 126, `ring angle ${ang}`);
  assert.equal(sketch.formula, "C6H6");
  assert.ok(sketch.smiles && /c1ccccc1/i.test(sketch.smiles.replace(/\s/g, "")), sketch.smiles);
  assert.ok(sketch.svg && sketch.svg.includes("<svg"), "OpenChemLib SVG depiction");
});

test("schematic and pose 2D flatten a chair to a hexagon", () => {
  const chair: SketchInput[] = [
    fakeAtom("C", 1.256, -0.726, 0.255, "C1"),
    fakeAtom("C", 1.256, 0.726, -0.255, "C2"),
    fakeAtom("C", 0.0, 1.251, 0.255, "C3"),
    fakeAtom("C", -1.256, 0.726, -0.255, "C4"),
    fakeAtom("C", -1.256, -0.726, 0.255, "C5"),
    fakeAtom("C", 0.0, -1.251, -0.255, "C6"),
  ];
  const pose = buildSketch(chair, "pose");
  const schematic = buildSketch(chair, "schematic");
  assert.equal(pose.bonds.length, 6);
  assert.equal(schematic.bonds.length, 6);
  const schAng = meanRingAngle(schematic);
  const poseAng = meanRingAngle(pose);
  assert.ok(schAng > 114 && schAng < 126, `schematic angle ${schAng}`);
  assert.ok(poseAng > 108 && poseAng < 132, `pose angle ${poseAng}`);
});

test("phenol has an OH label and a C–O bond", () => {
  const atoms = benzene();
  atoms.push(fakeAtom("O", 1.39 + 1.36, 0, 0, "O1"));
  const sketch = buildSketch(atoms, "schematic");
  const oxygen = sketch.atoms.find((a) => a.element === "O");
  assert.ok(oxygen);
  assert.equal(oxygen?.label, "OH");
  assert.ok(sketch.bonds.some((b) => {
    const el = `${sketch.atoms[b.i]!.element}${sketch.atoms[b.j]!.element}`;
    return el === "CO" || el === "OC";
  }));
});

test("Amber atom types in the element column are not sodium", () => {
  const line =
    "HETATM 1949  N   T2Z B   1      22.274 -34.914   5.722  0.00  0.00    -0.164NaA ";
  const atom = parseAtom(line);
  assert.equal(atom?.element, "N");
});

test("OX-11 from a hydrogenated pose is C20H21N7O4S with an oxadiazole", () => {
  const pdb = readFileSync("public/structures/2OV5_OX11_complex.pdb", "utf8");
  const ligand = parseAtoms(pdb).filter((a) => a.record === "HETATM" && a.resName === "LIG");
  const sketch = buildSketch(ligand, "schematic");
  assert.equal(sketch.formula, "C20H21N7O4S");
  assert.ok(sketch.smiles && /nnc/i.test(sketch.smiles), sketch.smiles);
  assert.ok(sketch.smiles && !/n\[nH\]/i.test(sketch.smiles), sketch.smiles);
  const ringN = sketch.atoms.filter((a) => a.element === "N" && a.label === "NH");
  assert.equal(ringN.length, 1, "only the amide NH is labeled NH");
  assert.ok(sketch.svg && sketch.svg.includes("<svg"));
});
