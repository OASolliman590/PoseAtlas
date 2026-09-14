import * as React from "react";
import { cn } from "@/lib/utils";

export const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  function Input({ className, ...props }, ref) {
    return (
      <input
        ref={ref}
        className={cn(
          "h-8 w-full min-w-0 rounded-md border border-border bg-raised px-2.5 text-sm text-fg outline-none transition-[border-color,box-shadow] duration-150 placeholder:text-faint focus-visible:ring-2 focus-visible:ring-accent/40",
          className,
        )}
        {...props}
      />
    );
  },
);
