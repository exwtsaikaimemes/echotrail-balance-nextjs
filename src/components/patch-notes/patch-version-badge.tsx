"use client";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface PatchVersionBadgeProps {
  version: string;
  isCurrent?: boolean;
  className?: string;
}

export function PatchVersionBadge({ version, isCurrent, className }: PatchVersionBadgeProps) {
  return (
    <Badge
      variant="outline"
      className={cn(
        "text-xs font-mono",
        isCurrent
          ? "bg-primary/15 text-primary border-primary/25"
          : "bg-muted/50 text-muted-foreground border-border",
        className
      )}
    >
      {version}
    </Badge>
  );
}
