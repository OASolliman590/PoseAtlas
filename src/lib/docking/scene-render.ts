import { packScene, PLATE_CSS_W, SCENE_COLS } from "./scene-layout";

import { prettyResidue, ssGroup, type SSCode } from "./chemistry";
import type { SSAnalysis } from "./dssp";
import {
  engineColor,
  type AffinityChartModel,
} from "./engines";
import {
  bandResidues,
  cellKey,
  FINGERPRINT_COLORS,
  fingerprintPlateLayout,
  type Fingerprint,
} from "./fingerprint";
import { INTERACTION_LABEL, type CommonContact, type InteractionType, type ResidueRow } from "./interactions";
import type { ScenePanel } from "./scene-store";

const BG = "#faf9f6";
const SURFACE = "#ffffff";
const FG = "#1b1a18";
const MUTED = "#5c5a54";
const FAINT = "#8a8780";
const BORDER = "#d8d2c6";
const HELIX = "#c97878";
const SHEET = "#7a9ed4";
const TURN = "#6aaa8c";
const COIL = "#8a8c90";

const SS_COLOR: Record<"helix" | "sheet" | "turn" | "coil", string> = {
  helix: HELIX,
  sheet: SHEET,
  turn: TURN,
  coil: COIL,
};

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
): void {
  const radius = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.arcTo(x + w, y, x + w, y + h, radius);
  ctx.arcTo(x + w, y + h, x, y + h, radius);
  ctx.arcTo(x, y + h, x, y, radius);
  ctx.arcTo(x, y, x + w, y, radius);
  ctx.closePath();
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("Could not read panel image"));
    img.src = src;
  });
}

function drawCover(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  x: number,
  y: number,
  w: number,
  h: number,
): void {
  const scale = Math.max(w / img.width, h / img.height);
  const dw = img.width * scale;
  const dh = img.height * scale;
  const dx = x + (w - dw) / 2;
  const dy = y + (h - dh) / 2;
  ctx.save();
  ctx.beginPath();
  ctx.rect(x, y, w, h);
  ctx.clip();
  ctx.drawImage(img, dx, dy, dw, dh);
  ctx.restore();
}

export function paintSsReport(
  ctx: CanvasRenderingContext2D,
  ss: SSAnalysis,
  x: number,
  y: number,
  w: number,
  h: number,
  interacting: Set<string>,
): void {
  ctx.fillStyle = SURFACE;
  roundRect(ctx, x, y, w, h, 12);
  ctx.fill();

  const pad = 22;
  ctx.fillStyle = FAINT;
  ctx.font = "500 12px 'IBM Plex Mono', ui-monospace, monospace";
  ctx.fillText("KABSCH–SANDER DSSP", x + pad, y + 28);

  const barY = y + 44;
  const barH = 10;
  const barW = w - pad * 2;
  let bx = x + pad;
  const order: Array<"helix" | "sheet" | "turn" | "coil"> = ["helix", "sheet", "turn", "coil"];
  for (const key of order) {
    const frac = ss.percents[key] / 100;
    ctx.fillStyle = SS_COLOR[key];
    ctx.fillRect(bx, barY, barW * frac, barH);
    bx += barW * frac;
  }

  ctx.font = "12px 'IBM Plex Sans', sans-serif";
  let lx = x + pad;
  const labels: Array<["helix" | "sheet" | "turn" | "coil", string]> = [
    ["helix", "Helix"],
    ["sheet", "Sheet"],
    ["turn", "Turn"],
    ["coil", "Coil"],
  ];
  for (const [key, lab] of labels) {
    ctx.fillStyle = SS_COLOR[key];
    ctx.fillText(`${lab}  ${ss.percents[key].toFixed(0)}%`, lx, y + 72);
    lx += 110;
  }

  const stripY = y + 92;
  const stripH = 16;
  const n = Math.max(ss.residues.length, 1);
  const unit = (w - pad * 2) / n;
  ss.residues.forEach((r, i) => {
    const group = ssGroup(r.ss as SSCode);
    ctx.fillStyle = SS_COLOR[group];
    ctx.fillRect(x + pad + i * unit, stripY, Math.max(unit, 1), stripH);
    if (interacting.has(`${r.chain}:${r.resSeq}`)) {
      ctx.fillStyle = "rgba(244,241,234,0.85)";
      ctx.fillRect(x + pad + i * unit, stripY - 3, Math.max(unit, 1), 3);
    }
  });

  ctx.fillStyle = MUTED;
  ctx.font = "12px 'IBM Plex Sans', sans-serif";
  const first = ss.residues[0];
  const last = ss.residues[ss.residues.length - 1];
  if (first && last) {
    ctx.fillText(`${first.resName}${first.resSeq}`, x + pad, stripY + 34);
    ctx.textAlign = "right";
    ctx.fillText(`${last.resName}${last.resSeq}`, x + w - pad, stripY + 34);
    ctx.textAlign = "left";
  }

  const counts = ss.residues.reduce(
    (acc, r) => {
      acc[ssGroup(r.ss as SSCode)] += 1;
      return acc;
    },
    { helix: 0, sheet: 0, turn: 0, coil: 0 },
  );
  ctx.fillStyle = FAINT;
  ctx.font = "12px 'IBM Plex Mono', ui-monospace, monospace";
  ctx.fillText(
    `${ss.residues.length} residues · H ${counts.helix}  E ${counts.sheet}  T ${counts.turn}  C ${counts.coil}`,
    x + pad,
    y + h - 18,
  );
}

