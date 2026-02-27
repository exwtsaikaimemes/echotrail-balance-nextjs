import { z } from "zod";

export const loginSchema = z.object({
  username: z.string().min(2).max(32),
  password: z.string().min(4),
});

export const registerSchema = z.object({
  username: z.string().min(2).max(32),
  password: z.string().min(4),
});

export const itemBoundSchema = z.object({
  type: z.enum(["Double", "Int", "String"]),
  min: z.string(),
  max: z.string(),
});

export const itemAttributeSchema = z.object({
  category: z.enum(["Custom", "Vanilla"]),
  name: z.string(),
  bounds: z.array(itemBoundSchema),
  bypassBP: z.boolean().optional(),
});

export const itemEnchantmentSchema = z.object({
  name: z.string(),
  level: z.number().int().min(1),
});

export const itemSchema = z.object({
  itemKey: z.string().min(1).max(255),
  objectName: z.string().min(1).max(255),
  customName: z.string().min(1).max(255),
  equipment: z.string(),
  rarity: z.string(),
  usesBaseStats: z.boolean(),
  secretItem: z.boolean(),
  canDrop: z.boolean(),
  isOffHand: z.boolean(),
  isBothHands: z.boolean(),
  isTest: z.boolean(),
  customModelData: z.string().optional().default(""),
  equippableAssetId: z.string().optional().default(""),
  enchantments: z.array(itemEnchantmentSchema),
  attributes: z.array(itemAttributeSchema),
  source: z.string().optional().default("manual"),
});

export const balanceConfigSchema = z.object({
  formula: z.string().optional(),
  weights: z.record(z.string(), z.number()).optional(),
  allowances: z.record(z.string(), z.record(z.string(), z.number())).optional(),
  attributeDefs: z.record(z.string(), z.any()).optional(),
});

export const commentSchema = z.object({
  comment: z.string().min(1).max(1000),
});

export const formulaSchema = z.object({
  formula: z.enum(["weight_x_max", "weight_x_avg", "weight_x_range", "flat_weight"]),
});

export const weightsSchema = z.object({
  weights: z.record(z.string(), z.number()),
});

export const allowancesSchema = z.object({
  allowances: z.record(z.string(), z.record(z.string(), z.number())),
});

export const attributeDefsSchema = z.object({
  attributeDefs: z.record(z.string(), z.any()),
});

export const workspaceImportSchema = z.object({
  items: z.array(z.any()).optional(),
  balanceConfig: z.any().optional(),
});
