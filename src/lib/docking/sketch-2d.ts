/** 2D chemical sketch: covalent graph + Kekulé orders, then OpenChemLib layout. */

import { Molecule } from "openchemlib";

export type BondOrder = 1 | 1.5 | 2 | 3;
export type StereoKind = "none" | "wedge" | "dash";
export type SketchStyle = "pose" | "schematic";

export type SketchInput = {
  element: string;
  name: string;
  x: number;
  y: number;
  z: number;
};

export type SketchAtom = {
  index: number;
  atom: SketchInput;
  x: number;
  y: number;
  element: string;
  label: string;
  implicitH: number;
};

export type SketchBond = {
  i: number;
  j: number;
  order: BondOrder;
  stereo: StereoKind;
  aromatic: boolean;
};

export type Sketch = {
  atoms: SketchAtom[];
  bonds: SketchBond[];
  rings: number[][];
  formula: string;
  smiles?: string;
  svg?: string;
};

function dist(a: SketchInput, b: SketchInput): number {
  return Math.hypot(a.x - b.x, a.y - b.y, a.z - b.z);
}

const COV: Record<string, number> = {
  H: 0.31,
  C: 0.76,
  N: 0.71,
  O: 0.66,
  F: 0.57,
  P: 1.07,
  S: 1.05,
  CL: 0.99,
  BR: 1.14,
  I: 1.33,
};

const VALENCE: Record<string, number> = {
  C: 4,
  N: 3,
  O: 2,
  S: 2,
  P: 3,
  F: 1,
  CL: 1,
  BR: 1,
  I: 1,
};

function covBond(a: SketchInput, b: SketchInput): boolean {
  const ra = COV[a.element] ?? 0.77;
  const rb = COV[b.element] ?? 0.77;
  const d = dist(a, b);
  return d > 0.45 && d < (ra + rb) * 1.28 + 0.08;
}

function canonEl(el: string): string {
  const u = el.trim().toUpperCase();
  if (u === "CL" || u === "BR" || u === "SE" || u === "NA" || u === "ZN" || u === "FE" || u === "MG" || u === "MN") {
    return u;
  }
  return u.charAt(0) || "C";
}

function typicalValence(el: string, degree: number): number {
  if (el === "C") return 4;
  if (el === "N") return degree >= 4 ? 4 : 3;
  if (el === "O") return 2;
  if (el === "S") return degree <= 2 ? 2 : degree <= 4 ? 4 : 6;
  if (el === "P") return degree <= 3 ? 3 : 5;
  if (el === "F" || el === "CL" || el === "BR" || el === "I") return 1;
  return 4;
}

function countExplicitH(heavy: SketchInput[], hydro: SketchInput[]): number[] {
  return heavy.map((h) => hydro.reduce((n, p) => n + (dist(h, p) < 1.25 ? 1 : 0), 0));
}


function sssr(nbr: number[][]): number[][] {
  const n = nbr.length;
  const found: number[][] = [];
  const seen = new Set<string>();
  const walk = (start: number, current: number, path: number[], depth: number) => {
    if (found.length >= 24 || depth > 8) return;
    for (const nxt of nbr[current] ?? []) {
      if (depth >= 3 && depth <= 8 && nxt === start) {
        const key = [...path].sort((a, b) => a - b).join(",");
        if (!seen.has(key)) {
          seen.add(key);
          found.push([...path]);
        }
        continue;
      }
      if (path.includes(nxt)) continue;
      walk(start, nxt, [...path, nxt], depth + 1);
    }
  };
  for (let i = 0; i < n && found.length < 24; i++) {
    if ((nbr[i]?.length ?? 0) >= 2) walk(i, i, [i], 1);
  }
  found.sort((a, b) => a.length - b.length || a[0]! - b[0]!);
  const kept: number[][] = [];
  for (const ring of found) {
    const set = new Set(ring);
    const coversSmaller = kept.some((small) => small.every((i) => set.has(i)));
    if (coversSmaller) continue;
    kept.push(ring);
  }
  return kept;
}

