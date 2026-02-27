import type { Item, ItemAttribute } from "@/types/item";
import type { ItemDiff, AttributeDiff, BoundDiff, PropertyChange, UpdateSubtype } from "@/types/history";

/**
 * Classify an update based on budget delta.
 */
export function classifyUpdate(budgetBefore: number | null, budgetAfter: number | null): UpdateSubtype {
  if (budgetBefore === null || budgetAfter === null) return "adjusted";
  if (budgetAfter > budgetBefore) return "buffed";
  if (budgetAfter < budgetBefore) return "nerfed";
  return "adjusted";
}

/**
 * Compute a structured diff between two Item snapshots.
 * Returns attribute-level additions/removals/changes and top-level property changes.
 */
export function computeItemDiff(before: Item | null, after: Item | null): ItemDiff {
  const attributeDiffs: AttributeDiff[] = [];
  const propertyChanges: PropertyChange[] = [];

  const beforeAttrs = before?.attributes ?? [];
  const afterAttrs = after?.attributes ?? [];

  const beforeMap = new Map<string, ItemAttribute>();
  for (const attr of beforeAttrs) beforeMap.set(attr.name, attr);

  const afterMap = new Map<string, ItemAttribute>();
  for (const attr of afterAttrs) afterMap.set(attr.name, attr);

  // Detect removed attributes
  for (const [name, attr] of beforeMap) {
    if (!afterMap.has(name)) {
      attributeDiffs.push({ kind: "removed", name, category: attr.category });
    }
  }

  // Detect added and changed attributes
  for (const [name, afterAttr] of afterMap) {
    const beforeAttr = beforeMap.get(name);
    if (!beforeAttr) {
      attributeDiffs.push({ kind: "added", name, category: afterAttr.category });
      continue;
    }

    // Compare bounds
    const maxLen = Math.max(beforeAttr.bounds.length, afterAttr.bounds.length);
    const boundDiffs: BoundDiff[] = [];

    for (let i = 0; i < maxLen; i++) {
      const bBound = beforeAttr.bounds[i];
      const aBound = afterAttr.bounds[i];

      if (!bBound && aBound) {
        boundDiffs.push({
          type: aBound.type,
          minBefore: null, minAfter: aBound.min,
          maxBefore: null, maxAfter: aBound.max,
        });
      } else if (bBound && !aBound) {
        boundDiffs.push({
          type: bBound.type,
          minBefore: bBound.min, minAfter: null,
          maxBefore: bBound.max, maxAfter: null,
        });
      } else if (bBound && aBound && (bBound.min !== aBound.min || bBound.max !== aBound.max)) {
        boundDiffs.push({
          type: aBound.type,
          minBefore: bBound.min, minAfter: aBound.min,
          maxBefore: bBound.max, maxAfter: aBound.max,
        });
      }
    }

    if (boundDiffs.length > 0) {
      attributeDiffs.push({ kind: "changed", name, category: afterAttr.category, boundDiffs });
    }
  }

  // Detect top-level property changes
  if (before && after) {
    const props: Array<{ key: keyof Item; label: string }> = [
      { key: "rarity", label: "Rarity" },
      { key: "equipment", label: "Equipment" },
      { key: "customName", label: "Custom Name" },
      { key: "objectName", label: "Object Name" },
      { key: "usesBaseStats", label: "Uses Base Stats" },
      { key: "secretItem", label: "Secret Item" },
      { key: "canDrop", label: "Can Drop" },
      { key: "isOffHand", label: "Off Hand" },
      { key: "isBothHands", label: "Both Hands" },
      { key: "isTest", label: "Test Item" },
      { key: "customModelData", label: "Custom Model Data" },
      { key: "equippableAssetId", label: "Equippable Asset ID" },
    ];

    for (const { key, label } of props) {
      const bVal = String(before[key] ?? "");
      const aVal = String(after[key] ?? "");
      if (bVal !== aVal) {
        propertyChanges.push({ property: label, before: bVal, after: aVal });
      }
    }
  }

  return { attributeDiffs, propertyChanges };
}