export function paintAffinityChart(
  ctx: CanvasRenderingContext2D,
  chart: AffinityChartModel,
  x: number,
  y: number,
  w: number,
  h: number,
  ligandColors: Record<string, string>,
  style: "grouped" | "overlay",
): void {
  ctx.fillStyle = SURFACE;
  roundRect(ctx, x, y, w, h, 12);
  ctx.fill();

  const pad = 22;
  ctx.fillStyle = FAINT;
  ctx.font = "500 12px 'IBM Plex Mono', ui-monospace, monospace";
  ctx.fillText("BINDING AFFINITY  (kcal/mol)", x + pad, y + 28);

  const values = chart.rows.flatMap((row) =>
    chart.engines.map((engine) => row[engine]).filter((v): v is number => typeof v === "number"),
  );
  if (!values.length) {
    ctx.fillStyle = MUTED;
    ctx.font = "13px 'IBM Plex Sans', sans-serif";
    ctx.fillText("No scored poses", x + pad, y + 64);
    return;
  }

  const min = Math.min(...values, 0);
  const max = Math.max(...values, 0);
  const span = Math.max(0.8, max - min);
  const plotX = x + pad + 52;
  const plotY = y + 48;
  const plotW = w - pad * 2 - 52;
  const plotH = h - 96;
  const zero = plotY + ((0 - min) / span) * plotH;
  const multi = chart.engines.length > 1;
  const n = Math.max(chart.rows.length, 1);
  const groupW = plotW / n;

  ctx.save();
  ctx.translate(x + pad + 10, plotY + plotH / 2);
  ctx.rotate(-Math.PI / 2);
  ctx.fillStyle = FAINT;
  ctx.font = "11px 'IBM Plex Sans', sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("kcal/mol", 0, 0);
  ctx.restore();

  ctx.strokeStyle = BORDER;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(plotX, plotY);
  ctx.lineTo(plotX, plotY + plotH);
  ctx.lineTo(plotX + plotW, plotY + plotH);
  ctx.stroke();

  ctx.strokeStyle = "rgba(27,26,24,0.16)";
  ctx.beginPath();
  ctx.moveTo(plotX, zero);
  ctx.lineTo(plotX + plotW, zero);
  ctx.stroke();

  ctx.fillStyle = FAINT;
  ctx.font = "10px 'IBM Plex Mono', ui-monospace, monospace";
  ctx.textAlign = "right";
  ctx.fillText(min.toFixed(1), plotX - 8, plotY + plotH);
  ctx.fillText("0", plotX - 8, zero + 3);
  ctx.textAlign = "left";

  chart.rows.forEach((row, i) => {
    const cx = plotX + (i + 0.5) * groupW;
    const engines = chart.engines.filter((engine) => typeof row[engine] === "number");
    const barW = style === "overlay" && multi
      ? Math.min(28, groupW * 0.4)
      : Math.min(22, (groupW * 0.7) / Math.max(engines.length, 1));
    engines.forEach((engine, e) => {
      const value = row[engine] as number;
      const bh = ((value - min) / span) * plotH - ((0 - min) / span) * plotH;
      const bx =
        style === "overlay" && multi
          ? cx - barW / 2
          : cx - (engines.length * (barW + 3)) / 2 + e * (barW + 3);
      const color = ligandColors[String(row.ligand)] ?? engineColor(engine, chart.engines);
      ctx.globalAlpha = style === "overlay" && multi ? 0.55 : 0.92;
      ctx.fillStyle = color;
      ctx.fillRect(bx, Math.min(zero, zero - bh), barW, Math.abs(bh));
      ctx.globalAlpha = 1;
    });
    ctx.fillStyle = MUTED;
    ctx.font = "12px 'IBM Plex Sans', sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(String(row.ligand), cx, plotY + plotH + 18);
    ctx.textAlign = "left";
  });

  if (multi) {
    let lx = x + pad;
    const legendY = y + h - 18;
    ctx.font = "11px 'IBM Plex Mono', ui-monospace, monospace";
    ctx.textBaseline = "middle";
    for (const engine of chart.engines) {
      ctx.fillStyle = engineColor(engine, chart.engines);
      roundRect(ctx, lx, legendY - 5, 10, 10, 2);
      ctx.fill();
      ctx.fillStyle = MUTED;
      ctx.fillText(engine, lx + 14, legendY);
      lx += ctx.measureText(engine).width + 28;
    }
    ctx.textBaseline = "alphabetic";
  }
}

