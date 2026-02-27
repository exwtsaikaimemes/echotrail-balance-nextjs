# EchoTrail Item Creator - Attribute Reference

Technical reference for all attributes in the item creator tool. Use this when designing items to understand what each bound controls and how values translate to in-game effects.

---

## Reading Bound Definitions

Each attribute has one or more **bounds**. A bound defines a rollable parameter:

- **Type**: `Double` (decimal), `Int` (whole number), or `String` (enum choice)
- **Min / Max**: The range the attribute can roll. Items get a random value between min and max.
- **Multiplier (mult)**: How the stored value maps to display. `mult: 100` means the stored value `0.15` displays as `15%`.
- **Suffix**: Display unit (`%`, `s` for seconds, or empty for flat values)

**Example:** An attribute with `mult: 100, suffix: "%"` and bounds `min: 0.05, max: 0.20` rolls between 5% and 20%.

---

## Attribute Definitions

### Offensive - Single Bound

| Attribute | Bound | Type | Mult | Suffix | Description |
|-----------|-------|------|------|--------|-------------|
| ATTACK_DAMAGE | Base Damage | Double | 1 | | Flat damage added |
| INCREASED_DAMAGE | Increased Damage | Double | 100 | % | Additive damage % |
| INCREASED_PROJECTILE_DAMAGE | Projectile Damage | Double | 100 | % | Additive damage %, projectile only |
| CRITICAL_DAMAGE | Critical Damage | Double | 100 | % | Multiplicative bonus on crits |
| CRITICAL_EXECUTE | Health Threshold | Double | 100 | % | Kill target below this HP% (PvP only) |
| BACKSTAB | Backstab Bonus | Double | 100 | % | Multiplicative bonus from behind |
| MORE_DAMAGE_AGAINST_FULL_LIFE | Full Life Bonus | Double | 100 | % | Multiplicative bonus vs full HP |
| EXTRA_DAMAGE_AGAINST_BOSSES | Boss Bonus | Double | 100 | % | Multiplicative bonus vs bosses |
| INCREASED_MELEE_DAMAGE_PER_MISSING_HEART | Damage Per Heart | Double | 100 | % | Additive bonus per missing heart |
| DAMAGE_PER_ENEMY_COUNT | Per Enemy | Double | 100 | % | Bonus per nearby enemy |
| DAMAGE_PER_ENEMY_HEARTS | Per Enemy Heart | Double | 100 | % | Bonus per enemy heart |
| EXTRA_DAMAGE_BASED_ON_ENEMY_SPEED | Speed Bonus | Double | 100 | % | Explosion chance on melee |
| HEALTHSTEAL | Lifesteal | Double | 100 | % | % of damage healed (6.5s CD) |
| WITHER_EFFECT_ON_HIT | Proc Chance | Double | 100 | % | Chance to apply Wither |
| MELEE_EXPLOSION_POWER | Power | Double | 100 | % | Explosion strength |
| MELEE_EXPLOSION_CHANCE | Chance | Double | 100 | % | Explosion proc chance (5s CD) |
| RANGED_EXPLOSION | Power | Double | 100 | % | Right-click explosion skill |
| ARMOR_PENETRATION | Penetration | Double | 100 | % | % of armor damage restored (cap 50%) |
| THORNS_DAMAGE | Reflect | Double | 100 | % | % of melee damage reflected |
| CRYSTAL_DAMAGE | Bonus | Double | 100 | % | Crystal damage bonus (disabled) |
| MACE_DAMAGE | Bonus | Double | 100 | % | Mace damage bonus (disabled) |

### Offensive - Multi Bound

#### EXECUTE_DAMAGE (2 bounds)
| Bound | Type | Mult | Suffix | Description |
|-------|------|------|--------|-------------|
| Bonus Damage | Double | 100 | % | Multiplicative damage bonus below threshold |
| Health Threshold | Double | 100 | % | Target HP% to activate |

#### ANTI_HEAL_ON_HIT (2 bounds)
| Bound | Type | Mult | Suffix | Description |
|-------|------|------|--------|-------------|
| Heal Reduction | Double | 100 | % | How much healing is reduced |
| Duration | Double | 1 | s | How long the debuff lasts |

