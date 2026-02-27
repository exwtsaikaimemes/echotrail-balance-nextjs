"use client";

import { PatchVersionBadge } from "./patch-version-badge";
import { InternalEntryCard } from "./internal-entry-card";
import { PublicEntryCard } from "./public-entry-card";
import type { PatchGroup, PublicPatchGroup } from "@/types/history";

interface PatchGroupCardInternalProps {
  mode: "internal";
  group: PatchGroup;
}

interface PatchGroupCardPublicProps {
  mode: "public";
  group: PublicPatchGroup;
}

type PatchGroupCardProps = PatchGroupCardInternalProps | PatchGroupCardPublicProps;

export function PatchGroupCard(props: PatchGroupCardProps) {
  const { mode, group } = props;

  return (
    <div className="space-y-3">
      {/* Group header */}
      <div className="flex items-center gap-3 sticky top-0 z-10 bg-background py-2">
        <PatchVersionBadge version={group.version} />
        <h2 className="text-lg font-semibold tracking-tight">
          EchoTrail Patch {group.version}
        </h2>
      </div>

      {group.description && (
        <p className="text-sm text-muted-foreground ml-1">{group.description}</p>
      )}

      <div className="space-y-2">
        {group.entries.length === 0 ? (
          <p className="text-sm text-muted-foreground italic py-4">No changes in this version.</p>
        ) : mode === "internal" ? (
          (group as PatchGroup).entries.map((entry) => (
            <InternalEntryCard key={entry.id} entry={entry} />
          ))
        ) : (
          (group as PublicPatchGroup).entries.map((entry, i) => (
            <PublicEntryCard key={i} entry={entry} />
          ))
        )}
      </div>
    </div>
  );
}
