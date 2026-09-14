export type MolViewer = {
  addModel: (data: string, format: string) => unknown;
  removeAllModels: () => void;
  removeAllSurfaces: () => void;
  removeAllLabels?: () => void;
  removeAllShapes?: () => void;
  setStyle: (sel: unknown, style: unknown) => void;
  addStyle: (sel: unknown, style: unknown) => void;
  addSurface: (
    type: unknown,
    style: unknown,
    atomsel?: unknown,
    allsel?: unknown,
    callback?: unknown,
  ) => unknown;
  addLine?: (spec: Record<string, unknown>) => unknown;
  addCylinder?: (spec: Record<string, unknown>) => unknown;
  addLabel?: (text: string, options: Record<string, unknown>) => unknown;
  zoomTo: (sel?: unknown) => void;
  zoom: (factor: number, duration?: number) => void;
  render: () => void;
  resize: () => void;
  spin: (arg?: boolean | string) => void;
  clear: () => void;
  pngURI: () => string;
  setBackgroundColor: (color: string) => void;
  center: (sel?: unknown) => void;
  getView?: () => unknown;
  setView?: (arg: unknown) => unknown;
  setViewChangeCallback?: (cb: (view: unknown) => void) => void;
  getModel?: (id?: number) => { selectedAtoms?: (sel: unknown) => Array<Record<string, unknown>> };
};

export type MolLib = {
  createViewer: (
    element: HTMLElement,
    config?: Record<string, unknown>,
  ) => MolViewer;
  SurfaceType: { VDW: unknown; MS: unknown; SAS: unknown };
};

type MolGlobal = Window & {
  $3Dmol?: MolLib;
  ["3Dmol"]?: MolLib;
};

function readLib(): MolLib | null {
  if (typeof window === "undefined") return null;
  const g = window as MolGlobal;
  return g.$3Dmol ?? g["3Dmol"] ?? null;
}

let pending: Promise<MolLib> | null = null;

export function load3Dmol(): Promise<MolLib> {
  if (typeof window === "undefined") {
    return Promise.reject(new Error("3Dmol needs a browser"));
  }
  const existingLib = readLib();
  if (existingLib) return Promise.resolve(existingLib);
  if (pending) return pending;

  pending = new Promise((resolve, reject) => {
    const done = () => {
      const lib = readLib();
      if (lib) resolve(lib);
      else reject(new Error("3Dmol loaded without a global"));
    };

    const existing =
      document.querySelector("script[data-mol-lib='3dmol']") ||
      document.querySelector('script[src*="3Dmol-min.js"]');
    if (existing) {
      if (readLib()) {
        resolve(readLib()!);
        return;
      }
      existing.addEventListener("load", done);
      existing.addEventListener("error", () =>
        reject(new Error("Failed to load 3Dmol")),
      );
      return;
    }

    const script = document.createElement("script");
    script.src = "/vendor/3Dmol-min.js";
    script.async = true;
    script.dataset.molLib = "3dmol";
    script.onload = done;
    script.onerror = () => reject(new Error("Failed to load 3Dmol"));
    document.head.appendChild(script);
  });

  return pending;
}

if (typeof window !== "undefined") {
  void load3Dmol();
}

let lastViewer: MolViewer | null = null;

export function setLastViewer(viewer: MolViewer | null): void {
  lastViewer = viewer;
}

export function isPngDataUrl(uri: string | null | undefined): uri is string {
  return !!uri && uri.startsWith("data:image/") && uri.length > 800;
}

function canvasToPng(canvas: HTMLCanvasElement | null): string | null {
  if (!canvas || canvas.width < 8 || canvas.height < 8) return null;
  try {
    const uri = canvas.toDataURL("image/png");
    return isPngDataUrl(uri) ? uri : null;
  } catch {
    return null;
  }
}

export const PAPER_BG = "#faf9f6";
export const STUDIO_BG = "#09090b";

export function snapshotViewer(): string | null {
  try {
    lastViewer?.spin(false);
    lastViewer?.render();
  } catch {
    /* ignore */
  }
  if (lastViewer) {
    try {
      const uri = lastViewer.pngURI();
      if (isPngDataUrl(uri)) return uri;
    } catch {
      /* fall through */
    }
  }
  if (typeof document === "undefined") return null;
  const host = document.querySelector("[data-mol-host]");
  const canvases = host
    ? ([...host.querySelectorAll("canvas")] as HTMLCanvasElement[])
    : [];
  for (const canvas of canvases) {
    const uri = canvasToPng(canvas);
    if (uri) return uri;
  }
  return null;
}

export function snapshotViewerAsync(): Promise<string | null> {
  try {
    lastViewer?.spin(false);
    lastViewer?.setBackgroundColor?.(PAPER_BG);
    lastViewer?.render();
  } catch {
    /* ignore */
  }
  return new Promise((resolve) => {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        const uri = snapshotViewer();
        try {
          lastViewer?.setBackgroundColor?.(PAPER_BG);
          lastViewer?.render();
        } catch {
          /* keep paper */
        }
        resolve(uri);
      });
    });
  });
}

export async function downloadDataUrl(uri: string, filename: string): Promise<void> {
  if (typeof document === "undefined") return;
  let href = uri;
  let revoke: string | null = null;
  try {
    const res = await fetch(uri);
    const blob = await res.blob();
    href = URL.createObjectURL(blob);
    revoke = href;
  } catch {
    href = uri;
  }
  const link = document.createElement("a");
  link.href = href;
  link.download = filename;
  link.rel = "noopener";
  link.style.display = "none";
  document.body.appendChild(link);
  link.click();
  link.remove();
  if (revoke) window.setTimeout(() => URL.revokeObjectURL(revoke!), 2500);
}
