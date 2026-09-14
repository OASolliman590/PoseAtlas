import { useEffect, useRef, useState } from "react";
import { load3Dmol, PAPER_BG, setLastViewer, type MolLib, type MolViewer } from "@/lib/docking/mol-lib";
import type { FigureMode } from "@/lib/docking/session-store";
import type { ChargeCenter, SSCode } from "@/lib/docking/chemistry";
import { coulombicColor, residueHydroColor } from "@/lib/docking/electrostatics";
import type { Interaction } from "@/lib/docking/interactions";
import { splitComplex, stripHydrogens } from "@/lib/docking/pdb";
import { cn } from "@/lib/utils";

export type LigandLayer = {
  id: string;
  pdb: string;
  color: string;
  label: string;
};

type MolViewerProps = {
  proteinPdb: string | null;
  ligands: LigandLayer[];
  figureMode: FigureMode;
  spin: boolean;
  focus: "ligand" | "complex";
  interactions: Interaction[];
  ssByKey: Record<string, SSCode>;
  pocketKeys: string[];
  labelsOn: boolean;
  charges: ChargeCenter[];
  residueLabels: Record<string, string>;
  className?: string;
};

const SS_COLOR: Record<string, string> = {
  H: "#c97878",
  G: "#c97878",
  I: "#c97878",
  E: "#7a9ed4",
  T: "#6aaa8c",
  C: "#8a8c90",
};

const LINE_COLOR: Record<string, string> = {
  hbond: "#2dd4bf",
  salt: "#d97878",
  "pi-stack": "#e8a090",
  "pi-cation": "#e8a090",
};

