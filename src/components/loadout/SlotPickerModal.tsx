"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { SLOT_LABELS, SLOT_ICONS } from "@/constants/loadout";
import type { LoadoutSlot } from "@/types/loadout";
import { useCurrentLoadout } from "@/hooks/use-loadout";

interface SlotPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  eligibleSlots: LoadoutSlot[];
  onSelect: (slot: LoadoutSlot) => void;
  currentItemKey?: string;
}

export default function SlotPickerModal({
  isOpen,
  onClose,
  eligibleSlots,
  onSelect,
  currentItemKey,
}: SlotPickerModalProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const { data: currentLoadout } = useCurrentLoadout();

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Select Slot</DialogTitle>
          <DialogDescription>
            Choose which equipment slot to use for this item
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          {eligibleSlots.map((slot) => {
            const isEquipped = currentLoadout && currentLoadout[slot];
            return (
              <button
                key={slot}
                onClick={() => onSelect(slot)}
                className={`w-full flex items-center gap-3 p-3 rounded-lg border-2 transition-colors ${
                  isEquipped
                    ? "border-amber-400 bg-amber-50 dark:bg-amber-950"
                    : "border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600"
                }`}
              >
                <span className="text-2xl">{SLOT_ICONS[slot]}</span>
                <div className="flex-1 text-left">
                  <div className="font-medium">{SLOT_LABELS[slot]}</div>
                  {isEquipped && (
                    <div className="text-sm text-amber-600 dark:text-amber-400">
                      Currently equipped
                    </div>
                  )}
                </div>
              </button>
            );
          })}
        </div>

        <div className="flex gap-2 justify-end pt-2">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
