import { useMemo, useRef } from "react";
import { Copy, Download } from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Button } from "@/components/ui/button";
import {
  affinityTableTsv,
  buildAffinityChart,
  engineColor,
} from "@/lib/docking/engines";
import { ligandDisplay } from "@/lib/docking/names";
import { useSession, type ChartStyle, type PoseRecord } from "@/lib/docking/session-store";
import { cn } from "@/lib/utils";

function formatKcal(value: unknown): string {
  const n = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(n)) return "—";
  return n.toFixed(2);
}

function recolorPaper(svg: SVGSVGElement): void {
  const dark = "#1b1a18";
  const grid = "#d8d2c6";
  svg.querySelectorAll("text").forEach((node) => {
    const fill = node.getAttribute("fill") || "";
    if (fill.includes("muted") || fill.includes("faint") || fill === "var(--color-muted)") {
      node.setAttribute("fill", "#5c5a54");
    } else if (fill.includes("fg") || fill === "var(--color-fg)") {
      node.setAttribute("fill", dark);
    }
  });
  svg.querySelectorAll("line, path").forEach((node) => {
    const stroke = node.getAttribute("stroke") || "";
    if (stroke.includes("border") || stroke.includes("faint")) node.setAttribute("stroke", grid);
  });
}

export function AffinityChart({ poses }: { poses: PoseRecord[] }) {
  const names = useSession((s) => s.names);
  const chartStyle = useSession((s) => s.chartStyle);
  const setChartStyle = useSession((s) => s.setChartStyle);
  const wrapRef = useRef<HTMLDivElement>(null);

  const labeled = useMemo(
    () =>
      poses.map((p) => ({
        ligand: ligandDisplay(names, p.id, p.fallbackLabel),
        engine: p.engine.trim() || "Unknown",
        affinity: p.affinity,
        color: p.color,
      })),
    [poses, names],
  );

  const model = useMemo(() => buildAffinityChart(labeled), [labeled]);

  const ligandColors = useMemo(() => {
    const map: Record<string, string> = {};
    for (const pose of labeled) {
      if (!map[pose.ligand]) map[pose.ligand] = pose.color;
    }
    return map;
  }, [labeled]);

  if (!model.scored) {
    return (
      <div className="border-t border-border px-4 py-3">
        <p className="font-mono text-xs tracking-widest text-faint uppercase">Affinity</p>
        <p className="mt-1 text-sm text-muted">
          No docking scores in these files. Type an affinity on each pose, or add REMARK affinity
          lines from Vina, GNINA, Glide, GOLD.
        </p>
      </div>
    );
  }

  const multiEngine = model.engines.length > 1;
  const values = model.rows.flatMap((row) =>
    model.engines
      .map((engine) => row[engine])
      .filter((v): v is number => typeof v === "number"),
  );
  const min = Math.min(...values, 0);
  const max = Math.max(...values, 0);
  const pad = Math.max(0.4, (max - min) * 0.08);
  const overlap = chartStyle === "overlay" && multiEngine;

  function copyTable() {
    void navigator.clipboard.writeText(affinityTableTsv(model));
  }

  function downloadSvg() {
    const svg = wrapRef.current?.querySelector("svg");
    if (!svg) return;
    const clone = svg.cloneNode(true) as SVGSVGElement;
    clone.setAttribute("xmlns", "http://www.w3.org/2000/svg");
    const vb = clone.viewBox?.baseVal;
    const w = vb?.width || Number(clone.getAttribute("width")) || 640;
    const h = vb?.height || Number(clone.getAttribute("height")) || 220;
    const bg = document.createElementNS("http://www.w3.org/2000/svg", "rect");
    bg.setAttribute("width", String(w));
    bg.setAttribute("height", String(h));
    bg.setAttribute("fill", "#faf9f6");
    clone.insertBefore(bg, clone.firstChild);
    const unit = document.createElementNS("http://www.w3.org/2000/svg", "text");
    unit.setAttribute("x", "8");
    unit.setAttribute("y", "16");
    unit.setAttribute("fill", "#1b1a18");
    unit.setAttribute("font-size", "12");
    unit.setAttribute("font-family", "IBM Plex Sans, sans-serif");
    unit.textContent = "Binding affinity (kcal/mol)";
    clone.appendChild(unit);
    recolorPaper(clone);
    const blob = new Blob([`<?xml version="1.0" encoding="UTF-8"?>${clone.outerHTML}`], {
      type: "image/svg+xml;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "poseatlas-affinity-kcal-mol.svg";
    link.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="border-t border-border px-3 py-2 sm:px-4" data-affinity-chart>
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <div>
          <p className="font-mono text-xs tracking-widest text-faint uppercase">
            Binding affinity
          </p>
          <p className="mt-0.5 text-xs text-muted">
            kcal/mol · more negative is stronger
            {multiEngine
              ? overlap
                ? " · overlapped bars, one per engine"
                : " · grouped by ligand, one bar per engine"
              : " · add another engine to overlay scores"}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-1">
          {multiEngine ? (
            <div className="flex gap-1">
              {(["grouped", "overlay"] as ChartStyle[]).map((style) => (
                <button
                  key={style}
                  type="button"
                  onClick={() => setChartStyle(style)}
                  className={cn(
                    "rounded-md px-2.5 py-1 font-mono text-xs uppercase tracking-wide",
                    chartStyle === style ? "bg-raised text-fg" : "text-faint hover:text-fg",
                  )}
                >
                  {style === "grouped" ? "Grouped" : "Overlap"}
                </button>
              ))}
            </div>
          ) : null}
          <Button size="sm" variant="ghost" onClick={copyTable} aria-label="Copy affinity table">
            <Copy />
            <span className="hidden sm:inline">Copy</span>
          </Button>
          <Button size="sm" variant="ghost" onClick={downloadSvg} aria-label="Download affinity chart">
            <Download />
            <span className="hidden sm:inline">SVG</span>
          </Button>
        </div>
      </div>
      <div ref={wrapRef} className="mt-1 h-36 w-full min-w-0">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={model.rows}
            margin={{ top: 8, right: 12, left: 28, bottom: 4 }}
            barCategoryGap={multiEngine ? "18%" : "28%"}
            barGap={overlap ? -28 : 4}
          >
            <CartesianGrid stroke="var(--color-border)" vertical={false} />
            <XAxis
              dataKey="ligand"
              tick={{ fill: "var(--color-muted)", fontSize: 11, fontFamily: "IBM Plex Sans" }}
              axisLine={{ stroke: "var(--color-border)" }}
              tickLine={false}
            />
            <YAxis
              tick={{ fill: "var(--color-muted)", fontSize: 11, fontFamily: "IBM Plex Mono" }}
              axisLine={false}
              tickLine={false}
              width={72}
              tickFormatter={(v: number) => Number(v).toFixed(1)}
              domain={[Math.floor((min - pad) * 10) / 10, Math.ceil((max + pad) * 10) / 10]}
              label={{
                value: "kcal/mol",
                angle: -90,
                position: "insideLeft",
                offset: 4,
                style: {
                  fill: "var(--color-muted)",
                  fontSize: 11,
                  fontFamily: "IBM Plex Sans, sans-serif",
                  textAnchor: "middle",
                },
              }}
            />
            <ReferenceLine y={0} stroke="var(--color-faint)" />
            <Tooltip
              cursor={{ fill: "var(--color-raised)", opacity: 0.6 }}
              contentStyle={{
                background: "var(--color-surface)",
                border: "1px solid var(--color-border)",
                borderRadius: 8,
                fontSize: 12,
                color: "var(--color-fg)",
              }}
              formatter={(value, name) => [`${formatKcal(value)} kcal/mol`, String(name)]}
            />
            {model.engines.map((engine) => (
              <Bar
                key={engine}
                dataKey={engine}
                name={engine}
                fill={engineColor(engine, model.engines)}
                fillOpacity={overlap ? 0.55 : 0.92}
                radius={[3, 3, 0, 0]}
                maxBarSize={overlap ? 42 : 36}
              >
                {!multiEngine
                  ? model.rows.map((row) => (
                      <Cell
                        key={`${row.ligand}-${engine}`}
                        fill={ligandColors[String(row.ligand)] ?? engineColor(engine, model.engines)}
                      />
                    ))
                  : null}
              </Bar>
            ))}
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div className="mt-1 overflow-x-auto">
        <table className="w-full min-w-[16rem] border-collapse text-left font-mono text-xs">
          <thead>
            <tr className="text-faint">
              <th className="py-1 pr-3 font-medium">Ligand</th>
              {model.engines.map((engine) => (
                <th key={engine} className="py-1 pr-3 font-medium">
                  <span className="inline-flex items-center gap-1.5">
                    <span
                      className="size-1.5 rounded-full"
                      style={{ background: engineColor(engine, model.engines) }}
                    />
                    {engine}
                  </span>
                  <span className="mt-0.5 block font-normal text-faint">kcal/mol</span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {model.rows.map((row) => (
              <tr key={String(row.ligand)} className="border-t border-border text-fg">
                <td className="py-1 pr-3 font-sans text-sm">{row.ligand}</td>
                {model.engines.map((engine) => (
                  <td key={engine} className="py-1 pr-3 tabular-nums">
                    {formatKcal(row[engine])}
                    {typeof row[engine] === "number" ? (
                      <span className="ml-1 text-faint">kcal/mol</span>
                    ) : null}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
