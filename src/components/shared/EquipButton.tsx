"use client";

import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { useUpdateLoadoutSlot } from "@/hooks/use-loadout";
import { getEligibleSlots } from "@/lib/loadout-utils";
import type { Item } from "@/types/item";
import type { LoadoutSlot } from "@/types/loadout";
import { Zap } from "lucide-react";
import { toast } from "sonner";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { SLOT_LABELS, SLOT_ICONS } from "@/constants/loadout";

interface EquipButtonProps {
  item: Item;
  variant?: "default" | "outline" | "ghost" | "secondary";
  size?: "default" | "sm" | "lg";
  showIcon?: boolean;
  iconOnly?: boolean;
}

export default function EquipButton({
  item,
  variant = "outline",
  size = "sm",
  showIcon = true,
  iconOnly = false,
}: EquipButtonProps) {
  const [showModal, setShowModal] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const updateLoadout = useUpdateLoadoutSlot();

  const eligibleSlots = useMemo(() => getEligibleSlots(item), [item]);

  if (eligibleSlots.length === 0) {
    return (
      <Button
        variant={variant}
        size={size}
        disabled
        title="No loadout slot available for this item"
        className={iconOnly ? "w-10 h-10 p-0" : undefined}
      >
        {showIcon && <Zap className="w-4 h-4" />}
        {!iconOnly && "Equip"}
      </Button>
    );
  }

  const handleEquip = (slotToEquip: string) => {
    updateLoadout.mutate(
      { slot: slotToEquip as LoadoutSlot, itemKey: item.itemKey },
      {
        onSuccess: () => {
          toast.success(`Equipped to ${slotToEquip.replace("_", " ")}`);
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
        className={iconOnly ? "w-10 h-10 p-0" : undefined}
      >
        {showIcon && <Zap className="w-4 h-4" />}
        {!iconOnly && "Equip"}
      </Button>

      {eligibleSlots.length > 1 && (
        <Popover open={showModal} onOpenChange={setShowModal}>
          <PopoverTrigger asChild>
            <div className="hidden" />
          </PopoverTrigger>
          <PopoverContent className="w-[260px] p-0" align="start">
            <Command>
              <CommandInput placeholder="Search slots..." />
              <CommandList>
                <CommandEmpty>No slots found.</CommandEmpty>
                {(eligibleSlots as LoadoutSlot[]).map((slot) => (
                  <CommandItem
                    key={slot}
                    value={slot}
                    onSelect={() => {
                      handleEquip(slot);
                    }}
                  >
                    <div className="flex items-center gap-2 w-full">
                      <span className="text-xl">{SLOT_ICONS[slot]}</span>
                      <span className="font-medium text-sm">
                        {SLOT_LABELS[slot]}
                      </span>
                    </div>
                  </CommandItem>
                ))}
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
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
