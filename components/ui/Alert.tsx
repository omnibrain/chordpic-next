import React from "react";

export const Alert: React.FunctionComponent<{
  status?: "error" | "success" | "info";
  children: React.ReactNode;
  className?: string;
}> = ({ status = "info", children, className = "" }) => {
  const colors =
    status === "error"
      ? "border-red-200 bg-red-50 text-red-800 dark:border-red-900 dark:bg-red-950 dark:text-red-200"
      : status === "success"
        ? "border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-200"
        : "border-zinc-200 bg-zinc-50 text-zinc-800 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-200";

  return (
    <div className={`rounded-xl border p-4 text-sm ${colors} ${className}`}>
      {children}
    </div>
  );
};
