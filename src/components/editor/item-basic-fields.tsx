"use client";

import { useFormContext } from "react-hook-form";
import type { Item } from "@/types/item";
import { EQUIPMENT_TYPES } from "@/constants/equipment";
import { RARITIES } from "@/constants/rarities";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface ItemBasicFieldsProps {
  isEditMode: boolean;
}

export function ItemBasicFields({ isEditMode }: ItemBasicFieldsProps) {
  const { register, setValue, watch } = useFormContext<Item>();

  const equipment = watch("equipment");
  const rarity = watch("rarity");

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Basic Information</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Custom Name */}
          <div className="space-y-2">
            <Label htmlFor="customName">Item Name</Label>
            <Input
              id="customName"
              placeholder="Blade of the Fallen"
              {...register("customName")}
            />
          </div>

          {/* Item Key */}
          <div className="space-y-2">
            <Label htmlFor="itemKey">Item Key</Label>
            <Input
              id="itemKey"
              placeholder="blade_of_the_fallen"
              readOnly={isEditMode}
              className={isEditMode ? "opacity-60 cursor-not-allowed" : ""}
              {...register("itemKey")}
            />
            {!isEditMode && (
              <p className="text-xs text-muted-foreground">
                Auto-generated from name. Must be unique.
              </p>
            )}
          </div>

          {/* Object Name */}
          <div className="space-y-2">
            <Label htmlFor="objectName">Object Name</Label>
            <Input
              id="objectName"
              placeholder="BladeOfTheFallen"
              readOnly={isEditMode}
              className={isEditMode ? "opacity-60 cursor-not-allowed" : ""}
              {...register("objectName")}
            />
            {!isEditMode && (
              <p className="text-xs text-muted-foreground">
                Kotlin object name. Auto-generated from name.
              </p>
            )}
          </div>

          {/* Equipment Type */}
          <div className="space-y-2">
            <Label>Equipment Type</Label>
            <Select
              value={equipment}
              onValueChange={(value) =>
                setValue("equipment", value, { shouldDirty: true })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select equipment type" />
              </SelectTrigger>
              <SelectContent>
                {EQUIPMENT_TYPES.map((group) => (
                  <SelectGroup key={group.group}>
                    <SelectLabel>{group.group}</SelectLabel>
                    {group.items.map((item) => (
                      <SelectItem key={item} value={item}>
                        {item}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Rarity */}
          <div className="space-y-2">
            <Label>Rarity</Label>
            <Select
              value={rarity}
              onValueChange={(value) =>
                setValue("rarity", value, { shouldDirty: true })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select rarity" />
              </SelectTrigger>
              <SelectContent>
                {RARITIES.map((r) => (
                  <SelectItem key={r.name} value={r.name}>
                    {r.name} (Tier {r.tier})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Custom Model Data */}
          <div className="space-y-2">
            <Label htmlFor="customModelData">Custom Model Data</Label>
            <Input
              id="customModelData"
              type="text"
              placeholder="e.g. 1001"
              {...register("customModelData")}
            />
          </div>
        </div>

        {/* Equippable Asset ID */}
        <div className="space-y-2">
          <Label htmlFor="equippableAssetId">Equippable Asset ID</Label>
          <Input
            id="equippableAssetId"
            placeholder="e.g. echotrail:custom_helmet"
            {...register("equippableAssetId")}
          />
          <p className="text-xs text-muted-foreground">
            Optional. Resource pack asset identifier for custom armor models.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
