"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { PatchVersion } from "@/types/history";
import { toast } from "sonner";

async function fetchPatchVersions(): Promise<{ versions: PatchVersion[] }> {
  const res = await fetch("/api/patch-versions");
  if (!res.ok) throw new Error("Failed to fetch patch versions");
  return res.json();
}

export function usePatchVersions() {
  return useQuery({
    queryKey: ["patchVersions"],
    queryFn: fetchPatchVersions,
    select: (data) => data.versions,
  });
}

export function useCreatePatchVersion() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { version: string; description?: string }) => {
      const res = await fetch("/api/patch-versions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to create patch version");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["patchVersions"] });
      queryClient.invalidateQueries({ queryKey: ["patchNotes"] });
      toast.success("Patch version created");
    },
    onError: (err: Error) => {
      toast.error(err.message);
    },
  });
}

export function useUpdatePatchVersion() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...data }: { id: number; description?: string; isCurrent?: boolean }) => {
      const res = await fetch(`/api/patch-versions/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to update patch version");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["patchVersions"] });
      queryClient.invalidateQueries({ queryKey: ["patchNotes"] });
      toast.success("Patch version updated");
    },
    onError: (err: Error) => {
      toast.error(err.message);
    },
  });
}

export function useDeletePatchVersion() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => {
      const res = await fetch(`/api/patch-versions/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to delete patch version");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["patchVersions"] });
      toast.success("Patch version deleted");
    },
    onError: (err: Error) => {
      toast.error(err.message);
    },
  });
}
