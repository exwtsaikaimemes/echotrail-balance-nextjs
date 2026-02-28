"use client";

import { useCurrentLoadout, useUpdateLoadoutSlot } from "@/hooks/use-loadout";
import { useItems } from "@/hooks/use-items";
import LoadoutSlotCard from "@/components/loadout/LoadoutSlotCard";
import LoadoutStatSummary from "@/components/loadout/LoadoutStatSummary";
import SavedLoadoutList from "@/components/loadout/SavedLoadoutList";
import type { LoadoutSlot } from "@/types/loadout";
import { toast } from "sonner";

export default function LoadoutPage() {
  const { data: currentLoadout, isLoading: isLoadingLoadout } = useCurrentLoadout();
  const { data: allItems, isLoading: isLoadingItems } = useItems();
  const updateSlot = useUpdateLoadoutSlot();

  const handleUnequip = (slot: LoadoutSlot) => {
    updateSlot.mutate(
      { slot, itemKey: null },
      {
        onSuccess: () => {
          toast.success(`Unequipped from ${slot.replace("_", " ")}`);
        },
        onError: (err: any) => {
          toast.error(err.message || "Failed to unequip item");
        },
      }
    );
  };

  const isLoading = isLoadingLoadout || isLoadingItems;

  if (isLoading) {
    return <div className="p-8">Loading loadout...</div>;
  }

  if (!currentLoadout || !allItems) {
    return <div className="p-8">Error loading loadout data</div>;
  }

  const SLOTS: LoadoutSlot[] = ["main_hand", "off_hand", "helmet", "chestplate", "leggings", "boots"];

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Loadout Manager</h1>

      <div className="grid lg:grid-cols-[3fr_2fr] gap-6">
        {/* Left: Loadout Slots */}
        <div className="space-y-6">
          <div className="space-y-3">
            <h2 className="text-lg font-semibold">Equipment Slots</h2>
            <div className="grid sm:grid-cols-2 gap-3">
              {SLOTS.map((slot) => (
                <LoadoutSlotCard
                  key={slot}
                  slot={slot}
                  itemKey={currentLoadout[slot]}
                  allItems={allItems}
                  onUnequip={handleUnequip}
                />
              ))}
            </div>
          </div>

          <LoadoutStatSummary />
        </div>

        {/* Right: Saved Loadouts */}
        <div>
          <h2 className="text-lg font-semibold mb-4">Saved Loadouts</h2>
          <SavedLoadoutList />
        </div>
      </div>
    </div>
  );
}
