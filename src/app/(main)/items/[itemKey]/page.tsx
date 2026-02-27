"use client";

import { use } from "react";
import { useItem } from "@/hooks/use-items";
import { ItemEditorForm } from "@/components/editor/item-editor-form";
import { Skeleton } from "@/components/ui/skeleton";

export default function EditItemPage({
  params,
}: {
  params: Promise<{ itemKey: string }>;
}) {
  const { itemKey } = use(params);
  const { data: item, isLoading, error } = useItem(itemKey);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="space-y-2">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-48" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-[520px_1fr] gap-6">
          <div className="space-y-6">
            <Skeleton className="h-[400px] w-full" />
            <Skeleton className="h-[200px] w-full" />
            <Skeleton className="h-[300px] w-full" />
          </div>
          <div className="space-y-6">
            <Skeleton className="h-[120px] w-full" />
            <Skeleton className="h-[300px] w-full" />
            <Skeleton className="h-[250px] w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !item) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center space-y-2">
          <h2 className="text-xl font-semibold">Item not found</h2>
          <p className="text-sm text-muted-foreground">
            {error?.message ?? "The item you are looking for does not exist."}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          {item.customName || "Untitled Item"}
        </h1>
        <p className="text-sm text-muted-foreground">
          Editing item{" "}
          <code className="rounded bg-muted px-1 py-0.5 text-xs">
            {item.itemKey}
          </code>
        </p>
      </div>
      <ItemEditorForm initialItem={item} />
    </div>
  );
}
