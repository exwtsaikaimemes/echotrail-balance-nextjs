export interface ItemBound {
  type: "Double" | "Int" | "String";
  min: string;
  max: string;
}

export interface ItemAttribute {
  category: "Custom" | "Vanilla";
  name: string;
  bounds: ItemBound[];
  bypassBP?: boolean;
}

export interface ItemEnchantment {
  name: string;
  level: number;
}

export interface Item {
  id: string;
  itemKey: string;
  objectName: string;
  customName: string;
  equipment: string;
  rarity: string;
  usesBaseStats: boolean;
  secretItem: boolean;
  canDrop: boolean;
  isOffHand: boolean;
  isBothHands: boolean;
  isTest: boolean;
  customModelData: string;
  equippableAssetId: string;
  enchantments: ItemEnchantment[];
  attributes: ItemAttribute[];
  source: string;
  createdBy: string | null;
  modifiedBy: string | null;
  createdAt: string;
  modifiedAt: string;
}

export function emptyItem(): Omit<Item, "id" | "createdAt" | "modifiedAt" | "createdBy" | "modifiedBy"> {
  return {
    itemKey: "",
    objectName: "",
    customName: "",
    equipment: "Sword.NETHERITE",
    rarity: "COMMON",
    usesBaseStats: true,
    secretItem: false,
    canDrop: true,
    isOffHand: false,
    isBothHands: false,
    isTest: false,
    customModelData: "",
    equippableAssetId: "",
    enchantments: [],
    attributes: [],
    source: "manual",
  };
}
