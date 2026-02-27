function fmtSigned(v: number): string {
  const n = parseFloat(String(v));
  if (isNaN(n)) return "+0";
  const s = Math.abs(n) < 10 ? (Math.round(n * 10) / 10).toString() : Math.round(n).toString();
  return (n >= 0 ? "+" : "") + s;
}

function fmtUnsigned(v: number): string {
  const n = parseFloat(String(v));
  if (isNaN(n)) return "0";
  return Math.abs(n) < 10 ? (Math.round(n * 10) / 10).toString() : Math.round(n).toString();
}

function fmtPrecise(v: number): string {
  const n = parseFloat(String(v));
  if (isNaN(n)) return "+0";
  const s = (Math.round(n * 100) / 100).toString();
  return (n >= 0 ? "+" : "") + s;
}

export const ATTRIBUTE_LORE_TEMPLATES: Record<string, (v: number[]) => string> = {
  INCREASED_PROJECTILE_DAMAGE: (v) => fmtSigned(v[0]*100) + "% Increased arrow damage",
  INCREASED_ARROW_VELOCITY: (v) => fmtSigned(v[0]*100) + "% Arrow Speed",
  DISABLE_MELEE: () => "Melee Damage Disabled",
  DODGE_CHANCE: (v) => fmtUnsigned(v[0]*100) + "% Dodge Chance",
  TWINFIRE_DUAL_WIELD: (v) => "+" + fmtUnsigned(v[0]*100) + "% Damage when Dual Wielding identical weapons",
  ABSORPTION_ON_HIGH_DAMAGE_TAKEN: (v) => "Get Absorption II when taking " + fmtSigned(v[0]) + " damage",
  REGEN_ON_DAMAGE_TAKEN: (v) => "Get Regeneration for " + fmtSigned(v[0]) + "s when hit",
  STEALTH: () => "Monster Stealth",
  BACKSTAB: (v) => "+" + fmtUnsigned(v[0]*100) + "% Backstab Damage",
  ADDITIONAL_ARROWS: (v) => "+" + v[0] + " Extra arrows with " + fmtUnsigned(v[1]*100) + "% Damage",
  EFFECT_GAIN: (v) => fmtUnsigned(v[0]*100) + "% Chance to get a positive effect when killing",
  MORE_DAMAGE_AGAINST_FULL_LIFE: (v) => fmtUnsigned(v[0]*100) + "% More damage to enemies with full health",
  HEAL_ON_BLOCK: (v) => fmtSigned(v[0]*100) + "% Heal on Block",
  INCREASED_MELEE_DAMAGE_PER_MISSING_HEART: (v) => fmtSigned(v[0]*100) + "% Melee Damage per missing heart",
  SLOW_ON_HIT: (v) => "Slow enemies for " + fmtSigned(v[0]) + "s when hitting",
  TAUNT: (v) => fmtSigned(v[0]*100) + "% chance to taunt monsters when hitting",
  CRITICAL_DAMAGE: (v) => fmtUnsigned(v[0]*100) + "% Critical Damage",
  CRITICAL_EXECUTE: (v) => fmtUnsigned(v[0]*100) + "% Critical Execute (Bypasses Totems)",
  RANDOMIZED_DAMAGE_TAKEN: (v) => "Damage you receive is randomized between " + fmtUnsigned(v[0]*100) + "% and " + fmtUnsigned(v[1]*100) + "%",
  NEGATIVE_EFFECT_IMMUNITY: () => "Immunity to negative effects",
  HEALTH_RESERVATION: (v) => fmtSigned(v[0]*100) + " Fake Hearts",
  REDUCED_DAMAGE_TAKEN: (v) => "-" + fmtUnsigned(v[0]*100) + "% Damage Reduction",
  REDUCED_PROJECTILE_DAMAGE_TAKEN: (v) => "-" + fmtUnsigned(v[0]*100) + "% Projectile Damage Reduction",
  INCREASED_DAMAGE: (v) => fmtSigned(v[0]*100) + "% Extra Damage Done",
  SUMMON_SUPPORT_WOLF: (v) => "Summon " + v[0] + " a Wolf with Strength " + v[1],
  MOVEMENT_ON_HIT_OR_KILL: (v) => fmtUnsigned(v[0]*100) + "% Chance to get Speed 1 if you are hit or killed.",
  STEALTH_SET_BONUS: (v) => "Set - " + fmtUnsigned(v[0]*100) + "% Extra chance to get the Stealth Blessing when attacking.",
  BOW_SET_BONUS: (v) => "Set - " + fmtUnsigned(v[0]*100) + "% Extra chance to get the Bow Blessing when attacking.",
  SUPPORT_SET_BONUS: (v) => "Set - " + fmtUnsigned(v[0]*100) + "% Extra chance to call a Regeneration Cloud when attacking.",
  TANK_SET_BONUS: (v) => "Set - " + fmtUnsigned(v[0]*100) + "% Extra chance to get the Tank Blessing when attacking.",
  HEALTHSTEAL: (v) => fmtUnsigned(v[0]*100) + "% Healthsteal",
  CLOUD_OF_HARMING: (v) => "Right Click - Call an ancient damaging curse on the ground. Power " + fmtUnsigned(v[0]*100),
  SPELL_RANGE: (v) => "Your magic reaches " + v[0] + " blocks!",
  SPELL_CLOUD_PERSISTANCE: (v) => "Spell Cloud Persistance " + fmtUnsigned(v[0]*100),
  CLOUD_OF_HEALING: (v) => "Right Click - Call an ancient healing blessing on the ground. Power " + fmtUnsigned(v[0]*100),
  FIGHTER_SET_BONUS: () => "Set - 10% chance to stun",
  EXTRA_DAMAGE_AGAINST_BOSSES: (v) => fmtUnsigned(v[0]*100) + "% Extra damage against bosses",
  PARALYZE_ENEMY: (v) => fmtUnsigned(v[0]*100) + "% chance to paralyze the enemy",
  RANGED_EXPLOSION: (v) => "Right Click - Call an explosion. Power " + fmtUnsigned(v[0]*100),
  EXTRA_DAMAGE_BASED_ON_ENEMY_SPEED: (v) => fmtUnsigned(v[0]*100) + "% chance to call an explosion on melee hit",
  DAMAGE_PER_ENEMY_COUNT: (v) => fmtUnsigned(v[0]*100) + "% Extra damage per enemy in front of you",
  DAMAGE_PER_ENEMY_HEARTS: (v) => fmtUnsigned(v[0]*100) + "% Extra damage per enemy heart",
  CLOUD_OF_SLOW: (v) => "Right Click - Call a Slow Cloud on the ground. Power " + fmtUnsigned(v[0]*100),
  WITHER_EFFECT_ON_HIT: (v) => fmtUnsigned(v[0]*100) + "% chance to Wither curse the enemy",
  MELEE_EXPLOSION_POWER: (v) => "Explosion power on melee hit " + fmtUnsigned(v[0]*100),
  MELEE_EXPLOSION_CHANCE: (v) => fmtUnsigned(v[0]*100) + "% chance to call an explosion on melee hit",
  WARDEN_SCREAM: () => "Right Click - Call the power of the Warden",
  SPEED_TRINKET: () => "Right Click - Get Speed II for 20 seconds!",
  EARTH_RAISE: () => "Right Click - Use dark powers to raise the earth!",
  NECRYONS_CALL: () => "Right Click - Use the power of the Necryons!",
  SPEED_TRINKET_DISCLAIMER: () => "*Can only be used inside Dungeons!",
  CONE_BLAST: () => "Right Click - Call the power of the Erictis",
  DASH_TRINKET: () => "Right Click - Do a short dash!",
  ORKOTOS_SWORD: () => "The power of the Orkotos is inside this sword",
  ORKOTOS_SHIELD: () => "Sneak + Block - Call the flames of the Oathsworn",
  TEST_MM_SKILL: () => "WARNING THIS IS A TEST ITEM",
  STAFF_OF_TENEBRIS: () => "Right Click - Call the power of the Hand of Erictis",
  SIREN_CRY: () => "Right Click - Call the power of Azura",
  KAYLESS_ACE: () => "\u0388\u03BD\u03B1\u03C2 \u039A\u03C1\u03CD\u03C3\u03C4\u03B1\u03BB\u03BB\u03BF\u03C2 \u03C4\u03CC\u03C3\u03BF \u03B9\u03C3\u03C7\u03C5\u03C1\u03CC\u03C2, \u03C0\u03BF\u03C5 \u03B7 \u03AF\u03B4\u03B9\u03B1 \u03B7 \u03C0\u03C1\u03B1\u03B3\u03BC\u03B1\u03C4\u03B9\u03BA\u03CC\u03C4\u03B7\u03C4\u03B1 \u03C1\u03B1\u03B3\u03AF\u03B6\u03B5\u03B9 \u03BC\u03B5 \u03C4\u03B7\u03BD \u03AD\u03BA\u03C1\u03B7\u03BE\u03AE \u03C4\u03BF\u03C5",
  NEGATIVE_EFFECT_IMMUNITY_CHANCE: (v) => fmtUnsigned(v[0]*100) + "% chance to have immunity to negative effects",
  APOCALYPSE_PROTECTION: () => "Protection from corrupted creatures.",
  CRYSTAL_DAMAGE: (v) => "+" + fmtUnsigned(v[0]*100) + "% Extra End Crystal Damage",
  CRYSTAL_DEFENCE: (v) => "-" + fmtUnsigned(v[0]*100) + "% Less End Crystal Damage",
  MACE_DAMAGE: (v) => "+" + fmtUnsigned(v[0]*100) + "% Extra Mace Damage",
  MACE_DEFENCE: (v) => "-" + fmtUnsigned(v[0]*100) + "% Less Mace Damage",
  WEAK_ARMOR: (v) => "Weak Armor - +" + v[0] + " Extra Armor Damage",
  ARMOR_PENETRATION: (v) => "+" + fmtUnsigned(v[0]*100) + "% Armor Penetration",
  EXECUTE_DAMAGE: (v) => "+" + fmtUnsigned(v[0]*100) + "% damage to enemies below " + fmtUnsigned(v[1]*100) + "% health",
  THORNS_DAMAGE: (v) => "Reflects " + fmtUnsigned(v[0]*100) + "% of melee damage taken",
  ANTI_HEAL_ON_HIT: (v) => "Attacks reduce enemy healing by " + fmtUnsigned(v[0]*100) + "% for " + fmtUnsigned(v[1]) + "s",
  BLEED_ON_HIT: (v) => fmtUnsigned(v[0]*100) + "% chance to inflict Bleed: " + fmtUnsigned(v[1]) + " damage over " + fmtUnsigned(v[2]) + "s",
  SHIELD_ON_KILL: (v) => "Gain " + fmtUnsigned(v[0]) + " absorption hearts for " + fmtUnsigned(v[1]) + "s on kill",
  STACKING_DAMAGE: (v) => "Every " + v[0] + " hit on the same target deals +" + fmtUnsigned(v[1]) + " bonus damage",
  CHAIN_LIGHTNING: (v) => fmtUnsigned(v[0]*100) + "% chance to chain lightning to " + v[1] + " enemies for " + fmtUnsigned(v[2]) + " damage (-25% per bounce)",
  LIFELINE_SHIELD: (v) => "When below " + fmtUnsigned(v[0]*100) + "% health, gain " + fmtUnsigned(v[1]) + " absorption hearts for " + fmtUnsigned(v[2]) + "s",
  BERSERKER_RAGE: (v) => "Below " + fmtUnsigned(v[0]*100) + "% HP: +" + fmtUnsigned(v[1]*100) + "% Attack Speed, +" + fmtUnsigned(v[2]*100) + "% Movement Speed, take " + fmtUnsigned(v[3]*100) + "% more damage",
  DEFERRED_DAMAGE: (v) => fmtUnsigned(v[0]*100) + "% of damage taken is deferred as bleed over " + fmtUnsigned(v[1]) + "s",
  SOUL_STACKS: (v) => "+" + fmtUnsigned(v[0]) + " damage per kill (max " + v[1] + " stacks). Lose half on death. Dungeon only",
  MARK_DETONATE: (v) => "Attacks mark enemies. Right-click to detonate: " + fmtUnsigned(v[0]) + " damage per mark (" + fmtUnsigned(v[2]) + "s cooldown)",
  BLINK_BACK: (v) => "Right-click: Teleport to your position from " + fmtUnsigned(v[0]) + "s ago (" + fmtUnsigned(v[1]) + "s cooldown)",
  GRAVITATIONAL_PULL: (v) => "Right-click: Pull enemies within " + fmtUnsigned(v[0]) + " blocks toward you (" + fmtUnsigned(v[1]) + "s cooldown)",
  // Vanilla
  MAX_HEALTH: (v) => fmtSigned(v[0]) + " Max Health",
  MAX_HEALTH_INCREASE: (v) => fmtSigned(v[0]*100) + "% Max Health",
  KNOCKBACK_RESISTANCE: (v) => fmtSigned(v[0]*10) + " Knockback Resistance",
  MOVEMENT_SPEED: (v) => fmtPrecise(v[0]*100) + " Movement Speed",
  ATTACK_DAMAGE: (v) => fmtSigned(v[0]) + " Attack Damage",
  ATTACK_KNOCKBACK: (v) => fmtSigned(v[0]) + " Attack Knockback",
  ATTACK_SPEED: (v) => fmtPrecise(v[0]) + " Attack Speed",
  ATTACK_RANGE: (v) => fmtPrecise(v[0]) + " Reach",
  ARMOR: (v) => fmtSigned(v[0]) + " Armor",
  ARMOR_TOUGHNESS: (v) => fmtSigned(v[0]) + " Armor Toughness",
  LUCK: (v) => fmtSigned(v[0]) + " Luck",
  SIZE_INCREASE: (v) => fmtSigned(v[0]*100) + "% Size",
};

export function getEnchantmentLore(enchName: string, level: number): string | null {
  const l = parseInt(String(level)) || 1;
  const df1 = (n: number) => (Math.round(n * 10) / 10).toString();
  switch (enchName) {
    case "DEPTH_STRIDER": return "+" + df1(l / 3.0) + " Water Movement Efficiency";
    case "SWIFT_SNEAK": return "+" + df1(0.15 * l) + " Sneaking Speed";
    case "AQUA_AFFINITY": return "+" + (400 * l) + "% Submerged Mining Speed";
    case "RESPIRATION": return "+" + l + " Oxygen Bonus";
    case "SWEEPING_EDGE": return "+" + df1(l / (l + 1.0)) + " Sweeping Damage Ratio";
    case "EFFICIENCY": {
      let sum = 0; for (let i = 1; i < l; i++) sum += 1 + 2 * i;
      return "+" + (2 + sum) + " Mining Efficiency";
    }
    case "FIRE_PROTECTION": return "-" + (15 * l) + "% Burning Time";
    case "BLAST_PROTECTION": return "+" + df1(0.15 * l) + " Explosion Knockback Resistance";
    default: return null;
  }
}
