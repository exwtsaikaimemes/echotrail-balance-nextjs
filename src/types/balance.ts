export interface BoundDef {
  type: "Double" | "Int" | "String";
  label: string;
  mult: number;
  suffix: string;
  options?: string[];
}

export interface AttributeDef {
  category: "Custom" | "Vanilla";
  bounds: BoundDef[];
  isFlag: boolean;
}

export type WeightMap = Record<string, number>;
export type AllowanceMap = Record<string, Record<string, number>>;
export type AttributeDefMap = Record<string, AttributeDef>;

export interface BalanceConfig {
  formula: string;
  weights: WeightMap;
  allowances: AllowanceMap;
  attributeDefs: AttributeDefMap;
}
