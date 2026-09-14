import { useEffect, useMemo, useState } from "react";
import { Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MolCanvas } from "@/components/viewer/mol-viewer";
import { snapshotViewerAsync, downloadDataUrl } from "@/lib/docking/mol-lib";
import { TARGETS } from "@/lib/docking/catalog";
import { prettyResidue, type SSCode } from "@/lib/docking/chemistry";
import { useChrome } from "@/lib/docking/layout-store";
import { ligandDisplay } from "@/lib/docking/names";
import { ligandAtoms } from "@/lib/docking/structure";
import { useAnalysis } from "@/lib/docking/use-analysis";
import { FIGURE_TITLES, useScene } from "@/lib/docking/scene-store";
import { useSession, type FigureMode } from "@/lib/docking/session-store";
import { cn } from "@/lib/utils";
import { AffinityChart } from "./affinity-chart";
import { ColumnSplit } from "./column-split";
import { Diagram2D } from "./diagram-2d";
import { FigureToolbar } from "./figure-toolbar";
import { FingerprintGrid } from "./fingerprint-grid";
import { InventoryPanel } from "./inventory-panel";
import { LoadBar } from "./load-bar";
import { MethodsDialog } from "./methods-dialog";
import { ResidueTable } from "./residue-table";
import { SceneBoard } from "./scene-board";
import { SsStrip } from "./ss-strip";

const MODE_HUD: Record<FigureMode, { title: string; hint: string }> = {
  interaction: { title: "Bonds", hint: "Cartoon + contacting side chains" },
  pocket: { title: "Pocket", hint: "Cutaway SAS around the ligand" },
  electrostatic: { title: "Electrostatic", hint: "Coulombic SAS · red − · blue +" },
  hydrophobic: { title: "Hydrophobic", hint: "Kyte–Doolittle hydropathy" },
};

