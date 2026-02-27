"use client";

import { useState, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useComments, useCreateComment } from "@/hooks/use-comments";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Loader2, MessageSquare, Send } from "lucide-react";

interface CommentsSectionProps {
  itemId: string;
}

function formatTimestamp(dateStr: string): string {
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return dateStr;
  }
}

export function CommentsSection({ itemId }: CommentsSectionProps) {
  const { data: _session } = useSession();
  const { data: comments, isLoading } = useComments(itemId);
  const createComment = useCreateComment();
  const [newComment, setNewComment] = useState("");

  const handleSubmit = useCallback(async () => {
    const text = newComment.trim();
    if (!text) return;

    try {
      await createComment.mutateAsync({ itemId, comment: text });
      setNewComment("");
      toast.success("Comment added.");
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to add comment.";
      toast.error(message);
    }
  }, [newComment, itemId, createComment]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        handleSubmit();
      }
    },
    [handleSubmit]
  );

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <MessageSquare className="h-4 w-4" />
          Comments
          {comments && comments.length > 0 && (
            <span className="text-sm font-normal text-muted-foreground">
              ({comments.length})
            </span>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* New comment form */}
        <div className="space-y-2">
          <Textarea
            placeholder="Add a comment... (Ctrl+Enter to submit)"
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            onKeyDown={handleKeyDown}
            rows={3}
            className="resize-none text-sm"
          />
          <div className="flex justify-end">
            <Button
              type="button"
              size="sm"
              onClick={handleSubmit}
              disabled={!newComment.trim() || createComment.isPending}
            >
              {createComment.isPending ? (
                <Loader2 className="mr-2 h-3 w-3 animate-spin" />
              ) : (
                <Send className="mr-2 h-3 w-3" />
              )}
              Comment
            </Button>
          </div>
        </div>

        <Separator />

        {/* Comment list */}
        {isLoading ? (
          <div className="flex items-center justify-center py-6">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        ) : !comments || comments.length === 0 ? (
          <div className="flex items-center justify-center py-6">
            <p className="text-sm text-muted-foreground">
              No comments yet. Be the first to comment.
            </p>
          </div>
        ) : (
          <ScrollArea className="max-h-[300px]">
            <div className="space-y-3">
              {comments.map((comment) => (
                <div
                  key={comment.id}
                  className="rounded-lg border p-3 space-y-1"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">
                      {comment.username}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {formatTimestamp(comment.createdAt)}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                    {comment.comment}
                  </p>
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
}
