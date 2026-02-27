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
import { useImportCSV } from "@/hooks/use-items";
import { toast } from "sonner";
import { Upload, FileSpreadsheet } from "lucide-react";

interface ImportCSVDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ImportCSVDialog({ open, onOpenChange }: ImportCSVDialogProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const importCSV = useImportCSV();

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  }

  async function handleImport() {
    if (!selectedFile) return;

    try {
      const result = await importCSV.mutateAsync(selectedFile);
      toast.success(
        `Imported ${result.imported ?? "all"} items from CSV successfully.`
      );
      handleClose();
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to import CSV file."
      );
    }
  }

  function handleClose() {
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Import CSV</DialogTitle>
          <DialogDescription>
            Upload a CSV file to import items. The CSV should follow the
            EchoTrail item export format. Existing items with matching keys will
            be updated.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div
            className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/25 p-8 cursor-pointer hover:border-muted-foreground/50 transition-colors"
            onClick={() => fileInputRef.current?.click()}
          >
            {selectedFile ? (
              <div className="flex items-center gap-3">
                <FileSpreadsheet className="h-8 w-8 text-green-500" />
                <div>
                  <p className="text-sm font-medium">{selectedFile.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {(selectedFile.size / 1024).toFixed(1)} KB
                  </p>
                </div>
              </div>
            ) : (
              <>
                <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground">
                  Click to select a CSV file
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  .csv files only
                </p>
              </>
            )}
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept=".csv"
            onChange={handleFileChange}
            className="hidden"
          />
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button
            onClick={handleImport}
            disabled={!selectedFile || importCSV.isPending}
          >
            {importCSV.isPending ? "Importing..." : "Import"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
