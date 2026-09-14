import { prettyResidue } from "@/lib/docking/chemistry";
import { INTERACTION_LABEL, type CommonContact } from "@/lib/docking/interactions";

export function ContactsTable({
  rows,
  poseCount,
}: {
  rows: CommonContact[];
  poseCount: number;
}) {
  return (
    <div className="flex min-h-0 flex-col px-3 py-2">
      <div className="flex items-baseline justify-between gap-2">
        <p className="font-mono text-xs tracking-widest text-faint uppercase">Common contacts</p>
        <p className="font-mono text-xs tabular-nums text-muted">
          {rows.length} / {poseCount} poses
        </p>
      </div>
      <p className="mt-0.5 text-xs text-muted">Residues shared by every overlay pose.</p>
      {rows.length === 0 ? (
        <p className="py-3 text-sm text-muted">Overlay two or more poses to list shared residues.</p>
      ) : (
        <table className="mt-2 w-full border-collapse text-left">
          <thead>
            <tr className="font-mono text-xs text-faint">
              <th className="py-1 pr-2 font-medium">Residue</th>
              <th className="py-1 pr-2 font-medium">Type</th>
              <th className="py-1 pr-2 font-medium">Poses</th>
              <th className="py-1 text-right font-medium">Å</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={`${row.chain}:${row.resSeq}`} className="border-t border-border">
                <td className="py-1.5 pr-2 text-sm font-medium">
                  {prettyResidue(row.resName, row.resSeq, row.chain)}
                </td>
                <td className="py-1.5 pr-2 font-mono text-xs text-muted">
                  {row.types.map((t) => INTERACTION_LABEL[t]).join(" · ")}
                </td>
                <td className="py-1.5 pr-2 font-mono text-xs tabular-nums text-muted">
                  {row.nPoses}/{poseCount}
                </td>
                <td className="py-1.5 text-right font-mono text-xs tabular-nums">
                  {row.meanDist.toFixed(2)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
