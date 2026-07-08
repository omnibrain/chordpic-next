import React from "react";

export const Logo: React.FunctionComponent<{
  className?: string;
}> = ({ className = "h-12 w-12" }) => (
  <svg
    viewBox="0 0 100 100"
    className={`fill-zinc-900 dark:fill-zinc-100 ${className}`}
  >
    <circle r={50} cx={50} cy={50} />
  </svg>
);
