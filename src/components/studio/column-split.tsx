import { useRef } from "react";
import { cn } from "@/lib/utils";

export function ColumnSplit({
  value,
  min,
  max,
  onChange,
  onReset,
  label,
  inverted = false,
}: {
  value: number;
  min: number;
  max: number;
  onChange: (next: number) => void;
  onReset?: () => void;
  label: string;
  /** True when `value` is the pane to the right of this split. */
  inverted?: boolean;
}) {
  const start = useRef({ x: 0, w: value });
  const sign = inverted ? -1 : 1;

  return (
    <div
      role="separator"
      aria-orientation="vertical"
      aria-label={label}
      aria-valuenow={value}
      aria-valuemin={min}
      aria-valuemax={max}
      tabIndex={0}
      title={`${label} — drag to resize, double-click to reset`}
      className={cn(
        "group relative z-20 hidden w-2 shrink-0 cursor-col-resize touch-none items-stretch justify-center lg:flex",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40",
      )}
      onKeyDown={(event) => {
        const step = event.key === "ArrowLeft" ? -16 : event.key === "ArrowRight" ? 16 : 0;
        if (step) {
          event.preventDefault();
          onChange(value + sign * step);
        }
        if (event.key === "Home") {
          event.preventDefault();
          onChange(min);
        }
        if (event.key === "End") {
          event.preventDefault();
          onChange(max);
        }
      }}
      onDoubleClick={() => onReset?.()}
      onPointerDown={(event) => {
        if (event.button !== 0) return;
        event.preventDefault();
        start.current = { x: event.clientX, w: value };
        event.currentTarget.setPointerCapture(event.pointerId);
        document.body.classList.add("is-col-resizing");
      }}
      onPointerMove={(event) => {
        if (!event.currentTarget.hasPointerCapture(event.pointerId)) return;
        onChange(start.current.w + sign * (event.clientX - start.current.x));
      }}
      onPointerUp={(event) => {
        if (event.currentTarget.hasPointerCapture(event.pointerId)) {
          event.currentTarget.releasePointerCapture(event.pointerId);
        }
        document.body.classList.remove("is-col-resizing");
      }}
      onPointerCancel={() => document.body.classList.remove("is-col-resizing")}
      onLostPointerCapture={() => document.body.classList.remove("is-col-resizing")}
    >
      <span className="my-auto h-12 w-px rounded-full bg-border transition-colors duration-150 group-hover:bg-fg/55 group-focus-visible:bg-fg/70 group-active:bg-fg" />
    </div>
  );
}
