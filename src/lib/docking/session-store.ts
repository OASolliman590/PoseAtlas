import { create } from "zustand";
import { TARGETS, type PoseId } from "./catalog";
import { POSE_PALETTE } from "./chemistry";
import { canonicalLigandName, detectEngine, matchLigandToExisting } from "./engines";
import {
  emptyNames,
  ligandDisplay,
  persistNames,
  restoreNames,
  type Nomenclature,
} from "./names";
import { fetchPdb } from "./pdb";
import { buildInventory, type Inventory } from "./structure";

export type FigureMode = "interaction" | "pocket" | "electrostatic" | "hydrophobic";
export type ChartStyle = "grouped" | "overlay";

export type PoseRecord = {
  id: string;
  filename: string;
  pdb: string;
  inventory: Inventory;
  color: string;
  source: "library" | "upload";
  fallbackLabel: string;
  affinity: number | null;
  engine: string;
};

export type SessionKind = "library" | "workspace";

type SessionState = {
  kind: SessionKind;
  libraryTargetId: string | null;
  proteinFallback: string;
  names: Nomenclature;
  poses: PoseRecord[];
  visibleIds: string[];
  focusedId: string | null;
  figureMode: FigureMode;
  spin: boolean;
  frame: "ligand" | "complex";
  labelsOn: boolean;
  chartOpen: boolean;
  chartStyle: ChartStyle;
  hydrating: boolean;
  loadError: string | null;
  dropActive: boolean;

  setProteinName: (value: string) => void;
  setChainName: (chain: string, value: string) => void;
  setLigandName: (poseId: string, value: string) => void;
  setHetName: (key: string, value: string) => void;
  setEngine: (poseId: string, engine: string) => void;
  setAffinity: (poseId: string, affinity: number | null) => void;
  toggleVisible: (id: string) => void;
  solo: (id: string) => void;
  overlayAll: () => void;
  setFocused: (id: string) => void;
  setFigureMode: (mode: FigureMode) => void;
  setSpin: (value: boolean | ((prev: boolean) => boolean)) => void;
  setFrame: (frame: "ligand" | "complex") => void;
  setLabelsOn: (value: boolean) => void;
  setChartOpen: (value: boolean) => void;
  setChartStyle: (value: ChartStyle) => void;
  setDropActive: (value: boolean) => void;
  loadLibraryTarget: (targetId: string) => Promise<void>;
  loadFiles: (files: File[]) => Promise<void>;
  addFiles: (files: File[]) => Promise<void>;
  removePose: (id: string) => void;
};

function sessionKey(kind: SessionKind, libraryTargetId: string | null, poses: PoseRecord[]): string {
  if (kind === "library" && libraryTargetId) return `lib:${libraryTargetId}`;
  return `up:${poses.map((p) => p.filename).sort().join("|")}`;
}

function remember(get: () => SessionState) {
  const s = get();
  persistNames(sessionKey(s.kind, s.libraryTargetId, s.poses), s.names);
}

function applyRestored(
  kind: SessionKind,
  libraryTargetId: string | null,
  poses: PoseRecord[],
  base: Nomenclature,
): Nomenclature {
  const saved = restoreNames(sessionKey(kind, libraryTargetId, poses));
  if (!saved) return base;
  return {
    protein: saved.protein || base.protein,
    chains: { ...base.chains, ...saved.chains },
    ligands: { ...base.ligands, ...saved.ligands },
    hetatms: { ...base.hetatms, ...saved.hetatms },
  };
}

function poseFromPdb(
  id: string,
  filename: string,
  pdb: string,
  color: string,
  source: PoseRecord["source"],
  fallbackLabel: string,
  affinity: number | null,
  engine: string,
): PoseRecord {
  const inventory = buildInventory(pdb, filename);
  return {
    id,
    filename,
    pdb,
    inventory,
    color,
    source,
    fallbackLabel,
    affinity: affinity ?? inventory.meta.affinity,
    engine: engine || inventory.meta.engine || detectEngine(filename, inventory.meta.remarks.join("\n")),
  };
}

