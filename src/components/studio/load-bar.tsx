import { useRef, useState } from "react";
import { BookOpen, Info, Plus, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TARGETS, winnerOf, POSE_COLOR } from "@/lib/docking/catalog";
import { useSession } from "@/lib/docking/session-store";
import { cn } from "@/lib/utils";

export function LoadBar({ onMethods }: { onMethods: () => void }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const addRef = useRef<HTMLInputElement>(null);
  const [libraryOpen, setLibraryOpen] = useState(false);
  const loadFiles = useSession((s) => s.loadFiles);
  const addFiles = useSession((s) => s.addFiles);
  const loadLibraryTarget = useSession((s) => s.loadLibraryTarget);
  const libraryTargetId = useSession((s) => s.libraryTargetId);
  const kind = useSession((s) => s.kind);
  const poseCount = useSession((s) => s.poses.length);

  return (
    <header className="relative z-20 flex items-center justify-between gap-3 border-b border-border px-3 py-2 sm:px-5">
      <div className="flex min-w-0 items-baseline gap-3">
        <h1 className="font-display text-xl tracking-tight sm:text-2xl">PoseAtlas</h1>
        <p className="hidden truncate text-xs text-muted sm:block">
          Pose view for docking results · white figures for publication
        </p>
      </div>
      <div className="flex shrink-0 items-center gap-1.5">
        <input
          ref={inputRef}
          id="load-pdb-files"
          type="file"
          accept=".pdb,.ent,.txt,.PDB"
          multiple
          className="sr-only"
          tabIndex={-1}
          onChange={(event) => {
            const list = event.target.files;
            if (list?.length) void loadFiles([...list]);
            event.target.value = "";
          }}
        />
        <input
          ref={addRef}
          id="add-engine-files"
          type="file"
          accept=".pdb,.ent,.txt,.PDB"
          multiple
          className="sr-only"
          tabIndex={-1}
          onChange={(event) => {
            const list = event.target.files;
            if (list?.length) void addFiles([...list]);
            event.target.value = "";
          }}
        />
        <Button size="sm" onClick={() => inputRef.current?.click()}>
          <Upload />
          Load PDBs
        </Button>
        {poseCount ? (
          <Button size="sm" variant="secondary" onClick={() => addRef.current?.click()} aria-label="Add docking poses from another engine">
            <Plus />
            <span className="hidden sm:inline">Add engine</span>
            <span className="sm:hidden">Add</span>
          </Button>
        ) : null}
        <Button
          size="sm"
          variant={kind === "library" ? "secondary" : "ghost"}
          onClick={() => setLibraryOpen(true)}
        >
          <BookOpen />
          <span className="hidden sm:inline">Library</span>
        </Button>
        <Button variant="ghost" size="sm" onClick={onMethods} aria-label="Methods">
          <Info />
          <span className="hidden sm:inline">Methods</span>
        </Button>
      </div>

      {libraryOpen ? (
        <div
          className="fixed inset-0 z-[80] flex items-end justify-center bg-bg/70 p-3 sm:items-center"
          onClick={() => setLibraryOpen(false)}
          role="presentation"
        >
          <div
            role="dialog"
            aria-labelledby="library-title"
            className="relative z-[81] max-h-[80vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-border bg-surface p-5 shadow-xl sm:p-6"
            onClick={(event) => event.stopPropagation()}
          >
            <h2 id="library-title" className="font-display text-2xl">
              Demo library
            </h2>
            <p className="mt-1 text-sm text-muted">
              Six Klebsiella pneumoniae receptors, each with a co-crystallized ligand plus OX-11
              and T2Z14. Names can be edited after loading.
            </p>
            <ul className="mt-4 space-y-1">
              {TARGETS.map((target) => {
                const active = libraryTargetId === target.id;
                const win = winnerOf(target);
                return (
                  <li key={target.id}>
                    <button
                      type="button"
                      onClick={() => {
                        void loadLibraryTarget(target.id);
                        setLibraryOpen(false);
                      }}
                      className={cn(
                        "flex w-full items-center justify-between gap-3 rounded-lg px-3 py-2.5 text-left transition-colors duration-150",
                        active ? "bg-raised text-fg" : "text-muted hover:bg-raised/60 hover:text-fg",
                      )}
                    >
                      <span className="min-w-0">
                        <span className="block font-mono text-xs tracking-wide text-faint">
                          {target.pdbId} · {target.gene}
                        </span>
                        <span className="block truncate text-sm font-medium">{target.protein}</span>
                      </span>
                      <span
                        className="size-2 shrink-0 rounded-full"
                        style={{
                          background: win ? POSE_COLOR[win] : "var(--color-faint)",
                        }}
                      />
                    </button>
                  </li>
                );
              })}
            </ul>
            <div className="mt-4 flex justify-end">
              <Button variant="ghost" onClick={() => setLibraryOpen(false)}>
                Close
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </header>
  );
}
