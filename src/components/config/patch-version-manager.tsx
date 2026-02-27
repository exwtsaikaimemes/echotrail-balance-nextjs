"use client";

import { useState } from "react";
import {
  usePatchVersions,
  useCreatePatchVersion,
  useUpdatePatchVersion,
  useDeletePatchVersion,
} from "@/hooks/use-patch-versions";
import { PatchVersionBadge } from "@/components/patch-notes/patch-version-badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Star, Trash2, Pencil, Plus, Check, X } from "lucide-react";
import type { PatchVersion } from "@/types/history";

interface PatchVersionManagerProps {
  isAdmin: boolean;
}

export function PatchVersionManager({ isAdmin }: PatchVersionManagerProps) {
  const { data: versions, isLoading } = usePatchVersions();
  const createMutation = useCreatePatchVersion();
  const updateMutation = useUpdatePatchVersion();
  const deleteMutation = useDeletePatchVersion();

  const [newVersion, setNewVersion] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editDescription, setEditDescription] = useState("");

  const currentVersion = versions?.find((v) => v.isCurrent);

  function handleCreate() {
    if (!newVersion.trim()) return;
    createMutation.mutate(
      { version: newVersion.trim(), description: newDescription.trim() || undefined },
      { onSuccess: () => { setNewVersion(""); setNewDescription(""); } }
    );
  }

  function handleSetCurrent(id: number) {
    updateMutation.mutate({ id, isCurrent: true });
  }

  function handleSaveDescription(id: number) {
    updateMutation.mutate(
      { id, description: editDescription },
      { onSuccess: () => setEditingId(null) }
    );
  }

  function handleDelete(id: number) {
    deleteMutation.mutate(id);
  }

  function startEditing(v: PatchVersion) {
    setEditingId(v.id);
    setEditDescription(v.description ?? "");
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-16 w-full" />
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Current version highlight */}
      {currentVersion && (
        <div className="rounded-lg border border-primary/25 bg-primary/5 p-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
            <Star className="h-4 w-4 text-primary" />
            Current Active Version
          </div>
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold tracking-tight">{currentVersion.version}</span>
            <PatchVersionBadge version={currentVersion.version} isCurrent />
          </div>
          {currentVersion.description && (
            <p className="text-sm text-muted-foreground mt-1">{currentVersion.description}</p>
          )}
        </div>
      )}

      {/* Create new version */}
      {isAdmin && (
        <div className="rounded-lg border border-border p-4 space-y-3">
          <h3 className="text-sm font-medium">Create New Version</h3>
          <div className="flex items-end gap-3">
            <div className="space-y-1 flex-1 max-w-[200px]">
              <label className="text-xs text-muted-foreground">Version</label>
              <Input
                placeholder="e.g. 3.1.0"
                value={newVersion}
                onChange={(e) => setNewVersion(e.target.value)}
                className="font-mono"
              />
            </div>
            <div className="space-y-1 flex-1">
              <label className="text-xs text-muted-foreground">Description (optional)</label>
              <Input
                placeholder="What's in this patch?"
                value={newDescription}
                onChange={(e) => setNewDescription(e.target.value)}
              />
            </div>
            <Button
              onClick={handleCreate}
              disabled={!newVersion.trim() || createMutation.isPending}
              size="sm"
            >
              <Plus className="h-4 w-4 mr-1" />
              Create
            </Button>
          </div>
        </div>
      )}

      {/* Version list */}
      <div className="space-y-2">
        <h3 className="text-sm font-medium text-muted-foreground">All Versions</h3>
        {versions?.map((v) => (
          <div
            key={v.id}
            className="rounded-lg border border-border p-3 flex items-center justify-between gap-3"
          >
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <PatchVersionBadge version={v.version} isCurrent={v.isCurrent} />
                {v.isCurrent && (
                  <span className="text-xs text-primary font-medium">Active</span>
                )}
                <span className="text-xs text-muted-foreground">
                  by {v.createdBy}
                </span>
              </div>

              {editingId === v.id ? (
                <div className="flex items-center gap-2 mt-1">
                  <Input
                    value={editDescription}
                    onChange={(e) => setEditDescription(e.target.value)}
                    placeholder="Description..."
                    className="h-8 text-sm"
                  />
                  <Button size="sm" variant="ghost" onClick={() => handleSaveDescription(v.id)}>
                    <Check className="h-3.5 w-3.5" />
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => setEditingId(null)}>
                    <X className="h-3.5 w-3.5" />
                  </Button>
                </div>
              ) : (
                v.description && (
                  <p className="text-xs text-muted-foreground mt-0.5 truncate">{v.description}</p>
                )
              )}
            </div>

            {isAdmin && (
              <div className="flex items-center gap-1 shrink-0">
                {!v.isCurrent && (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleSetCurrent(v.id)}
                    title="Set as current"
                  >
                    <Star className="h-3.5 w-3.5" />
                  </Button>
                )}
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => startEditing(v)}
                  title="Edit description"
                >
                  <Pencil className="h-3.5 w-3.5" />
                </Button>
                {!v.isCurrent && (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleDelete(v.id)}
                    disabled={deleteMutation.isPending}
                    title="Delete version"
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
