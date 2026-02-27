import type { Item } from "./item";

export type UpdateSubtype = "buffed" | "nerfed" | "adjusted";
export type PatchStatus = "buffed" | "nerfed" | "adjusted" | "new" | null;

export interface HistoryEntry {
  id: number;
  itemId: string;
  itemKey: string;
  itemName: string;
  changeType: "created" | "updated" | "deleted";
  changedBy: string;
  budgetBefore: number | null;
  budgetAfter: number | null;
  snapshotBefore: Item | null;
  snapshotAfter: Item | null;
  patchVersion: string | null;
  isHidden: boolean;
  createdAt: string;
}

// ── Diff types ──

export interface BoundDiff {
  type: string;
  minBefore: string | null;
  minAfter: string | null;
  maxBefore: string | null;
  maxAfter: string | null;
}

export interface AttributeDiff {
  kind: "added" | "removed" | "changed";
  name: string;
  category: "Custom" | "Vanilla";
  boundDiffs?: BoundDiff[];
}

export interface PropertyChange {
  property: string;
  before: string;
  after: string;
}

export interface ItemDiff {
  attributeDiffs: AttributeDiff[];
  propertyChanges: PropertyChange[];
}

// ── Patch version types ──

export interface PatchVersion {
  id: number;
  version: string;
  description: string | null;
  isCurrent: boolean;
  createdBy: string;
  createdAt: string;
}

export interface PatchGroup {
  version: string;
  description: string | null;
  entries: HistoryEntry[];
}

// ── Public patch notes types ──

export interface PublicPatchEntry {
  itemName: string;
  changeType: "created" | "buffed" | "nerfed" | "adjusted" | "deleted";
  diff: ItemDiff | null;
}

export interface PublicPatchGroup {
  version: string;
  description: string | null;
  entries: PublicPatchEntry[];
}
