import { useMemo } from "react";
import { CPK, prettyResidue } from "@/lib/docking/chemistry";
import type { Interaction } from "@/lib/docking/interactions";
import { INTERACTION_LABEL } from "@/lib/docking/interactions";
import type { Atom } from "@/lib/docking/pdb";
import {
  buildSketch,
  fitSketch,
  type Sketch,
  type SketchBond,
} from "@/lib/docking/sketch-2d";

const TYPE_STROKE: Record<string, string> = {
  hbond: "var(--color-int-hbond)",
  salt: "var(--color-int-salt)",
  hydrophobic: "var(--color-int-hydrophobic)",
  "pi-stack": "var(--color-int-pi)",
  "pi-cation": "var(--color-int-pi)",
  contact: "var(--color-faint)",
};

const BOND = "var(--color-accent)";
const CHIP_W = 64;
const CHIP_H = 30;
const MAP_W = 520;
const MAP_H = 292;

function perp(dx: number, dy: number, scale: number): { x: number; y: number } {
  const m = Math.hypot(dx, dy) || 1;
  return { x: (-dy / m) * scale, y: (dx / m) * scale };
}

function trimBond(
  a: { x: number; y: number },
  b: { x: number; y: number },
  trimA: number,
  trimB: number,
) {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const m = Math.hypot(dx, dy) || 1;
  const ux = dx / m;
  const uy = dy / m;
  return {
    x1: a.x + ux * trimA,
    y1: a.y + uy * trimA,
    x2: b.x - ux * trimB,
    y2: b.y - uy * trimB,
  };
}

function atomTrim(sketch: Sketch, index: number): number {
  return sketch.atoms[index]!.label ? 7 : 0;
}

function ringCentroid(sketch: Sketch, bond: SketchBond): { x: number; y: number } | null {
  for (const ring of sketch.rings) {
    if (ring.length < 4) continue;
    if (!ring.includes(bond.i) || !ring.includes(bond.j)) continue;
    let x = 0,
      y = 0;
    for (const i of ring) {
      x += sketch.atoms[i]!.x;
      y += sketch.atoms[i]!.y;
    }
    return { x: x / ring.length, y: y / ring.length };
  }
  return null;
}

function BondMarks({ bond, sketch }: { bond: SketchBond; sketch: Sketch }) {
  const a = sketch.atoms[bond.i]!;
  const b = sketch.atoms[bond.j]!;
  const t = trimBond(a, b, atomTrim(sketch, bond.i), atomTrim(sketch, bond.j));
  const dx = t.x2 - t.x1;
  const dy = t.y2 - t.y1;

  if (bond.stereo === "wedge") {
    const p = perp(dx, dy, 5.2);
    return (
      <polygon
        points={`${t.x1},${t.y1} ${t.x2 + p.x},${t.y2 + p.y} ${t.x2 - p.x},${t.y2 - p.y}`}
        fill={BOND}
      />
    );
  }
  if (bond.stereo === "dash") {
    const ticks = 7;
    return (
      <g>
        {Array.from({ length: ticks }, (_, k) => {
          const u = (k + 1) / (ticks + 1);
          const w = 0.8 + u * 4.6;
          const p = perp(dx, dy, w);
          const x = t.x1 + dx * u;
          const y = t.y1 + dy * u;
          return (
            <line
              key={k}
              x1={x - p.x}
              y1={y - p.y}
              x2={x + p.x}
              y2={y + p.y}
              stroke={BOND}
              strokeWidth={1.15}
              strokeLinecap="round"
            />
          );
        })}
      </g>
    );
  }

  const lines = bond.order >= 2.5 ? 3 : bond.order >= 1.6 ? 2 : 1;
  if (lines === 1) {
    return (
      <line
        x1={t.x1}
        y1={t.y1}
        x2={t.x2}
        y2={t.y2}
        stroke={BOND}
        strokeWidth={1.55}
        strokeLinecap="round"
      />
    );
  }

  const mid = { x: (t.x1 + t.x2) / 2, y: (t.y1 + t.y2) / 2 };
  const centroid = ringCentroid(sketch, bond);
  let off = perp(dx, dy, 2.9);
  if (centroid) {
    const toward = { x: centroid.x - mid.x, y: centroid.y - mid.y };
    if (off.x * toward.x + off.y * toward.y < 0) off = { x: -off.x, y: -off.y };
  }

  return (
    <g>
      <line
        x1={t.x1}
        y1={t.y1}
        x2={t.x2}
        y2={t.y2}
        stroke={BOND}
        strokeWidth={1.4}
        strokeLinecap="round"
      />
      <line
        x1={t.x1 + off.x}
        y1={t.y1 + off.y}
        x2={t.x2 + off.x}
        y2={t.y2 + off.y}
        stroke={BOND}
        strokeWidth={1.2}
        strokeLinecap="round"
      />
      {lines === 3 ? (
        <line
          x1={t.x1 - off.x}
          y1={t.y1 - off.y}
          x2={t.x2 - off.x}
          y2={t.y2 - off.y}
          stroke={BOND}
          strokeWidth={1.15}
          strokeLinecap="round"
        />
      ) : null}
    </g>
  );
}

