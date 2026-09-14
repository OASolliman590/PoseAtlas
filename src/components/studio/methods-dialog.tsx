import { Button } from "@/components/ui/button";

export function MethodsDialog({ onClose }: { onClose: () => void }) {
  return (
    <div
      className="fixed inset-0 z-[80] flex items-end justify-center bg-bg/70 p-3 sm:items-center"
      onClick={onClose}
      onKeyDown={(event) => {
        if (event.key === "Escape") onClose();
      }}
      role="presentation"
    >
      <div
        role="dialog"
        aria-labelledby="methods-title"
        className="relative z-[81] max-h-[80vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-border bg-surface p-5 shadow-xl sm:p-6"
        onClick={(event) => event.stopPropagation()}
      >
        <h2 id="methods-title" className="font-display text-2xl">
          How PoseAtlas reads a pose
        </h2>
        <div className="mt-4 space-y-3 text-sm leading-relaxed text-muted">
          <p>
            Load any protein–ligand PDB — a GNINA complex, a crystal structure, or a pose from
            another engine. PoseAtlas inventories chains, residues, and HETATM groups, then
            names you assign to the protein, domains, and ligands appear on every panel and
            in the figure caption.
          </p>
          <p>
            Secondary structure is assigned with a Kabsch–Sander DSSP: backbone N–H···O=C
            hydrogen-bond energies (E = 0.42·0.20·332·(1/r<sub>ON</sub>+1/r<sub>CH</sub>−1/r<sub>OH</sub>−1/r<sub>CN</sub>))
            below −0.5 kcal/mol define 3₁₀, α and π helices, β bridges, and turns. φ/ψ
            dihedrals feed the Ramachandran plot.
          </p>
          <p>
            Contacts follow a PLIP-style scheme: polar pairs ≤ 3.5 Å (H-bonds), charged
            pairs (salt bridges), carbon–carbon contacts in hydrophobic side chains,
            aromatic ring centroids (π-stacking / π-cation). The 3D scene shows side chains
            and polar dashes; hydrophobic contacts stay on the 2D map and fingerprint.
          </p>
          <p>
            The 2D drawings are cheminformatics, not a 3D snapshot. Heavy-atom
            bonds come from covalent radii; explicit hydrogens on the pose set
            valences so 1,3,4-oxadiazoles do not sprout an extra NH. OpenChemLib
            (Actelion) kekulizes, writes SMILES and the Hill formula, and invents
            ChemDraw-style coordinates. The contact map is that same 2D structure
            rotated onto the docked pose (Kabsch) so residue dashes keep their 3D
            direction. Flat tiles use the OpenChemLib SVG depiction.
          </p>
          <p>
            Pocket surfaces are solvent-accessible shells within 7.5 Å of the ligand.
            Electrostatics use a Coulombic sum over formal charges at pH 7 — a qualitative
            map, not APBS. Hydrophobic colouring is Kyte–Doolittle hydropathy.
          </p>
          <p>
            Affinities are read from REMARK lines (GNINA CNN, Vina RESULT, AutoDock ΔG, GlideScore,
            GOLD). You can type a score or engine name on any pose. Add engine uploads the same
            protein–ligand complex from another program; matching ligand names (OX-11 / OX11) are
            grouped automatically. Overlay draws the poses together. The affinity chart is grouped
            or overlapped by ligand × engine — Y-axis and table are labelled in kcal/mol. Copy
            exports a table with units; SVG downloads a white paper figure.
          </p>
          <p>
            Pose view is the engine for inspecting results: 3D, 2D map, and a tabulated residue
            list. Figures is the publication plate on white paper. To scene captures the 3D camera
            you framed (zoom and orientation are kept) and drops it on the plate; Download writes
            the same PNG. Add 2D, DSSP, affinity, common contacts (residues shared by every overlay
            pose), the residue table, or the fingerprint as separate panels — molecular views in
            one set, exhaustive tables in another. Export PNG is white paper. Drag edges to resize.
          </p>
          <p>
            The demo library is six Klebsiella pneumoniae receptors with native ligands plus
            OX-11 and T2Z14. Library affinities are GNINA CNN scores in kcal/mol at pH 7.4.
          </p>
          <p className="font-mono text-xs text-faint">
            Keys: 1–3 poses · [ ] library targets · O overlay · S spin · L labels · C chart
          </p>
        </div>
        <div className="mt-5 flex justify-end">
          <Button onClick={onClose}>Close</Button>
        </div>
      </div>
    </div>
  );
}
