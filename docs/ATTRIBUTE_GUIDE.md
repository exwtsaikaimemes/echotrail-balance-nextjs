# EchoTrail Attribute Guide

All item attributes available in EchoTrail dungeons. Attributes are rolled onto items based on rarity and equipment type. Higher rarity = more budget = stronger rolls.

---

## How Damage Works

Damage goes through a formula with four modifier layers:

```
Final Damage = Base Damage
    x (1 + sum of Increased Damage)     -- additive layer
    x product of (1 + each More Damage)  -- multiplicative layer
    x (1 - sum of Reduced Damage)        -- additive reduction
    x product of (1 - each Less Damage)  -- multiplicative reduction
```

- **Increased / Reduced** stack additively (10% + 10% = 20%)
- **More / Less** stack multiplicatively (10% more x 10% more = 21%)

---

## Offensive Attributes

### Basic Damage

| Attribute | What It Does |
|-----------|-------------|
| **Attack Damage** | Flat bonus to your base damage. Vanilla attribute. |
| **Increased Damage** | Percentage increase to ALL outgoing damage. Stacks additively. Can be negative. |
| **Increased Projectile Damage** | Same as above but only for arrows and projectiles. |
| **Critical Damage** | Extra multiplicative damage on critical hits. Melee crits: falling + full attack cooldown. Ranged crits: charged arrows. |
| **Backstab** | Multiplicative bonus damage when attacking from behind (> 90 degree angle). Shows action bar notification. |
| **More Damage Against Full Life** | Multiplicative bonus when the target is at full health. Red particles on hit. |
| **Extra Damage Against Bosses** | Multiplicative bonus against boss enemies. Purple particles. |
| **Increased Melee Damage Per Missing Heart** | Additive bonus per missing heart. The lower your HP, the harder you hit. Melee only. |

### Proc / On-Hit Effects

| Attribute | What It Does |
|-----------|-------------|
| **Healthsteal** | Heals you for a percentage of damage dealt. Uses the highest roll across all items. Respects anti-heal debuffs. 6.5s cooldown. |
| **Slow On Hit** | Applies Slowness II to the target and all enemies within 4 blocks for the specified duration. |
| **Wither Effect On Hit** | Chance to apply Wither to the target. |
| **Paralyze Enemy** | Chance to freeze the target in place for 1.6 seconds. 30s cooldown. |
| **Anti-Heal On Hit** | Applies a heal reduction debuff to the target for a duration. Reduces all healing they receive, including healthsteal. |
| **Bleed On Hit** | Chance to apply a damage-over-time bleed. Total damage is spread over the duration. Stronger bleeds overwrite weaker ones. Red particles. |

### Scaling / Stacking Mechanics

| Attribute | What It Does |
|-----------|-------------|
| **Armor Penetration** | Restores a percentage of damage absorbed by armor as bonus damage. Hard capped at 50%. |
| **Execute Damage** | Bonus multiplicative damage when the target is below a health threshold. Boss damage capped at 50 flat. |
| **Stacking Damage** | Tracks consecutive hits on the same target. Every N hits, deals bonus damage. Resets after 5 seconds or target switch. Anvil sound on proc. |
| **Soul Stacks** | Gain 1 stack per kill (up to max). Each stack adds flat bonus damage. Lose half on death. Stacks reset between dungeons. |
| **Mark & Detonate** | Attacks mark enemies (stacking up to max marks, 10s duration). Right-click detonates all marked enemies within 15 blocks. Color-coded particles: green > yellow > red. |

### Multi-Hit / AoE

| Attribute | What It Does |
|-----------|-------------|
| **Additional Arrows** | Fires extra arrows in a fan pattern on bow shot. Each bonus arrow deals a percentage of original damage. |
| **Chain Lightning** | Chance on hit to chain lightning to nearby enemies within 5 blocks. Each bounce deals 75% of the previous bounce. Blue particles. 2.5s cooldown. |
| **Melee Explosion Chance + Power** | Chance to trigger an explosion on melee hit. Power determines the explosion size. 5s cooldown. Both attributes required. |
| **Thorns Damage** | Reflects a percentage of melee damage taken back to the attacker. Grey particles. |

### Arrow Modifiers