function LigandDrawing({
  sketch,
  highlight,
}: {
  sketch: Sketch;
  highlight?: Set<string>;
}) {
  return (
    <g>
      {sketch.bonds.map((bond, i) => (
        <BondMarks key={`b-${i}`} bond={bond} sketch={sketch} />
      ))}
      {sketch.atoms.map((a) => {
        const marked = highlight?.has(a.atom.name);
        const text = a.label;
        if (!text && !marked) return null;
        const fill = CPK[a.element] ?? CPK.C;
        return (
          <g key={`a-${a.index}`}>
            {text ? (
              <>
                <circle cx={a.x} cy={a.y} r={6.6} fill="var(--color-surface)" />
                <text
                  x={a.x}
                  y={a.y + 3}
                  textAnchor="middle"
                  fill={fill}
                  fontSize={9}
                  fontFamily="IBM Plex Sans, ui-sans-serif, sans-serif"
                  fontWeight={600}
                >
                  {text}
                </text>
              </>
            ) : (
              <circle cx={a.x} cy={a.y} r={2.1} fill={fill} opacity={0.85} />
            )}
          </g>
        );
      })}
    </g>
  );
}

type ResidueMark = {
  hit: Interaction;
  group: Interaction[];
  targets: Sketch["atoms"];
  p: { x: number; y: number };
};

function wrapAngle(a: number): number {
  let x = a;
  while (x <= -Math.PI) x += Math.PI * 2;
  while (x > Math.PI) x -= Math.PI * 2;
  return x;
}

function ellipsePoint(cx: number, cy: number, rx: number, ry: number, angle: number) {
  return { x: cx + Math.cos(angle) * rx, y: cy + Math.sin(angle) * ry };
}

function assignEvenAngles(preferred: number[]): number[] {
  const n = preferred.length;
  if (!n) return [];
  const step = (Math.PI * 2) / n;
  const order = preferred.map((_, i) => i).sort((a, b) => preferred[a]! - preferred[b]!);
  const offset = preferred[order[0]!]! + Math.PI - step / 2;
  const slots = Array.from({ length: n }, (_, k) => wrapAngle(offset + k * step));
  const used = new Set<number>();
  const out = Array.from({ length: n }, () => 0);
  for (const i of order) {
    let best = -1;
    let bestD = Infinity;
    for (let k = 0; k < n; k++) {
      if (used.has(k)) continue;
      const d = Math.abs(wrapAngle(preferred[i]! - slots[k]!));
      if (d < bestD) {
        bestD = d;
        best = k;
      }
    }
    used.add(best);
    out[i] = slots[best]!;
  }
  return out;
}