#### BLEED_ON_HIT (3 bounds)
| Bound | Type | Mult | Suffix | Description |
|-------|------|------|--------|-------------|
| Bleed Chance | Double | 100 | % | Chance to apply bleed |
| Total Damage | Double | 1 | | Total bleed damage over duration |
| Duration | Double | 1 | s | How long the bleed lasts |

#### STACKING_DAMAGE (2 bounds)
| Bound | Type | Mult | Suffix | Description |
|-------|------|------|--------|-------------|
| Hit Threshold | Int | 1 | | Hits needed to proc |
| Bonus Damage | Double | 1 | | Flat damage on proc |

#### CHAIN_LIGHTNING (3 bounds)
| Bound | Type | Mult | Suffix | Description |
|-------|------|------|--------|-------------|
| Proc Chance | Double | 100 | % | Chance to trigger (2.5s CD) |
| Bounces | Int | 1 | | Max number of chain bounces |
| Base Damage | Double | 1 | | Starting damage (75% per bounce) |

#### SOUL_STACKS (2 bounds)
| Bound | Type | Mult | Suffix | Description |
|-------|------|------|--------|-------------|
| Damage Per Stack | Double | 1 | | Flat damage per soul stack |
| Max Stacks | Int | 1 | | Maximum stacks (lose half on death) |

#### MARK_DETONATE (3 bounds)
| Bound | Type | Mult | Suffix | Description |
|-------|------|------|--------|-------------|
| Damage Per Mark | Double | 1 | | Flat damage per mark on detonate |
| Max Marks | Int | 1 | | Max marks per enemy |
| Cooldown | Double | 1 | s | Detonate cooldown |

#### ADDITIONAL_ARROWS (2 bounds)
| Bound | Type | Mult | Suffix | Description |
|-------|------|------|--------|-------------|
| Arrow Count | Int | 1 | | Extra arrows (fan pattern) |
| Damage Per Arrow | Double | 100 | % | Each arrow's damage % |

---

### Defensive - Single Bound

| Attribute | Bound | Type | Mult | Suffix | Description |
|-----------|-------|------|------|--------|-------------|
| ARMOR | Armor | Double | 1 | | Flat armor |
| ARMOR_TOUGHNESS | Toughness | Double | 1 | | Flat armor toughness |
| MAX_HEALTH | Max Health | Double | 1 | | Flat HP bonus |
| MAX_HEALTH_INCREASE | Max Health | Double | 100 | % | % HP increase |
| REDUCED_DAMAGE_TAKEN | Reduction | Double | 100 | % | Additive damage reduction |
| REDUCED_PROJECTILE_DAMAGE_TAKEN | Reduction | Double | 100 | % | Projectile-only reduction |
| DODGE_CHANCE | Dodge | Double | 100 | % | Chance to avoid hit (cap 35%) |
| HEAL_ON_BLOCK | Heal | Double | 100 | % | % of max HP healed on block (15s CD) |
| HEALTH_RESERVATION | Reserved | Double | 100 | % | HP you can't heal (drawback) |
| KNOCKBACK_RESISTANCE | Resistance | Double | 10 | | Knockback reduction (0-1 scale) |
| ABSORPTION_ON_HIGH_DAMAGE_TAKEN | Threshold | Double | 1 | | Min damage to trigger (15s CD) |
| REGEN_ON_DAMAGE_TAKEN | Duration | Double | 1 | s | Regen II duration on hit |
| SLOW_ON_HIT | Duration | Double | 1 | s | Slowness II AoE duration |
| CRYSTAL_DEFENCE | Reduction | Double | 100 | % | Crystal damage reduction (disabled) |
| MACE_DEFENCE | Reduction | Double | 100 | % | Mace damage reduction (disabled) |
| WEAK_ARMOR | Durability Damage | Double | 1 | | Extra armor wear per hit (drawback) |
| NEGATIVE_EFFECT_IMMUNITY_CHANCE | Chance | Double | 100 | % | Chance to block negative effects |
| SPELL_RANGE | Range | Double | 1 | | Cloud spell range in blocks |

### Defensive - Multi Bound

