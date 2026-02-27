"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { useUpdateDefs } from "@/hooks/use-balance";
import { useDebounce } from "@/hooks/use-debounce";
import { getDefaultAttributeDefs } from "@/constants/balance-defaults";
import { ALL_ATTRIBUTES } from "@/constants/attributes";
import type { AttributeDefMap, AttributeDef, BoundDef } from "@/types/balance";
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
import { Search, RotateCcw, ChevronDown, ChevronRight, Save, Flag } from "lucide-react";

interface AttributeDefsTableProps {
  attributeDefs: AttributeDefMap;
  isAdmin: boolean;
}

type CategoryFilter = "all" | "Custom" | "Vanilla";

export function AttributeDefsTable({ attributeDefs, isAdmin }: AttributeDefsTableProps) {
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>("all");
  const [localDefs, setLocalDefs] = useState<AttributeDefMap>(
    JSON.parse(JSON.stringify(attributeDefs))
  );
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  const [pendingChanges, setPendingChanges] = useState<Set<string>>(new Set());
  const [resetOpen, setResetOpen] = useState(false);

  const debouncedSearch = useDebounce(search, 200);
  const updateDefs = useUpdateDefs();
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Sync from server when attributeDefs prop changes
  useEffect(() => {
    if (pendingChanges.size === 0) {
      setLocalDefs(JSON.parse(JSON.stringify(attributeDefs)));
    }
  }, [attributeDefs, pendingChanges.size]);

  const doSave = useCallback(
    (defsToSave: AttributeDefMap) => {
      updateDefs.mutate(defsToSave, {
        onSuccess: () => {
          setPendingChanges(new Set());
          toast.success("Attribute definitions saved");
        },
        onError: (err) => {
          toast.error(`Failed to save definitions: ${err.message}`);
        },
      });
    },
    [updateDefs]
  );

  const scheduleSave = useCallback(
    (newDefs: AttributeDefMap) => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
      saveTimerRef.current = setTimeout(() => {
        doSave(newDefs);
      }, 800);
    },
    [doSave]
  );

  const handleBoundChange = useCallback(
    (
      attrName: string,
      boundIndex: number,
      field: keyof BoundDef,
      value: string
    ) => {
      setLocalDefs((prev) => {
        const next = JSON.parse(JSON.stringify(prev)) as AttributeDefMap;
        const def = next[attrName];
        if (!def || !def.bounds[boundIndex]) return prev;

        if (field === "mult") {
          const num = parseFloat(value);
          if (isNaN(num) && value !== "" && value !== "-") return prev;
          def.bounds[boundIndex].mult = isNaN(num) ? 0 : num;
        } else if (field === "suffix" || field === "label") {
          (def.bounds[boundIndex] as any)[field] = value;
        }

        setPendingChanges((p) => {
          const s = new Set(p);
          s.add(attrName);
          return s;
        });

        scheduleSave(next);
        return next;
      });
    },
    [scheduleSave]
  );

  const toggleRow = useCallback((attrName: string) => {
    setExpandedRows((prev) => {
      const next = new Set(prev);
      if (next.has(attrName)) {
        next.delete(attrName);
      } else {
        next.add(attrName);
      }
      return next;
    });
  }, []);

  const handleResetToDefaults = useCallback(() => {
    const defaults = getDefaultAttributeDefs();
    setLocalDefs(defaults);
    setResetOpen(false);
    updateDefs.mutate(defaults, {
      onSuccess: () => {
        setPendingChanges(new Set());
        toast.success("Attribute definitions reset to defaults");
      },
      onError: (err) => {
        toast.error(`Failed to reset definitions: ${err.message}`);
      },
    });
  }, [updateDefs]);

  // Build the list of attribute names with their defs
  const allAttrNames = ALL_ATTRIBUTES.map((a) => a.name);
  // Also include any keys in localDefs not in ALL_ATTRIBUTES
  const defsOnlyNames = Object.keys(localDefs).filter(
    (k) => !allAttrNames.includes(k)
  );
  const allNames = [...allAttrNames, ...defsOnlyNames];

  const filteredNames = allNames.filter((name) => {
    const matchesSearch = name.toLowerCase().includes(debouncedSearch.toLowerCase());
    const def = localDefs[name];
    const category = def?.category ?? "Custom";
    const matchesCategory = categoryFilter === "all" || category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Attribute Definitions</CardTitle>
            <CardDescription>
              Each attribute&apos;s definition controls how values are displayed: multiplier,
              suffix, label, and bound structure. Click a row to expand bound details.
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
                    <DialogTitle>Reset all attribute definitions?</DialogTitle>
                    <DialogDescription>
                      This will overwrite all attribute definitions with the built-in defaults.
                      Any custom definitions will be lost. This action cannot be undone.
                    </DialogDescription>
                  </DialogHeader>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setResetOpen(false)}>
                      Cancel
                    </Button>
                    <Button variant="destructive" onClick={handleResetToDefaults}>
                      Reset All Definitions
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search attributes..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <div className="flex items-center gap-1">
            {(["all", "Custom", "Vanilla"] as CategoryFilter[]).map((cat) => (
              <Button
                key={cat}
                variant={categoryFilter === cat ? "default" : "outline"}
                size="sm"
                onClick={() => setCategoryFilter(cat)}
                className="text-xs"
              >
                {cat === "all" ? "All" : cat}
              </Button>
            ))}
          </div>
        </div>

        <div className="rounded-md border max-h-[600px] overflow-auto">
          <Table>
            <TableHeader className="sticky top-0 bg-card z-10">
              <TableRow>
                <TableHead className="w-8"></TableHead>
                <TableHead className="w-[280px]">Attribute</TableHead>
                <TableHead className="w-[90px]">Category</TableHead>
                <TableHead className="w-[70px]">Bounds</TableHead>
                <TableHead className="w-[60px]">Flag</TableHead>
                <TableHead>Bound Summary</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredNames.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                    No attribute definitions found matching your filters.
                  </TableCell>
                </TableRow>
              ) : (
                filteredNames.map((attrName) => {
                  const def: AttributeDef | undefined = localDefs[attrName];
                  const isExpanded = expandedRows.has(attrName);
                  const isPending = pendingChanges.has(attrName);
                  const bounds = def?.bounds ?? [];

                  return (
                    <TableRow
                      key={attrName}
                      className={cn("group", isPending && "bg-muted/30")}
                    >
                      <TableCell colSpan={6} className="p-0">
                        {/* Main row */}
                        <button
                          type="button"
                          onClick={() => toggleRow(attrName)}
                          className="flex items-center w-full px-4 py-3 text-left hover:bg-muted/50 transition-colors"
                        >
                          <div className="w-8 shrink-0">
                            {isExpanded ? (
                              <ChevronDown className="h-4 w-4 text-muted-foreground" />
                            ) : (
                              <ChevronRight className="h-4 w-4 text-muted-foreground" />
                            )}
                          </div>
                          <div className="w-[280px] shrink-0 font-mono text-xs">
                            {attrName}
                          </div>
                          <div className="w-[90px] shrink-0">
                            {def ? (
                              <Badge
                                variant={def.category === "Custom" ? "default" : "secondary"}
                                className="text-xs"
                              >
                                {def.category}
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="text-xs">
                                N/A
                              </Badge>
                            )}
                          </div>
                          <div className="w-[70px] shrink-0 text-sm text-muted-foreground text-center">
                            {bounds.length}
                          </div>
                          <div className="w-[60px] shrink-0 text-center">
                            {def?.isFlag && (
                              <Flag className="h-3.5 w-3.5 text-orange-400 inline-block" />
                            )}
                          </div>
                          <div className="flex-1 text-xs text-muted-foreground truncate">
                            {bounds
                              .map(
                                (b) =>
                                  `${b.label} (${b.type}, x${b.mult}${b.suffix ? ", " + b.suffix : ""})`
                              )
                              .join(" | ")}
                          </div>
                        </button>

                        {/* Expanded bound details */}
                        {isExpanded && bounds.length > 0 && (
                          <div className="border-t bg-muted/20 px-4 py-3 ml-8">
                            <div className="space-y-3">
                              {bounds.map((bound, idx) => (
                                <div
                                  key={idx}
                                  className="flex items-center gap-3 rounded-md border bg-card p-3"
                                >
                                  <Badge variant="outline" className="text-xs shrink-0">
                                    Bound {idx + 1}
                                  </Badge>
                                  <Badge variant="secondary" className="text-xs shrink-0">
                                    {bound.type}
                                  </Badge>

                                  <div className="flex items-center gap-1.5">
                                    <label className="text-xs text-muted-foreground shrink-0">
                                      Label
                                    </label>
                                    <Input
                                      value={bound.label}
                                      onChange={(e) =>
                                        handleBoundChange(attrName, idx, "label", e.target.value)
                                      }
                                      className="h-7 w-40 text-xs"
                                    />
                                  </div>

                                  <div className="flex items-center gap-1.5">
                                    <label className="text-xs text-muted-foreground shrink-0">
                                      Mult
                                    </label>
                                    <Input
                                      type="number"
                                      step="1"
                                      value={bound.mult}
                                      onChange={(e) =>
                                        handleBoundChange(attrName, idx, "mult", e.target.value)
                                      }
                                      className="h-7 w-20 text-xs text-right font-mono"
                                    />
                                  </div>

                                  <div className="flex items-center gap-1.5">
                                    <label className="text-xs text-muted-foreground shrink-0">
                                      Suffix
                                    </label>
                                    <Input
                                      value={bound.suffix}
                                      onChange={(e) =>
                                        handleBoundChange(attrName, idx, "suffix", e.target.value)
                                      }
                                      className="h-7 w-20 text-xs"
                                      placeholder="e.g. %"
                                    />
                                  </div>

                                  {bound.options && bound.options.length > 0 && (
                                    <div className="flex items-center gap-1.5">
                                      <label className="text-xs text-muted-foreground shrink-0">
                                        Options
                                      </label>
                                      <span className="text-xs text-muted-foreground">
                                        {bound.options.join(", ")}
                                      </span>
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {isExpanded && bounds.length === 0 && (
                          <div className="border-t bg-muted/20 px-4 py-3 ml-8">
                            <p className="text-xs text-muted-foreground">
                              No definition found for this attribute.
                            </p>
                          </div>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>

        <p className="text-xs text-muted-foreground">
          Showing {filteredNames.length} of {allNames.length} attributes.
          Click a row to expand and edit bound details. Changes auto-save after 800ms.
        </p>
      </CardContent>
    </Card>
  );
}
