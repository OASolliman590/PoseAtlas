import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { prettyResidue, ssGroup, ssLabel, type SSCode } from "@/lib/docking/chemistry";
import type { ResidueSS, SSAnalysis } from "@/lib/docking/dssp";
import { chainDisplay, type Nomenclature } from "@/lib/docking/names";
import { cn } from "@/lib/utils";

export function SsStrip({
  ss,
  names,
  interacting,
}: {
  ss: SSAnalysis | null;
  names: Nomenclature;
  interacting: Set<string>;
}) {
  const [open, setOpen] = useState(false);

  if (!ss || !ss.residues.length) {
    return (
      <div className="border-b border-border px-3 py-1.5 sm:px-4">
        <p className="font-mono text-xs text-muted">Secondary structure — load a PDB</p>
      </div>
    );
  }

  const byChain = new Map<string, typeof ss.residues>();
  for (const r of ss.residues) {
    const list = byChain.get(r.chain);
    if (list) list.push(r);
    else byChain.set(r.chain, [r]);
  }

  return (
    <div className={cn("relative border-b border-border", open && "z-40")}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-label="Secondary structure report"
        className="flex w-full items-center gap-3 px-3 py-1.5 text-left sm:px-4"
      >
        <div className="flex h-1.5 min-w-0 flex-1 overflow-hidden rounded-full">
          <span className="bg-ss-helix" style={{ width: `${ss.percents.helix}%` }} />
          <span className="bg-ss-sheet" style={{ width: `${ss.percents.sheet}%` }} />
          <span className="bg-ss-turn" style={{ width: `${ss.percents.turn}%` }} />
          <span className="bg-ss-coil" style={{ width: `${ss.percents.coil}%` }} />
        </div>
        <span className="shrink-0 font-mono text-xs tabular-nums text-muted">
          {ss.percents.helix.toFixed(0)}% helix · {ss.percents.sheet.toFixed(0)}% sheet · {ss.residues.length} aa
        </span>
        {open ? (
          <ChevronUp className="size-3.5 shrink-0 text-faint" />
        ) : (
          <ChevronDown className="size-3.5 shrink-0 text-faint" />
        )}
      </button>

      {open ? (
        <div className="absolute inset-x-0 top-full z-40 max-h-[min(50vh,22rem)] overflow-y-auto border-b border-border bg-surface px-3 py-3 shadow-xl sm:px-4">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <p className="font-mono text-xs tracking-widest text-faint uppercase">Kabsch–Sander DSSP</p>
            <p className="font-mono text-xs tabular-nums text-muted">
              {ss.helixCount} helices · {ss.strandCount} strands
            </p>
          </div>
          <ul className="mt-2 flex flex-wrap gap-x-3 gap-y-1 font-mono text-xs text-muted">
            <li>
              <span className="text-ss-helix">Helix</span> {ss.percents.helix.toFixed(0)}%
            </li>
            <li>
              <span className="text-ss-sheet">Sheet</span> {ss.percents.sheet.toFixed(0)}%
            </li>
            <li>
              <span className="text-ss-turn">Turn</span> {ss.percents.turn.toFixed(0)}%
            </li>
            <li>
              <span className="text-ss-coil">Coil</span> {ss.percents.coil.toFixed(0)}%
            </li>
            {ss.meanHelixLength ? (
              <li className="text-faint">⟨helix⟩ {ss.meanHelixLength.toFixed(1)} res</li>
            ) : null}
          </ul>
          <div className="mt-3 flex flex-col gap-3 lg:flex-row">
            <div className="min-w-0 flex-1 space-y-2">
              {[...byChain.entries()].map(([chain, residues]) => (
                <ChainStrip
                  key={chain}
                  chain={chain}
                  domain={chainDisplay(names, chain)}
                  residues={residues}
                  interacting={interacting}
                />
              ))}
            </div>
            <Ramachandran residues={ss.residues} interacting={interacting} />
          </div>
        </div>
      ) : null}
    </div>
  );
}

function ChainStrip({
  chain,
  domain,
  residues,
  interacting,
}: {
  chain: string;
  domain: string;
  residues: { chain: string; resSeq: number; resName: string; ss: SSCode }[];
  interacting: Set<string>;
}) {
  return (
    <div>
      <p className="mb-1 font-mono text-xs text-faint">
        {domain}
        {domain !== `Chain ${chain}` ? <span> · {chain}</span> : null}
        <span className="tabular-nums"> · {residues.length}</span>
      </p>
      <div className="flex h-4 overflow-hidden rounded-sm">
        {residues.map((r) => {
          const key = `${r.chain}:${r.resSeq}`;
          const group = ssGroup(r.ss);
          const hit = interacting.has(key);
          return (
            <span
              key={key}
              title={`${prettyResidue(r.resName, r.resSeq, r.chain)} · ${ssLabel(r.ss)}${hit ? " · contacting" : ""}`}
              className={cn(
                "min-w-px flex-1",
                group === "helix" && "bg-ss-helix",
                group === "sheet" && "bg-ss-sheet",
                group === "turn" && "bg-ss-turn",
                group === "coil" && "bg-ss-coil",
                hit && "ring-1 ring-fg/70",
              )}
            />
          );
        })}
      </div>
    </div>
  );
}

function Ramachandran({
  residues,
  interacting,
}: {
  residues: ResidueSS[];
  interacting: Set<string>;
}) {
  const w = 128;
  const pad = 14;
  const inner = w - pad * 2;
  const map = (phi: number, psi: number) => ({
    x: pad + ((phi + 180) / 360) * inner,
    y: pad + ((180 - psi) / 360) * inner,
  });
  const plotted = residues.filter((r) => r.phi !== null && r.psi !== null);

  return (
    <div className="hidden shrink-0 lg:block">
      <p className="mb-1 font-mono text-xs tracking-widest text-faint uppercase">Ramachandran</p>
      <svg
        width={w}
        height={w}
        viewBox={`0 0 ${w} ${w}`}
        className="rounded-lg border border-border bg-bg"
        aria-label="Ramachandran plot"
      >
        <line x1={pad} y1={w / 2} x2={w - pad} y2={w / 2} stroke="#26262b" />
        <line x1={w / 2} y1={pad} x2={w / 2} y2={w - pad} stroke="#26262b" />
        {plotted.map((r) => {
          const p = map(r.phi!, r.psi!);
          const key = `${r.chain}:${r.resSeq}`;
          const group = ssGroup(r.ss);
          const fill =
            group === "helix"
              ? "#c97878"
              : group === "sheet"
                ? "#7a9ed4"
                : group === "turn"
                  ? "#6aaa8c"
                  : "#8a8c90";
          const hit = interacting.has(key);
          return (
            <circle
              key={key}
              cx={p.x}
              cy={p.y}
              r={hit ? 2.4 : 1.4}
              fill={fill}
              opacity={hit ? 1 : 0.7}
            />
          );
        })}
      </svg>
    </div>
  );
}
