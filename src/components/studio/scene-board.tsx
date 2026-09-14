import { useEffect, useRef, useState } from "react";
import { Download, GripVertical, ImagePlus, Trash2, X } from "lucide-react";
import { AffinityChart } from "@/components/studio/affinity-chart";
import { ColumnSplit } from "@/components/studio/column-split";
import { ContactsTable } from "@/components/studio/contacts-table";
import { FingerprintGrid } from "@/components/studio/fingerprint-grid";
import { ResidueTable } from "@/components/studio/residue-table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ssGroup, type SSCode } from "@/lib/docking/chemistry";
import type { SSAnalysis } from "@/lib/docking/dssp";
import { buildAffinityChart } from "@/lib/docking/engines";
import type { Fingerprint } from "@/lib/docking/fingerprint";
import { commonContacts, tabulateResidues, type Interaction } from "@/lib/docking/interactions";
import { useChrome } from "@/lib/docking/layout-store";
import { ligandDisplay, type Nomenclature } from "@/lib/docking/names";
import { downloadDataUrl } from "@/lib/docking/mol-lib";
import { snapshotFigure2d } from "@/lib/docking/snapshot-figure";
import {
  clampHeight,
  clampSpan,
  defaultPanelHeight,
  defaultPanelSpan,
  HEIGHT_MAX,
  HEIGHT_MIN,
  SCENE_COLS,
  SPAN_PRESETS,
} from "@/lib/docking/scene-layout";
import { composeScenePng, renderFingerprintPng } from "@/lib/docking/scene-render";
import { useScene, type SceneKind, type ScenePanel } from "@/lib/docking/scene-store";
import type { PoseRecord } from "@/lib/docking/session-store";
import { useSession } from "@/lib/docking/session-store";
import { cn } from "@/lib/utils";