#### RANDOMIZED_DAMAGE_TAKEN (2 bounds)
| Bound | Type | Mult | Suffix | Description |
|-------|------|------|--------|-------------|
| Min Damage | Double | 100 | % | Minimum damage multiplier |
| Max Damage | Double | 100 | % | Maximum damage multiplier |

#### SHIELD_ON_KILL (2 bounds)
| Bound | Type | Mult | Suffix | Description |
|-------|------|------|--------|-------------|
| Absorption Hearts | Double | 1 | | Hearts granted on kill |
| Duration | Double | 1 | s | How long absorption lasts |

#### LIFELINE_SHIELD (3 bounds)
| Bound | Type | Mult | Suffix | Description |
|-------|------|------|--------|-------------|
| Health Threshold | Double | 100 | % | HP% to trigger (100s CD) |
| Absorption Hearts | Double | 1 | | Hearts granted |
| Duration | Double | 1 | s | Absorption duration |

#### BERSERKER_RAGE (4 bounds)
| Bound | Type | Mult | Suffix | Description |
|-------|------|------|--------|-------------|
| Health Threshold | Double | 100 | % | HP% to activate |
| Attack Speed Bonus | Double | 100 | % | Speed buff while low |
| Move Speed Bonus | Double | 100 | % | Movement buff while low |
| Extra Damage Taken | Double | 100 | % | Extra damage received (drawback) |

#### DEFERRED_DAMAGE (2 bounds)
| Bound | Type | Mult | Suffix | Description |
|-------|------|------|--------|-------------|
| Deferred Percent | Double | 100 | % | % of damage converted to bleed |
| Bleed Duration | Double | 1 | s | Duration of deferred bleed (clears on kill) |

---

### Utility - Single Bound

| Attribute | Bound | Type | Mult | Suffix | Description |
|-----------|-------|------|------|--------|-------------|
| MOVEMENT_SPEED | Speed | Double | 100 | % | Walk speed modifier |
| ATTACK_SPEED | Speed | Double | 1 | | Attack speed modifier |
| ATTACK_KNOCKBACK | Knockback | Double | 1 | | Knockback dealt |
| ATTACK_RANGE | Range | Double | 1 | | Melee range in blocks |
| LUCK | Luck | Double | 1 | | Loot table bonus |
| SIZE_INCREASE | Scale | Double | 100 | % | Model scale modifier |
| INCREASED_ARROW_VELOCITY | Velocity | Double | 100 | % | Arrow speed increase |
| EFFECT_GAIN | Proc Chance | Double | 100 | % | Chance for buff on kill |
| TAUNT | Taunt Chance | Double | 100 | % | Chance to force aggro |
| MOVEMENT_ON_HIT_OR_KILL | Proc Chance | Double | 100 | % | Chance for Speed I on hit/kill |
| TWINFIRE_DUAL_WIELD | Bonus | Double | 100 | % | Damage when dual wielding |
| CLOUD_OF_HARMING | Strength | Double | 100 | % | Damage cloud power (5s CD) |
| CLOUD_OF_HEALING | Strength | Double | 100 | % | Healing cloud power (5s CD) |
| CLOUD_OF_SLOW | Strength | Double | 100 | % | Slow cloud power (5s CD) |
| SPELL_CLOUD_PERSISTANCE | Persist | Double | 100 | % | Cloud shrink rate modifier |
| PARALYZE_ENEMY | Chance | Double | 100 | % | Paralysis proc chance (30s CD) |

### Utility - Multi Bound

#### SUMMON_SUPPORT_WOLF (2 bounds)
| Bound | Type | Mult | Suffix | Description |
|-------|------|------|--------|-------------|
| Wolf Type | String | 1 | | Slowing / Life Stealing / Weakening / Inciting / Hasting |
| Wolf Count | Int | 1 | | Number of wolves |

#### BLINK_BACK (2 bounds)
| Bound | Type | Mult | Suffix | Description |
|-------|------|------|--------|-------------|
| Lookback Time | Double | 1 | s | How far back to teleport (position saved every 3s) |
| Cooldown | Double | 1 | s | Ability cooldown |

#### GRAVITATIONAL_PULL (2 bounds)
| Bound | Type | Mult | Suffix | Description |
|-------|------|------|--------|-------------|
| Pull Radius | Double | 1 | | AoE radius in blocks |
| Cooldown | Double | 1 | s | Ability cooldown |

