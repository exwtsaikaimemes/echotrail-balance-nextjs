"use client";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { AttributeDiffDisplay } from "./attribute-diff-display";
import type { PublicPatchEntry } from "@/types/history";
import { TrendingUp, TrendingDown, ArrowLeftRight } from "lucide-react";

const CHANGE_TYPE_CONFIG: Record<
  PublicPatchEntry["changeType"],
  { label: string; className: string; icon?: React.ElementType }
> = {
  created: {
    label: "New Item",
    className: "bg-emerald-500/15 text-emerald-400 border-emerald-500/25",
  },
  buffed: {
    label: "Buffed",
    className: "bg-green-500/15 text-green-400 border-green-500/25",
    icon: TrendingUp,
  },
  nerfed: {
    label: "Nerfed",
    className: "bg-red-500/15 text-red-400 border-red-500/25",
    icon: TrendingDown,
  },
  adjusted: {
    label: "Adjusted",
    className: "bg-blue-500/15 text-blue-400 border-blue-500/25",
    icon: ArrowLeftRight,
  },
  deleted: {
    label: "Removed",
    className: "bg-red-500/15 text-red-400 border-red-500/25",
  },
};

interface PublicEntryCardProps {
  entry: PublicPatchEntry;
}

export function PublicEntryCard({ entry }: PublicEntryCardProps) {
  const config = CHANGE_TYPE_CONFIG[entry.changeType];
  const TypeIcon = config.icon;

  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <div className="space-y-2">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-medium text-foreground">{entry.itemName}</span>
          <Badge
            variant="outline"
            className={cn("text-[11px] font-medium", config.className)}
          >
            {TypeIcon && <TypeIcon className="h-3 w-3 mr-1" />}
            {config.label}
          </Badge>
        </div>

        {entry.diff && (entry.diff.attributeDiffs.length > 0 || entry.diff.propertyChanges.length > 0) && (
          <div className="pl-1 border-l-2 border-border ml-0.5">
            <AttributeDiffDisplay
              attributeDiffs={entry.diff.attributeDiffs}
              propertyChanges={entry.diff.propertyChanges}
            />
          </div>
        )}
      </div>
    </div>
  );
}