| Attribute | What It Does |
|-----------|-------------|
| **Increased Arrow Velocity** | Percentage increase to arrow speed on bow shot. |
| **Additional Arrows** | Spawns extra arrows in a fan pattern (see above). |

---

## Defensive Attributes

### Damage Reduction

| Attribute | What It Does |
|-----------|-------------|
| **Armor** | Flat bonus to armor points. Vanilla attribute. |
| **Armor Toughness** | Flat bonus to armor toughness. Vanilla attribute. |
| **Reduced Damage Taken** | Flat percentage reduction to all incoming damage. Stacks additively. |
| **Reduced Projectile Damage Taken** | Same but only for projectile damage. |
| **Dodge Chance** | Chance to completely avoid a hit. Capped at 35%. Outside dungeons, reduced to 15% effectiveness. |
| **Knockback Resistance** | Reduces knockback taken. Vanilla attribute (0-1 scale). |

### Health & Healing

| Attribute | What It Does |
|-----------|-------------|
| **Max Health** | Flat bonus to maximum HP. Vanilla attribute. |
| **Max Health Increase** | Percentage increase to maximum HP. |
| **Regen On Damage Taken** | Grants Regeneration II for the specified duration when hit. |
| **Heal On Block** | Heals a percentage of max HP when blocking with a shield. 15s cooldown. |
| **Health Reservation** | Reserves a percentage of your max HP. You cannot heal above the remaining amount. Drawback attribute. |

### Shields & Absorption

| Attribute | What It Does |
|-----------|-------------|
| **Absorption On High Damage** | When hit for more than the threshold, grants Absorption II for 5 seconds. 15s cooldown. |
| **Shield On Kill** | Grants absorption hearts on killing an enemy. No cooldown. |
| **Lifeline Shield** | When health drops below the threshold, grants absorption hearts. 100s cooldown. |

### Advanced Defensive

| Attribute | What It Does |
|-----------|-------------|
| **Berserker Rage** | Below the health threshold: take extra damage BUT gain attack speed and movement speed buffs for 5 seconds when hit. High-risk, high-reward. |
| **Deferred Damage** | A percentage of incoming damage is removed and converted to a bleed DoT instead. The deferred bleed is cleared when you kill an enemy. |
| **Negative Effect Immunity** | Complete immunity to all negative potion effects (Weakness, Slowness, Wither, Poison, etc.). |
| **Negative Effect Immunity Chance** | Chance-based version of the above. Rolls per effect application. |
| **Randomized Damage Taken** | Incoming damage is randomized between a min and max percentage. Can reduce or increase damage. |
| **Weak Armor** | Increases armor durability damage per hit. Drawback attribute. |

---

## Utility Attributes

### Movement & Speed

| Attribute | What It Does |
|-----------|-------------|
| **Movement Speed** | Percentage modifier to walk speed. Vanilla attribute. |
| **Movement On Hit Or Kill** | Chance to gain Speed I for 10 seconds on hit or kill. |
| **Attack Speed** | Flat modifier to attack speed. Vanilla attribute. |
| **Attack Range** | Flat modifier to melee attack range. Vanilla attribute. |
| **Attack Knockback** | Flat modifier to knockback dealt. Vanilla attribute. |

### Targeting & Aggro

| Attribute | What It Does |
|-----------|-------------|
| **Taunt** | Chance on hit to force monsters to target you. |
| **Stealth** | Prevents monsters from targeting you if you're behind them. |

### Companion

| Attribute | What It Does |
|-----------|-------------|
| **Summon Support Wolf** | Summons invulnerable wolf companions. Five types: **Slowing** (slow enemies), **Life Stealing** (heals you), **Weakening** (debuffs enemies), **Inciting** (+10% damage per wolf), **Hasting** (speed buff on wolf hit). Armor-only. |

### Active Abilities (Right-Click)

| Attribute | What It Does |
|-----------|-------------|
| **Cloud of Harming** | Spawns a damage cloud at the targeted location. 5s cooldown. |
| **Cloud of Healing** | Spawns a healing cloud at the targeted location. 5s cooldown. |
| **Cloud of Slow** | Spawns a slowing cloud at the targeted location. 5s cooldown. |
| **Spell Range** | Increases the targeting range for cloud spells. Default: 15 blocks. |
| **Spell Cloud Persistence** | Clouds shrink slower, lasting longer. |
| **Blink Back** | Teleports you to your position from N seconds ago. Dungeon worlds only. |
| **Gravitational Pull** | Pulls all nearby non-boss enemies toward you. *(Future attribute)* |

