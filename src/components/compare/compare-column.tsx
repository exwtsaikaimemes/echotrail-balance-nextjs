"use client";

import { useCallback, useEffect } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import { useItem, useUpdateItem } from "@/hooks/use-items";
import { useBalanceConfig } from "@/hooks/use-balance";
import { type Item, emptyItem } from "@/types/item";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ItemPicker } from "./item-picker";
import { ItemBasicFields } from "@/components/editor/item-basic-fields";
import { ItemToggles } from "@/components/editor/item-toggles";
import { AttributeList } from "@/components/editor/attribute-list";
import { EnchantmentList } from "@/components/editor/enchantment-list";
import { CommentsSection } from "@/components/editor/comments-section";
import { BudgetBar } from "@/components/editor/budget-bar";
import { Save, Loader2 } from "lucide-react";

interface CompareColumnProps {
  itemKey: string | null;
  onItemKeyChange: (key: string | null) => void;
}

export function CompareColumn({ itemKey, onItemKeyChange }: CompareColumnProps) {
  const { data: session } = useSession();
  const { data: balanceConfig } = useBalanceConfig();
  const { data: item, isLoading } = useItem(itemKey ?? undefined);
  const updateItem = useUpdateItem();

  const methods = useForm<Item>({
    defaultValues: item ?? (emptyItem() as Item),
    mode: "onChange",
  });

  const { handleSubmit, reset, formState: { isDirty, isSubmitting } } = methods;

  // Reset form when fetched item changes
  useEffect(() => {
    if (item) {
      reset(item);
    }
  }, [item, reset]);

  const handlePickerSelect = useCallback(
    (key: string) => {
      if (isDirty) {
        const confirmed = window.confirm(
          "You have unsaved changes. Discard and switch items?"
        );
        if (!confirmed) return;
      }
      onItemKeyChange(key);
    },
    [isDirty, onItemKeyChange]
  );

  const onSubmit = useCallback(
    async (data: Item) => {
      if (!item) return;
      try {
        const username = session?.user?.username ?? "unknown";
        await updateItem.mutateAsync({
          id: item.id,
          item: { ...data, modifiedBy: username },
        });
        toast.success(`"${data.customName}" saved.`);
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "An error occurred.";
        toast.error(`Save failed: ${message}`);
      }
    },
    [item, updateItem, session]
  );

  const isSaving = isSubmitting || updateItem.isPending;

  // Empty state — no item selected
  if (!itemKey) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/25 min-h-[400px] p-8 gap-4">
        <p className="text-sm text-muted-foreground">Select an item to compare</p>
        <ItemPicker selectedKey={null} onSelect={(key) => onItemKeyChange(key)} />
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!item) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-destructive/25 min-h-[400px] p-8 gap-4">
        <p className="text-sm text-destructive">Item not found: {itemKey}</p>
        <ItemPicker selectedKey={itemKey} onSelect={(key) => onItemKeyChange(key)} />
      </div>
    );
  }

  return (
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Header: picker + save */}
        <div className="flex items-center gap-2 flex-wrap">
          <ItemPicker selectedKey={itemKey} onSelect={handlePickerSelect} />
          <Button type="submit" size="sm" disabled={isSaving}>
            {isSaving ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Save className="mr-2 h-4 w-4" />
            )}
            Save
          </Button>
        </div>

        <BudgetBar balanceConfig={balanceConfig ?? null} showBreakdown={false} />
        <ItemBasicFields isEditMode />
        <Separator />
        <ItemToggles />
        <Separator />
        <AttributeList balanceConfig={balanceConfig ?? null} />
        <Separator />
        <EnchantmentList />
        <Separator />
        <CommentsSection itemId={item.id} />
      </form>
    </FormProvider>
  );
}
