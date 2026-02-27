"use client";

import { useState, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useImportWorkspace } from "@/hooks/use-items";
import { toast } from "sonner";
import { Upload, FileJson } from "lucide-react";
import { cn } from "@/lib/utils";

interface ImportJSONDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type InputMode = "file" | "paste";

export function ImportJSONDialog({
  open,
  onOpenChange,
}: ImportJSONDialogProps) {
  const [mode, setMode] = useState<InputMode>("file");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [jsonText, setJsonText] = useState("");
  const [parseError, setParseError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const importWorkspace = useImportWorkspace();

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setParseError(null);
    }
  }

  function handleTextChange(value: string) {
    setJsonText(value);
    setParseError(null);
  }

  async function handleImport() {
    let data: { items?: any[]; balanceConfig?: any };

    try {
      if (mode === "file") {
        if (!selectedFile) return;
        const text = await selectedFile.text();
        data = JSON.parse(text);
      } else {
        if (!jsonText.trim()) return;
        data = JSON.parse(jsonText);
      }
    } catch {
      setParseError("Invalid JSON format. Please check the content and try again.");
      return;
    }

    if (!data.items && !data.balanceConfig) {
      setParseError(
        'JSON must contain an "items" array and/or a "balanceConfig" object.'
      );
      return;
    }

    try {
      const result = await importWorkspace.mutateAsync(data);
      const imported = result.imported ?? 0;
      const parts: string[] = [];
      if (data.items) parts.push(`${imported} items`);
      if (data.balanceConfig) parts.push("balance config");
      toast.success(`Imported ${parts.join(" and ")} successfully.`);
      handleClose();
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to import JSON workspace."
      );
    }
  }

  function handleClose() {
    setSelectedFile(null);
    setJsonText("");
    setParseError(null);
    setMode("file");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    onOpenChange(false);
  }

  const canImport =
    mode === "file" ? !!selectedFile : jsonText.trim().length > 0;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Import JSON Workspace</DialogTitle>
          <DialogDescription>
            Import a JSON workspace export containing items and/or balance
            configuration. Upload a file or paste JSON content directly.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Mode toggle */}
          <div className="flex gap-1 p-1 bg-muted rounded-lg">
            <button
              type="button"
              className={cn(
                "flex-1 px-3 py-1.5 rounded-md text-sm font-medium transition-colors",
                mode === "file"
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
              onClick={() => setMode("file")}
            >
              Upload File
            </button>
            <button
              type="button"
              className={cn(
                "flex-1 px-3 py-1.5 rounded-md text-sm font-medium transition-colors",
                mode === "paste"
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
              onClick={() => setMode("paste")}
            >
              Paste JSON
            </button>
          </div>

          {mode === "file" ? (
            <>
              <div
                className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/25 p-8 cursor-pointer hover:border-muted-foreground/50 transition-colors"
                onClick={() => fileInputRef.current?.click()}
              >
                {selectedFile ? (
                  <div className="flex items-center gap-3">
                    <FileJson className="h-8 w-8 text-blue-500" />
                    <div>
                      <p className="text-sm font-medium">
                        {selectedFile.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {(selectedFile.size / 1024).toFixed(1)} KB
                      </p>
                    </div>
                  </div>
                ) : (
                  <>
                    <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                    <p className="text-sm text-muted-foreground">
                      Click to select a JSON file
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      .json files only
                    </p>
                  </>
                )}
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                onChange={handleFileChange}
                className="hidden"
              />
            </>
          ) : (
            <Textarea
              placeholder='{"items": [...], "balanceConfig": {...}}'
              value={jsonText}
              onChange={(e) => handleTextChange(e.target.value)}
              rows={10}
              className="font-mono text-xs"
            />
          )}

          {parseError && (
            <div className="text-sm text-red-400 bg-red-950/30 border border-red-900/50 rounded-md p-3">
              {parseError}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button
            onClick={handleImport}
            disabled={!canImport || importWorkspace.isPending}
          >
            {importWorkspace.isPending ? "Importing..." : "Import"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
