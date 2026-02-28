"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { SLOT_LABELS, SLOT_ICONS } from "@/constants/loadout";
import { RARITY_COLORS } from "@/constants/rarities";
import type { LoadoutSlot } from "@/types/loadout";
import type { Item } from "@/types/item";
import SlotPickerModal from "./SlotPickerModal";
import { X } from "lucide-react";

interface LoadoutSlotCardProps {
  slot: LoadoutSlot;
  itemKey: string | null;
  allItems: Item[];
  onUnequip?: (slot: LoadoutSlot) => void;
}

export default function LoadoutSlotCard({
  slot,
  itemKey,
  allItems,
  onUnequip,
}: LoadoutSlotCardProps) {
  const [showModal, setShowModal] = useState(false);
  const item = itemKey ? allItems.find((i) => i.itemKey === itemKey) : null;

  const handleSelect = (selectedSlot: LoadoutSlot) => {
    // The selection was already made, close modal
    setShowModal(false);
  };

  return (
    <>
      <Card
        className="p-4 cursor-pointer hover:shadow-md transition-shadow"
        onClick={() => setShowModal(true)}
      >
        <div className="flex items-start gap-3">
          <div className="text-3xl">{SLOT_ICONS[slot]}</div>
          <div className="flex-1">
            <div className="text-sm font-semibold text-slate-600 dark:text-slate-400">
              {SLOT_LABELS[slot]}
            </div>
            {item ? (
              <div className="mt-2">
                <div
                  className="font-medium text-sm"
                  style={{ color: RARITY_COLORS[item.rarity] ?? "#888" }}
                >
                  {item.customName}
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  {item.equipment}
                </div>
              </div>
            ) : (
              <div className="text-sm text-slate-400 dark:text-slate-500 mt-2">
                Empty
              </div>
            )}
          </div>
          {item && (
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onUnequip?.(slot);
              }}
              title="Unequip"
            >
              <X className="w-4 h-4" />
            </Button>
          )}
        </div>
      </Card>

      <SlotPickerModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        eligibleSlots={[slot]}
        onSelect={handleSelect}
      />
    </>
  );
}