function placeResidues(sketch: Sketch, hits: Interaction[], W: number, H: number): ResidueMark[] {
  const groups = new Map<string, Interaction[]>();
  for (const hit of hits) {
    const key = `${hit.chain}:${hit.resSeq}`;
    const list = groups.get(key);
    if (list) list.push(hit);
    else groups.set(key, [hit]);
  }
  const ranked = [...groups.values()].sort((a, b) => {
    const rank = (g: Interaction[]) =>
      g.some((h) => h.type === "hbond" || h.type === "salt" || h.type.startsWith("pi")) ? 0 : 1;
    return rank(a) - rank(b) || a[0]!.distance - b[0]!.distance;
  });
  const limited = ranked.slice(0, 7);
  const cx = sketch.atoms.reduce((s, a) => s + a.x, 0) / Math.max(sketch.atoms.length, 1);
  const cy = sketch.atoms.reduce((s, a) => s + a.y, 0) / Math.max(sketch.atoms.length, 1);
  const rx = W / 2 - CHIP_W / 2 - 8;
  const ry = H / 2 - CHIP_H / 2 - 8;

  const raw = limited.map((group, i, all) => {
    const hit = group[0]!;
    const targets = group
      .map((h) => sketch.atoms.find((a) => a.atom.name === h.ligandAtom))
      .filter((a): a is (typeof sketch.atoms)[number] => Boolean(a));
    const aim = targets.length
      ? {
          x: targets.reduce((s, a) => s + a.x, 0) / targets.length,
          y: targets.reduce((s, a) => s + a.y, 0) / targets.length,
        }
      : { x: cx, y: cy };
    const base = Math.atan2(aim.y - cy, aim.x - cx);
    const angle = Number.isFinite(base)
      ? base
      : (i / Math.max(all.length, 1)) * Math.PI * 2 - Math.PI / 2;
    return { hit, group, targets, angle: wrapAngle(angle) };
  });

  const placed = assignEvenAngles(raw.map((r) => r.angle));
  return raw.map((r, i) => ({
    hit: r.hit,
    group: r.group,
    targets: r.targets,
    p: ellipsePoint(cx, cy, rx, ry, placed[i]!),
  }));
}

function shortenToChip(
  from: { x: number; y: number },
  to: { x: number; y: number },
): { x: number; y: number } {
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const m = Math.hypot(dx, dy) || 1;
  const ux = dx / m;
  const uy = dy / m;
  const tx = ux === 0 ? Infinity : (CHIP_W / 2 - 2) / Math.abs(ux);
  const ty = uy === 0 ? Infinity : (CHIP_H / 2 - 2) / Math.abs(uy);
  const cut = Math.min(tx, ty);
  return { x: to.x - ux * cut, y: to.y - uy * cut };
}