export function paintFingerprint(
  ctx: CanvasRenderingContext2D,
  fp: Fingerprint,
  poseLabels: Record<string, string>,
  x: number,
  y: number,
  w: number,
  h: number,
  opts?: { title?: string; subtitle?: string },
): void {
  const titled = Boolean(opts?.title);
  const layout = fingerprintPlateLayout(fp.residues.length, fp.poseIds.length, w, { titled });
  ctx.fillStyle = SURFACE;
  roundRect(ctx, x, y, w, Math.max(h, layout.height), 12);
  ctx.fill();
  ctx.strokeStyle = BORDER;
  ctx.lineWidth = 1;
  roundRect(ctx, x, y, w, Math.max(h, layout.height), 12);
  ctx.stroke();

  const { pad, titleH, headerH, rowH, bandH, bandGap, labelW, cell, gap } = layout;
  const bands = bandResidues(fp.residues, layout.perBand);

  let y0 = y + pad;
  if (opts?.title) {
    ctx.fillStyle = FAINT;
    ctx.font = "500 12px 'IBM Plex Mono', ui-monospace, monospace";
    ctx.textAlign = "left";
    ctx.textBaseline = "alphabetic";
    ctx.fillText(opts.title.toUpperCase(), x + pad, y0 + 14);
    if (opts.subtitle) {
      ctx.fillStyle = MUTED;
      ctx.font = "13px 'IBM Plex Sans', sans-serif";
      ctx.fillText(opts.subtitle, x + pad, y0 + 36);
    }
    y0 += titleH;
  }

  bands.forEach((residues, b) => {
    const top = y0 + b * (bandH + bandGap);
    ctx.fillStyle = FAINT;
    ctx.font = "500 11px 'IBM Plex Mono', ui-monospace, monospace";
    ctx.textAlign = "left";
    ctx.textBaseline = "middle";
    if (b === 0) ctx.fillText("Pose", x + pad, top + headerH - 16);

    residues.forEach((res, i) => {
      const cx = x + pad + labelW + i * (cell + gap) + cell / 2;
      ctx.save();
      ctx.translate(cx, top + headerH - 10);
      ctx.rotate(-Math.PI / 2);
      ctx.fillStyle = MUTED;
      ctx.font = "11px 'IBM Plex Mono', ui-monospace, monospace";
      ctx.textAlign = "left";
      ctx.textBaseline = "middle";
      ctx.fillText(res, 0, 0);
      ctx.restore();
    });

    fp.poseIds.forEach((id, r) => {
      const ry = top + headerH + r * rowH;
      ctx.fillStyle = FG;
      ctx.font = "13px 'IBM Plex Sans', sans-serif";
      ctx.textAlign = "left";
      ctx.textBaseline = "middle";
      ctx.fillText(poseLabels[id] ?? id, x + pad, ry + cell / 2);
      residues.forEach((res, i) => {
        const types = fp.cells.get(cellKey(id, res)) ?? [];
        const lead = types[0] as InteractionType | undefined;
        const cx = x + pad + labelW + i * (cell + gap);
        ctx.fillStyle = lead ? FINGERPRINT_COLORS[lead] : "#1a1a1e";
        roundRect(ctx, cx, ry, cell, cell, 4);
        ctx.fill();
        if (types.includes("hbond") || types.includes("salt")) {
          ctx.strokeStyle = "rgba(244,241,234,0.4)";
          ctx.lineWidth = 1.25;
          roundRect(ctx, cx + 0.5, ry + 0.5, cell - 1, cell - 1, 4);
          ctx.stroke();
        }
      });
    });
  });

  const legendY = y + Math.max(h, layout.height) - pad - 10;
  const keys: Array<[InteractionType, string]> = [
    ["hbond", "H-bond"],
    ["salt", "Salt"],
    ["hydrophobic", "Hydrophobic"],
    ["pi-stack", "π-stack"],
    ["contact", "Contact"],
  ];
  let lx = x + pad;
  ctx.font = "11px 'IBM Plex Mono', ui-monospace, monospace";
  ctx.textBaseline = "middle";
  ctx.textAlign = "left";
  for (const [type, lab] of keys) {
    ctx.fillStyle = FINGERPRINT_COLORS[type];
    roundRect(ctx, lx, legendY - 5, 10, 10, 2);
    ctx.fill();
    ctx.fillStyle = MUTED;
    ctx.fillText(lab, lx + 14, legendY);
    lx += ctx.measureText(lab).width + 28;
  }
  ctx.textBaseline = "alphabetic";
}