export function SceneBoard({
  ss,
  poses,
  names,
  interacting,
  proteinName,
  ligandName,
  fingerprint,
  hits,
  hitsByPose,
  ssByKey,
}: {
  ss: SSAnalysis | null;
  poses: PoseRecord[];
  names: Nomenclature;
  interacting: Set<string>;
  proteinName: string;
  ligandName: string;
  fingerprint: Fingerprint;
  hits: Interaction[];
  hitsByPose: Array<{ poseId: string; hits: Interaction[] }>;
  ssByKey: Record<string, SSCode>;
}) {
  const open = useScene((s) => s.open);
  const setOpen = useScene((s) => s.setOpen);
  const title = useScene((s) => s.title);
  const subtitle = useScene((s) => s.subtitle);
  const setTitle = useScene((s) => s.setTitle);
  const setSubtitle = useScene((s) => s.setSubtitle);
  const panels = useScene((s) => s.panels);
  const selectedId = useScene((s) => s.selectedId);
  const setSelected = useScene((s) => s.setSelected);
  const addPanel = useScene((s) => s.addPanel);
  const updatePanel = useScene((s) => s.updatePanel);
  const removePanel = useScene((s) => s.removePanel);
  const movePanel = useScene((s) => s.movePanel);
  const ensureScaffold = useScene((s) => s.ensureScaffold);
  const migrateLayout = useScene((s) => s.migrateLayout);
  const clear = useScene((s) => s.clear);
  const chartStyle = useSession((s) => s.chartStyle);
  const photoRef = useRef<HTMLInputElement>(null);
  const plateRef = useRef<HTMLOListElement>(null);
  const dragId = useRef<string | null>(null);
  const [exporting, setExporting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inspectorW = useChrome((s) => s.inspectorW);
  const setInspectorW = useChrome((s) => s.setInspectorW);
  const resetInspector = useChrome((s) => s.resetInspector);
  const hydrateChrome = useChrome((s) => s.hydrate);

  useEffect(() => {
    hydrateChrome();
  }, [hydrateChrome]);

  useEffect(() => {
    if (open) migrateLayout();
  }, [open, migrateLayout]);

  if (!open) return null;

  function addOnce(kind: SceneKind, title: string, caption: string, span?: number) {
    const existing = panels.find((p) => p.kind === kind);
    if (existing) {
      setSelected(existing.id);
      return;
    }
    addPanel(
      { kind, title, caption, span: span ?? defaultPanelSpan(kind) },
      { open: true },
    );
  }

  const selected = panels.find((p) => p.id === selectedId) ?? null;
  const displayTitle = title || proteinName;
  const displaySubtitle =
    subtitle || [ligandName, `${panels.filter((p) => p.kind === "snapshot").length} views`].filter(Boolean).join(" · ");

  function onFiles(files: FileList | File[] | null) {
    if (!files) return;
    for (const file of [...files]) {
      if (!file.type.startsWith("image/")) continue;
      const reader = new FileReader();
      reader.onload = () => {
        const src = typeof reader.result === "string" ? reader.result : "";
        if (!src) return;
        addPanel(
          {
            kind: "photo",
            title: file.name.replace(/\.[^.]+$/, "").replace(/[_-]+/g, " "),
            caption: "Uploaded panel",
            src,
            span: 4,
          },
          { open: true },
        );
      };
      reader.readAsDataURL(file);
    }
  }

  async function exportPng() {
    setExporting(true);
    setError(null);
    try {
      const ligandColors: Record<string, string> = {};
      for (const pose of poses) {
        const label = ligandDisplay(names, pose.id, pose.fallbackLabel);
        if (!ligandColors[label]) ligandColors[label] = pose.color;
      }
      const chart = buildAffinityChart(
        poses.map((p) => ({
          ligand: ligandDisplay(names, p.id, p.fallbackLabel),
          engine: p.engine.trim() || "Unknown",
          affinity: p.affinity,
        })),
      );
      const poseLabels: Record<string, string> = {};
      for (const pose of poses) {
        poseLabels[pose.id] = ligandDisplay(names, pose.id, pose.fallbackLabel);
      }
      const uri = await composeScenePng({
        title: displayTitle,
        subtitle: displaySubtitle,
        panels,
        ss,
        chart,
        fingerprint,
        poseLabels,
        ligandColors,
        chartStyle,
        interacting,
        residueRows: tabulateResidues(hits),
        commonRows: commonContacts(hitsByPose),
        poseCount: hitsByPose.length,
      });
      const slug = displayTitle.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
      await downloadDataUrl(uri, `poseatlas-scene-${slug || "figure"}.png`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not export the figure");
    } finally {
      setExporting(false);
    }
  }

  return (
    <div
      className="workspace-paper fixed inset-0 z-[90] flex flex-col"
      role="dialog"
      aria-labelledby="scene-title"
      style={{ ["--inspector-w" as string]: `${inspectorW}px` }}
    >
      <header className="flex shrink-0 flex-wrap items-center justify-between gap-2 border-b border-border px-3 py-3 sm:px-5">
        <div className="min-w-0">
          <p className="font-mono text-xs tracking-widest text-faint uppercase">Publication figures</p>
          <h2 id="scene-title" className="font-display text-2xl leading-tight">
            Paper plate
          </h2>
        </div>
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="px-1 font-mono text-xs tracking-widest text-faint uppercase">Molecular</span>
          <Button
            size="sm"
            variant="secondary"
            onClick={() => {
              const existing = panels.find((p) => p.kind === "sketch");
              if (existing) {
                setSelected(existing.id);
                return;
              }
              void snapshotFigure2d().then((src) => {
                if (!src) {
                  setError("Open a pose to capture the 2D plate");
                  return;
                }
                addPanel(
                  {
                    kind: "sketch",
                    title: `${ligandName || "Ligand"} 2D`,
                    caption: "Pose-oriented contact map and OpenChemLib skeletal.",
                    src,
                    span: 6,
                  },
                  { open: true },
                );
              });
            }}
          >
            2D
          </Button>
          <Button size="sm" variant="secondary" onClick={() => photoRef.current?.click()}>
            <ImagePlus />
            Photo
          </Button>
          <span className="mx-1 hidden h-5 w-px bg-border sm:block" aria-hidden />
          <span className="px-1 font-mono text-xs tracking-widest text-faint uppercase">Research</span>
          <Button
            size="sm"
            variant="secondary"
            onClick={() => addOnce("ss", "Secondary structure", "Kabsch–Sander DSSP.")}
          >
            DSSP
          </Button>
          <Button
            size="sm"
            variant="secondary"
            onClick={() => addOnce("chart", "Binding affinity", "kcal/mol · more negative is stronger.")}
          >
            Chart
          </Button>
          <Button
            size="sm"
            variant="secondary"
            onClick={() =>
              addOnce(
                "contacts",
                "Common contacts",
                "Residues shared by every overlay pose.",
                6,
              )
            }
          >
            Common
          </Button>
          <Button
            size="sm"
            variant="secondary"
            onClick={() =>
              addOnce("residues", "Interacting residues", "Tabulated pocket contacts in sequence.")
            }
          >
            Residues
          </Button>
          {fingerprint.poseIds.length >= 2 && fingerprint.residues.length ? (
            <Button
              size="sm"
              variant="secondary"
              onClick={() => {
                const existing = panels.find((p) => p.kind === "fingerprint");
                if (existing) {
                  setSelected(existing.id);
                  return;
                }
                const poseLabels: Record<string, string> = {};
                for (const pose of poses) {
                  poseLabels[pose.id] = ligandDisplay(names, pose.id, pose.fallbackLabel);
                }
                void renderFingerprintPng(fingerprint, poseLabels, {
                  title: "Interaction fingerprint",
                  subtitle: `${fingerprint.residues.length} pocket residues · ${fingerprint.poseIds.length} poses · sequence order`,
                }).then((src) => {
                  addPanel(
                    {
                      kind: "fingerprint",
                      title: "Interaction fingerprint",
                      caption: `${fingerprint.residues.length} pocket residues · ${fingerprint.poseIds.length} poses.`,
                      src,
                      span: 12,
                    },
                    { open: true },
                  );
                });
              }}
            >
              Fingerprint
            </Button>
          ) : null}
          <input
            ref={photoRef}
            type="file"
            accept="image/*"
            multiple
            className="sr-only"
            tabIndex={-1}
            onChange={(event) => {
              onFiles(event.target.files);
              event.target.value = "";
            }}
          />
          <span className="mx-1 hidden h-5 w-px bg-border sm:block" aria-hidden />
          <Button size="sm" onClick={() => void exportPng()} disabled={exporting || !panels.length}>
            <Download />
            {exporting ? "Exporting" : "Export PNG"}
          </Button>
          <Button size="sm" variant="ghost" onClick={() => setOpen(false)} aria-label="Close scene">
            <X />
            Close
          </Button>
        </div>
      </header>

      <div className="flex min-h-0 flex-1 flex-col lg:flex-row">
        <div className="min-h-0 min-w-0 flex-1 overflow-y-auto px-3 py-4 sm:px-5">
          <div className="mx-auto max-w-5xl">
            <Input
              value={title}
              placeholder={proteinName}
              onChange={(e) => setTitle(e.target.value)}
              aria-label="Figure title"
              className="h-11 border-0 bg-transparent px-0 font-display text-2xl"
            />
            <Input
              value={subtitle}
              placeholder={displaySubtitle}
              onChange={(e) => setSubtitle(e.target.value)}
              aria-label="Figure subtitle"
              className="mt-1 h-8 border-0 bg-transparent px-0 text-sm text-muted"
            />

            {error ? <p className="mt-2 text-sm text-muted">{error}</p> : null}

            {!panels.length ? (
              <EmptyState onPhoto={() => photoRef.current?.click()} onScaffold={() => ensureScaffold()} />
            ) : (
              <ol ref={plateRef} className="scene-plate mt-5">
                {panels.map((panel, index) => (
                  <li
                    key={panel.id}
                    className="scene-tile min-w-0"
                    style={{ ["--cols" as string]: `span ${clampSpan(panel.span)}` }}
                  >
                    <PanelCard
                      panel={panel}
                      letter={String.fromCharCode(65 + index)}
                      selected={selectedId === panel.id}
                      ss={ss}
                      poses={poses}
                      interacting={interacting}
                      fingerprint={fingerprint}
                      names={names}
                      hits={hits}
                      hitsByPose={hitsByPose}
                      ssByKey={ssByKey}
                      onSelect={() => setSelected(panel.id)}
                      onDragStart={() => {
                        dragId.current = panel.id;
                      }}
                      onDrop={() => {
                        if (dragId.current) movePanel(dragId.current, panel.id);
                        dragId.current = null;
                      }}
                      onResize={(edge, event) => {
                        startPanelResize(event, panel, edge, plateRef.current, updatePanel, setSelected);
                      }}
                    />
                  </li>
                ))}
              </ol>
            )}
          </div>
        </div>

        <ColumnSplit
          value={inspectorW}
          min={260}
          max={480}
          onChange={setInspectorW}
          onReset={resetInspector}
          label="Inspector width"
          inverted
        />

        <aside className="scene-inspector shrink-0 border-t border-border lg:h-full lg:overflow-y-auto lg:border-t-0 lg:border-l">
          <div className="px-4 py-4">
            <p className="font-mono text-xs tracking-widest text-faint uppercase">Panel</p>
            {selected ? (
              <div className="mt-3 space-y-3">
                <label className="block">
                  <span className="font-mono text-xs text-faint">Title</span>
                  <Input
                    className="mt-1"
                    value={selected.title}
                    onChange={(e) => updatePanel(selected.id, { title: e.target.value })}
                  />
                </label>
                <label className="block">
                  <span className="font-mono text-xs text-faint">Caption</span>
                  <Input
                    className="mt-1"
                    value={selected.caption}
                    onChange={(e) => updatePanel(selected.id, { caption: e.target.value })}
                  />
                </label>
                <div>
                  <div className="flex items-baseline justify-between gap-2">
                    <p className="font-mono text-xs text-faint">Width</p>
                    <p className="font-mono text-xs tabular-nums text-muted">
                      {clampSpan(selected.span)} / {SCENE_COLS}
                    </p>
                  </div>
                  <input
                    type="range"
                    min={1}
                    max={SCENE_COLS}
                    value={clampSpan(selected.span)}
                    aria-label="Panel width"
                    className="mt-2 h-8 w-full cursor-ew-resize accent-accent"
                    onChange={(e) => updatePanel(selected.id, { span: Number(e.target.value) })}
                  />
                  <div className="mt-1.5 flex gap-1">
                    {SPAN_PRESETS.map((preset) => (
                      <Button
                        key={preset.span}
                        size="sm"
                        variant={clampSpan(selected.span) === preset.span ? "secondary" : "ghost"}
                        onClick={() => updatePanel(selected.id, { span: preset.span })}
                      >
                        {preset.label}
                      </Button>
                    ))}
                  </div>
                </div>
                <div>
                  <div className="flex items-baseline justify-between gap-2">
                    <p className="font-mono text-xs text-faint">Height</p>
                    <p className="font-mono text-xs tabular-nums text-muted">
                      {selected.height ?? defaultPanelHeight(selected.kind)} px
                    </p>
                  </div>
                  <input
                    type="range"
                    min={HEIGHT_MIN}
                    max={HEIGHT_MAX}
                    value={selected.height ?? defaultPanelHeight(selected.kind)}
                    aria-label="Panel height"
                    className="mt-2 h-8 w-full cursor-ns-resize accent-accent"
                    onChange={(e) => updatePanel(selected.id, { height: Number(e.target.value) })}
                  />
                </div>
                <div className="flex flex-wrap gap-1">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() =>
                      updatePanel(selected.id, {
                        span: defaultPanelSpan(selected.kind),
                        height: defaultPanelHeight(selected.kind),
                      })
                    }
                  >
                    Reset size
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => removePanel(selected.id)}>
                    <Trash2 />
                    Remove
                  </Button>
                </div>
              </div>
            ) : (
              <p className="mt-2 text-sm text-muted">
                Select a panel, then drag its edges or corner to resize. Width snaps to the
                twelve-column plate; height is free. Drag the grip to reorder.
              </p>
            )}
            {panels.length ? (
              <Button size="sm" variant="ghost" className="mt-6" onClick={() => clear()}>
                Clear plate
              </Button>
            ) : null}
          </div>
        </aside>
      </div>
    </div>
  );
}