export function Diagram2D({
  ligand,
  hits,
  ligandName,
  otherLigands = [],
}: {
  ligand: Atom[];
  hits: Interaction[];
  ligandName: string;
  otherLigands?: { name: string; atoms: Atom[] }[];
}) {
  const pose = useMemo(() => buildSketch(ligand, "pose"), [ligand]);
  const schematic = useMemo(() => buildSketch(ligand, "schematic"), [ligand]);

  const map = useMemo(() => {
    if (pose.atoms.length < 2) return null;
    const sketch = fitSketch(pose, MAP_W, MAP_H, 88);
    const residues = placeResidues(sketch, hits, MAP_W, MAP_H);
    const cx = sketch.atoms.reduce((s, a) => s + a.x, 0) / sketch.atoms.length;
    const cy = sketch.atoms.reduce((s, a) => s + a.y, 0) / sketch.atoms.length;
    return { sketch, residues, cx, cy };
  }, [pose, hits]);

  const overlaySketches = useMemo(
    () =>
      otherLigands
        .filter((item) => item.atoms.length > 1)
        .slice(0, 4)
        .map((item) => ({
          name: item.name,
          sketch: buildSketch(item.atoms, "schematic"),
        })),
    [otherLigands],
  );

  const contactNames = useMemo(() => {
    const set = new Set<string>();
    for (const h of hits) set.add(h.ligandAtom);
    return set;
  }, [hits]);

  if (!map) {
    return <p className="px-4 py-3 text-sm text-muted">Need a ligand to draw a 2D map.</p>;
  }

  return (
    <div className="flex min-h-0 flex-col px-2 pb-3 pt-2">
      <article
        id="figure-2d"
        className="figure-2d flex flex-col gap-1.5 rounded-2xl border border-border p-2.5"
        aria-label={`${ligandName} 2D figure`}
      >
        <header className="flex items-baseline justify-between gap-3 px-1">
          <p className="font-mono text-xs tracking-widest text-faint uppercase">
            Pose 2D · {ligandName}
          </p>
          {pose.formula ? (
            <p className="font-mono text-xs tabular-nums text-muted">{pose.formula}</p>
          ) : null}
        </header>

        <svg
          viewBox={`0 0 ${MAP_W} ${MAP_H}`}
          className="w-full shrink-0 rounded-lg bg-bg"
          role="img"
          aria-label="Ligand–residue interaction diagram"
        >
          {map.residues.map(({ group, targets, p, hit }) =>
            (targets.length ? targets : [{ x: map.cx, y: map.cy }]).map((t, i) => {
              const end = shortenToChip(t, p);
              const kind = group[i]?.type ?? hit.type;
              return (
                <line
                  key={`l-${hit.chain}-${hit.resSeq}-${i}`}
                  x1={t.x}
                  y1={t.y}
                  x2={end.x}
                  y2={end.y}
                  stroke={TYPE_STROKE[kind] ?? "var(--color-faint)"}
                  strokeWidth={1.35}
                  strokeDasharray={kind === "hbond" || kind === "salt" ? "3.5 2.5" : "0"}
                  opacity={0.9}
                />
              );
            }),
          )}
          <LigandDrawing sketch={map.sketch} highlight={contactNames} />
          {map.residues.map(({ hit, group, p }) => {
            const dmin = Math.min(...group.map((g) => g.distance));
            return (
              <g key={`r-${hit.chain}-${hit.resSeq}`}>
                <rect
                  x={p.x - CHIP_W / 2}
                  y={p.y - CHIP_H / 2}
                  width={CHIP_W}
                  height={CHIP_H}
                  rx={5}
                  fill="var(--color-surface)"
                  stroke="var(--color-border)"
                />
                <text
                  x={p.x}
                  y={p.y - 2}
                  textAnchor="middle"
                  fill="var(--color-fg)"
                  fontSize="9"
                  fontFamily="IBM Plex Mono, ui-monospace, monospace"
                >
                  {prettyResidue(hit.resName, hit.resSeq, hit.chain)}
                </text>
                <text
                  x={p.x}
                  y={p.y + 10}
                  textAnchor="middle"
                  fill="var(--color-muted)"
                  fontSize="7.5"
                  fontFamily="IBM Plex Mono, ui-monospace, monospace"
                >
                  {dmin.toFixed(1)} Å
                </text>
              </g>
            );
          })}
        </svg>

        <ul className="flex flex-wrap gap-x-3 gap-y-1 px-1 font-mono text-xs text-muted">
          {Object.entries(INTERACTION_LABEL).map(([k, lab]) => (
            <li key={k} className="flex items-center gap-1.5">
              <span className="h-px w-3" style={{ background: TYPE_STROKE[k] }} />
              {lab}
            </li>
          ))}
        </ul>

        {schematic.smiles ? (
          <div className="rounded-lg border border-border bg-bg px-3 py-1.5">
            <p className="font-mono text-xs tracking-widest text-faint uppercase">SMILES</p>
            <p className="mt-1 break-all font-mono text-xs leading-snug text-muted" data-smiles>
              {schematic.smiles}
            </p>
          </div>
        ) : null}

        <div className="rounded-lg border border-border bg-bg px-3 py-2">
          <div className="flex items-baseline justify-between gap-2">
            <p className="font-mono text-xs tracking-widest text-faint uppercase">Skeletal</p>
            {schematic.formula ? (
              <p className="font-mono text-xs tabular-nums text-muted">{schematic.formula}</p>
            ) : null}
          </div>
          {schematic.svg ? (
            <div className="chem-svg mt-1" dangerouslySetInnerHTML={{ __html: schematic.svg }} />
          ) : (
            <p className="px-1 py-6 text-xs text-muted">No ligand</p>
          )}
        </div>
      </article>

      {overlaySketches.length ? (
        <div className="mt-2 grid grid-cols-2 gap-2 px-1">
          {overlaySketches.map((item) => (
            <div key={item.name} className="rounded-xl border border-border bg-surface px-2 py-2">
              <p className="px-1 font-mono text-xs tracking-widest text-faint uppercase">
                {item.name}
              </p>
              {item.sketch.svg ? (
                <div className="chem-svg mt-1" dangerouslySetInnerHTML={{ __html: item.sketch.svg }} />
              ) : null}
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}
