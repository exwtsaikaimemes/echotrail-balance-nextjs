"use client";

import { useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm, FormProvider } from "react-hook-form";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import {
  useCreateItem,
  useUpdateItem,
  useDeleteItem,
} from "@/hooks/use-items";
import { useBalanceConfig } from "@/hooks/use-balance";
import type { Item } from "@/types/item";
import { emptyItem } from "@/types/item";
import { getEquipClass } from "@/constants/equipment";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ItemBasicFields } from "./item-basic-fields";
import { ItemToggles } from "./item-toggles";
import { ItemAdvancedFields } from "./item-advanced-fields";
import { AttributeList } from "./attribute-list";
import { EnchantmentList } from "./enchantment-list";
import { CommentsSection } from "./comments-section";
import { BudgetBar } from "./budget-bar";
import { KotlinCodePanel } from "./kotlin-code-panel";
import { TooltipPreview } from "./tooltip-preview";
import { ItemHistoryPanel } from "./item-history-panel";
import {
  ArrowLeft,
  Save,
  Copy,
  Trash2,
  Loader2,
} from "lucide-react";

interface ItemEditorFormProps {
  initialItem?: Item;
}

function slugify(name: string): string {
  return name
    .toUpperCase()
    .replace(/[^A-Z0-9\s_]/g, "")
    .replace(/\s+/g, "_")
    .replace(/_+/g, "_")
    .replace(/^_|_$/g, "");
}

function toObjectName(name: string): string {
  return name
    .replace(/[^a-zA-Z0-9\s]/g, "")
    .split(/\s+/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join("");
}

export function ItemEditorForm({ initialItem }: ItemEditorFormProps) {
  const router = useRouter();
  const { data: session } = useSession();
  const { data: balanceConfig } = useBalanceConfig();
  const isEditMode = !!initialItem;

  const createItem = useCreateItem();
  const updateItem = useUpdateItem();
  const deleteItem = useDeleteItem();

  const defaultValues = initialItem ?? {
    ...emptyItem(),
    id: "",
    createdAt: "",
    modifiedAt: "",
    createdBy: null,
    modifiedBy: null,
  };

  const methods = useForm<Item>({
    defaultValues: defaultValues as Item,
    mode: "onChange",
  });

  const {
    handleSubmit,
    watch,
    setValue,
    formState: { isDirty: _isDirty, isSubmitting },
  } = methods;

  const watchedName = watch("customName");
  const watchedEquipment = watch("equipment");
  const watchedItem = watch();

  // Auto-generate id fields from name for new items
  useEffect(() => {
    if (!isEditMode && watchedName) {
      const slug = slugify(watchedName);
      const objName = toObjectName(watchedName);
      const equipClass = getEquipClass(watchedEquipment ?? "");
      setValue("itemKey", slug.toLowerCase(), { shouldDirty: true });
      setValue("objectName", objName + equipClass, { shouldDirty: true });
    }
  }, [watchedName, watchedEquipment, isEditMode, setValue]);

  const onSubmit = useCallback(
    async (data: Item) => {
      try {
        const username = session?.user?.username ?? "unknown";

        if (isEditMode) {
          await updateItem.mutateAsync({
            id: initialItem.id,
            item: { ...data, modifiedBy: username },
          });
          toast.success("Item updated successfully.");
        } else {
          await createItem.mutateAsync({
            ...data,
            createdBy: username,
            modifiedBy: username,
          });
          toast.success("Item created successfully.");
          router.push("/items");
        }
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "An error occurred.";
        toast.error(`Save failed: ${message}`);
      }
    },
    [isEditMode, initialItem, createItem, updateItem, session, router]
  );

  const handleDuplicate = useCallback(async () => {
    if (!initialItem) return;

    try {
      const username = session?.user?.username ?? "unknown";
      const copyData = {
        ...watchedItem,
        id: undefined,
        itemKey: watchedItem.itemKey + "_copy",
        objectName: watchedItem.objectName + "Copy",
        customName: watchedItem.customName + " (Copy)",
        createdBy: username,
        modifiedBy: username,
        createdAt: undefined,
        modifiedAt: undefined,
      };
      const result = await createItem.mutateAsync(copyData);
      toast.success("Item duplicated successfully.");
      if (result?.item?.itemKey) {
        router.push(`/items/${result.item.itemKey}`);
      } else {
        router.push("/items");
      }
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "An error occurred.";
      toast.error(`Duplicate failed: ${message}`);
    }
  }, [initialItem, watchedItem, createItem, session, router]);

  const handleDelete = useCallback(async () => {
    if (!initialItem) return;

    try {
      await deleteItem.mutateAsync(initialItem.id);
      toast.success("Item deleted.");
      router.push("/items");
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "An error occurred.";
      toast.error(`Delete failed: ${message}`);
    }
  }, [initialItem, deleteItem, router]);

  const isSaving =
    isSubmitting || createItem.isPending || updateItem.isPending;

  return (
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit(onSubmit)}>
        {/* Action bar */}
        <div className="flex items-center gap-2 mb-6">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => router.push("/items")}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Items
          </Button>

          <Button type="submit" size="sm" disabled={isSaving}>
            {isSaving ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Save className="mr-2 h-4 w-4" />
            )}
            {isEditMode ? "Save Changes" : "Create Item"}
          </Button>

          {isEditMode && (
            <>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleDuplicate}
                disabled={createItem.isPending}
              >
                <Copy className="mr-2 h-4 w-4" />
                Duplicate
              </Button>

              <Dialog>
                <DialogTrigger asChild>
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Delete Item</DialogTitle>
                    <DialogDescription>
                      Are you sure you want to delete &quot;
                      {initialItem?.customName}&quot;? This action cannot be
                      undone.
                    </DialogDescription>
                  </DialogHeader>
                  <DialogFooter>
                    <Button
                      type="button"
                      variant="destructive"
                      onClick={handleDelete}
                      disabled={deleteItem.isPending}
                    >
                      {deleteItem.isPending && (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      )}
                      Confirm Delete
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </>
          )}
        </div>

        {/* Budget bar — full width above both columns */}
        <BudgetBar balanceConfig={balanceConfig ?? null} />

        {/* Two-column layout */}
        <div className="grid grid-cols-1 lg:grid-cols-[2fr_3fr] gap-3">
          {/* Left column: form fields (narrow) */}
          <div className="space-y-6">
            <ItemBasicFields isEditMode={isEditMode} />
            <Separator />
            <ItemToggles />
            <Separator />
            <ItemAdvancedFields />
            <Separator />
            <AttributeList balanceConfig={balanceConfig ?? null} />
            <Separator />
            <EnchantmentList />

            {isEditMode && initialItem && (
              <>
                <Separator />
                <CommentsSection itemId={initialItem.id} />
              </>
            )}
          </div>

          {/* Right column: preview panels (expanded) */}
          <div className="space-y-6">
            <KotlinCodePanel />
            <TooltipPreview />

            {isEditMode && initialItem && (
              <ItemHistoryPanel itemId={initialItem.id} />
            )}
          </div>
        </div>
      </form>
    </FormProvider>
  );
}