function startPanelResize(
  event: React.PointerEvent,
  panel: ScenePanel,
  edge: "e" | "s" | "se",
  plate: HTMLOListElement | null,
  updatePanel: (id: string, patch: Partial<ScenePanel>) => void,
  setSelected: (id: string) => void,
) {
  event.preventDefault();
  event.stopPropagation();
  setSelected(panel.id);
  const handle = event.currentTarget as HTMLElement;
  handle.setPointerCapture(event.pointerId);
  const startX = event.clientX;
  const startY = event.clientY;
  const startSpan = clampSpan(panel.span);
  const startH = panel.height ?? defaultPanelHeight(panel.kind);
  const pitch = (plate?.clientWidth ?? 1024) / SCENE_COLS;
  document.body.classList.add("is-panel-resizing");

  function move(ev: PointerEvent) {
    const patch: Partial<ScenePanel> = {};
    if (edge === "e" || edge === "se") {
      patch.span = clampSpan(startSpan + Math.round((ev.clientX - startX) / pitch));
    }
    if (edge === "s" || edge === "se") {
      patch.height = clampHeight(startH + (ev.clientY - startY));
    }
    updatePanel(panel.id, patch);
  }
  function end(ev: PointerEvent) {
    try {
      handle.releasePointerCapture(ev.pointerId);
    } catch {
      /* already released */
    }
    window.removeEventListener("pointermove", move);
    window.removeEventListener("pointerup", end);
    window.removeEventListener("pointercancel", end);
    document.body.classList.remove("is-panel-resizing");
  }
  window.addEventListener("pointermove", move);
  window.addEventListener("pointerup", end);
  window.addEventListener("pointercancel", end);
}

