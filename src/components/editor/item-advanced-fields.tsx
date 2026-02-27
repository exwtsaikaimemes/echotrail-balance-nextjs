"use client";

import { useFormContext } from "react-hook-form";
import type { Item } from "@/types/item";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function ItemAdvancedFields() {
  const { register } = useFormContext<Item>();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Advanced</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="source">Source / Origin</Label>
          <Input
            id="source"
            placeholder="e.g. manual, csv_import, migration"
            {...register("source")}
          />
          <p className="text-xs text-muted-foreground">
            Tracks where this item definition was created from.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
