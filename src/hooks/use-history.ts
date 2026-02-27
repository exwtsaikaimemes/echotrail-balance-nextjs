"use client";

import { useInfiniteQuery } from "@tanstack/react-query";
import type { HistoryEntry } from "@/types/history";

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
