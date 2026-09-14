export const SCENE_COLS = 12;
export const PLATE_CSS_W = 1024;
export const HEIGHT_MIN = 120;
export const HEIGHT_MAX = 720;

/** 1–12 columns on the publication plate. */
export type SceneSpan = number;

export type SceneKind = "snapshot" | "photo" | "ss" | "chart" | "fingerprint" | "sketch" | "contacts" | "residues";

export type PackedCell = {
  id: string;
  col: number;
  row: number;
  span: number;
};

export const SPAN_PRESETS: ReadonlyArray<{ span: number; label: string }> = [
  { span: 4, label: "⅓" },
  { span: 6, label: "½" },
  { span: 8, label: "⅔" },
  { span: 12, label: "Full" },
];

export function clampSpan(span: number): number {
  if (!Number.isFinite(span)) return 4;
  return Math.min(SCENE_COLS, Math.max(1, Math.round(span)));
}

export function clampHeight(height: number): number {
  if (!Number.isFinite(height)) return HEIGHT_MIN;
  return Math.min(HEIGHT_MAX, Math.max(HEIGHT_MIN, Math.round(height)));
}

export function defaultPanelSpan(kind: SceneKind): number {
  if (kind === "ss" || kind === "chart" || kind === "fingerprint" || kind === "residues") return SCENE_COLS;
  if (kind === "contacts") return 6;
  if (kind === "sketch") return 6;
  return 4;
}

export function defaultPanelHeight(kind: SceneKind): number {
  switch (kind) {
    case "ss":
      return 168;
    case "chart":
      return 280;
    case "fingerprint":
      return 220;
    case "sketch":
      return 300;
    case "contacts":
      return 220;
    case "residues":
      return 340;
    default:
      return 232;
  }
}

/** Old plates used a 3-column span (1 | 2 | 3). */
export function looksLegacySpans(panels: Array<{ span: number }>): boolean {
  return panels.length > 0 && panels.every((p) => p.span === 1 || p.span === 2 || p.span === 3);
}

export function migrateLegacySpan(span: number): number {
  if (span === 1 || span === 2 || span === 3) return span * 4;
  return clampSpan(span);
}

export function packScene(
  panels: Array<{ id: string; span: number }>,
  columns = SCENE_COLS,
): { cells: PackedCell[]; rows: number } {
  let col = 0;
  let row = 0;
  const cells: PackedCell[] = [];
  for (const panel of panels) {
    const span = Math.min(Math.max(clampSpan(panel.span), 1), columns);
    if (col + span > columns) {
      row += 1;
      col = 0;
    }
    cells.push({ id: panel.id, col, row, span });
    col += span;
  }
  return { cells, rows: panels.length ? row + 1 : 0 };
}
