"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { useUpdateWeights } from "@/hooks/use-balance";
import { useDebounce } from "@/hooks/use-debounce";
import { getDefaultWeights } from "@/constants/balance-defaults";
import { ALL_ATTRIBUTES } from "@/constants/attributes";
import type { WeightMap } from "@/types/balance";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { Search, RotateCcw, Save } from "lucide-react";

interface WeightsTableProps {
  weights: WeightMap;
  isAdmin: boolean;
}

export function WeightsTable({ weights, isAdmin }: WeightsTableProps) {
  const [search, setSearch] = useState("");
  const [localWeights, setLocalWeights] = useState<WeightMap>({ ...weights });
  const [pendingChanges, setPendingChanges] = useState<Set<string>>(new Set());
  const [resetOpen, setResetOpen] = useState(false);

  const debouncedSearch = useDebounce(search, 200);
  const updateWeights = useUpdateWeights();

  // Track if we need to auto-save
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Sync from server when weights prop changes (after mutation success)
  useEffect(() => {
    if (pendingChanges.size === 0) {
      setLocalWeights({ ...weights });
    }
  }, [weights, pendingChanges.size]);

  const doSave = useCallback(
    (weightsToSave: WeightMap) => {
      updateWeights.mutate(weightsToSave, {
        onSuccess: () => {
          setPendingChanges(new Set());
          toast.success("Weights saved");
        },
        onError: (err) => {
          toast.error(`Failed to save weights: ${err.message}`);
        },
      });
    },
    [updateWeights]
  );

  const handleWeightChange = useCallback(
    (attrName: string, value: string) => {
      const num = parseFloat(value);
      if (isNaN(num) && value !== "" && value !== "-") return;

      const newWeights = { ...localWeights };
      newWeights[attrName] = isNaN(num) ? 0 : num;
      setLocalWeights(newWeights);

      setPendingChanges((prev) => {
        const next = new Set(prev);
        next.add(attrName);
        return next;
      });

      // Debounced auto-save
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
      saveTimerRef.current = setTimeout(() => {
        doSave(newWeights);
      }, 800);
    },
    [localWeights, doSave]
  );

  const handleResetToDefaults = useCallback(() => {
    const defaults = getDefaultWeights();
    setLocalWeights(defaults);
    setResetOpen(false);
    updateWeights.mutate(defaults, {
      onSuccess: () => {
        setPendingChanges(new Set());
        toast.success("Weights reset to defaults");
      },
      onError: (err) => {
        toast.error(`Failed to reset weights: ${err.message}`);
      },
    });
  }, [updateWeights]);

  const filteredAttributes = ALL_ATTRIBUTES.filter((attr) =>
    attr.name.toLowerCase().includes(debouncedSearch.toLowerCase())
  );

  const defaultWeights = getDefaultWeights();

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Attribute Weights</CardTitle>
            <CardDescription>
              Each attribute&apos;s weight determines how much budget it consumes.
              Higher weight means more expensive per point.
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            {pendingChanges.size > 0 && (
              <Badge variant="secondary" className="gap-1">
                <Save className="h-3 w-3" />
                {pendingChanges.size} unsaved
              </Badge>
            )}
            {isAdmin && (
              <Dialog open={resetOpen} onOpenChange={setResetOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm" className="gap-1.5">
                    <RotateCcw className="h-3.5 w-3.5" />
                    Reset to Defaults
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Reset all weights?</DialogTitle>
                    <DialogDescription>
                      This will overwrite all weight values with the built-in defaults.
                      Any custom weights you have set will be lost. This action cannot be undone.
                    </DialogDescription>
                  </DialogHeader>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setResetOpen(false)}>
                      Cancel
                    </Button>
                    <Button variant="destructive" onClick={handleResetToDefaults}>
                      Reset All Weights
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search attributes..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 max-w-sm"
          />
        </div>

        <div className="rounded-md border max-h-[600px] overflow-auto">
          <Table>
            <TableHeader className="sticky top-0 bg-card z-10">
              <TableRow>
                <TableHead className="w-[350px]">Attribute</TableHead>
                <TableHead className="w-[100px]">Category</TableHead>
                <TableHead className="w-[140px]">Weight</TableHead>
                <TableHead className="w-[100px]">Default</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAttributes.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                    No attributes found matching &quot;{debouncedSearch}&quot;
                  </TableCell>
                </TableRow>
              ) : (
                filteredAttributes.map((attr) => {
                  const currentWeight = localWeights[attr.name] ?? 0;
                  const defaultWeight = defaultWeights[attr.name] ?? 1;
                  const isModified = currentWeight !== defaultWeight;
                  const isPending = pendingChanges.has(attr.name);

                  return (
                    <TableRow
                      key={attr.name}
                      className={cn(isPending && "bg-muted/30")}
                    >
                      <TableCell className="font-mono text-xs">
                        {attr.name}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={attr.category === "Custom" ? "default" : "secondary"}
                          className="text-xs"
                        >
                          {attr.category}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          step="0.1"
                          min="0"
                          value={currentWeight}
                          onChange={(e) => handleWeightChange(attr.name, e.target.value)}
                          className={cn(
                            "h-8 w-24 text-right font-mono",
                            isModified && "border-yellow-500/50"
                          )}
                        />
                      </TableCell>
                      <TableCell
                        className={cn(
                          "text-xs font-mono text-muted-foreground",
                          isModified && "text-yellow-500"
                        )}
                      >
                        {defaultWeight.toFixed(1)}
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>

        <p className="text-xs text-muted-foreground">
          Showing {filteredAttributes.length} of {ALL_ATTRIBUTES.length} attributes.
          Changes auto-save after 800ms of inactivity.
        </p>
      </CardContent>
    </Card>
  );
}