---

### Flag Attributes (No Bounds)

These are toggle attributes with no rollable values. They are either present or not.

| Attribute | Category | Description |
|-----------|----------|-------------|
| DISABLE_MELEE | Utility | Prevents all melee damage (drawback) |
| STEALTH | Utility | Invisible to mobs from behind |
| NEGATIVE_EFFECT_IMMUNITY | Defensive | Full immunity to negative effects |
| SPEED_TRINKET | Utility | Right-click: Speed II for 20s |
| DASH_TRINKET | Utility | Right-click: Launch forward (12s CD) |
| WARDEN_SCREAM | Special | Right-click: Sonic boom (15s CD) |
| CONE_BLAST | Special | Right-click: AoE beam attack (25s CD) |
| EARTH_RAISE | Special | Right-click: MythicMobs skill (25s CD) |
| NECRYONS_CALL | Special | Right-click: MythicMobs skill (25s CD) |
| ORKOTOS_SWORD | Special | Right-click: MythicMobs skill (25s CD) |
| ORKOTOS_SHIELD | Special | Sneak+block: MythicMobs skill (25s CD) |
| STAFF_OF_TENEBRIS | Special | Right-click: MythicMobs skill (25s CD) |
| SIREN_CRY | Special | Right-click: MythicMobs skill (25s CD) |
| KAYLESS_ACE | Special | End Crystals explode with power 10 |
| APOCALYPSE_PROTECTION | Defensive | Protection from corrupted creatures |
| FIGHTER_SET_BONUS | Set Bonus | Strength II + Speed II (req 4 pieces) |
| SPEED_TRINKET_DISCLAIMER | Display | Lore text: "Can only be used inside Dungeons!" |
| TEST_MM_SKILL | Dev | Test MythicMobs skill |

---

### Set Bonuses (Proc Chance)

| Attribute | Bound | Type | Mult | Suffix | Set Effect |
|-----------|-------|------|------|--------|------------|
| STEALTH_SET_BONUS | Chance | Double | 100 | % | Speed II + Strength II + Invisibility |
| BOW_SET_BONUS | Chance | Double | 100 | % | Jump II + Absorption II + Speed II |
| SUPPORT_SET_BONUS | Chance | Double | 100 | % | Regen II + Glowing + Heal Cloud |
| TANK_SET_BONUS | Chance | Double | 100 | % | Resistance II + Absorption II |

---

## Weight Categories

Weights determine how much of the item's budget an attribute consumes. Higher weight = more expensive = fewer other attributes can fit.

| Weight | Meaning | Examples |
|--------|---------|----------|
| 0.0 | Free / cosmetic | Speed Trinket Disclaimer, Test MM Skill |
| 0.5 - 1.5 | Low cost | Disable Melee, Size Increase, Luck, Knockback |
| 2.0 - 2.5 | Medium cost | Armor, Max Health, Slow On Hit, Taunt |
| 3.0 - 3.5 | High cost | Critical Damage, Healthsteal, Dodge Chance, Chain Lightning |
| 4.0 | Very high cost | Critical Execute |

---

## Design Tips

1. **Drawback attributes** (Disable Melee, Health Reservation, Weak Armor, Berserker Rage extra damage) have low weights, freeing budget for powerful attributes.
2. **Multiplicative attributes** (Critical Damage, Backstab, Execute Damage) scale better on weapons that already have high base damage.
3. **Additive attributes** (Increased Damage, Armor Penetration) are best stacked across multiple item slots.
4. **Cooldown-gated attributes** (Lifeline Shield 100s, Paralyze 30s) are powerful but unreliable. Pair with consistent attributes.
5. **BERSERKER_RAGE** is the only attribute with 4 bounds. It needs careful tuning: the extra damage taken must balance the speed/attack bonuses.
6. **Set bonuses** require 4+ pieces. Plan full sets around the proc chance and synergize with the set's effect.
7. **Soul Stacks** reset between dungeons but snowball within a run. Better for longer dungeon content.
8. **Deferred Damage** is uniquely powerful because the bleed clears on kill. It rewards aggressive play.
