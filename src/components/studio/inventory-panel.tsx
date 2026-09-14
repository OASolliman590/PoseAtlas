import { X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { formatAffinity } from "@/lib/docking/catalog";
import { ENGINE_OPTIONS, engineColor } from "@/lib/docking/engines";
import { chainDisplay, hetDisplay, ligandDisplay } from "@/lib/docking/names";
import { useSession, type PoseRecord } from "@/lib/docking/session-store";
import type { Inventory } from "@/lib/docking/structure";
import { cn } from "@/lib/utils";

export function InventoryPanel({
  receptor,
  poses,
}: {
  receptor: PoseRecord | null;
  poses: PoseRecord[];
}) {
  const names = useSession((s) => s.names);
  const setProteinName = useSession((s) => s.setProteinName);
  const setChainName = useSession((s) => s.setChainName);
  const setLigandName = useSession((s) => s.setLigandName);
  const setHetName = useSession((s) => s.setHetName);
  const setEngine = useSession((s) => s.setEngine);
  const setAffinity = useSession((s) => s.setAffinity);
  const removePose = useSession((s) => s.removePose);
  const visibleIds = useSession((s) => s.visibleIds);
  const focusedId = useSession((s) => s.focusedId);
  const toggleVisible = useSession((s) => s.toggleVisible);
  const solo = useSession((s) => s.solo);
  const proteinFallback = useSession((s) => s.proteinFallback);

  const inv: Inventory | null = receptor?.inventory ?? poses[0]?.inventory ?? null;
  const engines = [...new Set(poses.map((p) => p.engine.trim() || "Unknown"))];

  return (
    <div className="flex min-h-0 flex-col">
      <div className="border-b border-border px-4 py-3">
        <p className="font-mono text-xs tracking-widest text-faint uppercase">Protein</p>
        <Input
          value={names.protein}
          placeholder={proteinFallback}
          onChange={(e) => setProteinName(e.target.value)}
          aria-label="Protein name"
          className="mt-2"
        />
        {inv ? (
          <p className="mt-2 font-mono text-xs text-muted">
            {inv.residueCount} residues · {inv.chains.length} chain{inv.chains.length === 1 ? "" : "s"} ·{" "}
            {inv.proteinAtomCount} atoms
          </p>
        ) : (
          <p className="mt-2 text-xs text-muted">Load a PDB to inventory chains and HETATMs.</p>
        )}
      </div>

      {inv ? (
        <div className="border-b border-border px-4 py-3">
          <p className="font-mono text-xs tracking-widest text-faint uppercase">Chains / domains</p>
          <ul className="mt-2 space-y-2">
            {inv.chains
              .filter((chain) => chain.proteinResidues.length > 0)
              .map((chain) => (
              <li key={chain.id} className="rounded-lg border border-border bg-raised/40 p-2">
                <div className="flex items-baseline justify-between gap-2">
                  <span className="font-mono text-xs text-faint">{chain.id}</span>
                  <span className="font-mono text-xs tabular-nums text-muted">
                    {chain.proteinResidues.length} aa
                  </span>
                </div>
                <Input
                  value={names.chains[chain.id] ?? ""}
                  placeholder={chainDisplay(names, chain.id)}
                  onChange={(e) => setChainName(chain.id, e.target.value)}
                  aria-label={`Name for chain ${chain.id}`}
                  className="mt-1.5 h-8"
                />
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {inv ? (
        <div className="border-b border-border px-4 py-3">
          <p className="font-mono text-xs tracking-widest text-faint uppercase">HETATM groups</p>
          {inv.ligands.length === 0 && inv.waters.length === 0 && inv.ions.length === 0 ? (
            <p className="mt-2 text-xs text-muted">No hetero groups in the receptor file.</p>
          ) : (
            <ul className="mt-2 space-y-2">
              {inv.ligands.map((lig) => (
                <li key={lig.key} className="rounded-lg border border-border bg-raised/40 p-2">
                  <div className="flex items-baseline justify-between gap-2 font-mono text-xs text-faint">
                    <span>
                      {lig.resName} {lig.chain}
                      {lig.resSeq}
                    </span>
                    <span>
                      {lig.formula} · {lig.atomCount} at
                    </span>
                  </div>
                  <Input
                    value={names.hetatms[lig.key] ?? ""}
                    placeholder={hetDisplay(names, lig.key, lig.resName)}
                    onChange={(e) => setHetName(lig.key, e.target.value)}
                    aria-label={`Name for ${lig.resName}`}
                    className="mt-1.5"
                  />
                </li>
              ))}
              {inv.waters.length ? (
                <li className="font-mono text-xs text-muted">Waters · {inv.waters.length} HOH</li>
              ) : null}
              {inv.ions.length ? (
                <li className="font-mono text-xs text-muted">
                  Ions · {inv.ions.map((i) => i.resName).join(", ")}
                </li>
              ) : null}
            </ul>
          )}
        </div>
      ) : null}

      <div className="px-3 py-3">
        <p className="px-1 font-mono text-xs tracking-widest text-faint uppercase">Poses</p>
        <p className="mt-1 px-1 text-xs text-muted">
          Same ligand from another engine? Use Add engine — names match automatically.
        </p>
        <datalist id="poseatlas-engines">
          {ENGINE_OPTIONS.map((id) => (
            <option key={id} value={id} />
          ))}
        </datalist>
        <ul className="mt-2 space-y-2">
          {poses.map((pose) => {
            const on = visibleIds.includes(pose.id);
            const focused = focusedId === pose.id;
            const engineName = pose.engine.trim() || "Unknown";
            return (
              <li
                key={pose.id}
                className={cn(
                  "rounded-lg border px-2 py-2",
                  on ? "border-border bg-raised" : "border-transparent bg-raised/30",
                )}
              >
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => toggleVisible(pose.id)}
                    className="flex min-w-0 flex-1 items-center gap-2 text-left"
                  >
                    <span
                      className={cn("size-2.5 shrink-0 rounded-full", on ? "opacity-100" : "opacity-30")}
                      style={{ background: pose.color }}
                    />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-medium">
                        {ligandDisplay(names, pose.id, pose.fallbackLabel)}
                      </span>
                      <span className="block truncate font-mono text-xs text-faint">
                        {engineName}
                        {" · "}
                        {pose.filename}
                      </span>
                    </span>
                    <span className="font-mono text-xs tabular-nums text-fg">
                      {formatAffinity(pose.affinity)}
                      {pose.affinity !== null ? <span className="text-faint"> kcal</span> : null}
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={() => solo(pose.id)}
                    className={cn(
                      "hidden rounded-md px-2 py-1 font-mono text-xs tracking-wide uppercase sm:inline",
                      focused && on && visibleIds.length === 1 ? "text-fg" : "text-faint hover:text-fg",
                    )}
                  >
                    Solo
                  </button>
                  {poses.length > 1 ? (
                    <button
                      type="button"
                      onClick={() => removePose(pose.id)}
                      className="rounded-md p-1 text-faint hover:text-fg"
                      aria-label={`Remove ${pose.filename}`}
                    >
                      <X className="size-3.5" />
                    </button>
                  ) : null}
                </div>
                <Input
                  value={names.ligands[pose.id] ?? ""}
                  placeholder={pose.fallbackLabel}
                  onChange={(e) => setLigandName(pose.id, e.target.value)}
                  aria-label={`Ligand name for ${pose.filename}`}
                  className="mt-1.5"
                />
                <div className="mt-1.5 grid grid-cols-2 gap-1.5">
                  <label className="block">
                    <span className="sr-only">Engine for {pose.fallbackLabel}</span>
                    <Input
                      list="poseatlas-engines"
                      value={pose.engine}
                      placeholder="Engine"
                      onChange={(e) => setEngine(pose.id, e.target.value)}
                      aria-label={`Docking engine for ${pose.filename}`}
                      style={
                        engines.length > 1
                          ? { boxShadow: `inset 3px 0 0 ${engineColor(engineName, engines)}` }
                          : undefined
                      }
                    />
                  </label>
                  <label className="block">
                    <span className="sr-only">Affinity for {pose.fallbackLabel}</span>
                    <Input
                      type="number"
                      step="0.01"
                      value={pose.affinity ?? ""}
                      placeholder="kcal/mol"
                      onChange={(e) => {
                        const raw = e.target.value;
                        if (raw === "" || raw === "-") {
                          setAffinity(pose.id, null);
                          return;
                        }
                        const n = Number.parseFloat(raw);
                        setAffinity(pose.id, Number.isFinite(n) ? n : null);
                      }}
                      aria-label={`Affinity for ${pose.filename}`}
                    />
                  </label>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
