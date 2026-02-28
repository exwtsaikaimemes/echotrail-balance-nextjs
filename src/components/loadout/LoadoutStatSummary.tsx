"use client";

import { useCurrentLoadout } from "@/hooks/use-loadout";
import { useItems } from "@/hooks/use-items";
import { computeLoadoutStats } from "@/lib/loadout-utils";
import type { LoadoutStat } from "@/types/loadout";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function LoadoutStatSummary() {
  const { data: currentLoadout, isLoading: isLoadingLoadout } = useCurrentLoadout();
  const { data: allItems, isLoading: isLoadingItems } = useItems();

  if (isLoadingLoadout || isLoadingItems) {
    return <div className="text-sm text-slate-500">Loading loadout stats...</div>;
  }

  if (!currentLoadout || !allItems) {
    return <div className="text-sm text-slate-500">No loadout data</div>;
  }

  // Get equipped items
  const equippedItems = Object.values(currentLoadout)
    .filter((itemKey): itemKey is string => itemKey !== null)
    .map((itemKey) => allItems.find((item) => item.itemKey === itemKey))
    .filter((item): item is typeof allItems[0] => item !== undefined);

  if (equippedItems.length === 0) {
    return (
      <div className="text-sm text-slate-500 p-4 text-center border rounded">
        No items equipped. Select items to see loadout stats.
      </div>
    );
  }

  const stats = computeLoadoutStats(equippedItems);

  if (stats.length === 0) {
    return (
      <div className="text-sm text-slate-500 p-4 text-center border rounded">
        Equipped items have no stats.
      </div>
    );
  }

  // Sort by name
  stats.sort((a, b) => a.name.localeCompare(b.name));

  return (
    <div className="mt-4">
      <h3 className="font-semibold mb-3">Loadout Stats</h3>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[200px]">Stat</TableHead>
            <TableHead className="text-right w-[120px]">Min</TableHead>
            <TableHead className="text-right w-[120px]">Max</TableHead>
            <TableHead className="text-right w-[80px]">Count</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {stats.map((stat) => (
            <TableRow key={stat.name}>
              <TableCell className="font-medium">{stat.name}</TableCell>
              <TableCell className="text-right">{stat.totalMin.toFixed(2)}</TableCell>
              <TableCell className="text-right">{stat.totalMax.toFixed(2)}</TableCell>
              <TableCell className="text-right text-xs text-slate-500">
                {stat.count}x
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
