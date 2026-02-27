"use client";

import { cn } from "@/lib/utils";
import type { AttributeDiff, PropertyChange } from "@/types/history";
import { Plus, Minus, Pencil } from "lucide-react";

interface AttributeDiffDisplayProps {
  attributeDiffs: AttributeDiff[];
  propertyChanges: PropertyChange[];
}

export function AttributeDiffDisplay({ attributeDiffs, propertyChanges }: AttributeDiffDisplayProps) {
  if (attributeDiffs.length === 0 && propertyChanges.length === 0) {
    return <span className="text-xs text-muted-foreground italic">No detailed changes</span>;
  }

  return (
    <div className="space-y-1 text-sm">
      {propertyChanges.map((pc) => (
        <div key={pc.property} className="flex items-center gap-1.5 text-yellow-400">
          <Pencil className="h-3 w-3 shrink-0" />
          <span className="font-medium">{pc.property}:</span>
          <span className="text-muted-foreground line-through">{pc.before || '""'}</span>
          <span>&rarr;</span>
          <span>{pc.after || '""'}</span>
        </div>
      ))}

      {attributeDiffs.map((diff) => (
        <div key={diff.name}>
          <div
            className={cn(
              "flex items-center gap-1.5",
              diff.kind === "added" && "text-emerald-400",
              diff.kind === "removed" && "text-red-400",
              diff.kind === "changed" && "text-yellow-400"
            )}
          >
            {diff.kind === "added" && <Plus className="h-3 w-3 shrink-0" />}
            {diff.kind === "removed" && <Minus className="h-3 w-3 shrink-0" />}
            {diff.kind === "changed" && <Pencil className="h-3 w-3 shrink-0" />}
            <span className="font-medium">{diff.name}</span>
            <span className="text-muted-foreground text-xs">({diff.category})</span>
          </div>

          {diff.kind === "changed" && diff.boundDiffs && (
            <div className="ml-6 space-y-0.5">
              {diff.boundDiffs.map((bd, i) => (
                <div key={i} className="text-xs text-muted-foreground">
                  {bd.minBefore !== null && bd.minAfter !== null && bd.minBefore !== bd.minAfter && (
                    <span>
                      min: <span className="line-through text-red-400">{bd.minBefore}</span>{" "}
                      &rarr; <span className="text-emerald-400">{bd.minAfter}</span>
                    </span>
                  )}
                  {bd.minBefore !== null && bd.minAfter !== null && bd.minBefore !== bd.minAfter &&
                   bd.maxBefore !== null && bd.maxAfter !== null && bd.maxBefore !== bd.maxAfter && (
                    <span className="mx-1.5">|</span>
                  )}
                  {bd.maxBefore !== null && bd.maxAfter !== null && bd.maxBefore !== bd.maxAfter && (
                    <span>
                      max: <span className="line-through text-red-400">{bd.maxBefore}</span>{" "}
                      &rarr; <span className="text-emerald-400">{bd.maxAfter}</span>
                    </span>
                  )}
                  {bd.minBefore === null && bd.minAfter !== null && (
                    <span className="text-emerald-400">+ bound ({bd.type}: {bd.minAfter} – {bd.maxAfter})</span>
                  )}
                  {bd.minBefore !== null && bd.minAfter === null && (
                    <span className="text-red-400">- bound ({bd.type}: {bd.minBefore} – {bd.maxBefore})</span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
