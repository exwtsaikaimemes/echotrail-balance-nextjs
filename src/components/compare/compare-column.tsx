"use client";

import { useCallback } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import { useItem, useUpdateItem } from "@/hooks/use-items";
import { useBalanceConfig } from "@/hooks/use-balance";
import { type Item } from "@/types/item";
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
  itemKey: string;
  onItemKeyChange: (key: string) => void;
}

/* ── Inner form: mounts only when item data is available ──────────── */

interface CompareColumnFormProps {
  item: Item;
  onItemKeyChange: (key: string) => void;
}

function CompareColumnForm({ item, onItemKeyChange }: CompareColumnFormProps) {
  const { data: session } = useSession();
  const { data: balanceConfig } = useBalanceConfig();
  const updateItem = useUpdateItem();

  const methods = useForm<Item>({
    defaultValues: item,
    mode: "onChange",
  });

  const {
    handleSubmit,
    formState: { isDirty, isSubmitting },
  } = methods;

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
    [item.id, updateItem, session]
  );

  const isSaving = isSubmitting || updateItem.isPending;

  return (
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Header: picker + save */}
        <div className="flex items-center gap-2 flex-wrap">
          <ItemPicker selectedKey={item.itemKey} onSelect={handlePickerSelect} />
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

/* ── Outer shell: loading / error states ──────────────────────────── */

export function CompareColumn({ itemKey, onItemKeyChange }: CompareColumnProps) {
  const { data: item, isLoading } = useItem(itemKey);

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
    <CompareColumnForm
      key={item.id}
      item={item}
      onItemKeyChange={onItemKeyChange}
    />
  );
}
