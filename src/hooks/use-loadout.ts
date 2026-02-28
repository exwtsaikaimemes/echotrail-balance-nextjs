"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { EquippedLoadout, SavedLoadout, LoadoutSlot } from "@/types/loadout";

// Fetch current loadout
async function fetchCurrentLoadout(): Promise<EquippedLoadout> {
  const res = await fetch("/api/loadout/current");
  if (!res.ok) throw new Error("Failed to fetch current loadout");
  const data = await res.json();
  return data.loadout;
}

// Fetch saved loadouts
async function fetchSavedLoadouts(): Promise<SavedLoadout[]> {
  const res = await fetch("/api/loadout/saved");
  if (!res.ok) throw new Error("Failed to fetch saved loadouts");
  const data = await res.json();
  return data.loadouts;
}

// Update a loadout slot
async function updateLoadoutSlot(
  slot: LoadoutSlot,
  itemKey: string | null
): Promise<EquippedLoadout> {
  const res = await fetch("/api/loadout/current", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ slot, itemKey }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || "Failed to update loadout");
  }
  const data = await res.json();
  return data.loadout;
}

// Create a saved loadout
async function createSavedLoadout(
  name: string,
  slots: EquippedLoadout
): Promise<SavedLoadout> {
  const res = await fetch("/api/loadout/saved", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, slots }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || "Failed to create loadout");
  }
  const data = await res.json();
  return data.loadout;
}

// Rename a saved loadout
async function renameSavedLoadout(id: string, name: string): Promise<SavedLoadout> {
  const res = await fetch(`/api/loadout/saved/${encodeURIComponent(id)}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || "Failed to rename loadout");
  }
  const data = await res.json();
  return data.loadout;
}

// Delete a saved loadout
async function deleteSavedLoadout(id: string): Promise<void> {
  const res = await fetch(`/api/loadout/saved/${encodeURIComponent(id)}`, {
    method: "DELETE",
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || "Failed to delete loadout");
  }
}

// Equip a saved loadout
async function equipSavedLoadout(id: string): Promise<EquippedLoadout> {
  const res = await fetch(`/api/loadout/saved/${encodeURIComponent(id)}/equip`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || "Failed to equip loadout");
  }
  const data = await res.json();
  return data.loadout;
}

// Hooks

export function useCurrentLoadout() {
  return useQuery({
    queryKey: ["loadout", "current"],
    queryFn: fetchCurrentLoadout,
  });
}

export function useUpdateLoadoutSlot() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ slot, itemKey }: { slot: LoadoutSlot; itemKey: string | null }) =>
      updateLoadoutSlot(slot, itemKey),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["loadout", "current"] });
    },
  });
}

export function useSavedLoadouts() {
  return useQuery({
    queryKey: ["loadout", "saved"],
    queryFn: fetchSavedLoadouts,
  });
}

export function useCreateSavedLoadout() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ name, slots }: { name: string; slots: EquippedLoadout }) =>
      createSavedLoadout(name, slots),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["loadout", "saved"] });
    },
  });
}

export function useRenameSavedLoadout() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, name }: { id: string; name: string }) =>
      renameSavedLoadout(id, name),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["loadout", "saved"] });
    },
  });
}

export function useDeleteSavedLoadout() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteSavedLoadout(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["loadout", "saved"] });
    },
  });
}

export function useEquipSavedLoadout() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => equipSavedLoadout(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["loadout", "current"] });
    },
  });
}