async function filesToPoses(files: File[], startIndex: number): Promise<PoseRecord[]> {
  const pdbFiles = files.filter((f) => /\.(pdb|ent|txt)$/i.test(f.name));
  const poses: PoseRecord[] = [];
  for (let i = 0; i < pdbFiles.length; i++) {
    const file = pdbFiles[i]!;
    const pdb = await file.text();
    const inv = buildInventory(pdb, file.name);
    if (!inv.atoms.length) continue;
    const lig = inv.ligands[0];
    const fallback = canonicalLigandName(
      file.name,
      lig?.resName ?? file.name.replace(/\.[^.]+$/, ""),
    );
    poses.push(
      poseFromPdb(
        `up-${Date.now()}-${startIndex + i}-${file.name.replace(/[^a-zA-Z0-9]+/g, "-")}`,
        file.name,
        pdb,
        POSE_PALETTE[(startIndex + i) % POSE_PALETTE.length]!,
        "upload",
        fallback,
        inv.meta.affinity,
        inv.meta.engine,
      ),
    );
  }
  return poses;
}

export const useSession = create<SessionState>((set, get) => ({
  kind: "library",
  libraryTargetId: null,
  proteinFallback: "Protein",
  names: emptyNames(),
  poses: [],
  visibleIds: [],
  focusedId: null,
  figureMode: "interaction",
  spin: false,
  frame: "ligand",
  labelsOn: true,
  chartOpen: false,
  chartStyle: "overlay",
  hydrating: true,
  loadError: null,
  dropActive: false,

  setProteinName: (value) => {
    set((s) => ({ names: { ...s.names, protein: value } }));
    remember(get);
  },
  setChainName: (chain, value) => {
    set((s) => ({ names: { ...s.names, chains: { ...s.names.chains, [chain]: value } } }));
    remember(get);
  },
  setLigandName: (poseId, value) => {
    set((s) => ({ names: { ...s.names, ligands: { ...s.names.ligands, [poseId]: value } } }));
    remember(get);
  },
  setHetName: (key, value) => {
    set((s) => ({ names: { ...s.names, hetatms: { ...s.names.hetatms, [key]: value } } }));
    remember(get);
  },
  setEngine: (poseId, engine) => {
    set((s) => ({
      poses: s.poses.map((p) => (p.id === poseId ? { ...p, engine } : p)),
    }));
  },
  setAffinity: (poseId, affinity) => {
    set((s) => ({
      poses: s.poses.map((p) => (p.id === poseId ? { ...p, affinity } : p)),
    }));
  },
  toggleVisible: (id) => {
    set((s) => {
      const on = s.visibleIds.includes(id);
      if (on) {
        if (s.visibleIds.length === 1) return s;
        const visibleIds = s.visibleIds.filter((x) => x !== id);
        const focusedId = s.focusedId === id ? visibleIds[0]! : s.focusedId;
        return { visibleIds, focusedId };
      }
      return { visibleIds: [...s.visibleIds, id], focusedId: id };
    });
  },
  solo: (id) => set({ visibleIds: [id], focusedId: id }),
  overlayAll: () =>
    set((s) => ({
      visibleIds: s.poses.map((p) => p.id),
      focusedId: s.focusedId ?? s.poses[0]?.id ?? null,
    })),
  setFocused: (id) => set({ focusedId: id }),
  setFigureMode: (figureMode) => set({ figureMode }),
  setSpin: (value) =>
    set((s) => ({ spin: typeof value === "function" ? value(s.spin) : value })),
  setFrame: (frame) => set({ frame }),
  setLabelsOn: (labelsOn) => set({ labelsOn }),
  setChartOpen: (chartOpen) => set({ chartOpen }),
  setChartStyle: (chartStyle) => set({ chartStyle }),
  setDropActive: (dropActive) => set({ dropActive }),

  loadLibraryTarget: async (targetId) => {
    const target = TARGETS.find((t) => t.id === targetId);
    if (!target) return;
    set({ hydrating: true, loadError: null, libraryTargetId: targetId, kind: "library" });
    try {
      const ids: PoseId[] = ["native", "ox11", "t2z14"];
      const poses = await Promise.all(
        ids.map(async (pid, index) => {
          const pose = target.poses[pid];
          const pdb = await fetchPdb(pose.file);
          const filename = pose.file.split("/").pop() ?? pose.file;
          return poseFromPdb(
            `${target.id}-${pid}`,
            filename,
            pdb,
            POSE_PALETTE[index] ?? POSE_PALETTE[0]!,
            "library",
            pose.label,
            pose.affinity,
            "GNINA",
          );
        }),
      );
      const chainNames: Record<string, string> = {};
      for (const chain of poses[0]?.inventory.chains ?? []) {
        chainNames[chain.id] = "";
      }
      const ligandNames: Record<string, string> = {};
      for (const p of poses) ligandNames[p.id] = p.fallbackLabel;
      const hetatms: Record<string, string> = {};
      for (const lig of poses[0]?.inventory.ligands ?? []) {
        hetatms[lig.key] = lig.resName;
      }
      const base: Nomenclature = {
        protein: target.protein,
        chains: chainNames,
        ligands: ligandNames,
        hetatms,
      };
      const names = applyRestored("library", targetId, poses, base);
      const candidate = poses.find((p) => p.id.endsWith("-ox11")) ?? poses[1] ?? poses[0]!;
      set({
        kind: "library",
        libraryTargetId: targetId,
        proteinFallback: target.protein,
        names,
        poses,
        visibleIds: [candidate.id],
        focusedId: candidate.id,
        hydrating: false,
        loadError: null,
        chartOpen: false,
      });
    } catch (err) {
      set({
        hydrating: false,
        loadError: err instanceof Error ? err.message : "Failed to load structures",
      });
    }
  },

  loadFiles: async (files) => {
    set({ hydrating: true, loadError: null, kind: "workspace", libraryTargetId: null });
    try {
      const poses = await filesToPoses(files, 0);
      if (!poses.length) {
        set({ hydrating: false, loadError: "Drop PDB files from any docking engine" });
        return;
      }
      const first = poses[0]!;
      const chainNames: Record<string, string> = {};
      for (const chain of first.inventory.chains) chainNames[chain.id] = "";
      const ligandNames: Record<string, string> = {};
      for (const p of poses) ligandNames[p.id] = p.fallbackLabel;
      const hetatms: Record<string, string> = {};
      for (const p of poses) {
        for (const lig of p.inventory.ligands) hetatms[lig.key] = lig.resName;
      }
      const proteinFallback =
        first.inventory.meta.title || first.filename.replace(/\.[^.]+$/, "");
      const base: Nomenclature = {
        protein: proteinFallback,
        chains: chainNames,
        ligands: ligandNames,
        hetatms,
      };
      const names = applyRestored("workspace", null, poses, base);
      set({
        kind: "workspace",
        libraryTargetId: null,
        proteinFallback,
        names,
        poses,
        visibleIds: poses.map((p) => p.id),
        focusedId: poses[0]!.id,
        hydrating: false,
        loadError: null,
        chartOpen: false,
      });
      remember(get);
    } catch (err) {
      set({
        hydrating: false,
        loadError: err instanceof Error ? err.message : "Could not read those files",
      });
    }
  },

  addFiles: async (files) => {
    const current = get();
    if (!current.poses.length) {
      await get().loadFiles(files);
      return;
    }
    set({ hydrating: true, loadError: null });
    try {
      const extra = await filesToPoses(files, current.poses.length);
      if (!extra.length) {
        set({ hydrating: false, loadError: "No atoms found in those files" });
        return;
      }
      const ligandNames = { ...current.names.ligands };
      const hetatms = { ...current.names.hetatms };
      const existing = current.poses.map((x) => ({
        filename: x.filename,
        fallbackLabel: x.fallbackLabel,
        display: ligandDisplay(current.names, x.id, x.fallbackLabel),
      }));
      for (const p of extra) {
        ligandNames[p.id] = matchLigandToExisting(p.filename, p.fallbackLabel, existing);
        for (const lig of p.inventory.ligands) hetatms[lig.key] = lig.resName;
      }
      const poses = [...current.poses, ...extra];
      const visibleIds = [...new Set([...current.visibleIds, ...extra.map((p) => p.id)])];
      set({
        poses,
        names: { ...current.names, ligands: ligandNames, hetatms },
        visibleIds,
        focusedId: extra[0]!.id,
        hydrating: false,
        loadError: null,
        chartOpen: false,
      });
      remember(get);
    } catch (err) {
      set({
        hydrating: false,
        loadError: err instanceof Error ? err.message : "Could not add those poses",
      });
    }
  },

  removePose: (id) =>
    set((s) => {
      const poses = s.poses.filter((p) => p.id !== id);
      const visibleIds = s.visibleIds.filter((x) => x !== id);
      const focusedId =
        s.focusedId === id ? (visibleIds[0] ?? poses[0]?.id ?? null) : s.focusedId;
      return {
        poses,
        visibleIds: visibleIds.length ? visibleIds : poses.slice(0, 1).map((p) => p.id),
        focusedId,
      };
    }),
}));

export function selectFocused(state: SessionState): PoseRecord | null {
  return state.poses.find((p) => p.id === state.focusedId) ?? state.poses[0] ?? null;
}

export function selectVisible(state: SessionState): PoseRecord[] {
  return state.poses.filter((p) => state.visibleIds.includes(p.id));
}
