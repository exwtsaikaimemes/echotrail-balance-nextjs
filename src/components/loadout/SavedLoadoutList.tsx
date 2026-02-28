"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  useSavedLoadouts,
  useCreateSavedLoadout,
  useDeleteSavedLoadout,
  useRenameSavedLoadout,
  useEquipSavedLoadout,
  useCurrentLoadout,
} from "@/hooks/use-loadout";
import { Card } from "@/components/ui/card";
import { Trash2, Check, X, Download } from "lucide-react";
import { toast } from "sonner";

export default function SavedLoadoutList() {
  const [searchQuery, setSearchQuery] = useState("");
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [newName, setNewName] = useState("");

  const { data: savedLoadouts, isLoading } = useSavedLoadouts();
  const { data: currentLoadout } = useCurrentLoadout();
  const createSavedLoadout = useCreateSavedLoadout();
  const deleteSavedLoadout = useDeleteSavedLoadout();
  const renameSavedLoadout = useRenameSavedLoadout();
  const equipSavedLoadout = useEquipSavedLoadout();

  const filteredLoadouts =
    savedLoadouts?.filter((loadout) =>
      loadout.name.toLowerCase().includes(searchQuery.toLowerCase())
    ) || [];

  const handleSaveCurrent = () => {
    if (!currentLoadout) return;

    const defaultName = new Date().toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

    createSavedLoadout.mutate(
      { name: defaultName, slots: currentLoadout },
      {
        onSuccess: (loadout) => {
          toast.success(`Saved loadout: ${loadout.name}`);
        },
        onError: (err: any) => {
          toast.error(err.message || "Failed to save loadout");
        },
      }
    );
  };

  const handleDelete = (id: string) => {
    if (confirm("Delete this loadout?")) {
      deleteSavedLoadout.mutate(id, {
        onSuccess: () => {
          toast.success("Loadout deleted");
        },
        onError: (err: any) => {
          toast.error(err.message || "Failed to delete loadout");
        },
      });
    }
  };

  const handleRename = (id: string, currentName: string) => {
    setRenamingId(id);
    setNewName(currentName);
  };

  const handleSaveRename = (id: string) => {
    if (!newName.trim()) {
      toast.error("Name cannot be empty");
      return;
    }

    renameSavedLoadout.mutate(
      { id, name: newName },
      {
        onSuccess: () => {
          toast.success("Loadout renamed");
          setRenamingId(null);
        },
        onError: (err: any) => {
          toast.error(err.message || "Failed to rename loadout");
        },
      }
    );
  };

  const handleEquip = (id: string) => {
    equipSavedLoadout.mutate(id, {
      onSuccess: () => {
        toast.success("Loadout equipped");
      },
      onError: (err: any) => {
        toast.error(err.message || "Failed to equip loadout");
      },
    });
  };

  return (
    <div className="space-y-4">
      <Button onClick={handleSaveCurrent} className="w-full" disabled={!currentLoadout}>
        Save Current Loadout
      </Button>

      <Input
        placeholder="Search saved loadouts..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="h-9"
      />

      <div className="space-y-2 max-h-[600px] overflow-y-auto">
        {isLoading ? (
          <div className="text-sm text-slate-500 p-4 text-center">
            Loading loadouts...
          </div>
        ) : filteredLoadouts.length === 0 ? (
          <div className="text-sm text-slate-500 p-4 text-center">
            No saved loadouts yet
          </div>
        ) : (
          filteredLoadouts.map((loadout) => (
            <Card key={loadout.id} className="p-3">
              {renamingId === loadout.id ? (
                <div className="space-y-2">
                  <Input
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    className="h-8"
                    autoFocus
                  />
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleSaveRename(loadout.id)}
                      className="flex-1"
                      disabled={renameSavedLoadout.isPending}
                    >
                      <Check className="w-4 h-4" />
                      Save
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setRenamingId(null)}
                      disabled={renameSavedLoadout.isPending}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <div className="font-medium">{loadout.name}</div>
                      <div className="text-xs text-slate-500">
                        {new Date(loadout.updatedAt).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleEquip(loadout.id)}
                      className="flex-1"
                      disabled={equipSavedLoadout.isPending}
                    >
                      <Download className="w-4 h-4" />
                      Equip
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleRename(loadout.id, loadout.name)}
                    >
                      Edit
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDelete(loadout.id)}
                      disabled={deleteSavedLoadout.isPending}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </>
              )}
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