function mul3(M: number[], v: [number, number, number]): [number, number, number] {
  return [
    M[0]! * v[0] + M[1]! * v[1] + M[2]! * v[2],
    M[3]! * v[0] + M[4]! * v[1] + M[5]! * v[2],
    M[6]! * v[0] + M[7]! * v[1] + M[8]! * v[2],
  ];
}

function powerEigen(M: number[], seed: [number, number, number]): [number, number, number] {
  let v = norm(seed);
  for (let k = 0; k < 28; k++) v = norm(mul3(M, v));
  return v;
}

function pca2(points: Array<{ x: number; y: number; z: number }>): {
  u: [number, number, number];
  v: [number, number, number];
  w: [number, number, number];
} {
  const n = points.length || 1;
  const c = {
    x: points.reduce((s, p) => s + p.x, 0) / n,
    y: points.reduce((s, p) => s + p.y, 0) / n,
    z: points.reduce((s, p) => s + p.z, 0) / n,
  };
  let xx = 0,
    xy = 0,
    xz = 0,
    yy = 0,
    yz = 0,
    zz = 0;
  for (const p of points) {
    const dx = p.x - c.x,
      dy = p.y - c.y,
      dz = p.z - c.z;
    xx += dx * dx;
    xy += dx * dy;
    xz += dx * dz;
    yy += dy * dy;
    yz += dy * dz;
    zz += dz * dz;
  }
  const M = [xx, xy, xz, xy, yy, yz, xz, yz, zz];
  const u = powerEigen(M, [1, 0.3, 0.1]);
  const lambda = dot(u, mul3(M, u));
  const D = [
    xx - lambda * u[0] * u[0],
    xy - lambda * u[0] * u[1],
    xz - lambda * u[0] * u[2],
    xy - lambda * u[1] * u[0],
    yy - lambda * u[1] * u[1],
    yz - lambda * u[1] * u[2],
    xz - lambda * u[2] * u[0],
    yz - lambda * u[2] * u[1],
    zz - lambda * u[2] * u[2],
  ];
  let v = powerEigen(D, [0.2, 1, 0.4]);
  v = norm(sub(v, scale(u, dot(v, u))));
  if (len(v) < 1e-6) v = norm(cross(u, [0, 0, 1]));
  if (len(v) < 1e-6) v = norm(cross(u, [1, 0, 0]));
  const w = norm(cross(u, v));
  return { u, v, w };
}