export async function renderFingerprintPng(
  fp: Fingerprint,
  poseLabels: Record<string, string>,
  opts?: { title?: string; subtitle?: string; width?: number },
): Promise<string> {
  const layout = fingerprintPlateLayout(fp.residues.length, fp.poseIds.length, opts?.width ?? 2200, {
    titled: true,
  });
  const scale = 2;
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(layout.width * scale);
  canvas.height = Math.round(layout.height * scale);
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Could not allocate fingerprint canvas");
  try {
    await document.fonts.ready;
  } catch {
    /* use fallbacks */
  }
  ctx.scale(scale, scale);
  ctx.fillStyle = BG;
  ctx.fillRect(0, 0, layout.width, layout.height);
  paintFingerprint(ctx, fp, poseLabels, 0, 0, layout.width, layout.height, {
    title: opts?.title ?? "Interaction fingerprint",
    subtitle:
      opts?.subtitle ??
      `${fp.residues.length} pocket residues · ${fp.poseIds.length} poses · sequence order`,
  });
  return canvas.toDataURL("image/png");
}

function drawContain(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  x: number,
  y: number,
  w: number,
  h: number,
): void {
  const scale = Math.min(w / img.width, h / img.height);
  const dw = img.width * scale;
  const dh = img.height * scale;
  const dx = x + (w - dw) / 2;
  const dy = y + (h - dh) / 2;
  ctx.drawImage(img, dx, dy, dw, dh);
}

