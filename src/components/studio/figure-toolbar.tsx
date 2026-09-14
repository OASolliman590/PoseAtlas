import { BarChart3, Camera, Download, LayoutTemplate, RotateCw, Scan, Tag } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { FigureMode } from "@/lib/docking/session-store";
import { cn } from "@/lib/utils";

const MODES: { id: FigureMode; label: string; hint: string }[] = [
  { id: "interaction", label: "Bonds", hint: "Cartoon + contacting side chains" },
  { id: "pocket", label: "Pocket", hint: "Cutaway pocket surface" },
  { id: "electrostatic", label: "Electro", hint: "Coulombic SAS" },
  { id: "hydrophobic", label: "Hydro", hint: "Kyte–Doolittle hydropathy" },
];

export function FigureToolbar({
  mode,
  spin,
  frame,
  labelsOn,
  overlay,
  chartOpen,
  sceneCount,
  saveLabel,
  onMode,
  onSpin,
  onFrame,
  onLabels,
  onOverlayAll,
  onChart,
  onSnapshot,
  onDownload,
  onScene,
}: {
  mode: FigureMode;
  spin: boolean;
  frame: "ligand" | "complex";
  labelsOn: boolean;
  overlay: boolean;
  chartOpen: boolean;
  sceneCount: number;
  saveLabel: string;
  onMode: (mode: FigureMode) => void;
  onSpin: () => void;
  onFrame: () => void;
  onLabels: () => void;
  onOverlayAll: () => void;
  onChart: () => void;
  onSnapshot: () => void;
  onDownload: () => void;
  onScene: () => void;
}) {
  return (
    <div className="flex flex-col gap-1.5 px-3 py-2 sm:px-4 lg:flex-row lg:items-center">
      <div
        className="grid grid-cols-4 gap-1 rounded-lg bg-raised p-1 lg:w-[28rem] lg:shrink-0"
        role="tablist"
        aria-label="Pose representation"
      >
        {MODES.map((item) => {
          const active = mode === item.id;
          return (
            <button
              key={item.id}
              type="button"
              role="tab"
              aria-selected={active}
              title={item.hint}
              onClick={() => onMode(item.id)}
              className={cn(
                "min-h-10 rounded-md px-2 text-sm font-medium transition-colors duration-150",
                active ? "bg-surface text-fg shadow-sm" : "text-muted hover:text-fg",
              )}
            >
              {item.label}
            </button>
          );
        })}
      </div>

      <div className="flex min-w-0 items-center gap-1 overflow-x-auto">
        <Button size="sm" variant={frame === "ligand" ? "secondary" : "ghost"} onClick={onFrame}>
          <Scan />
          {frame === "ligand" ? "Ligand" : "Complex"}
        </Button>
        <Button size="sm" variant={spin ? "secondary" : "ghost"} onClick={onSpin}>
          <RotateCw />
          Spin
        </Button>
        <Button size="sm" variant={labelsOn ? "secondary" : "ghost"} onClick={onLabels}>
          <Tag />
          Labels
        </Button>
        <Button
          size="sm"
          variant={overlay ? "secondary" : "ghost"}
          onClick={onOverlayAll}
          className={cn(overlay && "text-fg")}
        >
          Overlay
        </Button>
        <Button size="sm" variant={chartOpen ? "secondary" : "ghost"} onClick={onChart}>
          <BarChart3 />
          Chart
        </Button>
        <div className="ml-auto flex shrink-0 items-center gap-1">
          <Button size="sm" variant="secondary" onClick={onSnapshot} aria-label="Save to scene">
            <Camera />
            {saveLabel}
          </Button>
          <Button size="sm" variant="ghost" onClick={onDownload} aria-label="Download PNG">
            <Download />
            Download
          </Button>
          <Button size="sm" variant={sceneCount ? "secondary" : "ghost"} onClick={onScene}>
            <LayoutTemplate />
            Figures
            {sceneCount ? (
              <span className="font-mono text-xs tabular-nums text-muted">{sceneCount}</span>
            ) : null}
          </Button>
        </div>
      </div>
    </div>
  );
}