function norm(a: [number, number, number]): [number, number, number] {
  const m = len(a) || 1;
  return [a[0] / m, a[1] / m, a[2] / m];
}
function len(a: [number, number, number]): number {
  return Math.hypot(a[0], a[1], a[2]);
}
function cross(a: [number, number, number], b: [number, number, number]): [number, number, number] {
  return [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
}
function dot(a: [number, number, number], b: [number, number, number]): number {
  return a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
}
function sub(a: [number, number, number], b: [number, number, number]): [number, number, number] {
  return [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
}
function scale(a: [number, number, number], s: number): [number, number, number] {
  return [a[0] * s, a[1] * s, a[2] * s];
}

function rotateAbout(p: { x: number; y: number }, origin: { x: number; y: number }, ang: number) {
  const dx = p.x - origin.x;
  const dy = p.y - origin.y;
  const c = Math.cos(ang);
  const s = Math.sin(ang);
  return { x: origin.x + dx * c - dy * s, y: origin.y + dx * s + dy * c };
}

function regularizeRing(xy: Array<{ x: number; y: number }>, ring: number[]): void {
  const n = ring.length;
  if (n < 3) return;
  let cx = 0,
    cy = 0;
  for (const i of ring) {
    cx += xy[i]!.x;
    cy += xy[i]!.y;
  }
  cx /= n;
  cy /= n;
  let r = 0;
  let area = 0;
  for (let k = 0; k < n; k++) {
    const a = xy[ring[k]!]!;
    const b = xy[ring[(k + 1) % n]!]!;
    r += Math.hypot(a.x - cx, a.y - cy);
    area += a.x * b.y - b.x * a.y;
  }
  r /= n;
  const first = xy[ring[0]!]!;
  const a0 = Math.atan2(first.y - cy, first.x - cx);
  const sign = area >= 0 ? 1 : -1;
  for (let k = 0; k < n; k++) {
    const ang = a0 + sign * ((k * 2 * Math.PI) / n);
    xy[ring[k]!] = { x: cx + r * Math.cos(ang), y: cy + r * Math.sin(ang) };
  }
}

function snapRing(xy: Array<{ x: number; y: number }>, ring: number[], amount: number): void {
  if (amount <= 0) return;
  const saved = ring.map((i) => ({ ...xy[i]! }));
  regularizeRing(xy, ring);
  if (amount >= 1) return;
  for (let k = 0; k < ring.length; k++) {
    const i = ring[k]!;
    const from = saved[k]!;
    const to = xy[i]!;
    xy[i] = {
      x: from.x + (to.x - from.x) * amount,
      y: from.y + (to.y - from.y) * amount,
    };
  }
}

function completeRingFromEdge(xy: Array<{ x: number; y: number }>, ring: number[], placed: Set<number>): void {
  const n = ring.length;
  let s = -1;
  for (let k = 0; k < n; k++) {
    if (placed.has(ring[k]!) && placed.has(ring[(k + 1) % n]!)) {
      s = k;
      break;
    }
  }
  if (s < 0) {
    regularizeRing(xy, ring);
    return;
  }
  const A = xy[ring[s]!]!;
  const B = xy[ring[(s + 1) % n]!]!;
  const step = (2 * Math.PI) / n;
  const thirdIdx = ring[(s + 2) % n]!;
  let sign = 1;
  if (placed.has(thirdIdx)) {
    const plus = rotateAbout(A, B, step);
    const minus = rotateAbout(A, B, -step);
    const t = xy[thirdIdx]!;
    const dp = Math.hypot(plus.x - t.x, plus.y - t.y);
    const dm = Math.hypot(minus.x - t.x, minus.y - t.y);
    sign = dp <= dm ? 1 : -1;
  }
  let prev2 = { ...A };
  let prev1 = { ...B };
  for (let k = 2; k < n; k++) {
    const nxt = rotateAbout(prev2, prev1, sign * step);
    const idx = ring[(s + k) % n]!;
    if (!placed.has(idx)) xy[idx] = nxt;
    prev2 = prev1;
    prev1 = placed.has(idx) ? { ...xy[idx]! } : nxt;
  }
}

function layoutRings(
  xy: Array<{ x: number; y: number }>,
  rings: number[][],
  style: SketchStyle,
): void {
  const ordered = [...rings].sort((a, b) => b.length - a.length);
  if (style === "pose") {
    for (const ring of ordered) {
      if (ring.length >= 5 && ring.length <= 7) snapRing(xy, ring, 0.42);
    }
    return;
  }
  const placed = new Set<number>();
  for (const ring of ordered) {
    if (ring.length < 4 || ring.length > 8) continue;
    const known = ring.filter((i) => placed.has(i)).length;
    if (known < 2) regularizeRing(xy, ring);
    else completeRingFromEdge(xy, ring, placed);
    for (const i of ring) placed.add(i);
  }
}

function relax(
  xy: Array<{ x: number; y: number }>,
  nbr: number[][],
  bonds: Array<{ i: number; j: number }>,
  rings: number[][],
  steps: number,
  ringLock: boolean,
): void {
  const n = xy.length;
  const ideal = 1.15;
  const locked = new Set<number>();
  if (ringLock) {
    for (const ring of rings) {
      if (ring.length >= 5 && ring.length <= 7) for (const i of ring) locked.add(i);
    }
  }
  for (let step = 0; step < steps; step++) {
    const force = Array.from({ length: n }, () => ({ x: 0, y: 0 }));
    for (const b of bonds) {
      const a = xy[b.i]!,
        c = xy[b.j]!;
      const dx = c.x - a.x,
        dy = c.y - a.y;
      const d = Math.hypot(dx, dy) || 1e-4;
      const f = (d - ideal) * 0.2;
      const fx = (dx / d) * f,
        fy = (dy / d) * f;
      force[b.i]!.x += fx;
      force[b.i]!.y += fy;
      force[b.j]!.x -= fx;
      force[b.j]!.y -= fy;
    }
    for (let i = 0; i < n; i++) {
      for (let j = i + 1; j < n; j++) {
        if (nbr[i]!.includes(j)) continue;
        const a = xy[i]!,
          c = xy[j]!;
        const dx = c.x - a.x,
          dy = c.y - a.y;
        const d = Math.hypot(dx, dy) || 1e-4;
        if (d > 1.55) continue;
        const f = (1.55 - d) * 0.1;
        const fx = (dx / d) * f,
          fy = (dy / d) * f;
        force[i]!.x -= fx;
        force[i]!.y -= fy;
        force[j]!.x += fx;
        force[j]!.y += fy;
      }
    }
    for (let i = 0; i < n; i++) {
      const ns = nbr[i]!;
      if (ns.length < 2) continue;
      const target =
        ns.length === 3 ? (2 * Math.PI) / 3 : ns.length === 4 ? Math.PI / 2 : (2 * Math.PI) / ns.length;
      const origin = xy[i]!;
      for (let a = 0; a < ns.length; a++) {
        const b = (a + 1) % ns.length;
        const p = xy[ns[a]!]!,
          q = xy[ns[b]!]!;
        const v1x = p.x - origin.x,
          v1y = p.y - origin.y;
        const v2x = q.x - origin.x,
          v2y = q.y - origin.y;
        const ang = Math.atan2(v1x * v2y - v1y * v2x, v1x * v2x + v1y * v2y);
        const diff = (Math.abs(ang) - target) * 0.1 * Math.sign(ang || 1);
        force[ns[a]!]!.x += -v1y * diff;
        force[ns[a]!]!.y += v1x * diff;
        force[ns[b]!]!.x += v2y * diff;
        force[ns[b]!]!.y += -v2x * diff;
      }
    }
    const damp = 0.5;
    for (let i = 0; i < n; i++) {
      const scaleF = locked.has(i) ? 0.15 : 1;
      xy[i]!.x += force[i]!.x * damp * scaleF;
      xy[i]!.y += force[i]!.y * damp * scaleF;
    }
    if (ringLock && step % 10 === 9) {
      for (const ring of rings) {
        if (ring.length >= 5 && ring.length <= 7) regularizeRing(xy, ring);
      }
    }
  }
}

function orientLandscape(xy: Array<{ x: number; y: number }>): void {
  const n = xy.length || 1;
  const cx = xy.reduce((s, p) => s + p.x, 0) / n;
  const cy = xy.reduce((s, p) => s + p.y, 0) / n;
  let xx = 0,
    xyC = 0,
    yy = 0;
  for (const p of xy) {
    const dx = p.x - cx,
      dy = p.y - cy;
    xx += dx * dx;
    xyC += dx * dy;
    yy += dy * dy;
  }
  const ang = 0.5 * Math.atan2(2 * xyC, xx - yy);
  const c = Math.cos(-ang);
  const s = Math.sin(-ang);
  for (const p of xy) {
    const dx = p.x - cx,
      dy = p.y - cy;
    p.x = cx + dx * c - dy * s;
    p.y = cy + dx * s + dy * c;
  }
  const spanX = Math.max(...xy.map((p) => p.x)) - Math.min(...xy.map((p) => p.x));
  const spanY = Math.max(...xy.map((p) => p.y)) - Math.min(...xy.map((p) => p.y));
  if (spanY > spanX) {
    for (const p of xy) {
      const dx = p.x - cx,
        dy = p.y - cy;
      p.x = cx - dy;
      p.y = cy + dx;
    }
  }
}

function implicitH(element: string, orders: number, neighbors: number, aromatic: boolean): number {
  const v = VALENCE[element];
  if (v == null) return 0;
  if (element === "N" && aromatic && neighbors === 2) {
    const need = Math.max(0, Math.round(v - orders));
    return need > 1 ? 1 : need;
  }
  return Math.max(0, Math.round(v - orders));
}

function prettyElement(element: string): string {
  if (element === "CL") return "Cl";
  if (element === "BR") return "Br";
  return element[0] + element.slice(1).toLowerCase();
}

function elementLabel(element: string, h: number): string {
  if (element === "C") return "";
  const el = prettyElement(element);
  if (h <= 0) return el;
  if (h === 1) return `${el}H`;
  return `${el}H${h}`;
}

function hillFormula(heavy: SketchInput[], hs: number[]): string {
  const counts = new Map<string, number>();
  const add = (el: string, n = 1) => counts.set(el, (counts.get(el) ?? 0) + n);
  for (let i = 0; i < heavy.length; i++) {
    add(heavy[i]!.element);
    if (hs[i]) add("H", hs[i]!);
  }
  const parts: string[] = [];
  const emit = (el: string) => {
    const n = counts.get(el);
    if (!n) return;
    parts.push(n === 1 ? prettyElement(el) : `${prettyElement(el)}${n}`);
    counts.delete(el);
  };
  emit("C");
  emit("H");
  for (const el of [...counts.keys()].sort()) emit(el);
  return parts.join("");
}

function isAromaticRing(heavy: SketchInput[], ring: number[], nbr: number[][]): boolean {
  if (ring.length !== 5 && ring.length !== 6) return false;
  for (const i of ring) {
    const el = heavy[i]!.element;
    if (!(el === "C" || el === "N" || el === "O" || el === "S")) return false;
    if ((nbr[i]?.length ?? 0) > 3) return false;
  }
  let mean = 0;
  for (let k = 0; k < ring.length; k++) {
    mean += dist(heavy[ring[k]!]!, heavy[ring[(k + 1) % ring.length]!]!);
  }
  mean /= ring.length;
  return mean < 1.46;
}

function assignBondOrders(
  heavy: SketchInput[],
  nbr: number[][],
  rings: number[][],
  explicitH: number[],
  hasHydrogens: boolean,
): SketchBond[] {
  const n = heavy.length;
  const raw: Array<{ i: number; j: number; d: number; order: number }> = [];
  for (let i = 0; i < n; i++) {
    for (const j of nbr[i] ?? []) {
      if (j <= i) continue;
      raw.push({ i, j, d: dist(heavy[i]!, heavy[j]!), order: 1 });
    }
  }
  const remaining = heavy.map((atom, i) =>
    Math.max(
      0,
      typicalValence(atom.element, nbr[i]!.length) - nbr[i]!.length - (hasHydrogens ? explicitH[i]! : 0),
    ),
  );
  const bump = (b: (typeof raw)[number], extra = 1) => {
    if (remaining[b.i]! < extra || remaining[b.j]! < extra) return false;
    b.order += extra;
    remaining[b.i]! -= extra;
    remaining[b.j]! -= extra;
    return true;
  };
  const sorted = [...raw].sort((a, b) => a.d - b.d);
  for (const b of sorted) {
    const pair = [heavy[b.i]!.element, heavy[b.j]!.element].sort().join("");
    if (pair === "CC" && b.d < 1.22) bump(b, 2) || bump(b);
    else if (pair === "CC" && b.d < 1.32) bump(b);
    else if (pair === "CO" && b.d < 1.3) bump(b);
    else if (pair === "CN" && b.d < 1.32) bump(b);
    else if (pair === "CS" && b.d < 1.6) bump(b);
    else if (pair === "NO" && b.d < 1.25) bump(b);
    else if (pair === "PO" && b.d < 1.55) bump(b);
  }
  const byKey = new Map(raw.map((b) => [b.i < b.j ? `${b.i}-${b.j}` : `${b.j}-${b.i}`, b]));
  const aromaticAtoms = new Set<number>();
  for (const ring of rings) {
    if (ring.length !== 5 && ring.length !== 6) continue;
    if (!isAromaticRing(heavy, ring, nbr)) continue;
    for (const i of ring) aromaticAtoms.add(i);
    const edges: typeof raw = [];
    for (let k = 0; k < ring.length; k++) {
      const a = ring[k]!;
      const c = ring[(k + 1) % ring.length]!;
      const b = byKey.get(a < c ? `${a}-${c}` : `${c}-${a}`);
      if (b) edges.push(b);
    }
    edges.sort((a, b) => remaining[b.i]! + remaining[b.j]! - (remaining[a.i]! + remaining[a.j]!));
    for (const b of edges) {
      if (b.order >= 2) continue;
      const adj = edges.some(
        (e) => e !== b && e.order >= 2 && (e.i === b.i || e.i === b.j || e.j === b.i || e.j === b.j),
      );
      if (adj) continue;
      bump(b);
    }
  }
  if (hasHydrogens) {
    for (const b of sorted) bump(b);
  }
  return raw.map((b) => ({
    i: b.i,
    j: b.j,
    order: (b.order >= 3 ? 3 : b.order >= 2 ? 2 : 1) as BondOrder,
    stereo: "none" as StereoKind,
    aromatic: aromaticAtoms.has(b.i) && aromaticAtoms.has(b.j),
  }));
}

function centroid2(pts: Array<{ x: number; y: number }>): { x: number; y: number } {
  const n = pts.length || 1;
  return {
    x: pts.reduce((s, p) => s + p.x, 0) / n,
    y: pts.reduce((s, p) => s + p.y, 0) / n,
  };
}

function kabschAlign(
  src: Array<{ x: number; y: number }>,
  dst: Array<{ x: number; y: number }>,
): Array<{ x: number; y: number }> {
  if (src.length !== dst.length || src.length < 2) return src.map((p) => ({ ...p }));
  const cs = centroid2(src);
  const cd = centroid2(dst);
  const from = src.map((p) => ({ x: p.x - cs.x, y: p.y - cs.y }));
  const to = dst.map((p) => ({ x: p.x - cd.x, y: p.y - cd.y }));
  const score = (flipped: boolean) => {
    const pts = from.map((p) => ({ x: p.x, y: flipped ? -p.y : p.y }));
    let xx = 0,
      xy = 0,
      yx = 0,
      yy = 0;
    for (let i = 0; i < pts.length; i++) {
      xx += pts[i]!.x * to[i]!.x;
      xy += pts[i]!.x * to[i]!.y;
      yx += pts[i]!.y * to[i]!.x;
      yy += pts[i]!.y * to[i]!.y;
    }
    const A = xx + yy;
    const B = xy - yx;
    const nrm = Math.hypot(A, B) || 1;
    const c = A / nrm;
    const s = B / nrm;
    let e = 0;
    const out = pts.map((p, i) => {
      const x = c * p.x - s * p.y;
      const y = s * p.x + c * p.y;
      e += (x - to[i]!.x) ** 2 + (y - to[i]!.y) ** 2;
      return { x: x + cd.x, y: y + cd.y };
    });
    return { e, out };
  };
  const a = score(false);
  const b = score(true);
  return a.e <= b.e ? a.out : b.out;
}


function oclAtomicNo(element: string): number {
  const label =
    element === "CL"
      ? "Cl"
      : element === "BR"
        ? "Br"
        : element === "NA"
          ? "Na"
          : element === "SE"
            ? "Se"
            : prettyElement(element);
  const n = Molecule.getAtomicNoFromLabel(label);
  return n > 0 ? n : 6;
}

function oclBondType(order: BondOrder): number {
  if (order >= 2.5) return Molecule.cBondTypeTriple;
  if (order >= 1.6) return Molecule.cBondTypeDouble;
  return Molecule.cBondTypeSingle;
}

let chemSvgId = 0;

function themeChemSvg(svg: string): string {
  return svg
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/stroke="rgb\(\s*0,\s*0,\s*0\s*\)"/g, 'stroke="#c8ccd4"')
    .replace(/fill="rgb\(\s*0,\s*0,\s*0\s*\)"/g, 'fill="#f4f1ea"')
    .replace(/stroke="#000000"/gi, 'stroke="#c8ccd4"')
    .replace(/fill="#000000"/gi, 'fill="#f4f1ea"')
    .replace(/stroke="black"/gi, 'stroke="#c8ccd4"')
    .replace(/fill="black"/gi, 'fill="#f4f1ea"');
}

function moleculeFromSketch(heavy: SketchInput[], bonds: SketchBond[]): Molecule {
  const mol = new Molecule(heavy.length + 8, bonds.length + 8);
  for (const atom of heavy) {
    const i = mol.addAtom(oclAtomicNo(atom.element));
    mol.setAtomX(i, atom.x);
    mol.setAtomY(i, atom.y);
    mol.setAtomZ(i, atom.z);
  }
  for (const b of bonds) {
    const idx = mol.addBond(b.i, b.j);
    mol.setBondType(idx, oclBondType(b.order));
  }
  mol.ensureHelperArrays(Molecule.cHelperRings);
  return mol;
}

function applyCheminformatics(
  sketch: Sketch,
  heavy: SketchInput[],
  style: SketchStyle,
  poseTarget?: Array<{ x: number; y: number }>,
): Sketch {
  if (!sketch.atoms.length) return sketch;
  try {
    const mol = moleculeFromSketch(heavy, sketch.bonds);
    mol.ensureHelperArrays(Molecule.cHelperRings);
    mol.inventCoordinates({ seed: 0 });
    const invented = sketch.atoms.map((_, i) => ({
      x: mol.getAtomX(i),
      y: -mol.getAtomY(i),
    }));
    const laid =
      style === "pose" && poseTarget && poseTarget.length === invented.length
        ? kabschAlign(invented, poseTarget)
        : invented;
    if (style !== "pose") orientLandscape(laid);
    for (let i = 0; i < sketch.atoms.length; i++) {
      sketch.atoms[i]!.x = laid[i]!.x;
      sketch.atoms[i]!.y = laid[i]!.y;
    }

    const hs = sketch.atoms.map((_, i) => {
      try {
        return Math.max(0, mol.getImplicitHydrogens(i) | 0);
      } catch {
        return sketch.atoms[i]!.implicitH;
      }
    });
    for (let i = 0; i < sketch.atoms.length; i++) {
      sketch.atoms[i]!.implicitH = hs[i]!;
      sketch.atoms[i]!.label = elementLabel(sketch.atoms[i]!.element, hs[i]!);
    }
    try {
      const hill = mol.getMolecularFormula()?.formula;
      sketch.formula = hill || hillFormula(heavy, hs);
    } catch {
      sketch.formula = hillFormula(heavy, hs);
    }

    const nBonds = mol.getAllBonds();
    const byPair = new Map(sketch.bonds.map((b) => [b.i < b.j ? `${b.i}-${b.j}` : `${b.j}-${b.i}`, b]));
    for (let b = 0; b < nBonds; b++) {
      const i = mol.getBondAtom(0, b);
      const j = mol.getBondAtom(1, b);
      const rec = byPair.get(i < j ? `${i}-${j}` : `${j}-${i}`);
      if (!rec) continue;
      const simple = mol.getBondTypeSimple(b);
      if (simple === Molecule.cBondTypeTriple) rec.order = 3;
      else if (simple === Molecule.cBondTypeDouble) rec.order = 2;
      else if (simple === Molecule.cBondTypeSingle) rec.order = rec.aromatic ? rec.order : 1;
      rec.stereo = "none";
    }

    try {
      sketch.smiles = mol.toIsomericSmiles();
    } catch {
      sketch.smiles = undefined;
    }

    if (style === "schematic") {
      try {
        sketch.svg = themeChemSvg(
          mol.toSVG(420, 220, `chem${++chemSvgId}`, {
            suppressChiralText: true,
            suppressESR: true,
            noStereoProblem: true,
            autoCrop: true,
            autoCropMargin: 12,
            strokeWidth: 1.45,
            factorTextSize: 1,
          }),
        );
      } catch {
        sketch.svg = undefined;
      }
    }
    return sketch;
  } catch {
    return sketch;
  }
}

export function buildSketch(input: SketchInput[], style: SketchStyle = "schematic"): Sketch {
  const atoms = input.map((a) => ({ ...a, element: canonEl(a.element) }));
  const hydro = atoms.filter((a) => a.element === "H");
  const heavy = atoms.filter((a) => a.element !== "H");
  const n = heavy.length;
  if (n === 0) return { atoms: [], bonds: [], rings: [], formula: "" };

  const nbr: number[][] = Array.from({ length: n }, () => []);
  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) {
      if (!covBond(heavy[i]!, heavy[j]!)) continue;
      nbr[i]!.push(j);
      nbr[j]!.push(i);
    }
  }

  const rings = sssr(nbr);
  const hasHydrogens = hydro.length >= 3;
  const explicitH = countExplicitH(heavy, hydro);
  const bonds = assignBondOrders(heavy, nbr, rings, explicitH, hasHydrogens);

  const { u, v } = pca2(heavy);
  const c = {
    x: heavy.reduce((s, a) => s + a.x, 0) / n,
    y: heavy.reduce((s, a) => s + a.y, 0) / n,
    z: heavy.reduce((s, a) => s + a.z, 0) / n,
  };
  const xy = heavy.map((a) => {
    const d: [number, number, number] = [a.x - c.x, a.y - c.y, a.z - c.z];
    return { x: dot(d, u), y: dot(d, v) };
  });

  layoutRings(xy, rings, style);
  if (style === "schematic") {
    relax(xy, nbr, bonds, rings, 56, true);
    orientLandscape(xy);
  } else {
    relax(xy, nbr, bonds, rings, 14, false);
  }

  const orderSum = Array.from({ length: n }, () => 0);
  for (const b of bonds) {
    orderSum[b.i]! += b.order;
    orderSum[b.j]! += b.order;
  }
  const aromaticAtoms = new Set<number>();
  for (const b of bonds) {
    if (b.aromatic) {
      aromaticAtoms.add(b.i);
      aromaticAtoms.add(b.j);
    }
  }

  const hs = hasHydrogens
    ? explicitH
    : heavy.map((atom, index) =>
        implicitH(atom.element, orderSum[index]!, nbr[index]!.length, aromaticAtoms.has(index)),
      );

  const sketchAtoms: SketchAtom[] = heavy.map((atom, index) => ({
    index,
    atom,
    x: xy[index]!.x,
    y: xy[index]!.y,
    element: atom.element,
    label: elementLabel(atom.element, hs[index]!),
    implicitH: hs[index]!,
  }));

  const sketch: Sketch = { atoms: sketchAtoms, bonds, rings, formula: hillFormula(heavy, hs) };
  return applyCheminformatics(sketch, heavy, style, xy);
}

