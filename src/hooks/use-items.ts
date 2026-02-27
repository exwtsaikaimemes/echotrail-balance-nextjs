"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getSocketId } from "@/components/providers/socket-provider";
import type { Item } from "@/types/item";
import type { PatchStatus } from "@/types/history";

function socketHeader(): Record<string, string> {
  const id = getSocketId();
  return id ? { "X-Socket-Id": id } : {};
}

async function fetchItems(): Promise<Item[]> {
  const res = await fetch("/api/items");
  if (!res.ok) throw new Error("Failed to fetch items");
  const data = await res.json();
  return data.items;
}

async function fetchItem(identifier: string): Promise<Item> {
  const res = await fetch(`/api/items/${encodeURIComponent(identifier)}`);
  if (!res.ok) throw new Error("Failed to fetch item");
  const data = await res.json();
  return data.item;
}

export function useItems() {
  return useQuery({ queryKey: ["items"], queryFn: fetchItems });
}

export function useItem(identifier: string | undefined) {
  return useQuery({
    queryKey: ["item", identifier],
    queryFn: () => fetchItem(identifier!),
    enabled: !!identifier,
  });
}

export function useCreateItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (item: Partial<Item>) => {
      const res = await fetch("/api/items", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...socketHeader() },
        body: JSON.stringify({ item }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Create failed");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["items"] });
    },
  });
}

export function useUpdateItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, item }: { id: string; item: Partial<Item> }) => {
      const res = await fetch(`/api/items/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", ...socketHeader() },
        body: JSON.stringify({ item }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Update failed");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["items"] });
      queryClient.invalidateQueries({ queryKey: ["item"] });
    },
  });
}

export function useDeleteItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/items/${id}`, { method: "DELETE", headers: socketHeader() });
      if (!res.ok) throw new Error("Delete failed");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["items"] });
    },
  });
}

export function useClearItems() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/items", { method: "DELETE", headers: socketHeader() });
      if (!res.ok) throw new Error("Clear failed");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["items"] });
    },
  });
}

export function useImportCSV() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/items/import/csv", {
        method: "POST",
        headers: socketHeader(),
        body: formData,
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Import failed");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["items"] });
    },
  });
}

export function useImportWorkspace() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: { items?: any[]; balanceConfig?: any }) => {
      const res = await fetch("/api/items/import/workspace", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...socketHeader() },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Import failed");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["items"] });
      queryClient.invalidateQueries({ queryKey: ["balance"] });
    },
  });
}

// ── Patch statuses per item for current version ──

async function fetchPatchStatuses(): Promise<Record<string, PatchStatus>> {
  const res = await fetch("/api/items/patch-status");
  if (!res.ok) throw new Error("Failed to fetch patch statuses");
  const data = await res.json();
  return data.statuses;
}

export function useItemPatchStatuses() {
  return useQuery({
    queryKey: ["itemPatchStatuses"],
    queryFn: fetchPatchStatuses,
  });
}
