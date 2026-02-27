"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { Comment } from "@/types/comment";

async function fetchComments(itemId: string): Promise<Comment[]> {
  const res = await fetch(`/api/items/${itemId}/comments`);
  if (!res.ok) throw new Error("Failed to fetch comments");
  const data = await res.json();
  return data.comments;
}

async function fetchCommentCounts(): Promise<Record<string, number>> {
  const res = await fetch("/api/items/comment-counts");
  if (!res.ok) throw new Error("Failed to fetch comment counts");
  const data = await res.json();
  return data.counts;
}

export function useComments(itemId: string | undefined) {
  return useQuery({
    queryKey: ["comments", itemId],
    queryFn: () => fetchComments(itemId!),
    enabled: !!itemId,
  });
}

export function useCommentCounts() {
  return useQuery({
    queryKey: ["commentCounts"],
    queryFn: fetchCommentCounts,
  });
}

export function useCreateComment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      itemId,
      comment,
    }: {
      itemId: string;
      comment: string;
    }) => {
      const res = await fetch(`/api/items/${itemId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ comment }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Failed to create comment");
      }
      return res.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["comments", variables.itemId],
      });
      queryClient.invalidateQueries({ queryKey: ["commentCounts"] });
    },
  });
}
