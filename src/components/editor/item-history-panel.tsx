"use client";

import { useMemo } from "react";
import { useItemHistory } from "@/hooks/use-history";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2, History } from "lucide-react";
import { cn } from "@/lib/utils";

interface ItemHistoryPanelProps {
  itemId: string;
}

function formatTimestamp(dateStr: string): string {
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return dateStr;
  }
}

const CHANGE_TYPE_CONFIG: Record<
  string,
  { label: string; className: string }
> = {
  created: {
    label: "Created",
    className: "bg-green-600/20 text-green-400 border-green-600/30",
  },
  updated: {
    label: "Updated",
    className: "bg-blue-600/20 text-blue-400 border-blue-600/30",
  },
  deleted: {
    label: "Deleted",
    className: "bg-red-600/20 text-red-400 border-red-600/30",
  },
};

export function ItemHistoryPanel({ itemId }: ItemHistoryPanelProps) {
  const {
    data,
    isLoading,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
  } = useItemHistory(itemId);

  const entries = useMemo(
    () => data?.pages.flatMap((p) => p.history) ?? [],
    [data]
  );

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <History className="h-4 w-4" />
          History
          {entries.length > 0 && (
            <span className="text-sm font-normal text-muted-foreground">
              ({entries.length})
            </span>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center py-6">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        ) : entries.length === 0 ? (
          <div className="flex items-center justify-center py-6">
            <p className="text-sm text-muted-foreground">
              No history recorded for this item.
            </p>
          </div>
        ) : (
          <ScrollArea className="max-h-[350px]">
            <div className="space-y-2">
              {entries.map((entry) => {
                const typeConfig =
                  CHANGE_TYPE_CONFIG[entry.changeType] ??
                  CHANGE_TYPE_CONFIG.updated;

                const budgetDelta =
                  entry.budgetAfter != null && entry.budgetBefore != null
                    ? Math.round(
                        (entry.budgetAfter - entry.budgetBefore) * 100
                      ) / 100
                    : null;

                return (
                  <div
                    key={entry.id}
                    className="rounded-lg border p-3 space-y-1"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Badge
                          variant="outline"
                          className={cn("text-[10px]", typeConfig.className)}
                        >
                          {typeConfig.label}
                        </Badge>
                        <span className="text-xs font-medium">
                          {entry.changedBy}
                        </span>
                      </div>
                      <span className="text-[10px] text-muted-foreground">
                        {formatTimestamp(entry.createdAt)}
                      </span>
                    </div>

                    {budgetDelta !== null && budgetDelta !== 0 && (
                      <p
                        className={cn(
                          "text-xs font-mono",
                          budgetDelta > 0
                            ? "text-red-400"
                            : "text-green-400"
                        )}
                      >
                        Budget: {budgetDelta > 0 ? "+" : ""}
                        {budgetDelta}
                        {entry.budgetAfter != null && (
                          <span className="text-muted-foreground">
                            {" "}
                            (now {entry.budgetAfter})
                          </span>
                        )}
                      </p>
                    )}
                  </div>
                );
              })}

              {hasNextPage && (
                <div className="flex justify-center pt-2">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => fetchNextPage()}
                    disabled={isFetchingNextPage}
                  >
                    {isFetchingNextPage ? (
                      <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                    ) : null}
                    Load More
                  </Button>
                </div>
              )}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
}
