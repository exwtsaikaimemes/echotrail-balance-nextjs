"use client";

import { useInfiniteQuery, useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type { HistoryEntry, PatchGroup, PublicPatchGroup } from "@/types/history";

const PAGE_SIZE = 50;

interface HistoryPage {
  history: HistoryEntry[];
  total: number;
}

async function fetchHistoryPage(
  offset: number,
  itemId?: string,
): Promise<HistoryPage> {
  const params = new URLSearchParams({
    limit: String(PAGE_SIZE),
    offset: String(offset),
  });
  if (itemId) {
    params.set("item_id", itemId);
  }
  const res = await fetch(`/api/history?${params}`);
  if (!res.ok) throw new Error("Failed to fetch history");
  return res.json();
}

export function useHistory() {
  return useInfiniteQuery({
    queryKey: ["history"],
    queryFn: ({ pageParam = 0 }) => fetchHistoryPage(pageParam),
    initialPageParam: 0,
    getNextPageParam: (lastPage, allPages) => {
      const loaded = allPages.reduce((sum, p) => sum + p.history.length, 0);
      return loaded < lastPage.total ? loaded : undefined;
    },
  });
}

export function useItemHistory(itemId: string | undefined) {
  return useInfiniteQuery({
    queryKey: ["history", "item", itemId],
    queryFn: ({ pageParam = 0 }) => fetchHistoryPage(pageParam, itemId!),
    initialPageParam: 0,
    getNextPageParam: (lastPage, allPages) => {
      const loaded = allPages.reduce((sum, p) => sum + p.history.length, 0);
      return loaded < lastPage.total ? loaded : undefined;
    },
    enabled: !!itemId,
  });
}

// ── Grouped patch notes (internal, authenticated) ──

async function fetchPatchNotes(version?: string): Promise<{ groups: PatchGroup[] }> {
  const params = new URLSearchParams({ grouped: "true" });
  if (version) params.set("version", version);
  const res = await fetch(`/api/history?${params}`);
  if (!res.ok) throw new Error("Failed to fetch patch notes");
  return res.json();
}

export function usePatchNotes(version?: string) {
  return useQuery({
    queryKey: ["patchNotes", version ?? "all"],
    queryFn: () => fetchPatchNotes(version),
  });
}

// ── Public patch notes (no auth) ──

async function fetchPublicPatchNotes(version?: string): Promise<{ groups: PublicPatchGroup[] }> {
  const params = new URLSearchParams();
  if (version) params.set("version", version);
  const res = await fetch(`/api/patch-notes?${params}`);
  if (!res.ok) throw new Error("Failed to fetch public patch notes");
  return res.json();
}

export function usePublicPatchNotes(version?: string) {
  return useQuery({
    queryKey: ["publicPatchNotes", version ?? "all"],
    queryFn: () => fetchPublicPatchNotes(version),
  });
}

// ── Toggle history entry visibility ──

export function useToggleHistoryVisibility() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (entryId: number): Promise<{ isHidden: boolean }> => {
      const res = await fetch(`/api/history/${entryId}/visibility`, {
        method: "PATCH",
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Failed to toggle visibility");
      }
      return res.json();
    },
    onSuccess: (data) => {
      toast.success(data.isHidden ? "Entry hidden from public patch notes" : "Entry visible in public patch notes");
      queryClient.invalidateQueries({ queryKey: ["history"] });
      queryClient.invalidateQueries({ queryKey: ["patchNotes"] });
      queryClient.invalidateQueries({ queryKey: ["publicPatchNotes"] });
    },
    onError: (err: Error) => {
      toast.error(err.message);
    },
  });
}
