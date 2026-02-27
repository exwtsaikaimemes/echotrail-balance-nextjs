"use client";

import { useState } from "react";
import { useUpdateFormula } from "@/hooks/use-balance";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { Calculator, ArrowRight } from "lucide-react";

interface FormulaSelectorProps {
  formula: string;
}

interface FormulaOption {
  value: string;
  label: string;
  description: string;
  equation: string;
}

const FORMULAS: FormulaOption[] = [
  {
    value: "flat",
    label: "Flat",
    description:
      "Simple linear cost. Each point of an attribute costs exactly its weight. Predictable and easy to reason about.",
    equation: "cost = weight x value",
  },
  {
    value: "scaled",
    label: "Scaled",
    description:
      "Quadratic cost scaling. Higher attribute values become disproportionately expensive, discouraging stacking a single attribute.",
    equation: "cost = weight x value^2",
  },
  {
    value: "linear",
    label: "Linear",
    description:
      "Identical to flat formula. Each point of an attribute costs exactly its weight. Provided as an explicit alias.",
    equation: "cost = weight x value",
  },
];

export function FormulaSelector({ formula }: FormulaSelectorProps) {
  const [selectedFormula, setSelectedFormula] = useState(formula);
  const updateFormula = useUpdateFormula();

  const currentFormulaInfo = FORMULAS.find((f) => f.value === selectedFormula) ?? FORMULAS[0];

  function handleFormulaChange(value: string) {
    setSelectedFormula(value);
    updateFormula.mutate(value, {
      onSuccess: () => {
        toast.success(`Formula changed to "${value}"`);
      },
      onError: (err) => {
        setSelectedFormula(formula); // revert on error
        toast.error(`Failed to update formula: ${err.message}`);
      },
    });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Cost Formula</CardTitle>
        <CardDescription>
          The formula determines how attribute values translate into budget cost.
          Changing the formula affects all items&apos; budget calculations.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center gap-4">
          <label className="text-sm font-medium shrink-0">Active Formula</label>
          <Select
            value={selectedFormula}
            onValueChange={handleFormulaChange}
            disabled={updateFormula.isPending}
          >
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Select formula" />
            </SelectTrigger>
            <SelectContent>
              {FORMULAS.map((f) => (
                <SelectItem key={f.value} value={f.value}>
                  {f.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {updateFormula.isPending && (
            <span className="text-xs text-muted-foreground">Saving...</span>
          )}
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {FORMULAS.map((f) => {
            const isActive = f.value === selectedFormula;
            return (
              <button
                key={f.value}
                type="button"
                onClick={() => handleFormulaChange(f.value)}
                disabled={updateFormula.isPending}
                className={cn(
                  "relative rounded-lg border p-4 text-left transition-all hover:border-primary/50 hover:shadow-sm",
                  isActive
                    ? "border-primary bg-primary/5 ring-1 ring-primary/20"
                    : "border-border"
                )}
              >
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-sm">{f.label}</h3>
                  {isActive && (
                    <Badge variant="default" className="text-xs">
                      Active
                    </Badge>
                  )}
                </div>

                <div className="flex items-center gap-2 mb-3 rounded-md bg-muted/50 px-3 py-2">
                  <Calculator className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                  <code className="text-xs font-mono text-foreground">{f.equation}</code>
                </div>

                <p className="text-xs text-muted-foreground leading-relaxed">
                  {f.description}
                </p>
              </button>
            );
          })}
        </div>

        <div className="rounded-lg border bg-muted/30 p-4">
          <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
            <ArrowRight className="h-4 w-4 text-muted-foreground" />
            How it works
          </h4>
          <p className="text-xs text-muted-foreground leading-relaxed">
            When an item&apos;s attributes are evaluated, each attribute&apos;s budget cost is
            computed using the selected formula. The total cost across all attributes must
            fit within the item&apos;s budget allowance (determined by its rarity and equipment class).
            For example, with the <strong>{currentFormulaInfo.label}</strong> formula:{" "}
            <code className="text-xs font-mono bg-muted px-1 py-0.5 rounded">
              {currentFormulaInfo.equation}
            </code>
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
