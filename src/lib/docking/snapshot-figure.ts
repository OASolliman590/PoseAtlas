/** Rasterise the 2D publication plate (#figure-2d) onto white paper. */

const PAPER = "#faf9f6";
const INK = "#1b1a18";
const MUTED = "#5c5a54";

const VAR_MAP: Array<[string, string]> = [
  ["var(--color-bg)", PAPER],
  ["var(--color-surface)", "#ffffff"],
  ["var(--color-raised)", "#efeae2"],
  ["var(--color-fg)", INK],
  ["var(--color-muted)", MUTED],
  ["var(--color-faint)", "#8a8780"],
  ["var(--color-border)", "#d8d2c6"],
  ["var(--color-accent)", INK],
  ["var(--color-int-hbond)", "#0f7a6c"],
  ["var(--color-int-salt)", "#b44545"],
  ["var(--color-int-hydrophobic)", "#7a756c"],
  ["var(--color-int-pi)", "#c46b5a"],
];

function bakeSvg(svg: SVGSVGElement): string {
  const clone = svg.cloneNode(true) as SVGSVGElement;
  clone.setAttribute("xmlns", "http://www.w3.org/2000/svg");
  if (!clone.getAttribute("viewBox") && svg.viewBox?.baseVal) {
    const vb = svg.viewBox.baseVal;
    clone.setAttribute("viewBox", `${vb.x} ${vb.y} ${vb.width} ${vb.height}`);
  }
  let html = clone.outerHTML;
  for (const [from, to] of VAR_MAP) html = html.split(from).join(to);
  return html;
}

function svgToImage(markup: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const blob = new Blob([markup], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Could not rasterise 2D SVG"));
    };
    img.src = url;
  });
}

export async function snapshotFigure2d(): Promise<string | null> {
  if (typeof document === "undefined") return null;
  const root = document.getElementById("figure-2d");
  if (!root) return null;
  const svgs = [...root.querySelectorAll("svg")] as SVGSVGElement[];
  if (!svgs.length) return null;

  const title =
    root.querySelector("header p")?.textContent?.trim() || "Pose 2D";
  const formula = root.querySelector("header .tabular-nums")?.textContent?.trim() ?? "";
  const smiles = (root.querySelector("[data-smiles]") as HTMLElement | null)?.textContent?.trim() ?? "";

  const images = await Promise.all(svgs.slice(0, 2).map((svg) => svgToImage(bakeSvg(svg))));
  const map = images[0]!;
  const skeletal = images[1] ?? null;

  const w = 1100;
  const mapH = 520;
  const smilesH = smiles ? 72 : 0;
  const skelH = skeletal ? 240 : 0;
  const h = 56 + mapH + 16 + smilesH + (skelH ? skelH + 16 : 0) + 24;
  const canvas = document.createElement("canvas");
  canvas.width = w * 2;
  canvas.height = h * 2;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;
  ctx.scale(2, 2);
  ctx.fillStyle = PAPER;
  ctx.fillRect(0, 0, w, h);

  ctx.fillStyle = INK;
  ctx.font = "italic 22px 'Instrument Serif', Georgia, serif";
  ctx.fillText(title, 28, 36);
  if (formula) {
    ctx.fillStyle = MUTED;
    ctx.font = "12px 'IBM Plex Mono', ui-monospace, monospace";
    ctx.textAlign = "right";
    ctx.fillText(formula, w - 28, 36);
    ctx.textAlign = "left";
  }

  const mapW = w - 56;
  ctx.drawImage(map, 28, 48, mapW, mapH);

  let y = 48 + mapH + 16;
  if (smiles) {
    ctx.fillStyle = MUTED;
    ctx.font = "500 11px 'IBM Plex Mono', ui-monospace, monospace";
    ctx.fillText("SMILES", 28, y + 14);
    ctx.fillStyle = INK;
    ctx.font = "12px 'IBM Plex Mono', ui-monospace, monospace";
    wrapText(ctx, smiles, 28, y + 34, w - 56, 16);
    y += smilesH;
  }
  if (skeletal) {
    ctx.drawImage(skeletal, 28, y, mapW, skelH);
  }

  return canvas.toDataURL("image/png");
}

function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxW: number,
  lineH: number,
): void {
  const chars = text.split("");
  let line = "";
  let yy = y;
  for (const ch of chars) {
    const next = line + ch;
    if (ctx.measureText(next).width > maxW && line) {
      ctx.fillText(line, x, yy);
      line = ch;
      yy += lineH;
    } else {
      line = next;
    }
  }
  if (line) ctx.fillText(line, x, yy);
}
