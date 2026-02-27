"use client";

import { useState } from "react";
import {
  useFormulas,
  useUpdateFormula,
  useCreateFormula,
  useUpdateFormulaEntry,
  useDeleteFormula,
} from "@/hooks/use-balance";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import type { BudgetFormula } from "@/types/balance";
import {
  Calculator,
  ArrowRight,
  Plus,
  Pencil,
  Trash2,
  Loader2,
} from "lucide-react";

interface FormulaSelectorProps {
  formula: string;
}

const VARIABLE_CHIPS = [
  { name: "weight", desc: "Attribute weight" },
  { name: "min", desc: "Min bound" },
  { name: "max", desc: "Max bound" },
  { name: "avg", desc: "(min+max)/2" },
  { name: "range", desc: "max-min" },
  { name: "value", desc: "Alias for max" },
];

function FormulaDialog({
  open,
  onOpenChange,
  editFormula,
  onSubmit,
  isPending,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editFormula?: BudgetFormula;
  onSubmit: (data: { name: string; expression: string; description?: string }) => void;
  isPending: boolean;
}) {
  const [name, setName] = useState(editFormula?.name ?? "");
  const [expression, setExpression] = useState(editFormula?.expression ?? "");
  const [description, setDescription] = useState(editFormula?.description ?? "");

  function handleOpen(isOpen: boolean) {
    if (isOpen) {
      setName(editFormula?.name ?? "");
      setExpression(editFormula?.expression ?? "");
      setDescription(editFormula?.description ?? "");
    }
    onOpenChange(isOpen);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !expression.trim()) return;
    onSubmit({ name: name.trim(), expression: expression.trim(), description: description.trim() || undefined });
  }

  return (
    <Dialog open={open} onOpenChange={handleOpen}>
      <DialogContent>
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>{editFormula ? "Edit Formula" : "New Formula"}</DialogTitle>
            <DialogDescription>
              Define a cost formula using variables and math operators.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="formula-name">Name</Label>
              <Input
                id="formula-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Quadratic"
                maxLength={64}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="formula-expression">Expression</Label>
              <Input
                id="formula-expression"
                value={expression}
                onChange={(e) => setExpression(e.target.value)}
                placeholder="e.g. weight * max ^ 2"
                maxLength={255}
                className="font-mono"
              />
              <div className="flex flex-wrap gap-1.5 mt-1.5">
                {VARIABLE_CHIPS.map((v) => (
                  <button
                    key={v.name}
                    type="button"
                    className="inline-flex items-center rounded-md bg-muted px-2 py-0.5 text-xs font-mono hover:bg-muted/80 transition-colors"
                    onClick={() => setExpression((prev) => prev + (prev && !prev.endsWith(" ") ? " " : "") + v.name)}
                    title={v.desc}
                  >
                    {v.name}
                  </button>
                ))}
              </div>
              <p className="text-xs text-muted-foreground">
                Operators: +, -, *, /, ^ (power), parentheses
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="formula-description">Description (optional)</Label>
              <Textarea
                id="formula-description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="What does this formula do?"
                rows={2}
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" disabled={isPending || !name.trim() || !expression.trim()}>
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {editFormula ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function FormulaSelector({ formula: activeFormulaName }: FormulaSelectorProps) {
  const { data: formulas, isLoading } = useFormulas();
  const updateFormula = useUpdateFormula();
  const createFormula = useCreateFormula();
  const updateFormulaEntry = useUpdateFormulaEntry();
  const deleteFormula = useDeleteFormula();

  const [createOpen, setCreateOpen] = useState(false);
  const [editingFormula, setEditingFormula] = useState<BudgetFormula | null>(null);

  function handleActivate(name: string) {
    if (name === activeFormulaName) return;
    updateFormula.mutate(name, {
      onSuccess: () => toast.success(`Formula changed to "${name}"`),
      onError: (err) => toast.error(`Failed to update formula: ${err.message}`),
    });
  }

  function handleCreate(data: { name: string; expression: string; description?: string }) {
    createFormula.mutate(data, {
      onSuccess: () => {
        toast.success(`Formula "${data.name}" created`);
        setCreateOpen(false);
      },
      onError: (err) => toast.error(err.message),
    });
  }

  function handleUpdate(data: { name: string; expression: string; description?: string }) {
    if (!editingFormula) return;
    updateFormulaEntry.mutate({ id: editingFormula.id, ...data }, {
      onSuccess: () => {
        toast.success(`Formula "${data.name}" updated`);
        setEditingFormula(null);
      },
      onError: (err) => toast.error(err.message),
    });
  }

  function handleDelete(f: BudgetFormula) {
    if (f.name === activeFormulaName) {
      toast.error("Cannot delete the active formula. Switch to a different formula first.");
      return;
    }
    deleteFormula.mutate(f.id, {
      onSuccess: () => toast.success(`Formula "${f.name}" deleted`),
      onError: (err) => toast.error(err.message),
    });
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Cost Formula</CardTitle>
            <CardDescription>
              The formula determines how attribute values translate into budget cost.
              Changing the formula affects all items&apos; budget calculations.
            </CardDescription>
          </div>
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() => setCreateOpen(true)}
          >
            <Plus className="mr-1 h-4 w-4" />
            New Formula
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {isLoading ? (
          <div className="text-sm text-muted-foreground">Loading formulas...</div>
        ) : !formulas || formulas.length === 0 ? (
          <div className="text-sm text-muted-foreground">No formulas defined yet.</div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {formulas.map((f) => {
              const isActive = f.name === activeFormulaName;
              return (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => handleActivate(f.name)}
                  disabled={updateFormula.isPending}
                  className={cn(
                    "relative rounded-lg border p-4 text-left transition-all hover:border-primary/50 hover:shadow-sm",
                    isActive
                      ? "border-primary bg-primary/5 ring-1 ring-primary/20"
                      : "border-border"
                  )}
                >
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-sm">{f.name}</h3>
                    <div className="flex items-center gap-1">
                      {isActive && (
                        <Badge variant="default" className="text-xs">
                          Active
                        </Badge>
                      )}
                      <span
                        role="button"
                        className="p-1 rounded hover:bg-muted transition-colors"
                        onClick={(e) => { e.stopPropagation(); setEditingFormula(f); }}
                        title="Edit"
                      >
                        <Pencil className="h-3 w-3 text-muted-foreground" />
                      </span>
                      {!isActive && (
                        <span
                          role="button"
                          className="p-1 rounded hover:bg-destructive/10 transition-colors"
                          onClick={(e) => { e.stopPropagation(); handleDelete(f); }}
                          title="Delete"
                        >
                          <Trash2 className="h-3 w-3 text-muted-foreground" />
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 mb-3 rounded-md bg-muted/50 px-3 py-2">
                    <Calculator className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                    <code className="text-xs font-mono text-foreground">{f.expression}</code>
                  </div>

                  {f.description && (
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {f.description}
                    </p>
                  )}
                </button>
              );
            })}
          </div>
        )}

        <div className="rounded-lg border bg-muted/30 p-4">
          <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
            <ArrowRight className="h-4 w-4 text-muted-foreground" />
            How it works
          </h4>
          <p className="text-xs text-muted-foreground leading-relaxed">
            When an item&apos;s attributes are evaluated, each attribute&apos;s budget cost is
            computed using the active formula&apos;s expression. The total cost across all attributes must
            fit within the item&apos;s budget allowance (determined by its rarity and equipment class).
            Available variables: <code className="text-xs font-mono bg-muted px-1 py-0.5 rounded">weight</code>,{" "}
            <code className="text-xs font-mono bg-muted px-1 py-0.5 rounded">min</code>,{" "}
            <code className="text-xs font-mono bg-muted px-1 py-0.5 rounded">max</code>,{" "}
            <code className="text-xs font-mono bg-muted px-1 py-0.5 rounded">avg</code>,{" "}
            <code className="text-xs font-mono bg-muted px-1 py-0.5 rounded">range</code>,{" "}
            <code className="text-xs font-mono bg-muted px-1 py-0.5 rounded">value</code>.
          </p>
        </div>

        {/* Create dialog */}
        <FormulaDialog
          open={createOpen}
          onOpenChange={setCreateOpen}
          onSubmit={handleCreate}
          isPending={createFormula.isPending}
        />

        {/* Edit dialog */}
        <FormulaDialog
          open={!!editingFormula}
          onOpenChange={(open) => { if (!open) setEditingFormula(null); }}
          editFormula={editingFormula ?? undefined}
          onSubmit={handleUpdate}
          isPending={updateFormulaEntry.isPending}
        />
      </CardContent>
    </Card>
  );
}