export function paintResidueTable(
  ctx: CanvasRenderingContext2D,
  rows: ResidueRow[],
  x: number,
  y: number,
  w: number,
  h: number,
): void {
  ctx.fillStyle = SURFACE;
  roundRect(ctx, x, y, w, h, 12);
  ctx.fill();
  const pad = 18;
  ctx.fillStyle = FAINT;
  ctx.font = "500 12px 'IBM Plex Mono', ui-monospace, monospace";
  ctx.fillText("INTERACTING RESIDUES", x + pad, y + 26);
  const headers = ["Residue", "Type", "Atoms", "Å"];
  const cols = [0.28, 0.4, 0.22, 0.1];
  let hx = x + pad;
  ctx.fillStyle = MUTED;
  ctx.font = "11px 'IBM Plex Mono', ui-monospace, monospace";
  headers.forEach((lab, i) => {
    const cw = (w - pad * 2) * cols[i]!;
    ctx.textAlign = i === headers.length - 1 ? "right" : "left";
    ctx.fillText(lab, i === headers.length - 1 ? hx + cw : hx, y + 48);
    hx += cw;
  });
  ctx.textAlign = "left";
  const rowH = 22;
  const start = y + 58;
  const max = Math.max(0, Math.floor((h - 70) / rowH));
  rows.slice(0, max).forEach((row, i) => {
    const yy = start + i * rowH;
    ctx.fillStyle = i % 2 ? "rgba(27,26,24,0.04)" : "transparent";
    ctx.fillRect(x + pad, yy - 14, w - pad * 2, rowH);
    let cx = x + pad;
    const cells = [
      prettyResidue(row.resName, row.resSeq, row.chain),
      row.types.map((t) => INTERACTION_LABEL[t]).join(" · "),
      `${row.ligandAtom}··${row.residueAtom}`,
      row.distance.toFixed(2),
    ];
    ctx.font = "13px 'IBM Plex Sans', sans-serif";
    cells.forEach((text, ci) => {
      const cw = (w - pad * 2) * cols[ci]!;
      ctx.fillStyle = ci === 0 ? FG : MUTED;
      ctx.textAlign = ci === 3 ? "right" : "left";
      ctx.fillText(text, ci === 3 ? cx + cw : cx, yy);
      cx += cw;
    });
    ctx.textAlign = "left";
  });
  if (rows.length > max) {
    ctx.fillStyle = FAINT;
    ctx.font = "11px 'IBM Plex Sans', sans-serif";
    ctx.fillText(`+ ${rows.length - max} more`, x + pad, y + h - 14);
  }
}

export function paintCommonContacts(
  ctx: CanvasRenderingContext2D,
  rows: CommonContact[],
  poseCount: number,
  x: number,
  y: number,
  w: number,
  h: number,
): void {
  ctx.fillStyle = SURFACE;
  roundRect(ctx, x, y, w, h, 12);
  ctx.fill();
  const pad = 18;
  ctx.fillStyle = FAINT;
  ctx.font = "500 12px 'IBM Plex Mono', ui-monospace, monospace";
  ctx.fillText(`COMMON CONTACTS  ·  ${poseCount} poses`, x + pad, y + 26);
  if (!rows.length) {
    ctx.fillStyle = MUTED;
    ctx.font = "13px 'IBM Plex Sans', sans-serif";
    ctx.fillText("No residue is shared by every overlay pose.", x + pad, y + 56);
    return;
  }
  const rowH = 22;
  const start = y + 48;
  const max = Math.max(0, Math.floor((h - 62) / rowH));
  rows.slice(0, max).forEach((row, i) => {
    const yy = start + i * rowH;
    ctx.fillStyle = FG;
    ctx.font = "13px 'IBM Plex Sans', sans-serif";
    ctx.fillText(prettyResidue(row.resName, row.resSeq, row.chain), x + pad, yy);
    ctx.fillStyle = MUTED;
    ctx.font = "12px 'IBM Plex Mono', ui-monospace, monospace";
    ctx.fillText(row.types.map((t) => INTERACTION_LABEL[t]).join(" · "), x + pad + 120, yy);
    ctx.textAlign = "right";
    ctx.fillText(`${row.nPoses}/${poseCount}  ${row.meanDist.toFixed(2)} Å`, x + w - pad, yy);
    ctx.textAlign = "left";
  });
}

