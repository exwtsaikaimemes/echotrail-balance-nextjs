"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { PatchVersion } from "@/types/history";

interface VersionFilterProps {
  versions: PatchVersion[] | string[];
  value: string;
  onChange: (value: string) => void;
}

export function VersionFilter({ versions, value, onChange }: VersionFilterProps) {
  const items = versions.map((v) =>
    typeof v === "string" ? { version: v, isCurrent: false } : v
  );

  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="w-[180px]">
        <SelectValue placeholder="All Versions" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">All Versions</SelectItem>
        {items.map((v) => (
          <SelectItem key={v.version} value={v.version}>
            {v.version}{v.isCurrent ? " (current)" : ""}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
