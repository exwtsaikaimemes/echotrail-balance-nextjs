"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useUpdateLoadoutSlot } from "@/hooks/use-loadout";
import { getEligibleSlots } from "@/lib/loadout-utils";
import type { Item } from "@/types/item";
import { Zap } from "lucide-react";
import { toast } from "sonner";
import SlotPickerModal from "@/components/loadout/SlotPickerModal";

interface EquipButtonProps {
  item: Item;
  variant?: "default" | "outline" | "ghost" | "secondary";
  size?: "default" | "sm" | "lg";
  showIcon?: boolean;
}

export default function EquipButton({
  item,
  variant = "outline",
  size = "sm",
  showIcon = true,
}: EquipButtonProps) {
  const [showModal, setShowModal] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const updateLoadout = useUpdateLoadoutSlot();

  const eligibleSlots = getEligibleSlots(item);

  if (eligibleSlots.length === 0) {
    return (
      <Button
        variant={variant}
        size={size}
        disabled
        title="No loadout slot available for this item"
      >
        {showIcon && <Zap className="w-4 h-4" />}
        Equip
      </Button>
    );
  }

  const handleEquip = (slotToEquip?: string) => {
    const slot = slotToEquip || eligibleSlots[0];
    updateLoadout.mutate(
      { slot: slot as any, itemKey: item.itemKey },
      {
        onSuccess: () => {
          toast.success(`Equipped to ${slot.replace("_", " ")}`);
          setShowModal(false);
          setShowConfirm(false);
        },
        onError: (err: any) => {
          toast.error(err.message || "Failed to equip item");
        },
      }
    );
  };

  const handleButtonClick = () => {
    if (eligibleSlots.length === 1) {
      setShowConfirm(true);
    } else {
      setShowModal(true);
    }
  };

  return (
    <>
      <Button
        variant={variant}
        size={size}
        onClick={handleButtonClick}
        disabled={updateLoadout.isPending}
      >
        {showIcon && <Zap className="w-4 h-4" />}
        Equip
      </Button>

      {eligibleSlots.length > 1 && (
        <SlotPickerModal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          eligibleSlots={eligibleSlots}
          onSelect={handleEquip}
        />
      )}

      {eligibleSlots.length === 1 && showConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-slate-900 rounded-lg p-4 shadow-lg">
            <p className="mb-4">
              Equip <span className="font-semibold">{item.customName}</span> to{" "}
              <span className="font-semibold">{eligibleSlots[0].replace("_", " ")}</span>?
            </p>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setShowConfirm(false)}>
                Cancel
              </Button>
              <Button
                onClick={() => handleEquip(eligibleSlots[0])}
                disabled={updateLoadout.isPending}
              >
                Confirm
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