function exportPanelHeight(
  panel: ScenePanel,
  span: number,
  colW: number,
  gutter: number,
  fingerprint: Fingerprint | null,
  scale: number,
): number {
  const cap = 66;
  if (panel.height != null) {
    return Math.round(panel.height * scale) + cap;
  }
  if (panel.kind === "ss") return 210;
  if (panel.kind === "chart") return 320;
  if (panel.kind === "residues") return 360;
  if (panel.kind === "contacts") return 240;
  if (panel.kind === "sketch") return 340;
  if (panel.kind === "fingerprint") {
    const nPoses = Math.max(fingerprint?.poseIds.length ?? 3, 1);
    const nRes = Math.max(fingerprint?.residues.length ?? 12, 1);
    const boxW = colW * span + gutter * (span - 1);
    const layout = fingerprintPlateLayout(nRes, nPoses, boxW, { titled: true });
    return layout.height + cap;
  }
  const w = colW * span + gutter * (span - 1);
  return Math.round(w * 0.62) + 56;
}

function panelBoxHeight(
  panel: ScenePanel,
  span: number,
  colW: number,
  gutter: number,
  fingerprint: Fingerprint | null,
  scale: number,
  rowH: number,
): number {
  const own = exportPanelHeight(panel, span, colW, gutter, fingerprint, scale);
  const capH = 44;
  return Math.max(80, Math.min(own, rowH) - capH - 22);
}

