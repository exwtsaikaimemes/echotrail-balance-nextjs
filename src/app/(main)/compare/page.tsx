"use client";

import { useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { CompareColumn } from "@/components/compare/compare-column";

export default function ComparePage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const keyA = searchParams.get("a") || null;
  const keyB = searchParams.get("b") || null;

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

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Compare Items</h1>
        <p className="text-sm text-muted-foreground">
          Side-by-side item comparison and editing
        </p>
      </div>

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
    </div>
  );
}
