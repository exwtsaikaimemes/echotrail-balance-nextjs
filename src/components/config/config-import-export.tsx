"use client";

import { useRef, useState } from "react";
import { useUpdateBalance } from "@/hooks/use-balance";
import type { BalanceConfig } from "@/types/balance";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { Download, Upload, AlertTriangle } from "lucide-react";

interface ConfigImportExportProps {
  balanceConfig: BalanceConfig;
  isAdmin: boolean;
}

export function ConfigImportExport({ balanceConfig, isAdmin }: ConfigImportExportProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingImport, setPendingImport] = useState<BalanceConfig | null>(null);
  const [importFileName, setImportFileName] = useState("");

  const updateBalance = useUpdateBalance();

  function handleExport() {
    try {
      const json = JSON.stringify(balanceConfig, null, 2);
      const blob = new Blob([json], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `echotrail-balance-config-${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success("Balance configuration exported");
    } catch {
      toast.error("Failed to export configuration");
    }
  }

  function handleImportClick() {
    fileInputRef.current?.click();
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setImportFileName(file.name);

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const parsed = JSON.parse(text);

        // Basic validation
        if (!parsed || typeof parsed !== "object") {
          toast.error("Invalid JSON: expected an object");
          return;
        }

        const config = parsed as Partial<BalanceConfig>;

        // Validate presence of expected keys
        const hasWeights = config.weights && typeof config.weights === "object";
        const hasAllowances = config.allowances && typeof config.allowances === "object";
        const hasFormula = typeof config.formula === "string";
        const hasDefs = config.attributeDefs && typeof config.attributeDefs === "object";

        if (!hasWeights && !hasAllowances && !hasFormula && !hasDefs) {
          toast.error(
            "Invalid config: expected at least one of 'weights', 'allowances', 'formula', or 'attributeDefs'"
          );
          return;
        }

        // Build the full config for import, filling in current values for missing keys
        const fullConfig: BalanceConfig = {
          formula: hasFormula ? config.formula! : balanceConfig.formula,
          weights: hasWeights ? config.weights! : balanceConfig.weights,
          allowances: hasAllowances ? config.allowances! : balanceConfig.allowances,
          attributeDefs: hasDefs ? config.attributeDefs! : balanceConfig.attributeDefs,
        };

        setPendingImport(fullConfig);
        setConfirmOpen(true);
      } catch {
        toast.error("Failed to parse JSON file");
      }
    };
    reader.onerror = () => {
      toast.error("Failed to read file");
    };
    reader.readAsText(file);

    // Reset file input so the same file can be re-selected
    e.target.value = "";
  }

  function handleConfirmImport() {
    if (!pendingImport) return;

    updateBalance.mutate(pendingImport, {
      onSuccess: () => {
        toast.success("Balance configuration imported successfully");
        setConfirmOpen(false);
        setPendingImport(null);
      },
      onError: (err) => {
        toast.error(`Import failed: ${err.message}`);
      },
    });
  }

  function handleCancelImport() {
    setConfirmOpen(false);
    setPendingImport(null);
  }

  return (
    <>
      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm" onClick={handleExport} className="gap-1.5">
          <Download className="h-3.5 w-3.5" />
          Export
        </Button>
        {isAdmin && (
          <Button variant="outline" size="sm" onClick={handleImportClick} className="gap-1.5">
            <Upload className="h-3.5 w-3.5" />
            Import
          </Button>
        )}
        <input
          ref={fileInputRef}
          type="file"
          accept=".json,application/json"
          onChange={handleFileChange}
          className="hidden"
        />
      </div>

      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              Confirm Import
            </DialogTitle>
            <DialogDescription>
              You are about to replace the entire balance configuration with data from{" "}
              <strong>{importFileName}</strong>. This is a destructive operation that will
              overwrite all current weights, allowances, formula, and attribute definitions.
            </DialogDescription>
          </DialogHeader>

          {pendingImport && (
            <div className="rounded-md border bg-muted/30 p-3 text-xs space-y-1">
              <p>
                <span className="text-muted-foreground">Formula:</span>{" "}
                <span className="font-mono">{pendingImport.formula}</span>
              </p>
              <p>
                <span className="text-muted-foreground">Weights:</span>{" "}
                {Object.keys(pendingImport.weights).length} entries
              </p>
              <p>
                <span className="text-muted-foreground">Allowances:</span>{" "}
                {Object.keys(pendingImport.allowances).length} rarities
              </p>
              <p>
                <span className="text-muted-foreground">Attribute Defs:</span>{" "}
                {Object.keys(pendingImport.attributeDefs).length} definitions
              </p>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={handleCancelImport}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleConfirmImport}
              disabled={updateBalance.isPending}
            >
              {updateBalance.isPending ? "Importing..." : "Replace Configuration"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