export async function composeScenePng(opts: {
  title: string;
  subtitle: string;
  panels: ScenePanel[];
  ss: SSAnalysis | null;
  chart: AffinityChartModel | null;
  fingerprint: Fingerprint | null;
  poseLabels: Record<string, string>;
  ligandColors: Record<string, string>;
  chartStyle: "grouped" | "overlay";
  interacting: Set<string>;
  residueRows?: ResidueRow[];
  commonRows?: CommonContact[];
  poseCount?: number;
}): Promise<string> {
  const {
    title,
    subtitle,
    panels,
    ss,
    chart,
    fingerprint,
    poseLabels,
    ligandColors,
    chartStyle,
    interacting,
    residueRows = [],
    commonRows = [],
    poseCount = 0,
  } = opts;
  const packed = packScene(panels, SCENE_COLS);
  const pageW = 1800;
  const margin = 56;
  const gutter = 18;
  const innerW = pageW - margin * 2;
  const colW = (innerW - gutter * (SCENE_COLS - 1)) / SCENE_COLS;
  const titleH = subtitle ? 92 : 72;
  const scale = innerW / PLATE_CSS_W;

  const rowHeights: number[] = [];
  for (let r = 0; r < packed.rows; r++) {
    const rowPanels = packed.cells.filter((c) => c.row === r);
    let h = 160;
    for (const cell of rowPanels) {
      const panel = panels.find((p) => p.id === cell.id);
      if (!panel) continue;
      h = Math.max(h, exportPanelHeight(panel, cell.span, colW, gutter, fingerprint, scale));
    }
    rowHeights[r] = h;
  }
  const bodyH = rowHeights.reduce((a, b) => a + b, 0) + gutter * Math.max(0, packed.rows - 1);
  const pageH = Math.max(1100, margin + titleH + bodyH + margin);

  const canvas = document.createElement("canvas");
  canvas.width = pageW;
  canvas.height = pageH;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Could not allocate a figure canvas");

  ctx.fillStyle = BG;
  ctx.fillRect(0, 0, pageW, pageH);

  try {
    await document.fonts.ready;
  } catch {
    /* use fallbacks */
  }

  ctx.fillStyle = FG;
  ctx.font = "italic 44px 'Instrument Serif', Georgia, serif";
  ctx.fillText(title || "PoseAtlas figure", margin, margin + 40);
  if (subtitle) {
    ctx.fillStyle = MUTED;
    ctx.font = "16px 'IBM Plex Sans', sans-serif";
    ctx.fillText(subtitle, margin, margin + 68);
  }

  const images = new Map<string, HTMLImageElement>();
  await Promise.all(
    panels
      .filter((p) => p.src)
      .map(async (p) => {
        try {
          images.set(p.id, await loadImage(p.src!));
        } catch {
          /* skip broken panel */
        }
      }),
  );

  let yCursor = margin + titleH;
  for (let r = 0; r < packed.rows; r++) {
    const rowH = rowHeights[r]!;
    const rowCells = packed.cells.filter((c) => c.row === r);
    for (const cell of rowCells) {
      const panel = panels.find((p) => p.id === cell.id);
      if (!panel) continue;
      const x = margin + cell.col * (colW + gutter);
      const w = colW * cell.span + gutter * (cell.span - 1);
      const boxH = panelBoxHeight(panel, cell.span, colW, gutter, fingerprint, scale, rowH);

      const letter = String.fromCharCode(65 + panels.findIndex((p) => p.id === panel.id));
      ctx.fillStyle = FAINT;
      ctx.font = "500 12px 'IBM Plex Mono', ui-monospace, monospace";
      ctx.fillText(`${letter}  ${panel.title.toUpperCase()}`, x, yCursor + 14);

      const boxY = yCursor + 22;
      if (panel.kind === "ss" && ss) {
        paintSsReport(ctx, ss, x, boxY, w, boxH, interacting);
      } else if (panel.kind === "chart" && chart) {
        paintAffinityChart(ctx, chart, x, boxY, w, boxH, ligandColors, chartStyle);
      } else if (panel.kind === "fingerprint" && fingerprint) {
        paintFingerprint(ctx, fingerprint, poseLabels, x, boxY, w, boxH, {
          title: "Interaction fingerprint",
          subtitle: `${fingerprint.residues.length} pocket residues · ${fingerprint.poseIds.length} poses · sequence order`,
        });
      } else if (panel.kind === "residues") {
        paintResidueTable(ctx, residueRows, x, boxY, w, boxH);
      } else if (panel.kind === "contacts") {
        paintCommonContacts(ctx, commonRows, poseCount, x, boxY, w, boxH);
      } else if (images.has(panel.id)) {
        ctx.fillStyle = SURFACE;
        roundRect(ctx, x, boxY, w, boxH, 12);
        ctx.fill();
        ctx.save();
        roundRect(ctx, x, boxY, w, boxH, 12);
        ctx.clip();
        if (panel.kind === "snapshot" || panel.kind === "sketch") {
          drawContain(ctx, images.get(panel.id)!, x, boxY, w, boxH);
        } else {
          drawCover(ctx, images.get(panel.id)!, x, boxY, w, boxH);
        }
        ctx.restore();
      } else {
        ctx.fillStyle = SURFACE;
        roundRect(ctx, x, boxY, w, boxH, 12);
        ctx.fill();
        ctx.fillStyle = FAINT;
        ctx.font = "14px 'IBM Plex Sans', sans-serif";
        ctx.fillText("Empty panel", x + 18, boxY + boxH / 2);
      }

      if (panel.caption) {
        ctx.fillStyle = MUTED;
        ctx.font = "13px 'IBM Plex Sans', sans-serif";
        const cap = panel.caption.length > 110 ? `${panel.caption.slice(0, 107)}…` : panel.caption;
        ctx.fillText(cap, x, yCursor + rowH - 8);
      }
    }
    yCursor += rowH + gutter;
  }

  return canvas.toDataURL("image/png");
}