function EmptyState({ onPhoto, onScaffold }: { onPhoto: () => void; onScaffold: () => void }) {
  return (
    <div className="mt-8 rounded-2xl border border-dashed border-border px-5 py-8">
      <p className="font-display text-2xl">Compose a paper plate</p>
      <ol className="mt-4 max-w-xl space-y-2 text-sm leading-relaxed text-muted">
        <li>1. In pose view, frame the 3D, then To scene (keeps your zoom) or Download.</li>
        <li>2. Molecular panels: 3D snapshots and the 2D map.</li>
        <li>3. Research panels: DSSP, affinity (kcal/mol), common contacts, residue table, fingerprint.</li>
        <li>4. Drag edges to size, caption, Export PNG on white paper.</li>
      </ol>
      <div className="mt-5 flex flex-wrap gap-2">
        <Button size="sm" onClick={onScaffold}>
          Add DSSP + chart
        </Button>
        <Button size="sm" variant="secondary" onClick={onPhoto}>
          <ImagePlus />
          Upload photo
        </Button>
      </div>
    </div>
  );
}

function PanelCard({
  panel,
  letter,
  selected,
  ss,
  poses,
  interacting,
  fingerprint,
  names,
  hits,
  hitsByPose,
  ssByKey,
  onSelect,
  onDragStart,
  onDrop,
  onResize,
}: {
  panel: ScenePanel;
  letter: string;
  selected: boolean;
  ss: SSAnalysis | null;
  poses: PoseRecord[];
  interacting: Set<string>;
  fingerprint: Fingerprint;
  names: Nomenclature;
  hits: Interaction[];
  hitsByPose: Array<{ poseId: string; hits: Interaction[] }>;
  ssByKey: Record<string, SSCode>;
  onSelect: () => void;
  onDragStart: () => void;
  onDrop: () => void;
  onResize: (edge: "e" | "s" | "se", event: React.PointerEvent) => void;
}) {
  const mediaH = panel.height ?? defaultPanelHeight(panel.kind);
  return (
    <article
      onDragOver={(event) => event.preventDefault()}
      onDrop={(event) => {
        event.preventDefault();
        onDrop();
      }}
      onClick={onSelect}
      className={cn(
        "group relative cursor-pointer rounded-xl border bg-surface p-2.5 text-left transition-colors duration-150",
        selected ? "border-fg" : "border-border hover:border-fg/40",
      )}
    >
      <div className="flex items-center gap-2 px-0.5">
        <button
          type="button"
          draggable
          aria-label="Drag to reorder"
          className="grid size-7 shrink-0 cursor-grab place-items-center rounded-md text-faint hover:bg-raised hover:text-fg active:cursor-grabbing"
          onClick={(event) => event.stopPropagation()}
          onDragStart={(event) => {
            event.dataTransfer.effectAllowed = "move";
            onDragStart();
          }}
        >
          <GripVertical className="size-3.5" />
        </button>
        <span className="font-mono text-xs text-faint">{letter}</span>
        <span className="min-w-0 flex-1 truncate text-sm font-medium">{panel.title}</span>
      </div>
      <div className="mt-2 overflow-hidden rounded-lg bg-bg" style={{ height: mediaH }}>
        {panel.kind === "ss" ? (
          <SsMini ss={ss} interacting={interacting} />
        ) : panel.kind === "chart" ? (
          <div className="h-full overflow-hidden">
            <AffinityChart poses={poses} />
          </div>
        ) : panel.kind === "fingerprint" ? (
          panel.src ? (
            <img src={panel.src} alt={panel.title} className="h-full w-full object-contain" />
          ) : (
            <div className="h-full overflow-hidden">
              <FingerprintGrid
                fingerprint={fingerprint}
                names={names}
                labels={Object.fromEntries(poses.map((p) => [p.id, p.fallbackLabel]))}
                compact
              />
            </div>
          )
        ) : panel.kind === "residues" ? (
          <div className="h-full overflow-auto">
            <ResidueTable hits={hits} ssByKey={ssByKey} ligandName="" compact />
          </div>
        ) : panel.kind === "contacts" ? (
          <div className="h-full overflow-auto">
            <ContactsTable rows={commonContacts(hitsByPose)} poseCount={hitsByPose.length} />
          </div>
        ) : panel.src ? (
          <img
            src={panel.src}
            alt={panel.title}
            className={cn(
              "h-full w-full",
              panel.kind === "photo" ? "object-cover" : "object-contain",
            )}
          />
        ) : (
          <div className="flex h-full items-center justify-center text-xs text-faint">No image</div>
        )}
      </div>
      {panel.caption ? (
        <p className="mt-2 px-0.5 text-xs leading-relaxed text-muted">{panel.caption}</p>
      ) : null}

      <ResizeHandle edge="e" selected={selected} onResize={onResize} />
      <ResizeHandle edge="s" selected={selected} onResize={onResize} />
      <ResizeHandle edge="se" selected={selected} onResize={onResize} />
    </article>
  );
}

