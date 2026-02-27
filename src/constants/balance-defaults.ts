import type { WeightMap, AllowanceMap, AttributeDefMap } from "@/types/balance";
import { CUSTOM_ATTRIBUTES, VANILLA_ATTRIBUTES } from "./attributes";
import { RARITIES } from "./rarities";
import { EQUIP_CLASSES } from "./equipment";

function toLabel(name: string): string {
  return name.replace(/_/g, " ").toLowerCase().replace(/\b\w/g, c => c.toUpperCase());
}

function pctDouble(cat: "Custom" | "Vanilla", name: string) {
  return { category: cat, bounds: [{ type: "Double" as const, label: toLabel(name), mult: 100, suffix: "%" }], isFlag: false };
}

function absDouble(cat: "Custom" | "Vanilla", name: string, suffix: string) {
  return { category: cat, bounds: [{ type: "Double" as const, label: toLabel(name), mult: 1, suffix: suffix || "" }], isFlag: false };
}

function flag(cat: "Custom" | "Vanilla") {
  return { category: cat, bounds: [{ type: "Double" as const, label: "Flag", mult: 1, suffix: "" }], isFlag: true };
}

export function getDefaultWeights(): WeightMap {
  const offensive: Record<string, number> = {
    "ATTACK_DAMAGE": 3.0, "INCREASED_DAMAGE": 3.0, "INCREASED_PROJECTILE_DAMAGE": 2.8,
    "CRITICAL_DAMAGE": 3.5, "CRITICAL_EXECUTE": 4.0, "BACKSTAB": 3.0,
    "MORE_DAMAGE_AGAINST_FULL_LIFE": 2.5, "EXTRA_DAMAGE_AGAINST_BOSSES": 2.5,
    "INCREASED_MELEE_DAMAGE_PER_MISSING_HEART": 2.5, "DAMAGE_PER_ENEMY_COUNT": 2.0,
    "DAMAGE_PER_ENEMY_HEARTS": 2.0, "EXTRA_DAMAGE_BASED_ON_ENEMY_SPEED": 2.0,
    "ADDITIONAL_ARROWS": 3.0, "INCREASED_ARROW_VELOCITY": 1.5,
    "HEALTHSTEAL": 3.5, "WITHER_EFFECT_ON_HIT": 2.0, "SLOW_ON_HIT": 1.5,
    "MELEE_EXPLOSION_POWER": 2.5, "MELEE_EXPLOSION_CHANCE": 2.0,
    "RANGED_EXPLOSION": 2.5, "CLOUD_OF_HARMING": 2.0, "CLOUD_OF_SLOW": 1.5,
    "CONE_BLAST": 3.0, "WARDEN_SCREAM": 3.5, "EARTH_RAISE": 2.5,
    "PARALYZE_ENEMY": 3.0, "CRYSTAL_DAMAGE": 2.5, "MACE_DAMAGE": 2.5,
    "ARMOR_PENETRATION": 3.0, "EXECUTE_DAMAGE": 3.5, "BLEED_ON_HIT": 3.0,
    "STACKING_DAMAGE": 3.0, "CHAIN_LIGHTNING": 3.5, "SOUL_STACKS": 3.5,
    "MARK_DETONATE": 3.5, "ANTI_HEAL_ON_HIT": 2.5,
  };
  const defensive: Record<string, number> = {
    "ARMOR": 2.0, "ARMOR_TOUGHNESS": 2.0, "MAX_HEALTH": 2.5, "MAX_HEALTH_INCREASE": 2.5,
    "REDUCED_DAMAGE_TAKEN": 3.0, "REDUCED_PROJECTILE_DAMAGE_TAKEN": 2.5,
    "DODGE_CHANCE": 3.5, "HEAL_ON_BLOCK": 2.0, "RANDOMIZED_DAMAGE_TAKEN": 1.5,
    "ABSORPTION_ON_HIGH_DAMAGE_TAKEN": 2.0, "REGEN_ON_DAMAGE_TAKEN": 2.5,
    "HEALTH_RESERVATION": 2.0, "NEGATIVE_EFFECT_IMMUNITY": 3.0,
    "NEGATIVE_EFFECT_IMMUNITY_CHANCE": 2.5, "APOCALYPSE_PROTECTION": 2.0,
    "CRYSTAL_DEFENCE": 2.0, "MACE_DEFENCE": 2.0, "WEAK_ARMOR": 1.0,
    "KNOCKBACK_RESISTANCE": 1.5,
    "THORNS_DAMAGE": 2.5, "LIFELINE_SHIELD": 3.0, "BERSERKER_RAGE": 3.5,
    "DEFERRED_DAMAGE": 3.0, "SHIELD_ON_KILL": 2.5,
  };
  const utility: Record<string, number> = {
    "MOVEMENT_SPEED": 2.0, "ATTACK_SPEED": 2.0, "ATTACK_KNOCKBACK": 1.0, "ATTACK_RANGE": 1.5,
    "LUCK": 1.0, "SIZE_INCREASE": 0.5, "EFFECT_GAIN": 1.5, "TAUNT": 2.0,
    "STEALTH": 2.5, "MOVEMENT_ON_HIT_OR_KILL": 1.5, "SPEED_TRINKET": 2.0,
    "DASH_TRINKET": 2.5, "TWINFIRE_DUAL_WIELD": 2.0,
    "SPELL_RANGE": 1.5, "SPELL_CLOUD_PERSISTANCE": 1.5, "CLOUD_OF_HEALING": 2.0,
    "SUMMON_SUPPORT_WOLF": 2.0, "DISABLE_MELEE": 0.5,
    "BLINK_BACK": 3.0, "GRAVITATIONAL_PULL": 3.0,
  };
  const setBonuses: Record<string, number> = {
    "STEALTH_SET_BONUS": 2.0, "BOW_SET_BONUS": 2.0, "SUPPORT_SET_BONUS": 2.0,
    "TANK_SET_BONUS": 2.0, "FIGHTER_SET_BONUS": 2.0,
  };
  const special: Record<string, number> = {
    "ORKOTOS_SWORD": 3.0, "ORKOTOS_SHIELD": 3.0, "NECRYONS_CALL": 3.0,
    "STAFF_OF_TENEBRIS": 3.0, "SIREN_CRY": 3.0, "KAYLESS_ACE": 3.0,
    "SPEED_TRINKET_DISCLAIMER": 0.0, "TEST_MM_SKILL": 0.0,
  };
  const all = { ...offensive, ...defensive, ...utility, ...setBonuses, ...special };

  const w: WeightMap = {};
  [...CUSTOM_ATTRIBUTES, ...VANILLA_ATTRIBUTES].forEach(name => {
    w[name] = all[name] !== undefined ? all[name] : 1.0;
  });
  return w;
}

