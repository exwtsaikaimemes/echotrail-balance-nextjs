export const EQUIPMENT_TYPES = [
  { group: "Swords", items: ["Sword.WOODEN","Sword.GOLDEN","Sword.STONE","Sword.IRON","Sword.DIAMOND","Sword.NETHERITE"] },
  { group: "Axes", items: ["Axe.WOODEN","Axe.GOLDEN","Axe.STONE","Axe.IRON","Axe.DIAMOND","Axe.NETHERITE"] },
  { group: "Maces", items: ["Mace.WOODEN","Mace.GOLDEN","Mace.STONE","Mace.IRON","Mace.DIAMOND","Mace.NETHERITE"] },
  { group: "Ranged", items: ["Bow.BOW","Crossbow.CROSSBOW","Trident.TRIDENT"] },
  { group: "Helmets", items: ["Helmet.LEATHER","Helmet.GOLDEN","Helmet.CHAINMAIL","Helmet.IRON","Helmet.DIAMOND","Helmet.NETHERITE"] },
  { group: "Chestplates", items: ["Chestplate.LEATHER","Chestplate.GOLDEN","Chestplate.CHAINMAIL","Chestplate.IRON","Chestplate.DIAMOND","Chestplate.NETHERITE"] },
  { group: "Leggings", items: ["Leggings.LEATHER","Leggings.GOLDEN","Leggings.CHAINMAIL","Leggings.IRON","Leggings.DIAMOND","Leggings.NETHERITE"] },
  { group: "Boots", items: ["Boots.LEATHER","Boots.GOLDEN","Boots.CHAINMAIL","Boots.IRON","Boots.DIAMOND","Boots.NETHERITE"] },
  { group: "Other", items: ["Shield.SHIELD","Elytra.ELYTRA","Tool.CRYSTAL","Trinket.TOTEM_OF_UNDYING","Trinket.FEATHER"] },
] as const;

export const EQUIP_CLASSES = [
  "Sword","Axe","Mace","Bow","Crossbow","Trident",
  "Helmet","Chestplate","Leggings","Boots",
  "Shield","Tool","Trinket","Elytra",
] as const;

export type EquipClass = typeof EQUIP_CLASSES[number];

export function getEquipClass(equipment: string): EquipClass {
  const prefix = equipment.split(".")[0];
  return (EQUIP_CLASSES.includes(prefix as EquipClass) ? prefix : "Sword") as EquipClass;
}

export const EQUIPMENT_IMPORTS: Record<string, string> = {
  Sword:      "com.echotrail.core.component.item.equipment.tool.Sword",
  Axe:        "com.echotrail.core.component.item.equipment.tool.Axe",
  Mace:       "com.echotrail.core.component.item.equipment.tool.Mace",
  Bow:        "com.echotrail.core.component.item.equipment.tool.Bow",
  Crossbow:   "com.echotrail.core.component.item.equipment.tool.Crossbow",
  Trident:    "com.echotrail.core.component.item.equipment.tool.Trident",
  Shield:     "com.echotrail.core.component.item.equipment.tool.Shield",
  Tool:       "com.echotrail.core.component.item.equipment.tool.Tool",
  Helmet:     "com.echotrail.core.component.item.equipment.armor.Helmet",
  Chestplate: "com.echotrail.core.component.item.equipment.armor.Chestplate",
  Leggings:   "com.echotrail.core.component.item.equipment.armor.Leggings",
  Boots:      "com.echotrail.core.component.item.equipment.armor.Boots",
  Trinket:    "com.echotrail.core.component.item.equipment.tool.Trinket",
  Elytra:     "com.echotrail.core.component.item.equipment.armor.Elytra",
};

export const EQUIP_SLOT_LORE: Record<string, string> = {
  Sword: "When in Main Hand:", Axe: "When in Main Hand:", Mace: "When in Main Hand:",
  Bow: "When in Main Hand:", Crossbow: "When in Main Hand:", Trident: "When in Main Hand:",
  Shield: "When in Off Hand:",
  Helmet: "When on Head:", Chestplate: "When on Body:",
  Leggings: "When on Legs:", Boots: "When on Feet:",
  Tool: "When equipped:", Trinket: "When equipped:", Elytra: "When on Body:",
};

// Equipment slot for CSV export
export const EQUIP_SLOT_MAP: Record<string, string> = {
  Sword: "HAND", Axe: "HAND", Mace: "HAND",
  Bow: "HAND", Crossbow: "HAND", Trident: "HAND",
  Shield: "OFF_HAND",
  Helmet: "HEAD", Chestplate: "CHEST",
  Leggings: "LEGS", Boots: "FEET",
  Tool: "HAND", Trinket: "OFF_HAND", Elytra: "CHEST",
};