export function fitSketch(sketch: Sketch, width: number, height: number, pad: number): Sketch {
  if (!sketch.atoms.length) return sketch;
  let minX = Infinity,
    maxX = -Infinity,
    minY = Infinity,
    maxY = -Infinity;
  for (const a of sketch.atoms) {
    minX = Math.min(minX, a.x);
    maxX = Math.max(maxX, a.x);
    minY = Math.min(minY, a.y);
    maxY = Math.max(maxY, a.y);
  }
  const sx = (width - pad * 2) / Math.max(1e-3, maxX - minX);
  const sy = (height - pad * 2) / Math.max(1e-3, maxY - minY);
  const s = Math.min(sx, sy);
  const cx = (minX + maxX) / 2;
  const cy = (minY + maxY) / 2;
  return {
    ...sketch,
    atoms: sketch.atoms.map((a) => ({
      ...a,
      x: width / 2 + (a.x - cx) * s,
      y: height / 2 + (a.y - cy) * s,
    })),
  };
}

export function meanBondLength(sketch: Sketch): number {
  if (!sketch.bonds.length) return 0;
  let s = 0;
  for (const b of sketch.bonds) {
    const a = sketch.atoms[b.i]!,
      c = sketch.atoms[b.j]!;
    s += Math.hypot(a.x - c.x, a.y - c.y);
  }
  return s / sketch.bonds.length;
}

export function meanRingAngle(sketch: Sketch): number {
  const hex = sketch.rings.find((r) => r.length === 6);
  if (!hex) return 0;
  let sum = 0;
  for (let k = 0; k < 6; k++) {
    const p = sketch.atoms[hex[(k + 5) % 6]!]!;
    const o = sketch.atoms[hex[k]!]!;
    const q = sketch.atoms[hex[(k + 1) % 6]!]!;
    const v1x = p.x - o.x,
      v1y = p.y - o.y;
    const v2x = q.x - o.x,
      v2y = q.y - o.y;
    const ang = Math.atan2(v1x * v2y - v1y * v2x, v1x * v2x + v1y * v2y);
    sum += Math.abs(ang);
  }
  return (sum / 6) * (180 / Math.PI);
}