function ResizeHandle({
  edge,
  selected,
  onResize,
}: {
  edge: "e" | "s" | "se";
  selected: boolean;
  onResize: (edge: "e" | "s" | "se", event: React.PointerEvent) => void;
}) {
  const label = edge === "e" ? "Resize width" : edge === "s" ? "Resize height" : "Resize width and height";
  return (
    <div
      role="separator"
      aria-label={label}
      title={label}
      onPointerDown={(event) => {
        if (event.button !== 0) return;
        onResize(edge, event);
      }}
      onClick={(event) => event.stopPropagation()}
      className={cn(
        "absolute z-10 touch-none transition-opacity duration-150",
        selected ? "opacity-100" : "opacity-0 group-hover:opacity-100",
        edge === "e" && "inset-y-8 right-0 w-3 cursor-ew-resize max-sm:hidden",
        edge === "s" && "inset-x-8 bottom-0 h-3 cursor-ns-resize",
        edge === "se" && "bottom-0 right-0 size-4 cursor-nwse-resize",
      )}
    >
      {edge === "se" ? (
        <span className="pointer-events-none absolute bottom-1 right-1 block size-2.5 border-r-2 border-b-2 border-fg/80" />
      ) : edge === "e" ? (
        <span className="pointer-events-none absolute inset-y-6 right-1 w-px bg-fg/50" />
      ) : (
        <span className="pointer-events-none absolute inset-x-6 bottom-1 h-px bg-fg/50" />
      )}
    </div>
  );
}

function SsMini({ ss, interacting }: { ss: SSAnalysis | null; interacting: Set<string> }) {
  if (!ss) {
    return <p className="px-3 py-6 text-xs text-muted">Load a structure to draw DSSP.</p>;
  }
  return (
    <div className="h-full overflow-hidden px-3 py-3">
      <div className="flex h-1.5 overflow-hidden rounded-full">
        <span className="bg-ss-helix" style={{ width: `${ss.percents.helix}%` }} />
        <span className="bg-ss-sheet" style={{ width: `${ss.percents.sheet}%` }} />
        <span className="bg-ss-turn" style={{ width: `${ss.percents.turn}%` }} />
        <span className="bg-ss-coil" style={{ width: `${ss.percents.coil}%` }} />
      </div>
      <ul className="mt-2 flex flex-wrap gap-x-3 font-mono text-xs text-muted">
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
      </ul>
      <div className="mt-3 flex h-4 overflow-hidden rounded-sm">
        {ss.residues.map((r) => {
          const group = ssGroup(r.ss as SSCode);
          const hit = interacting.has(`${r.chain}:${r.resSeq}`);
          return (
            <span
              key={`${r.chain}:${r.resSeq}`}
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
