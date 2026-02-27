"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { computeItemDiff, classifyUpdate } from "@/lib/diff-utils";
import { useToggleHistoryVisibility } from "@/hooks/use-history";
import { AttributeDiffDisplay } from "./attribute-diff-display";
import type { HistoryEntry } from "@/types/history";
import { Clock, User, ArrowRight, TrendingUp, TrendingDown, ArrowLeftRight, Eye, EyeOff } from "lucide-react";

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
  return `${Math.floor(days / 365)}y ago`;
}

const CHANGE_TYPE_CONFIG: Record<
  string,
  { label: string; className: string; icon?: React.ElementType }
> = {
  created: {
    label: "Created",
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
    label: "Deleted",
    className: "bg-red-500/15 text-red-400 border-red-500/25",
  },
};

function formatBudget(value: number | null): string {
  if (value === null) return "--";
  return value.toFixed(1);
}

interface InternalEntryCardProps {
  entry: HistoryEntry;
}

export function InternalEntryCard({ entry }: InternalEntryCardProps) {
  const { data: session } = useSession();
  const isAdmin = session?.user?.role === "admin";
  const toggleVisibility = useToggleHistoryVisibility();

  const displayType = entry.changeType === "updated"
    ? classifyUpdate(entry.budgetBefore, entry.budgetAfter)
    : entry.changeType;
  const config = CHANGE_TYPE_CONFIG[displayType];
  const TypeIcon = config.icon;

  const diff = (entry.snapshotBefore || entry.snapshotAfter)
    ? computeItemDiff(entry.snapshotBefore, entry.snapshotAfter)
    : null;

  const budgetDelta = entry.budgetBefore !== null && entry.budgetAfter !== null
    ? entry.budgetAfter - entry.budgetBefore
    : null;

  return (
    <div className={cn(
      "rounded-lg border border-border bg-card p-4 transition-colors hover:bg-accent/30",
      entry.isHidden && "opacity-60"
    )}>
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0 space-y-2">
          {/* Header row */}
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
              {TypeIcon && <TypeIcon className="h-3 w-3 mr-1" />}
              {config.label}
            </Badge>
            {entry.isHidden && (
              <EyeOff className="h-3.5 w-3.5 text-muted-foreground" />
            )}
          </div>

          {/* Budget delta (for updates) */}
          {entry.changeType === "updated" && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>Budget: {formatBudget(entry.budgetBefore)}</span>
              <ArrowRight className="h-3 w-3 shrink-0" />
              <span>{formatBudget(entry.budgetAfter)}</span>
              {budgetDelta !== null && budgetDelta !== 0 && (
                <span className={cn(
                  "text-xs font-medium",
                  budgetDelta > 0 ? "text-emerald-400" : "text-red-400"
                )}>
                  ({budgetDelta > 0 ? "+" : ""}{budgetDelta.toFixed(1)})
                </span>
              )}
            </div>
          )}

          {/* Attribute diffs */}
          {diff && (diff.attributeDiffs.length > 0 || diff.propertyChanges.length > 0) && (
            <div className="mt-1 pl-1 border-l-2 border-border ml-0.5">
              <AttributeDiffDisplay
                attributeDiffs={diff.attributeDiffs}
                propertyChanges={diff.propertyChanges}
              />
            </div>
          )}

          {/* Meta */}
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

        <div className="flex items-center gap-1 shrink-0">
          {isAdmin && (
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              title={entry.isHidden ? "Show in public patch notes" : "Hide from public patch notes"}
              onClick={() => toggleVisibility.mutate(entry.id)}
              disabled={toggleVisibility.isPending}
            >
              {entry.isHidden ? (
                <EyeOff className="h-3.5 w-3.5 text-muted-foreground" />
              ) : (
                <Eye className="h-3.5 w-3.5 text-muted-foreground" />
              )}
            </Button>
          )}
          <span className="text-xs text-muted-foreground/60 font-mono">
            #{entry.id}
          </span>
        </div>
      </div>
    </div>
  );
}
