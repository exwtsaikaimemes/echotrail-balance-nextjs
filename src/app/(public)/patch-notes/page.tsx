"use client";

import { useState, useMemo } from "react";
import { usePublicPatchNotes } from "@/hooks/use-history";
import { useDebounce } from "@/hooks/use-debounce";
import { PatchGroupCard } from "@/components/patch-notes/patch-group-card";
import { VersionFilter } from "@/components/patch-notes/version-filter";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Search } from "lucide-react";

export default function PublicPatchNotesPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [versionFilter, setVersionFilter] = useState("all");

  const debouncedSearch = useDebounce(searchQuery, 300);

  const { data, isLoading } = usePublicPatchNotes(
    versionFilter !== "all" ? versionFilter : undefined
  );

  // Extract unique version strings from groups for the filter
  const versionStrings = useMemo(() => {
    if (!data?.groups) return [];
    return data.groups.map((g) => g.version);
  }, [data]);

  const filteredGroups = useMemo(() => {
    if (!data?.groups) return [];

    return data.groups
      .map((group) => {
        let entries = group.entries;

        if (debouncedSearch) {
          const query = debouncedSearch.toLowerCase();
          entries = entries.filter((entry) =>
            entry.itemName.toLowerCase().includes(query)
          );
        }

        return { ...group, entries };
      })
      .filter((group) => group.entries.length > 0);
  }, [data, debouncedSearch]);

  const totalEntries = filteredGroups.reduce((sum, g) => sum + g.entries.length, 0);

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Patch Notes</h1>
        <p className="text-sm text-muted-foreground">
          {isLoading
            ? "Loading..."
            : `${totalEntries} change${totalEntries !== 1 ? "s" : ""} across ${filteredGroups.length} version${filteredGroups.length !== 1 ? "s" : ""}`}
        </p>
      </div>

      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by item name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <VersionFilter
          versions={versionStrings}
          value={versionFilter}
          onChange={setVersionFilter}
        />
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-16 w-full rounded-lg" />
          ))}
        </div>
      ) : filteredGroups.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
          <p className="text-lg font-medium">No patch notes found</p>
          <p className="text-sm">
            {debouncedSearch || versionFilter !== "all"
              ? "Try adjusting your filters."
              : "No changes have been recorded yet."}
          </p>
        </div>
      ) : (
        <div className="space-y-8">
          {filteredGroups.map((group) => (
            <PatchGroupCard key={group.version} mode="public" group={group} />
          ))}
        </div>
      )}
    </div>
  );
}
