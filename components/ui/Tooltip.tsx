import React from "react";

/**
 * Minimal CSS-only tooltip. Wraps its child and shows the label above on
 * hover/focus.
 */
export const Tooltip: React.FunctionComponent<{
  label: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  /** Force the tooltip open (e.g. while dragging a slider) */
  isOpen?: boolean;
}> = ({ label, children, className = "", isOpen }) => (
  <span className={`group/tooltip relative inline-flex ${className}`}>
    {children}
    <span
      role="tooltip"
      className={`pointer-events-none absolute bottom-full left-1/2 z-20 mb-2 -translate-x-1/2 whitespace-nowrap rounded-md bg-zinc-900 px-2 py-1 text-xs text-white shadow transition-opacity dark:bg-zinc-100 dark:text-zinc-900 ${
        isOpen ? "opacity-100" : "opacity-0 group-hover/tooltip:opacity-100"
      }`}
    >
      {label}
    </span>
  </span>
);
