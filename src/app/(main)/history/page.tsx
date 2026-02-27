"use client";

import { useState, useMemo } from "react";
import { useHistory } from "@/hooks/use-history";
import { useDebounce } from "@/hooks/use-debounce";
import { HistoryToolbar, type ChangeTypeFilter } from "@/components/history/history-toolbar";
import { HistoryEntry } from "@/components/history/history-entry";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Loader2 } from "lucide-react";

export default function HistoryPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<ChangeTypeFilter>("all");

  const debouncedSearch = useDebounce(searchQuery, 300);

  const {
    data,
    isLoading,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
  } = useHistory();

  const allEntries = useMemo(() => {
    if (!data?.pages) return [];
    return data.pages.flatMap((page) => page.history);
  }, [data]);

  const filteredEntries = useMemo(() => {
    let result = allEntries;

    if (debouncedSearch) {
      const query = debouncedSearch.toLowerCase();
      result = result.filter(
        (entry) =>
          entry.itemName.toLowerCase().includes(query) ||
          entry.itemKey.toLowerCase().includes(query)
      );
    }

    if (typeFilter !== "all") {
      result = result.filter((entry) => entry.changeType === typeFilter);
    }

    return result;
  }, [allEntries, debouncedSearch, typeFilter]);

  const totalCount = data?.pages[0]?.total ?? 0;

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">History</h1>
        <p className="text-sm text-muted-foreground">
          {isLoading
            ? "Loading history..."
            : `${filteredEntries.length} of ${totalCount} changes`}
        </p>
      </div>

      <HistoryToolbar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        typeFilter={typeFilter}
        onTypeFilterChange={setTypeFilter}
      />

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-20 w-full rounded-lg" />
          ))}
        </div>
      ) : filteredEntries.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
          <p className="text-lg font-medium">No history entries found</p>
          <p className="text-sm">
            {debouncedSearch || typeFilter !== "all"
              ? "Try adjusting your filters."
              : "Changes to items will appear here."}
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {filteredEntries.map((entry) => (
            <HistoryEntry key={entry.id} entry={entry} />
          ))}

          {hasNextPage && (
            <div className="flex justify-center pt-4">
              <Button
                variant="outline"
                onClick={() => fetchNextPage()}
                disabled={isFetchingNextPage}
              >
                {isFetchingNextPage ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Loading...
                  </>
                ) : (
                  "Load More"
                )}
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
