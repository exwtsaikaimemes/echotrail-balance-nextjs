"use client";

import { ItemEditorForm } from "@/components/editor/item-editor-form";

export default function NewItemPage() {
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">New Item</h1>
        <p className="text-sm text-muted-foreground">
          Create a new custom item definition.
        </p>
      </div>
      <ItemEditorForm />
    </div>
  );
}