export function getDefaultAllowances(): AllowanceMap {
  const data: Record<string, Record<string, number>> = {
    "COMMON":    { Sword:10, Axe:10, Mace:10, Bow:10, Crossbow:10, Trident:10, Helmet:8,  Chestplate:8,  Leggings:8,  Boots:8,  Shield:6,  Tool:5,  Trinket:5,  Elytra:8  },
    "UNCOMMON":  { Sword:18, Axe:18, Mace:18, Bow:18, Crossbow:18, Trident:18, Helmet:15, Chestplate:15, Leggings:15, Boots:15, Shield:12, Tool:10, Trinket:10, Elytra:15 },
    "RARE":      { Sword:30, Axe:30, Mace:30, Bow:30, Crossbow:30, Trident:30, Helmet:25, Chestplate:25, Leggings:25, Boots:25, Shield:20, Tool:18, Trinket:18, Elytra:25 },
    "EPIC":      { Sword:45, Axe:45, Mace:45, Bow:45, Crossbow:45, Trident:45, Helmet:38, Chestplate:38, Leggings:38, Boots:38, Shield:30, Tool:28, Trinket:28, Elytra:38 },
    "LEGENDARY": { Sword:65, Axe:65, Mace:65, Bow:65, Crossbow:65, Trident:65, Helmet:55, Chestplate:55, Leggings:55, Boots:55, Shield:45, Tool:40, Trinket:40, Elytra:55 },
    "CURSED":    { Sword:80, Axe:80, Mace:80, Bow:80, Crossbow:80, Trident:80, Helmet:68, Chestplate:68, Leggings:68, Boots:68, Shield:55, Tool:50, Trinket:50, Elytra:68 },
    "MYTHICAL":  { Sword:100,Axe:100,Mace:100,Bow:100,Crossbow:100,Trident:100,Helmet:85, Chestplate:85, Leggings:85, Boots:85, Shield:70, Tool:65, Trinket:65, Elytra:85 },
  };

  const a: AllowanceMap = {};
  RARITIES.forEach(r => {
    a[r.name] = {};
    EQUIP_CLASSES.forEach(ec => {
      a[r.name][ec] = data[r.name]?.[ec] ?? 10;
    });
  });
  return a;
}

