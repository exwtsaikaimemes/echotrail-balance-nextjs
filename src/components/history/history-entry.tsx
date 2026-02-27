"use client";

import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { HistoryEntry as HistoryEntryType } from "@/types/history";
import { Clock, User, ArrowRight } from "lucide-react";

function timeAgo(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (seconds < 0) return "just now";
  if (seconds < 60) return `${seconds}s ago`;

  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;

  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;

  const weeks = Math.floor(days / 7);
  if (weeks < 5) return `${weeks}w ago`;

  const months = Math.floor(days / 30);
  if (months < 12) return `${months}mo ago`;

  const years = Math.floor(days / 365);
  return `${years}y ago`;
}

const CHANGE_TYPE_CONFIG: Record<
  HistoryEntryType["changeType"],
  { label: string; className: string }
> = {
  created: {
    label: "Created",
    className: "bg-emerald-500/15 text-emerald-400 border-emerald-500/25",
  },
  updated: {
    label: "Updated",
    className: "bg-blue-500/15 text-blue-400 border-blue-500/25",
  },
  deleted: {
    label: "Deleted",
    className: "bg-red-500/15 text-red-400 border-red-500/25",
  },
};

function formatBudget(value: number | null): string {
  if (value === null) return "--";
  return value.toFixed(1);
}

function budgetDelta(before: number | null, after: number | null): { text: string; className: string } | null {
  if (before === null || after === null) return null;
  const diff = after - before;
  if (diff === 0) return null;
  const sign = diff > 0 ? "+" : "";
  return {
    text: `${sign}${diff.toFixed(1)}`,
    className: diff > 0 ? "text-emerald-400" : "text-red-400",
  };
}

interface HistoryEntryProps {
  entry: HistoryEntryType;
}

export function HistoryEntry({ entry }: HistoryEntryProps) {
  const config = CHANGE_TYPE_CONFIG[entry.changeType];
  const delta = entry.changeType === "updated"
    ? budgetDelta(entry.budgetBefore, entry.budgetAfter)
    : null;

  return (
    <div className="rounded-lg border border-border bg-card p-4 transition-colors hover:bg-accent/30">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0 space-y-1.5">
          <div className="flex items-center gap-2 flex-wrap">
            {entry.changeType === "deleted" ? (
              <span className="font-medium text-foreground truncate">
                {entry.itemName || entry.itemKey}
              </span>
            ) : (
              <Link
                href={`/items/${entry.itemId}`}
                className="font-medium text-foreground hover:text-primary hover:underline underline-offset-2 truncate"
              >
                {entry.itemName || entry.itemKey}
              </Link>
            )}

            <Badge
              variant="outline"
              className={cn("text-[11px] font-medium", config.className)}
            >
              {config.label}
            </Badge>
          </div>

          {entry.changeType === "updated" && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>Budget: {formatBudget(entry.budgetBefore)}</span>
              <ArrowRight className="h-3 w-3 shrink-0" />
              <span>{formatBudget(entry.budgetAfter)}</span>
              {delta && (
                <span className={cn("text-xs font-medium", delta.className)}>
                  ({delta.text})
                </span>
              )}
            </div>
          )}

          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <User className="h-3 w-3" />
              {entry.changedBy}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              <time
                dateTime={entry.createdAt}
                title={new Date(entry.createdAt).toLocaleString()}
              >
                {timeAgo(entry.createdAt)}
              </time>
            </span>
          </div>
        </div>

        <span className="text-xs text-muted-foreground/60 font-mono shrink-0">
          #{entry.id}
        </span>
      </div>
    </div>
  );
}
