"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { useUpdateAllowances } from "@/hooks/use-balance";
import { getDefaultAllowances } from "@/constants/balance-defaults";
import { RARITIES, RARITY_COLORS } from "@/constants/rarities";
import { EQUIP_CLASSES } from "@/constants/equipment";
import type { AllowanceMap } from "@/types/balance";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { RotateCcw, Save } from "lucide-react";

interface AllowancesGridProps {
  allowances: AllowanceMap;
  isAdmin: boolean;
}

export function AllowancesGrid({ allowances, isAdmin }: AllowancesGridProps) {
  const [localAllowances, setLocalAllowances] = useState<AllowanceMap>(
    JSON.parse(JSON.stringify(allowances))
  );
  const [pendingCount, setPendingCount] = useState(0);
  const [resetOpen, setResetOpen] = useState(false);

  const updateAllowances = useUpdateAllowances();
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Sync from server when allowances prop changes
  useEffect(() => {
    if (pendingCount === 0) {
      setLocalAllowances(JSON.parse(JSON.stringify(allowances)));
    }
  }, [allowances, pendingCount]);

  const doSave = useCallback(
    (toSave: AllowanceMap) => {
      updateAllowances.mutate(toSave, {
        onSuccess: () => {
          setPendingCount(0);
          toast.success("Allowances saved");
        },
        onError: (err) => {
          toast.error(`Failed to save allowances: ${err.message}`);
        },
      });
    },
    [updateAllowances]
  );

  const handleCellChange = useCallback(
    (rarity: string, equipClass: string, value: string) => {
      const num = parseInt(value, 10);
      if (isNaN(num) && value !== "" && value !== "-") return;

      setLocalAllowances((prev) => {
        const next = JSON.parse(JSON.stringify(prev)) as AllowanceMap;
        if (!next[rarity]) next[rarity] = {};
        next[rarity][equipClass] = isNaN(num) ? 0 : num;

        // Debounced auto-save
        if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
        saveTimerRef.current = setTimeout(() => {
          doSave(next);
        }, 800);

        return next;
      });

      setPendingCount((c) => c + 1);
    },
    [doSave]
  );

  const handleResetToDefaults = useCallback(() => {
    const defaults = getDefaultAllowances();
    setLocalAllowances(defaults);
    setResetOpen(false);
    updateAllowances.mutate(defaults, {
      onSuccess: () => {
        setPendingCount(0);
        toast.success("Allowances reset to defaults");
      },
      onError: (err) => {
        toast.error(`Failed to reset allowances: ${err.message}`);
      },
    });
  }, [updateAllowances]);

  const defaultAllowances = getDefaultAllowances();

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Budget Allowances</CardTitle>
            <CardDescription>
              Maximum budget points allowed per rarity and equipment class combination.
              Higher values let items have more or stronger attributes.
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            {pendingCount > 0 && (
              <Badge variant="secondary" className="gap-1">
                <Save className="h-3 w-3" />
                Saving...
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
                    <DialogTitle>Reset all allowances?</DialogTitle>
                    <DialogDescription>
                      This will overwrite the entire allowance grid with built-in defaults.
                      All custom allowance values will be lost. This action cannot be undone.
                    </DialogDescription>
                  </DialogHeader>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setResetOpen(false)}>
                      Cancel
                    </Button>
                    <Button variant="destructive" onClick={handleResetToDefaults}>
                      Reset All Allowances
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <ScrollArea className="w-full">
          <div className="rounded-md border min-w-[900px]">
            <table className="w-full caption-bottom text-sm">
              <thead>
                <tr className="border-b">
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground sticky left-0 bg-card z-10 min-w-[120px]">
                    Rarity
                  </th>
                  {EQUIP_CLASSES.map((ec) => (
                    <th
                      key={ec}
                      className="h-12 px-2 text-center align-middle font-medium text-muted-foreground min-w-[80px]"
                    >
                      {ec}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {RARITIES.map((rarity) => {
                  const color = RARITY_COLORS[rarity.name];
                  return (
                    <tr key={rarity.name} className="border-b transition-colors hover:bg-muted/50">
                      <td
                        className="p-4 align-middle font-semibold text-sm sticky left-0 bg-card z-10"
                        style={{ color }}
                      >
                        {rarity.name.charAt(0) + rarity.name.slice(1).toLowerCase()}
                      </td>
                      {EQUIP_CLASSES.map((ec) => {
                        const current = localAllowances[rarity.name]?.[ec] ?? 0;
                        const defaultVal = defaultAllowances[rarity.name]?.[ec] ?? 0;
                        const isModified = current !== defaultVal;

                        return (
                          <td key={ec} className="p-1 align-middle text-center">
                            <Input
                              type="number"
                              step="1"
                              min="0"
                              value={current}
                              onChange={(e) =>
                                handleCellChange(rarity.name, ec, e.target.value)
                              }
                              className={cn(
                                "h-8 w-[70px] text-center font-mono text-xs mx-auto",
                                isModified && "border-yellow-500/50"
                              )}
                            />
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>

        <p className="text-xs text-muted-foreground mt-4">
          {RARITIES.length} rarities across {EQUIP_CLASSES.length} equipment classes.
          Yellow borders indicate values that differ from defaults.
          Changes auto-save after 800ms of inactivity.
        </p>
      </CardContent>
    </Card>
  );
}