export function getDefaultAttributeDefs(): AttributeDefMap {
  const defs: AttributeDefMap = {};

  // Percentage Custom (×100, "%")
  ([
    "INCREASED_PROJECTILE_DAMAGE","INCREASED_ARROW_VELOCITY","DODGE_CHANCE",
    "TWINFIRE_DUAL_WIELD","BACKSTAB","EFFECT_GAIN","MORE_DAMAGE_AGAINST_FULL_LIFE",
    "HEAL_ON_BLOCK","INCREASED_MELEE_DAMAGE_PER_MISSING_HEART","TAUNT",
    "CRITICAL_DAMAGE","CRITICAL_EXECUTE","HEALTH_RESERVATION",
    "REDUCED_DAMAGE_TAKEN","REDUCED_PROJECTILE_DAMAGE_TAKEN","INCREASED_DAMAGE",
    "MOVEMENT_ON_HIT_OR_KILL","STEALTH_SET_BONUS","BOW_SET_BONUS",
    "SUPPORT_SET_BONUS","TANK_SET_BONUS","HEALTHSTEAL","CLOUD_OF_HARMING",
    "SPELL_CLOUD_PERSISTANCE","CLOUD_OF_HEALING","EXTRA_DAMAGE_AGAINST_BOSSES",
    "PARALYZE_ENEMY","RANGED_EXPLOSION","EXTRA_DAMAGE_BASED_ON_ENEMY_SPEED",
    "DAMAGE_PER_ENEMY_COUNT","DAMAGE_PER_ENEMY_HEARTS","CLOUD_OF_SLOW",
    "WITHER_EFFECT_ON_HIT","MELEE_EXPLOSION_POWER","MELEE_EXPLOSION_CHANCE",
    "NEGATIVE_EFFECT_IMMUNITY_CHANCE","CRYSTAL_DAMAGE","CRYSTAL_DEFENCE",
    "MACE_DAMAGE","MACE_DEFENCE","ARMOR_PENETRATION","THORNS_DAMAGE",
  ] as const).forEach(n => { defs[n] = pctDouble("Custom", n); });

  // Percentage Vanilla
  (["MAX_HEALTH_INCREASE","MOVEMENT_SPEED","SIZE_INCREASE"] as const).forEach(n => { defs[n] = pctDouble("Vanilla", n); });

  // Absolute duration (s)
  (["REGEN_ON_DAMAGE_TAKEN","SLOW_ON_HIT"] as const).forEach(n => { defs[n] = absDouble("Custom", n, "s"); });

  // Absolute value Custom
  (["ABSORPTION_ON_HIGH_DAMAGE_TAKEN","SPELL_RANGE","WEAK_ARMOR"] as const).forEach(n => { defs[n] = absDouble("Custom", n, ""); });

  // Absolute value Vanilla
  (["MAX_HEALTH","ATTACK_DAMAGE","ATTACK_KNOCKBACK","ATTACK_SPEED","ATTACK_RANGE","ARMOR","ARMOR_TOUGHNESS","LUCK"] as const).forEach(n => {
    defs[n] = absDouble("Vanilla", n, "");
  });

  // Special multiplier
  defs["KNOCKBACK_RESISTANCE"] = { category: "Vanilla", bounds: [{ type: "Double", label: "Knockback Resistance", mult: 10, suffix: "" }], isFlag: false };

  // Flag attributes
  ([
    "DISABLE_MELEE","STEALTH","NEGATIVE_EFFECT_IMMUNITY","FIGHTER_SET_BONUS",
    "WARDEN_SCREAM","SPEED_TRINKET","EARTH_RAISE","NECRYONS_CALL",
    "SPEED_TRINKET_DISCLAIMER","CONE_BLAST","DASH_TRINKET",
    "ORKOTOS_SWORD","ORKOTOS_SHIELD","TEST_MM_SKILL","STAFF_OF_TENEBRIS",
    "SIREN_CRY","KAYLESS_ACE","APOCALYPSE_PROTECTION",
  ] as const).forEach(n => { defs[n] = flag("Custom"); });

  // Multi-bound definitions
  defs["ADDITIONAL_ARROWS"] = {
    category: "Custom",
    bounds: [
      { type: "Int", label: "Arrow Count", mult: 1, suffix: "" },
      { type: "Double", label: "Damage Per Arrow", mult: 100, suffix: "%" },
    ],
    isFlag: false,
  };

  defs["RANDOMIZED_DAMAGE_TAKEN"] = {
    category: "Custom",
    bounds: [
      { type: "Double", label: "Min Damage", mult: 100, suffix: "%" },
      { type: "Double", label: "Max Damage", mult: 100, suffix: "%" },
    ],
    isFlag: false,
  };

  defs["SUMMON_SUPPORT_WOLF"] = {
    category: "Custom",
    bounds: [
      { type: "String", label: "Wolf Type", mult: 1, suffix: "", options: ["Slowing","Life Stealing","Weakening","Inciting","Hasting"] },
      { type: "Int", label: "Wolf Count", mult: 1, suffix: "" },
    ],
    isFlag: false,
  };

  defs["EXECUTE_DAMAGE"] = {
    category: "Custom",
    bounds: [
      { type: "Double", label: "Bonus Damage", mult: 100, suffix: "%" },
      { type: "Double", label: "Health Threshold", mult: 100, suffix: "%" },
    ],
    isFlag: false,
  };

  defs["ANTI_HEAL_ON_HIT"] = {
    category: "Custom",
    bounds: [
      { type: "Double", label: "Heal Reduction", mult: 100, suffix: "%" },
      { type: "Double", label: "Duration", mult: 1, suffix: "s" },
    ],
    isFlag: false,
  };

  defs["BLEED_ON_HIT"] = {
    category: "Custom",
    bounds: [
      { type: "Double", label: "Bleed Chance", mult: 100, suffix: "%" },
      { type: "Double", label: "Total Damage", mult: 1, suffix: "" },
      { type: "Double", label: "Duration", mult: 1, suffix: "s" },
    ],
    isFlag: false,
  };

  defs["SHIELD_ON_KILL"] = {
    category: "Custom",
    bounds: [
      { type: "Double", label: "Absorption Hearts", mult: 1, suffix: "" },
      { type: "Double", label: "Duration", mult: 1, suffix: "s" },
    ],
    isFlag: false,
  };

  defs["STACKING_DAMAGE"] = {
    category: "Custom",
    bounds: [
      { type: "Int", label: "Hit Threshold", mult: 1, suffix: "" },
      { type: "Double", label: "Bonus Damage", mult: 1, suffix: "" },
    ],
    isFlag: false,
  };

  defs["CHAIN_LIGHTNING"] = {
    category: "Custom",
    bounds: [
      { type: "Double", label: "Proc Chance", mult: 100, suffix: "%" },
      { type: "Int", label: "Bounces", mult: 1, suffix: "" },
      { type: "Double", label: "Base Damage", mult: 1, suffix: "" },
    ],
    isFlag: false,
  };

  defs["LIFELINE_SHIELD"] = {
    category: "Custom",
    bounds: [
      { type: "Double", label: "Health Threshold", mult: 100, suffix: "%" },
      { type: "Double", label: "Absorption Hearts", mult: 1, suffix: "" },
      { type: "Double", label: "Duration", mult: 1, suffix: "s" },
    ],
    isFlag: false,
  };

  defs["BERSERKER_RAGE"] = {
    category: "Custom",
    bounds: [
      { type: "Double", label: "Health Threshold", mult: 100, suffix: "%" },
      { type: "Double", label: "Attack Speed Bonus", mult: 100, suffix: "%" },
      { type: "Double", label: "Move Speed Bonus", mult: 100, suffix: "%" },
      { type: "Double", label: "Extra Damage Taken", mult: 100, suffix: "%" },
    ],
    isFlag: false,
  };

  defs["DEFERRED_DAMAGE"] = {
    category: "Custom",
    bounds: [
      { type: "Double", label: "Deferred Percent", mult: 100, suffix: "%" },
      { type: "Double", label: "Bleed Duration", mult: 1, suffix: "s" },
    ],
    isFlag: false,
  };

  defs["SOUL_STACKS"] = {
    category: "Custom",
    bounds: [
      { type: "Double", label: "Damage Per Stack", mult: 1, suffix: "" },
      { type: "Int", label: "Max Stacks", mult: 1, suffix: "" },
    ],
    isFlag: false,
  };

  defs["MARK_DETONATE"] = {
    category: "Custom",
    bounds: [
      { type: "Double", label: "Damage Per Mark", mult: 1, suffix: "" },
      { type: "Int", label: "Max Marks", mult: 1, suffix: "" },
      { type: "Double", label: "Cooldown", mult: 1, suffix: "s" },
    ],
    isFlag: false,
  };

  defs["BLINK_BACK"] = {
    category: "Custom",
    bounds: [
      { type: "Double", label: "Lookback Time", mult: 1, suffix: "s" },
      { type: "Double", label: "Cooldown", mult: 1, suffix: "s" },
    ],
    isFlag: false,
  };

  defs["GRAVITATIONAL_PULL"] = {
    category: "Custom",
    bounds: [
      { type: "Double", label: "Pull Radius", mult: 1, suffix: "" },
      { type: "Double", label: "Cooldown", mult: 1, suffix: "s" },
    ],
    isFlag: false,
  };

  return defs;
}