export function Studio() {
  const [methodsOpen, setMethodsOpen] = useState(false);
  const [mobileTab, setMobileTab] = useState<"structure" | "scene" | "residues">("scene");
  const [copied, setCopied] = useState(false);
  const [saveLabel, setSaveLabel] = useState("To scene");

  const loadLibraryTarget = useSession((s) => s.loadLibraryTarget);
  const loadFiles = useSession((s) => s.loadFiles);
  const addFiles = useSession((s) => s.addFiles);
  const setDropActive = useSession((s) => s.setDropActive);
  const dropActive = useSession((s) => s.dropActive);
  const hydrating = useSession((s) => s.hydrating);
  const loadError = useSession((s) => s.loadError);
  const poses = useSession((s) => s.poses);
  const names = useSession((s) => s.names);
  const figureMode = useSession((s) => s.figureMode);
  const setFigureMode = useSession((s) => s.setFigureMode);
  const spin = useSession((s) => s.spin);
  const setSpin = useSession((s) => s.setSpin);
  const frame = useSession((s) => s.frame);
  const setFrame = useSession((s) => s.setFrame);
  const labelsOn = useSession((s) => s.labelsOn);
  const setLabelsOn = useSession((s) => s.setLabelsOn);
  const overlayAll = useSession((s) => s.overlayAll);
  const chartOpen = useSession((s) => s.chartOpen);
  const setChartOpen = useSession((s) => s.setChartOpen);
  const addSnapshot = useScene((s) => s.addSnapshot);
  const setSceneOpen = useScene((s) => s.setOpen);
  const sceneCount = useScene((s) => s.panels.length);
  const setSceneTitle = useScene((s) => s.setTitle);
  const sceneNotice = useScene((s) => s.notice);
  const setSceneNotice = useScene((s) => s.setNotice);
  const toggleVisible = useSession((s) => s.toggleVisible);
  const libraryTargetId = useSession((s) => s.libraryTargetId);
  const kind = useSession((s) => s.kind);
  const libraryW = useChrome((s) => s.libraryW);
  const diagramW = useChrome((s) => s.diagramW);
  const setLibraryW = useChrome((s) => s.setLibraryW);
  const setDiagramW = useChrome((s) => s.setDiagramW);
  const resetLibrary = useChrome((s) => s.resetLibrary);
  const resetDiagram = useChrome((s) => s.resetDiagram);
  const hydrateChrome = useChrome((s) => s.hydrate);

  const analysis = useAnalysis();
  const { receptor, focused, visible, ss, focusedHits, fingerprint, pocketKeys, charges, proteinName, focusedLabel, caption } =
    analysis;

  useEffect(() => {
    if (!poses.length) void loadLibraryTarget("4zbe");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    hydrateChrome();
  }, [hydrateChrome]);

  useEffect(() => {
    if (!proteinName) return;
    if (!useScene.getState().title) setSceneTitle(proteinName);
  }, [proteinName, setSceneTitle]);

  useEffect(() => {
    if (!sceneNotice) return;
    setSaveLabel("Saved");
    const t = window.setTimeout(() => {
      setSceneNotice(null);
      setSaveLabel("To scene");
    }, 1600);
    return () => window.clearTimeout(t);
  }, [sceneNotice, setSceneNotice]);

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      const tag = (event.target as HTMLElement | null)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA") return;
      if (event.key >= "1" && event.key <= "9") {
        const pose = poses[Number(event.key) - 1];
        if (pose) toggleVisible(pose.id);
      }
      if (event.key === "[" || event.key === "]") {
        const dir = event.key === "]" ? 1 : -1;
        const index = TARGETS.findIndex((t) => t.id === libraryTargetId);
        const next = TARGETS[(index + dir + TARGETS.length) % TARGETS.length];
        if (next) void loadLibraryTarget(next.id);
      }
      if (event.key === "s" || event.key === "S") setSpin((v) => !v);
      if (event.key === "o" || event.key === "O") overlayAll();
      if (event.key === "l" || event.key === "L") setLabelsOn(!labelsOn);
      if (event.key === "c" || event.key === "C") setChartOpen(!useSession.getState().chartOpen);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [poses, libraryTargetId, labelsOn, loadLibraryTarget, overlayAll, setLabelsOn, setSpin, toggleVisible, setChartOpen]);

  useEffect(() => {
    function isFileDrag(event: DragEvent) {
      return Array.from(event.dataTransfer?.types ?? []).includes("Files");
    }
    function onEnter(event: DragEvent) {
      if (!isFileDrag(event)) return;
      event.preventDefault();
      setDropActive(true);
    }
    function onOver(event: DragEvent) {
      if (!isFileDrag(event)) return;
      event.preventDefault();
    }
    function onLeave(event: DragEvent) {
      if (event.relatedTarget) return;
      setDropActive(false);
    }
    function onDrop(event: DragEvent) {
      event.preventDefault();
      setDropActive(false);
      const files = [...(event.dataTransfer?.files ?? [])];
      if (files.length) {
        if (useSession.getState().poses.length) void addFiles(files);
        else void loadFiles(files);
      }
    }
    window.addEventListener("dragenter", onEnter);
    window.addEventListener("dragover", onOver);
    window.addEventListener("dragleave", onLeave);
    window.addEventListener("drop", onDrop);
    return () => {
      window.removeEventListener("dragenter", onEnter);
      window.removeEventListener("dragover", onOver);
      window.removeEventListener("dragleave", onLeave);
      window.removeEventListener("drop", onDrop);
    };
  }, [addFiles, loadFiles, setDropActive]);

  const ssByKey = useMemo(() => {
    const rec: Record<string, SSCode> = {};
    if (!ss) return rec;
    for (const r of ss.residues) rec[`${r.chain}:${r.resSeq}`] = r.ss;
    return rec;
  }, [ss]);

  const interacting = useMemo(() => {
    const set = new Set<string>();
    for (const h of focusedHits) set.add(`${h.chain}:${h.resSeq}`);
    return set;
  }, [focusedHits]);

  const residueLabels = useMemo(() => {
    const rec: Record<string, string> = {};
    for (const h of focusedHits) {
      rec[`${h.chain}:${h.resSeq}`] = prettyResidue(h.resName, h.resSeq, h.chain);
    }
    return rec;
  }, [focusedHits]);

  const engines = [...new Set(visible.map((p) => p.engine).filter(Boolean))];
  const ligandLayers = visible.map((pose) => ({
    id: pose.id,
    pdb: pose.pdb,
    color: pose.color,
    label:
      engines.length > 1
        ? `${ligandDisplay(names, pose.id, pose.fallbackLabel)} · ${pose.engine}`
        : ligandDisplay(names, pose.id, pose.fallbackLabel),
  }));

  const overlay = visible.length > 1;
  const target = TARGETS.find((t) => t.id === libraryTargetId);
  const otherLigands = useMemo(() => {
    if (!focused) return [];
    return visible
      .filter((p) => p.id !== focused.id)
      .map((p) => ({
        name: ligandDisplay(names, p.id, p.fallbackLabel),
        atoms: ligandAtoms(p.inventory),
      }));
  }, [focused, visible, names]);

  const hud = MODE_HUD[figureMode];

  async function captureView(): Promise<string | null> {
    setSpin(false);
    let uri = await snapshotViewerAsync();
    if (!uri) {
      await new Promise((resolve) => window.setTimeout(resolve, 700));
      uri = await snapshotViewerAsync();
    }
    return uri;
  }

  return (
    <div className="flex h-dvh min-h-0 flex-col overflow-hidden bg-bg text-fg">
      <LoadBar onMethods={() => setMethodsOpen(true)} />

      <div className="flex items-center gap-1 border-b border-border px-3 py-1 lg:hidden">
        {(
          [
            ["structure", "Library"],
            ["scene", "Pose"],
            ["residues", "Residues"],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            type="button"
            onClick={() => setMobileTab(id)}
            className={cn(
              "min-h-10 flex-1 rounded-md px-2 text-sm",
              mobileTab === id ? "bg-raised text-fg" : "text-muted",
            )}
          >
            {label}
          </button>
        ))}
      </div>

      <div
        className="flex min-h-0 flex-1 flex-col lg:flex-row"
        style={{
          ["--library-w" as string]: `${libraryW}px`,
          ["--diagram-w" as string]: `${diagramW}px`,
        }}
      >
        <aside
          className={cn(
            "studio-library relative z-10 min-h-0 shrink-0 overflow-y-auto border-b border-border lg:h-full lg:border-r lg:border-b-0",
            mobileTab === "structure" ? "block" : "hidden lg:block",
          )}
        >
          <InventoryPanel receptor={receptor} poses={poses} />
        </aside>

        <ColumnSplit
          value={libraryW}
          min={220}
          max={440}
          onChange={setLibraryW}
          onReset={resetLibrary}
          label="Library width"
        />

        <section
          className={cn(
            "relative z-0 min-h-0 min-w-0 flex-1 flex-col overflow-hidden",
            mobileTab === "scene" ? "flex" : "hidden lg:flex",
          )}
        >
          <div className="shrink-0 border-b border-border">
            <div className="flex items-baseline justify-between gap-3 px-3 pt-2 sm:px-4">
              <div className="min-w-0">
                <h2 className="truncate font-display text-lg leading-tight sm:text-xl">
                  {proteinName}
                  {kind === "library" && target ? (
                    <span className="ml-2 font-sans font-mono text-xs tracking-wide text-muted uppercase">
                      {target.pdbId} · {target.gene}
                    </span>
                  ) : null}
                </h2>
              </div>
              {focused ? (
                <span className="hidden shrink-0 font-mono text-xs tracking-wide text-muted uppercase sm:inline">
                  {focusedLabel}
                </span>
              ) : null}
            </div>
            <FigureToolbar
              mode={figureMode}
              spin={spin}
              frame={frame}
              labelsOn={labelsOn}
              overlay={overlay}
              chartOpen={chartOpen}
              sceneCount={sceneCount}
              saveLabel={saveLabel}
              onMode={setFigureMode}
              onSpin={() => setSpin((v) => !v)}
              onFrame={() => setFrame(frame === "ligand" ? "complex" : "ligand")}
              onLabels={() => setLabelsOn(!labelsOn)}
              onOverlayAll={overlayAll}
              onChart={() => setChartOpen(!chartOpen)}
              onScene={() => setSceneOpen(true)}
              onSnapshot={() => {
                void (async () => {
                  setSaveLabel("Saving");
                  const uri = await captureView();
                  if (!uri) {
                    setSaveLabel("To scene");
                    setSceneNotice("3D not ready — wait for the pocket, then To scene");
                    return;
                  }
                  const modeTitle = FIGURE_TITLES[figureMode] ?? figureMode;
                  const title = overlay ? `${modeTitle} · overlay` : modeTitle;
                  addSnapshot({
                    title,
                    caption,
                    src: uri,
                    span: 6,
                  });
                })();
              }}
              onDownload={() => {
                void (async () => {
                  const uri = await captureView();
                  if (!uri) {
                    setSceneNotice("3D not ready — wait for the pocket, then Download");
                    return;
                  }
                  const slug = (FIGURE_TITLES[figureMode] ?? figureMode)
                    .toLowerCase()
                    .replace(/[^a-z0-9]+/g, "-");
                  await downloadDataUrl(uri, `poseatlas-${slug || "view"}.png`);
                })();
              }}
            />
          </div>

          <SsStrip ss={ss} names={names} interacting={interacting} />

          <div className="flex min-h-0 flex-1 flex-col overflow-y-auto lg:overflow-hidden">
            <div className="studio-stage shrink-0 lg:h-full lg:min-h-0 lg:flex-1 lg:shrink">
              <div className="relative h-[min(48vh,28rem)] min-h-[16rem] min-w-0 lg:h-full lg:min-h-0">
                <MolCanvas
                  proteinPdb={receptor?.pdb ?? focused?.pdb ?? null}
                  ligands={ligandLayers}
                  figureMode={figureMode}
                  spin={spin}
                  focus={frame}
                  interactions={focusedHits}
                  ssByKey={ssByKey}
                  pocketKeys={[...pocketKeys]}
                  labelsOn={labelsOn}
                  charges={charges}
                  residueLabels={residueLabels}
                  className="absolute inset-0"
                />
                {hydrating ? (
                  <p className="absolute bottom-4 left-4 font-mono text-xs text-muted">Reading coordinates</p>
                ) : null}
                {loadError ? (
                  <p className="absolute bottom-4 left-4 font-mono text-xs text-muted">{loadError}</p>
                ) : null}
                <div className="hud-paper pointer-events-none absolute left-3 top-3 z-20 rounded-lg px-3 py-2">
                  <p className="font-mono text-xs tracking-widest text-faint uppercase">{hud.title}</p>
                  <p className="mt-0.5 text-xs text-muted">{hud.hint}</p>
                </div>
                {figureMode === "electrostatic" ? (
                  <div className="hud-paper pointer-events-none absolute right-3 top-3 z-20 flex items-center gap-2 rounded-lg px-2 py-2">
                    <div className="flex h-16 w-1.5 flex-col overflow-hidden rounded-full">
                      <span className="flex-1 bg-aa-acidic" />
                      <span className="flex-1 bg-accent" />
                      <span className="flex-1 bg-aa-basic" />
                    </div>
                    <div className="font-mono text-xs leading-4 text-muted">
                      <p>−</p>
                      <p className="mt-3">0</p>
                      <p className="mt-3">+</p>
                    </div>
                  </div>
                ) : null}
                {figureMode === "hydrophobic" ? (
                  <div className="hud-paper pointer-events-none absolute right-3 top-3 z-20 flex items-center gap-2 rounded-lg px-2 py-2">
                    <div className="flex h-16 w-1.5 flex-col overflow-hidden rounded-full">
                      <span className="flex-1 bg-aa-hydrophobic" />
                      <span className="flex-1 bg-accent" />
                      <span className="flex-1 bg-aa-polar" />
                    </div>
                    <div className="font-mono text-xs leading-4 text-muted">
                      <p>φ</p>
                      <p className="mt-6">polar</p>
                    </div>
                  </div>
                ) : null}
                <Legend layers={ligandLayers} overlay={overlay} />
                {chartOpen ? (
                  <div className="figure-2d absolute inset-x-0 bottom-0 z-30 max-h-[46%] overflow-y-auto border-t border-border">
                    <AffinityChart poses={poses} />
                  </div>
                ) : null}
                {saveLabel === "Saving" || sceneNotice ? (
                  <p className="hud-paper pointer-events-none absolute right-3 top-3 z-30 rounded-md px-3 py-1.5 font-mono text-xs">
                    {sceneNotice ?? "Capturing view"}
                  </p>
                ) : null}
              </div>

              <ColumnSplit
                value={diagramW}
                min={280}
                max={640}
                onChange={setDiagramW}
                onReset={resetDiagram}
                label="2D column width"
                inverted
              />

              <div className="figure-2d border-t border-border lg:h-full lg:min-h-0 lg:overflow-y-auto lg:border-t-0 lg:border-l">
                {focused ? (
                  <Diagram2D
                    ligand={ligandAtoms(focused.inventory)}
                    hits={focusedHits}
                    ligandName={focusedLabel}
                    otherLigands={otherLigands}
                  />
                ) : (
                  <p className="px-4 py-3 text-sm text-muted">
                    {hydrating ? "Reading coordinates" : "Load a pose to draw the 2D map."}
                  </p>
                )}
                <div className="hidden border-t border-border lg:block">
                  <ResidueTable
                    hits={focusedHits}
                    ssByKey={ssByKey}
                    ligandName={focusedLabel}
                    compact
                  />
                </div>
                <div className="hidden lg:block">
                  <FingerprintGrid
                    fingerprint={fingerprint}
                    names={names}
                    labels={Object.fromEntries(poses.map((p) => [p.id, p.fallbackLabel]))}
                    figure
                  />
                </div>
              </div>
            </div>

            <div className="flex shrink-0 items-start justify-between gap-3 border-t border-border px-4 py-1.5 sm:px-5">
              <p className="min-w-0 text-xs leading-relaxed text-muted sm:text-sm">{caption}</p>
              <Button
                size="sm"
                variant="ghost"
                className="shrink-0"
                onClick={() => {
                  void navigator.clipboard.writeText(caption);
                  setCopied(true);
                  window.setTimeout(() => setCopied(false), 1200);
                }}
              >
                <Copy />
                {copied ? "Copied" : "Caption"}
              </Button>
            </div>
          </div>
        </section>

        <aside
          className={cn(
            "figure-2d relative z-10 flex min-h-0 w-full shrink-0 flex-col overflow-y-auto border-t border-border lg:hidden",
            mobileTab === "residues" ? "flex" : "hidden",
          )}
        >
          <ResidueTable
            hits={focusedHits}
            ssByKey={ssByKey}
            ligandName={focusedLabel}
          />
          <FingerprintGrid
            fingerprint={fingerprint}
            names={names}
            labels={Object.fromEntries(poses.map((p) => [p.id, p.fallbackLabel]))}
          />
        </aside>
      </div>

      {dropActive ? (
        <div className="pointer-events-none fixed inset-0 z-[70] flex items-center justify-center bg-bg/70">
          <div className="rounded-2xl border border-border bg-surface px-8 py-6">
            <p className="font-display text-2xl">Drop PDB files</p>
            <p className="mt-1 text-sm text-muted">
              Protein–ligand complexes from any docking engine. Drop on an open session to overlay
              another engine.
            </p>
          </div>
        </div>
      ) : null}

      {methodsOpen ? <MethodsDialog onClose={() => setMethodsOpen(false)} /> : null}
      <SceneBoard
        ss={ss}
        poses={poses}
        names={names}
        interacting={interacting}
        proteinName={proteinName}
        ligandName={focusedLabel}
        fingerprint={fingerprint}
        hits={focusedHits}
        hitsByPose={analysis.hitsByPose}
        ssByKey={ssByKey}
      />
    </div>
  );
}

function Legend({
  layers,
  overlay,
}: {
  layers: { id: string; color: string; label: string }[];
  overlay: boolean;
}) {
  if (!layers.length) return null;
  return (
    <div className="hud-paper pointer-events-none absolute bottom-3 left-3 z-10 rounded-lg px-3 py-2">
      <p className="font-mono text-xs tracking-widest text-faint uppercase">
        {overlay ? "Overlay" : "Ligand"}
      </p>
      <ul className="mt-1.5 space-y-1">
        {layers.map((layer) => (
          <li key={layer.id} className="flex items-center gap-2 text-xs">
            <span className="size-1.5 rounded-full" style={{ background: layer.color }} />
            {layer.label}
          </li>
        ))}
      </ul>
    </div>
  );
}
