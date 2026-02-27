"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type {
  BalanceConfig,
  WeightMap,
  AllowanceMap,
  AttributeDefMap,
} from "@/types/balance";

async function fetchBalanceConfig(): Promise<BalanceConfig> {
  const res = await fetch("/api/balance");
  if (!res.ok) throw new Error("Failed to fetch balance config");
  const data = await res.json();
  return data.balanceConfig;
}

export function useBalanceConfig() {
  return useQuery({
    queryKey: ["balance"],
    queryFn: fetchBalanceConfig,
  });
}

export function useUpdateBalance() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (balanceConfig: Partial<BalanceConfig>) => {
      const res = await fetch("/api/balance", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ balanceConfig }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Update failed");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["balance"] });
    },
  });
}

export function useUpdateWeights() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (weights: WeightMap) => {
      const res = await fetch("/api/balance/weights", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ weights }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Update weights failed");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["balance"] });
    },
  });
}

export function useUpdateAllowances() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (allowances: AllowanceMap) => {
      const res = await fetch("/api/balance/allowances", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ allowances }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Update allowances failed");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["balance"] });
    },
  });
}

export function useUpdateFormula() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (formula: string) => {
      const res = await fetch("/api/balance/formula", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ formula }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Update formula failed");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["balance"] });
    },
  });
}

export function useUpdateDefs() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (attributeDefs: AttributeDefMap) => {
      const res = await fetch("/api/balance/defs", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ attributeDefs }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Update defs failed");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["balance"] });
    },
  });
}