export function MolCanvas({
  proteinPdb,
  ligands,
  figureMode,
  spin,
  focus,
  interactions,
  ssByKey,
  pocketKeys,
  labelsOn,
  charges,
  residueLabels,
  className,
}: MolViewerProps) {
  const hostRef = useRef<HTMLDivElement>(null);
  const libRef = useRef<MolLib | null>(null);
  const viewerRef = useRef<MolViewer | null>(null);
  const spinRef = useRef(spin);
  const generationRef = useRef(0);
  const viewRef = useRef<unknown>(null);
  const structKeyRef = useRef("");
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const [message, setMessage] = useState("Loading viewer");
  const ligandKey = ligands.map((layer) => `${layer.id}:${layer.pdb.length}`).join("|");
  const hitKey = interactions.map((h) => `${h.type}:${h.chain}:${h.resSeq}`).join("|");
  const pocketKey = pocketKeys.join(",");

  spinRef.current = spin;

  useEffect(() => {
    const el = hostRef.current;
    if (!el) return;
    let cancelled = false;
    let observer: ResizeObserver | null = null;

    load3Dmol()
      .then((lib) => {
        if (cancelled || !hostRef.current) return;
        libRef.current = lib;
        el.innerHTML = "";
        const viewer = lib.createViewer(el, {
          backgroundColor: PAPER_BG,
          antialias: true,
          cartoonQuality: 10,
          preserveDrawingBuffer: true,
        });
        viewerRef.current = viewer;
        setLastViewer(viewer);
        viewer.setViewChangeCallback?.((view) => {
          viewRef.current = view;
        });
        el.querySelectorAll("canvas").forEach((canvas) => {
          const node = canvas as HTMLElement;
          node.style.zIndex = "0";
          node.style.position = "absolute";
        });
        setStatus("ready");
        observer = new ResizeObserver(() => {
          try {
            viewer.resize();
            viewer.render();
          } catch {
            /* viewer may be tearing down */
          }
        });
        observer.observe(el);
      })
      .catch((err: Error) => {
        if (cancelled) return;
        setStatus("error");
        setMessage(err.message);
      });

    return () => {
      cancelled = true;
      observer?.disconnect();
      try {
        viewerRef.current?.spin(false);
        viewerRef.current?.clear();
      } catch {
        /* ignore */
      }
      if (viewerRef.current) setLastViewer(null);
      viewerRef.current = null;
    };
  }, []);

  useEffect(() => {
    const viewer = viewerRef.current;
    const lib = libRef.current;
    if (!viewer || !lib || status !== "ready") return;
    if (!proteinPdb) return;

    const generation = ++generationRef.current;
    viewer.spin(false);
    viewer.removeAllModels();
    try {
      viewer.removeAllSurfaces();
    } catch {
      /* empty */
    }
    try {
      viewer.removeAllLabels?.();
    } catch {
      /* empty */
    }
    try {
      viewer.removeAllShapes?.();
    } catch {
      /* empty */
    }

    const protein = stripHydrogens(splitComplex(proteinPdb).protein);
    viewer.addModel(protein, "pdb");

    const ssLookup = ssByKey;
    const ssColorFn = (atom: { chain?: string; resi?: number; ss?: string }) => {
      const key = `${atom.chain ?? "A"}:${atom.resi ?? 0}`;
      const code = ssLookup[key];
      if (code) return SS_COLOR[code] ?? SS_COLOR.C;
      if (atom.ss) {
        const map: Record<string, string> = { h: "H", s: "E", c: "C" };
        return SS_COLOR[map[atom.ss] ?? "C"] ?? SS_COLOR.C;
      }
      return "#8a8c90";
    };

    if (figureMode === "interaction") {
      viewer.setStyle(
        { model: 0 },
        {
          cartoon: {
            opacity: 0.92,
            color: ssColorFn,
            colorfunc: ssColorFn,
          },
        },
      );
    } else if (figureMode === "pocket") {
      viewer.setStyle({ model: 0 }, { cartoon: { opacity: 0.22, color: "#6e6c66" } });
    } else {
      viewer.setStyle({ model: 0 }, { cartoon: { opacity: 0.1, color: "#3a3a40" } });
    }

    ligands.forEach((layer, index) => {
      const ligand = stripHydrogens(splitComplex(layer.pdb).ligand);
      if (!ligand.trim() || ligand.trim() === "END") return;
      viewer.addModel(ligand, "pdb");
      const model = index + 1;
      const single = ligands.length === 1;
      viewer.setStyle(
        { model },
        single
          ? { stick: { colorscheme: "Jmol", radius: 0.18 } }
          : { stick: { color: layer.color, radius: 0.17 } },
      );
      if (single) {
        viewer.addStyle({ model }, { sphere: { colorscheme: "Jmol", scale: 0.2 } });
      }
    });

    const interactingSel = selectionFromKeys(
      interactions.map((h) => `${h.chain}:${h.resSeq}`),
    );
    if (interactingSel && figureMode === "interaction") {
      viewer.addStyle(
        { and: [{ model: 0 }, interactingSel] },
        { stick: { colorscheme: "Jmol", radius: 0.13 } },
      );
    }

    const polarHits = interactions.filter(
      (h) => h.type === "hbond" || h.type === "salt" || h.type === "pi-stack" || h.type === "pi-cation",
    );
    if (figureMode === "interaction") {
      for (const hit of polarHits) {
        try {
          viewer.addLine?.({
            dashed: true,
            start: hit.start,
            end: hit.end,
            color: LINE_COLOR[hit.type] ?? "#2dd4bf",
            linewidth: 2.2,
            dashLength: 0.22,
            gapLength: 0.14,
          });
        } catch {
          /* older 3Dmol */
        }
      }
    }

    if (labelsOn && figureMode === "interaction") {
      const labeled = new Set<string>();
      for (const hit of polarHits) {
        const key = `${hit.chain}:${hit.resSeq}`;
        if (labeled.has(key)) continue;
        labeled.add(key);
        const text = residueLabels[key] ?? `${hit.resName}${hit.resSeq}`;
        try {
          viewer.addLabel?.(text, {
            position: hit.start,
            backgroundColor: PAPER_BG,
            backgroundOpacity: 0.88,
            fontColor: "#1b1a18",
            fontSize: 11,
            borderThickness: 0,
            inFront: true,
            showBackground: true,
          });
        } catch {
          /* ignore */
        }
      }
    }

    const wantsSurface = figureMode !== "interaction";
    if (wantsSurface) {
      setMessage("Building surface");
      const pocketSel = selectionFromKeys(
        pocketKeys.length ? pocketKeys : interactions.map((h) => `${h.chain}:${h.resSeq}`),
      );
      const atomsel = pocketSel ? { and: [{ model: 0 }, pocketSel] } : { model: 0 };
      try {
        const model = viewer.getModel?.(0);
        const atoms = model?.selectedAtoms?.({}) ?? [];
        for (const raw of atoms) {
          const atom = raw as { resn?: string; x: number; y: number; z: number; color?: string };
          atom.color =
            figureMode === "electrostatic"
              ? coulombicColor(atom, charges)
              : figureMode === "hydrophobic"
                ? residueHydroColor(atom.resn ?? "GLY")
                : "#9aa3b0";
        }
      } catch {
        /* optional */
      }
      const colorFn = (atom: { x: number; y: number; z: number; resn?: string }) => {
        if (figureMode === "electrostatic") return coulombicColor(atom, charges);
        if (figureMode === "hydrophobic") return residueHydroColor(atom.resn ?? "GLY");
        return "#9aa3b0";
      };
      const style =
        figureMode === "pocket"
          ? { opacity: 0.72, color: "#9aa3b0" }
          : { opacity: 0.9, colorfunc: colorFn, color: colorFn };

      viewer.addSurface(
        lib.SurfaceType.SAS ?? lib.SurfaceType.VDW,
        style,
        atomsel,
        undefined,
        () => {
          if (generation !== generationRef.current) return;
          if (viewRef.current && viewer.setView) {
            try {
              viewer.setView(viewRef.current);
            } catch {
              /* ignore */
            }
          }
          viewer.render();
        },
      );
    }

    const structKey = `${proteinPdb.length}:${ligandKey}`;
    const structChanged = structKeyRef.current !== structKey;
    structKeyRef.current = structKey;
    const savedView = viewRef.current;

    if (!structChanged && savedView && viewer.setView) {
      try {
        viewer.setView(savedView);
      } catch {
        applyDefaultZoom(viewer, focus, ligands);
      }
    } else {
      applyDefaultZoom(viewer, focus, ligands);
    }

    viewer.render();
    try {
      viewRef.current = viewer.getView?.() ?? savedView;
    } catch {
      /* ignore */
    }
    if (spinRef.current) viewer.spin("y");
  }, [
    proteinPdb,
    ligandKey,
    figureMode,
    focus,
    status,
    hitKey,
    pocketKey,
    labelsOn,
    // ssByKey identity is tracked by size so late DSSP still recolours cartoon
    Object.keys(ssByKey).length,
  ]);

  useEffect(() => {
    const viewer = viewerRef.current;
    if (!viewer || status !== "ready") return;
    viewer.spin(spin ? "y" : false);
    viewer.render();
  }, [spin, status]);

  return (
    <div className={cn("relative z-0 isolate min-h-0 overflow-hidden bg-paper", className)}>
      <div ref={hostRef} className="absolute inset-0" data-mol-host="1" />
      {status !== "ready" ? (
        <canvas
          width={800}
          height={600}
          className="pointer-events-none absolute inset-0 size-full"
          aria-hidden
        />
      ) : null}
      {status === "error" ? (
        <div className="absolute inset-0 flex items-center justify-center">
          <p className="font-mono text-xs tracking-wide text-faint">{message}</p>
        </div>
      ) : status !== "ready" ? (
        <div className="absolute inset-0 flex items-center justify-center">
          <p className="font-mono text-xs tracking-wide text-faint">Assembling pocket</p>
        </div>
      ) : null}
    </div>
  );
}

function applyDefaultZoom(
  viewer: MolViewer,
  focus: "ligand" | "complex",
  ligands: LigandLayer[],
): void {
  if (focus === "ligand" && ligands.length) {
    viewer.zoomTo({ or: ligands.map((_, i) => ({ model: i + 1 })) });
    try {
      viewer.zoom(1.65, 0);
    } catch {
      /* ignore */
    }
  } else {
    viewer.zoomTo();
  }
}

function selectionFromKeys(keys: string[]): Record<string, unknown> | null {
  const byChain = new Map<string, number[]>();
  for (const key of keys) {
    const [chain, seq] = key.split(":");
    if (!chain || !seq) continue;
    const n = Number.parseInt(seq, 10);
    if (!Number.isFinite(n)) continue;
    const list = byChain.get(chain);
    if (list) list.push(n);
    else byChain.set(chain, [n]);
  }
  if (!byChain.size) return null;
  const parts = [...byChain.entries()].map(([chain, resi]) => ({ chain, resi }));
  return parts.length === 1 ? parts[0]! : { or: parts };
}
