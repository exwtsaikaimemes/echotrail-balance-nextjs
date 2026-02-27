"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useClearItems } from "@/hooks/use-items";
import { toast } from "sonner";
import { AlertTriangle } from "lucide-react";

interface ClearItemsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ClearItemsDialog({
  open,
  onOpenChange,
}: ClearItemsDialogProps) {
  const { data: session } = useSession();
  const [confirmation, setConfirmation] = useState("");
  const clearItems = useClearItems();

  const isAdmin = session?.user?.role === "admin";
  const isConfirmed = confirmation === "DELETE";

  async function handleClear() {
    if (!isConfirmed || !isAdmin) return;

    try {
      await clearItems.mutateAsync();
      toast.success("All items have been cleared.");
      handleClose();
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to clear items."
      );
    }
  }

  function handleClose() {
    setConfirmation("");
    onOpenChange(false);
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="h-5 w-5" />
            Clear All Items
          </DialogTitle>
          <DialogDescription>
            This action is irreversible. All items in the database will be
            permanently deleted. This cannot be undone.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="rounded-md bg-destructive/10 border border-red-900/50 p-4">
            <p className="text-sm text-red-400">
              You are about to delete every item in the workspace. All item
              data, attributes, enchantments, and associated comments will be
              permanently removed.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirm-delete" className="text-sm">
              Type <span className="font-mono font-bold">DELETE</span> to
              confirm
            </Label>
            <Input
              id="confirm-delete"
              value={confirmation}
              onChange={(e) => setConfirmation(e.target.value)}
              placeholder="Type DELETE to confirm"
              className="font-mono"
              autoComplete="off"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleClear}
            disabled={!isConfirmed || clearItems.isPending}
          >
            {clearItems.isPending ? "Clearing..." : "Clear All Items"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
