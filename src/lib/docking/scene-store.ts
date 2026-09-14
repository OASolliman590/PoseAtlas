import { create } from "zustand";
import {
  clampHeight,
  clampSpan,
  defaultPanelSpan,
  looksLegacySpans,
  migrateLegacySpan,
  type SceneKind as LayoutKind,
  type SceneSpan,
} from "./scene-layout";

export type SceneKind = LayoutKind;
export type { SceneSpan };

export type ScenePanel = {
  id: string;
  kind: SceneKind;
  title: string;
  caption: string;
  src?: string;
  span: SceneSpan;
  height?: number;
};

type SceneState = {
  open: boolean;
  title: string;
  subtitle: string;
  panels: ScenePanel[];
  selectedId: string | null;
  notice: string | null;

  setOpen: (open: boolean) => void;
  setTitle: (title: string) => void;
  setSubtitle: (subtitle: string) => void;
  setSelected: (id: string | null) => void;
  setNotice: (notice: string | null) => void;
  addPanel: (panel: Omit<ScenePanel, "id"> & { id?: string }, opts?: { open?: boolean }) => string;
  addSnapshot: (panel: Omit<ScenePanel, "id" | "kind"> & { src: string }) => string;
  updatePanel: (id: string, patch: Partial<ScenePanel>) => void;
  removePanel: (id: string) => void;
  movePanel: (fromId: string, toId: string) => void;
  ensureScaffold: () => void;
  migrateLayout: () => void;
  clear: () => void;
};

function uid(prefix: string): string {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}

function scaffold(): ScenePanel[] {
  return [
    {
      id: uid("ss"),
      kind: "ss",
      title: "Secondary structure",
      caption: "Kabsch–Sander DSSP, colour-coded by helix, sheet, turn and coil.",
      span: 12,
    },
    {
      id: uid("chart"),
      kind: "chart",
      title: "Binding affinity",
      caption: "kcal/mol · more negative is stronger.",
      span: 12,
    },
  ];
}

export const useScene = create<SceneState>((set, get) => ({
  open: false,
  title: "",
  subtitle: "",
  panels: [],
  selectedId: null,
  notice: null,

  setOpen: (open) => set({ open }),
  setTitle: (title) => set({ title }),
  setSubtitle: (subtitle) => set({ subtitle }),
  setSelected: (selectedId) => set({ selectedId }),
  setNotice: (notice) => set({ notice }),

  ensureScaffold: () => {
    const { panels } = get();
    if (panels.some((p) => p.kind === "ss") && panels.some((p) => p.kind === "chart")) return;
    const next = [...panels];
    if (!next.some((p) => p.kind === "ss")) next.unshift(scaffold()[0]!);
    if (!next.some((p) => p.kind === "chart")) next.push(scaffold()[1]!);
    set({ panels: next });
  },

  migrateLayout: () => {
    const { panels } = get();
    if (!looksLegacySpans(panels)) return;
    set({
      panels: panels.map((p) => ({ ...p, span: migrateLegacySpan(p.span) })),
    });
  },

  addPanel: (panel, opts) => {
    const id = panel.id ?? uid(panel.kind);
    const first = get().panels.length === 0;
    const span = clampSpan(panel.span ?? defaultPanelSpan(panel.kind));
    const height = panel.height != null ? clampHeight(panel.height) : undefined;
    set((s) => ({
      panels: [...s.panels, { ...panel, id, span, height }],
      selectedId: id,
      open: opts?.open ?? (s.open || first),
    }));
    return id;
  },

  addSnapshot: (panel) => {
    const id = uid("snap");
    const item: ScenePanel = {
      id,
      kind: "snapshot",
      title: panel.title,
      caption: panel.caption,
      src: panel.src,
      span: clampSpan(panel.span ?? 4),
      height: panel.height != null ? clampHeight(panel.height) : undefined,
    };
    set((s) => {
      const panels = [...s.panels];
      const chartIdx = panels.findIndex((p) => p.kind === "chart");
      const at = chartIdx === -1 ? panels.length : chartIdx;
      panels.splice(at, 0, item);
      return {
        panels,
        selectedId: id,
        open: s.open || true,
        notice: "Saved to scene",
      };
    });
    return id;
  },

  updatePanel: (id, patch) =>
    set((s) => ({
      panels: s.panels.map((p) => {
        if (p.id !== id) return p;
        const next = { ...p, ...patch };
        next.span = clampSpan(next.span);
        if (next.height != null) next.height = clampHeight(next.height);
        return next;
      }),
    })),

  removePanel: (id) =>
    set((s) => ({
      panels: s.panels.filter((p) => p.id !== id),
      selectedId: s.selectedId === id ? null : s.selectedId,
    })),

  movePanel: (fromId, toId) => {
    if (fromId === toId) return;
    set((s) => {
      const panels = [...s.panels];
      const from = panels.findIndex((p) => p.id === fromId);
      const to = panels.findIndex((p) => p.id === toId);
      if (from < 0 || to < 0) return s;
      const [item] = panels.splice(from, 1);
      panels.splice(to, 0, item!);
      return { panels };
    });
  },

  clear: () => set({ panels: [], selectedId: null }),
}));

export const FIGURE_TITLES: Record<string, string> = {
  interaction: "Ligand interactions",
  pocket: "Pocket cutaway",
  electrostatic: "Electrostatic pocket",
  hydrophobic: "Hydrophobic pocket",
};
