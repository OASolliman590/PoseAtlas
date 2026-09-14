import { useEffect, useRef, useState } from "react";
import { Camera } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  bandResidues,
  cellKey,
  fingerprintFit,
  type Fingerprint,
} from "@/lib/docking/fingerprint";
import { INTERACTION_LABEL, type InteractionType } from "@/lib/docking/interactions";
import { downloadDataUrl } from "@/lib/docking/mol-lib";
import { ligandDisplay, type Nomenclature } from "@/lib/docking/names";
import { renderFingerprintPng } from "@/lib/docking/scene-render";
import { useScene } from "@/lib/docking/scene-store";
import { cn } from "@/lib/utils";

const TYPE_CLASS: Record<InteractionType, string> = {
  hbond: "bg-int-hbond",
  salt: "bg-int-salt",
  hydrophobic: "bg-int-hydrophobic",
  "pi-stack": "bg-int-pi",
  "pi-cation": "bg-int-pi",
  contact: "bg-raised",
};

export function FingerprintGrid({
  fingerprint,
  names,
  labels,
  compact = false,
  figure = false,
}: {
  fingerprint: Fingerprint;
  names: Nomenclature;
  labels: Record<string, string>;
  compact?: boolean;
  figure?: boolean;
}) {
  const addPanel = useScene((s) => s.addPanel);
  const updatePanel = useScene((s) => s.updatePanel);
  const setOpen = useScene((s) => s.setOpen);
  const setSelected = useScene((s) => s.setSelected);
  const panels = useScene((s) => s.panels);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (fingerprint.poseIds.length < 2 || fingerprint.residues.length === 0) return null;

  function poseName(id: string) {
    return ligandDisplay(names, id, labels[id] ?? id);
  }

  async function snapshotPlate() {
    setBusy(true);
    setError(null);
    try {
      const poseLabels: Record<string, string> = {};
      for (const id of fingerprint.poseIds) poseLabels[id] = poseName(id);
      const src = await renderFingerprintPng(fingerprint, poseLabels, {
        title: "Interaction fingerprint",
        subtitle: `${fingerprint.residues.length} pocket residues · ${fingerprint.poseIds.length} poses · sequence order`,
      });
      const caption = `${fingerprint.residues.length} pocket residues · ${fingerprint.poseIds.length} poses. Teal is polar; grey is hydrophobic.`;
      const existing = panels.find((p) => p.kind === "fingerprint");
      if (existing) {
        updatePanel(existing.id, { src, caption });
        setSelected(existing.id);
        setOpen(true);
      } else {
        const id = addPanel(
          {
            kind: "fingerprint",
            title: "Interaction fingerprint",
            caption,
            src,
            span: 12,
          },
          { open: true },
        );
        setSelected(id);
      }
      try {
        await downloadDataUrl(src, `poseatlas-fingerprint-${fingerprint.residues.length}res.png`);
      } catch {
        /* scene panel still holds the plate */
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not render the fingerprint plate");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div
      id={figure ? "fingerprint-figure" : undefined}
      className={cn(
        compact
          ? "px-2 py-2"
          : "figure-fp mx-2 mb-2 rounded-2xl border border-border px-3 py-3",
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="font-mono text-xs tracking-widest text-faint uppercase">
            Interaction fingerprint
          </p>
          <p className="mt-1 text-xs text-muted">
            {fingerprint.residues.length} pocket residues · {fingerprint.poseIds.length} poses.
            Sequence order. Snapshot is the publication plate.
          </p>
        </div>
        {compact ? null : (
          <Button size="sm" onClick={() => void snapshotPlate()} disabled={busy}>
            <Camera />
            {busy ? "Saving" : "Snapshot"}
          </Button>
        )}
      </div>
      {error ? <p className="mt-1 text-xs text-muted">{error}</p> : null}
      <FingerprintMatrix
        fingerprint={fingerprint}
        poseLabel={poseName}
        compact={compact}
      />
      <ul className="mt-2 flex flex-wrap gap-x-3 gap-y-1 font-mono text-xs text-muted">
        {Object.entries(INTERACTION_LABEL).map(([k, lab]) => (
          <li key={k} className="flex items-center gap-1.5">
            <span className={cn("size-2 rounded-sm", TYPE_CLASS[k as InteractionType])} />
            {lab}
          </li>
        ))}
      </ul>
    </div>
  );
}

export function FingerprintMatrix({
  fingerprint,
  poseLabel,
  compact = false,
}: {
  fingerprint: Fingerprint;
  poseLabel: (id: string) => string;
  compact?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [perBand, setPerBand] = useState(12);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const fit = () => {
      const w = el.clientWidth || 320;
      setPerBand(fingerprintFit(fingerprint.residues.length, fingerprint.poseIds.length, w).perBand);
    };
    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(el);
    return () => ro.disconnect();
  }, [fingerprint.residues.length, fingerprint.poseIds.length]);

  const bands = bandResidues(fingerprint.residues, perBand);
  const cell = compact ? "size-3" : "size-3.5";

  return (
    <div ref={ref} className="mt-2 space-y-3 overflow-x-hidden">
      {bands.map((residues, band) => (
        <table
          key={`band-${band}-${residues[0] ?? band}`}
          className="w-full table-fixed border-separate border-spacing-0.5 text-left"
        >
          <thead>
            <tr>
              <th className="w-16 bg-surface px-1 py-1 font-mono text-xs font-medium text-faint">
                {band === 0 ? "Pose" : ""}
              </th>
              {residues.map((res) => (
                <th
                  key={res}
                  className="px-0 py-1 text-center font-mono text-xs font-medium text-faint [writing-mode:vertical-rl] rotate-180"
                >
                  {res}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {fingerprint.poseIds.map((id) => (
              <tr key={`${id}-${band}`}>
                <th className="truncate bg-surface px-1 py-0.5 text-left text-xs font-medium text-fg">
                  {poseLabel(id)}
                </th>
                {residues.map((res) => {
                  const types = fingerprint.cells.get(cellKey(id, res)) ?? [];
                  const polar = types.includes("hbond") || types.includes("salt");
                  const lead = types[0];
                  return (
                    <td key={res} className="p-0">
                      <span
                        title={types.length ? `${res} · ${types.join(", ")}` : `${res} · none`}
                        className={cn(
                          "mx-auto block rounded-sm",
                          cell,
                          lead ? TYPE_CLASS[lead] : "bg-raised",
                          polar && "ring-1 ring-fg/30",
                        )}
                      />
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      ))}
    </div>
  );
}