### Trinkets

| Attribute | What It Does |
|-----------|-------------|
| **Speed Trinket** | Right-click: Speed II for 20 seconds. Dungeon-only. |
| **Dash Trinket** | Right-click: Launch forward in your look direction. 12s cooldown. |

### Miscellaneous

| Attribute | What It Does |
|-----------|-------------|
| **Luck** | Affects loot table rolls. Vanilla attribute. |
| **Size Increase** | Percentage modifier to player model scale. Vanilla attribute. |
| **Effect Gain** | Chance on kill to gain a random positive buff (Strength, Resistance, Speed, etc.) for 3 minutes. Higher tiers are rarer. |
| **Disable Melee** | Completely prevents melee damage. Intended for ranged-only weapons. Drawback attribute. |
| **Twinfire Dual Wield** | When wielding two items with this attribute, both items' bonuses are applied as multiplicative damage. |

---

## Set Bonuses

Require **4 or more pieces** of the same set equipped. On hit or kill, chance to proc the set effect for 7.5 seconds.

| Set | Effect |
|-----|--------|
| **Stealth Set** | Speed II + Strength II + Invisibility |
| **Bow Set** | Jump Boost II + Absorption II + Speed II |
| **Support Set** | Regeneration II + Glowing + Healing Cloud |
| **Tank Set** | Resistance II + Absorption II |
| **Fighter Set** | Strength II + Speed II |

---

## Special / Unique Weapon Skills

All share a 25-second global skill cooldown. Activated with right-click.

| Attribute | Weapon Skill |
|-----------|-------------|
| **Warden Scream** | Sonic boom at the closest enemy within 10 blocks. 15 damage in dungeons (35 vs bosses). 15s own cooldown. |
| **Ranged Explosion** | Explosion on the closest enemy within 15 blocks. 25 damage in dungeons (45 vs bosses). |
| **Cone Blast** | Purple beams at all enemies in a 60-degree cone, 15-block range. 40 damage (160 vs bosses). |
| **Earth Raise** | MythicMobs skill. |
| **Necryon's Call** | MythicMobs skill. |
| **Orkotos Sword** | MythicMobs skill. |
| **Orkotos Shield** | MythicMobs skill. Requires sneaking + blocking. |
| **Staff of Tenebris** | MythicMobs skill. |
| **Siren Cry** | MythicMobs skill. |
| **Kayless Ace** | Placed End Crystals explode with power 10 (massive AoE). |
| **Apocalypse Protection** | ?????? |

---

## Cooldown Reference

| Cooldown Type | Duration | Shared By |
|---------------|----------|-----------|
| Global Skill | 25s | All weapon skills, cloud spells, cone blast |
| Healthsteal | 6.5s | Healthsteal |
| Absorption on Hit | 15s | Absorption On High Damage |
| Heal on Block | 15s | Heal On Block |
| Explosion on Melee | 5s | Melee Explosion |
| Cloud Spells | 5s | Harming / Healing / Slow clouds |
| Chain Lightning | 2.5s | Chain Lightning |
| Dash Trinket | 12s | Dash Trinket |
| Paralyze | 30s | Paralyze Enemy |
| Lifeline Shield | 100s | Lifeline Shield |
| Warden Scream | 15s | Warden Scream |

---

## Damage Modifier Categories

Understanding how attributes stack:

**Additive (Increased):** Increased Damage, Increased Projectile Damage, Increased Melee Damage Per Missing Heart, Armor Penetration, Soul Stacks

**Multiplicative (More):** Backstab, Critical Damage, More Damage Against Full Life, Extra Damage Against Bosses, Execute Damage, Stacking Damage, Twinfire Dual Wield

**Additive Reduction (Reduced):** Reduced Damage Taken, Reduced Projectile Damage Taken, Deferred Damage

**Multiplicative Penalty (Less):** Berserker Rage extra damage taken
