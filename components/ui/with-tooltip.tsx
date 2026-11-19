import * as React from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export const WithTooltip = ({
  label,
  children,
}: {
  label: React.ReactNode;
  children: React.ReactElement;
}) => (
  <Tooltip>
    <TooltipTrigger asChild>{children}</TooltipTrigger>
    <TooltipContent className="max-w-64">{label}</TooltipContent>
  </Tooltip>
);
