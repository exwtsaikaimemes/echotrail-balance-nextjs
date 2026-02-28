import type { Item } from "@/types/item";
import type { LoadoutSlot, LoadoutStat, EquippedLoadout } from "@/types/loadout";
import { SLOT_ELIGIBLE_CLASSES } from "@/constants/loadout";

/**
 * Get all eligible loadout slots for an item based on its equipment class and special properties
 */
export function getEligibleSlots(item: Item): LoadoutSlot[] {
  const slots: LoadoutSlot[] = [];

  // Extract the equipment class from equipment string (e.g., "Sword.NETHERITE" -> "Sword")
  const equipClass = item.equipment.split(".")[0] as string;

  // Add slots based on equipment class mapping
  for (const [slot, classes] of Object.entries(SLOT_ELIGIBLE_CLASSES)) {
    if (classes.includes(equipClass as any)) {
      slots.push(slot as LoadoutSlot);
    }
  }

  // Handle special properties
  if (item.isOffHand && !slots.includes("off_hand")) {
    slots.push("off_hand");
  }

  if (item.isBothHands) {
    if (!slots.includes("main_hand")) {
      slots.push("main_hand");
    }
    if (!slots.includes("off_hand")) {
      slots.push("off_hand");
    }
  }

  return slots;
}

/**
 * Compute aggregated loadout stats from equipped items
 */
export function computeLoadoutStats(
  equippedItems: Item[]
): LoadoutStat[] {
  const statMap = new Map<string, { totalMin: number; totalMax: number; count: number }>();

  for (const item of equippedItems) {
    for (const attr of item.attributes) {
      const key = attr.name;
      const bounds = attr.bounds[0];

      if (!bounds) continue;

      const minVal = parseFloat(bounds.min) || 0;
      const maxVal = parseFloat(bounds.max) || 0;

      if (!statMap.has(key)) {
        statMap.set(key, { totalMin: 0, totalMax: 0, count: 0 });
      }

      const stat = statMap.get(key)!;
      stat.totalMin += minVal;
      stat.totalMax += maxVal;
      stat.count += 1;
    }
  }

  return Array.from(statMap.entries()).map(([name, { totalMin, totalMax, count }]) => ({
    name,
    totalMin,
    totalMax,
    count,
  }));
}

/**
 * Check if an item can be equipped to a given slot
 */
export function canEquipToSlot(item: Item, slot: LoadoutSlot): boolean {
  return getEligibleSlots(item).includes(slot);
}

/**
 * Get the current and max health values for a loadout based on an attribute name
 */
export function getLoadoutStatRange(stats: LoadoutStat[], name: string) {
  const stat = stats.find((s) => s.name === name);
  if (!stat) return { min: 0, max: 0 };
  return { min: stat.totalMin, max: stat.totalMax };
}
