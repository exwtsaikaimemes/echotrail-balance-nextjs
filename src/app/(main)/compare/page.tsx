"use client";

import { Suspense, useState, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { CompareColumn } from "@/components/compare/compare-column";
import { ItemPicker } from "@/components/compare/item-picker";
import { Button } from "@/components/ui/button";
import { ArrowRightLeft } from "lucide-react";

function CompareContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const keyA = searchParams.get("a") || null;
  const keyB = searchParams.get("b") || null;

  const isComparing = !!keyA && !!keyB;

  /* ── Staged picker state for selection mode ─────────────────── */
  const [stagedA, setStagedA] = useState<string | null>(keyA);
  const [stagedB, setStagedB] = useState<string | null>(keyB);

  const updateParams = useCallback(
    (side: "a" | "b", value: string | null) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value) {
        params.set(side, value);
      } else {
        params.delete(side);
      }
      router.replace(`/compare?${params.toString()}`);
    },
    [router, searchParams]
  );

  const handleCompare = useCallback(() => {
    if (!stagedA || !stagedB) return;
    router.push(`/compare?a=${encodeURIComponent(stagedA)}&b=${encodeURIComponent(stagedB)}`);
  }, [stagedA, stagedB, router]);

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Compare Items</h1>
        <p className="text-sm text-muted-foreground">
          Side-by-side item comparison and editing
        </p>
      </div>

      {isComparing ? (
        /* ── Comparison mode: side-by-side columns ────────────── */
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <CompareColumn
            itemKey={keyA}
            onItemKeyChange={(key) => updateParams("a", key)}
          />
          <CompareColumn
            itemKey={keyB}
            onItemKeyChange={(key) => updateParams("b", key)}
          />
        </div>
      ) : (
        /* ── Selection mode: pick two items then compare ──────── */
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="flex flex-col items-center gap-6 rounded-lg border-2 border-dashed border-muted-foreground/25 p-10 w-full max-w-lg">
            <p className="text-sm text-muted-foreground">
              Select two items to compare side-by-side
            </p>

            <div className="flex flex-col sm:flex-row items-center gap-4 w-full justify-center">
              <ItemPicker
                selectedKey={stagedA}
                onSelect={(key) => setStagedA(key)}
              />
              <ArrowRightLeft className="h-5 w-5 text-muted-foreground shrink-0" />
              <ItemPicker
                selectedKey={stagedB}
                onSelect={(key) => setStagedB(key)}
              />
            </div>

            <Button
              onClick={handleCompare}
              disabled={!stagedA || !stagedB}
            >
              Compare
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function ComparePage() {
  return (
    <Suspense>
      <CompareContent />
    </Suspense>
  );
}
