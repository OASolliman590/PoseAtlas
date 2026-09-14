import { aaClass, aaClassLabel, prettyResidue, ssGroup, ssLabel, type SSCode } from "@/lib/docking/chemistry";
import { INTERACTION_LABEL, tabulateResidues, type Interaction } from "@/lib/docking/interactions";
import { cn } from "@/lib/utils";

export function ResidueTable({
  hits,
  ssByKey,
  ligandName,
  compact = false,
}: {
  hits: Interaction[];
  ssByKey: Record<string, SSCode>;
  ligandName: string;
  compact?: boolean;
}) {
  const rows = tabulateResidues(hits);

  return (
    <div className="flex min-h-0 flex-col">
      <div className={cn("flex items-baseline justify-between gap-2 px-3", compact ? "pt-2" : "px-4 pt-3")}>
        <p className="font-mono text-xs tracking-widest text-faint uppercase">Interacting residues</p>
        <p className="font-mono text-xs tabular-nums text-muted">{rows.length}</p>
      </div>
      {compact ? null : (
        <p className="px-4 pt-1 text-xs text-muted">
          {ligandName || "Ligand"} contacts, one row per residue. Polar pairs ≤ 3.5 Å.
        </p>
      )}
      <div className={cn("min-h-0 flex-1 overflow-auto", compact ? "px-2 py-1.5" : "px-3 py-2")}>
        {rows.length === 0 ? (
          <p className="px-1 py-3 text-sm text-muted">No heavy-atom contacts within cutoff.</p>
        ) : (
          <table className="w-full min-w-[18rem] border-collapse text-left">
            <thead>
              <tr className="font-mono text-xs text-faint">
                <th className="py-1 pr-2 font-medium">Residue</th>
                <th className="py-1 pr-2 font-medium">SS</th>
                <th className="hidden py-1 pr-2 font-medium sm:table-cell">Class</th>
                <th className="py-1 pr-2 font-medium">Type</th>
                <th className="hidden py-1 pr-2 font-medium md:table-cell">Atoms</th>
                <th className="py-1 text-right font-medium">Å</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => {
                const key = `${row.chain}:${row.resSeq}`;
                const ss = ssByKey[key] ?? "C";
                const group = ssGroup(ss);
                const cls = aaClass(row.resName);
                return (
                  <tr key={key} className="border-t border-border">
                    <td className="py-1.5 pr-2">
                      <span className="text-sm font-medium">
                        {prettyResidue(row.resName, row.resSeq, row.chain)}
                      </span>
                    </td>
                    <td className="py-1.5 pr-2 font-mono text-xs text-muted">
                      <span
                        className={cn(
                          "mr-1 inline-block size-1.5 rounded-full",
                          group === "helix" && "bg-ss-helix",
                          group === "sheet" && "bg-ss-sheet",
                          group === "turn" && "bg-ss-turn",
                          group === "coil" && "bg-ss-coil",
                        )}
                      />
                      {compact ? ss : ssLabel(ss)}
                    </td>
                    <td className="hidden py-1.5 pr-2 font-mono text-xs text-muted sm:table-cell">
                      {aaClassLabel(cls)}
                    </td>
                    <td className="py-1.5 pr-2 font-mono text-xs text-muted">
                      {row.types.map((t) => INTERACTION_LABEL[t]).join(" · ")}
                    </td>
                    <td className="hidden py-1.5 pr-2 font-mono text-xs text-faint md:table-cell">
                      {row.ligandAtom}··{row.residueAtom}
                    </td>
                    <td className="py-1.5 text-right font-mono text-xs tabular-nums text-fg">
                      {row.distance.toFixed(2)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
