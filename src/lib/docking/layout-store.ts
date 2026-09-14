import { create } from "zustand";

const KEY = "poseatlas-chrome";

export const CHROME_DEFAULTS = {
  libraryW: 288,
  diagramW: 416,
  inspectorW: 320,
} as const;

const LIBRARY_MIN = 220;
const LIBRARY_MAX = 440;
const DIAGRAM_MIN = 280;
const DIAGRAM_MAX = 640;
const INSPECTOR_MIN = 260;
const INSPECTOR_MAX = 480;

function clamp(n: number, min: number, max: number): number {
  if (!Number.isFinite(n)) return min;
  return Math.min(max, Math.max(min, Math.round(n)));
}

export function clampLibraryW(n: number): number {
  return clamp(n, LIBRARY_MIN, LIBRARY_MAX);
}

export function clampDiagramW(n: number): number {
  return clamp(n, DIAGRAM_MIN, DIAGRAM_MAX);
}

export function clampInspectorW(n: number): number {
  return clamp(n, INSPECTOR_MIN, INSPECTOR_MAX);
}

type ChromeState = {
  libraryW: number;
  diagramW: number;
  inspectorW: number;
  hydrated: boolean;
  hydrate: () => void;
  setLibraryW: (n: number) => void;
  setDiagramW: (n: number) => void;
  setInspectorW: (n: number) => void;
  resetLibrary: () => void;
  resetDiagram: () => void;
  resetInspector: () => void;
};

function load(): Pick<ChromeState, "libraryW" | "diagramW" | "inspectorW"> {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return { ...CHROME_DEFAULTS };
    const parsed = JSON.parse(raw) as Partial<ChromeState>;
    return {
      libraryW: clampLibraryW(parsed.libraryW ?? CHROME_DEFAULTS.libraryW),
      diagramW: clampDiagramW(parsed.diagramW ?? CHROME_DEFAULTS.diagramW),
      inspectorW: clampInspectorW(parsed.inspectorW ?? CHROME_DEFAULTS.inspectorW),
    };
  } catch {
    return { ...CHROME_DEFAULTS };
  }
}

function persist(state: Pick<ChromeState, "libraryW" | "diagramW" | "inspectorW">): void {
  try {
    localStorage.setItem(
      KEY,
      JSON.stringify({
        libraryW: state.libraryW,
        diagramW: state.diagramW,
        inspectorW: state.inspectorW,
      }),
    );
  } catch {
    /* private mode */
  }
}

export const useChrome = create<ChromeState>((set, get) => ({
  ...CHROME_DEFAULTS,
  hydrated: false,

  hydrate: () => {
    if (get().hydrated) return;
    set({ ...load(), hydrated: true });
  },

  setLibraryW: (n) => {
    const libraryW = clampLibraryW(n);
    set({ libraryW });
    persist(get());
  },
  setDiagramW: (n) => {
    const diagramW = clampDiagramW(n);
    set({ diagramW });
    persist(get());
  },
  setInspectorW: (n) => {
    const inspectorW = clampInspectorW(n);
    set({ inspectorW });
    persist(get());
  },
  resetLibrary: () => {
    set({ libraryW: CHROME_DEFAULTS.libraryW });
    persist(get());
  },
  resetDiagram: () => {
    set({ diagramW: CHROME_DEFAULTS.diagramW });
    persist(get());
  },
  resetInspector: () => {
    set({ inspectorW: CHROME_DEFAULTS.inspectorW });
    persist(get());
  },
}));
