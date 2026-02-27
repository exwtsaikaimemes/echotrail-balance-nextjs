import { Skeleton } from "@/components/ui/skeleton";

export default function WikiLoading() {
  return (
    <div className="space-y-4 max-w-3xl">
      <Skeleton className="h-10 w-48" />
      <div className="grid gap-4 sm:grid-cols-2">
        <Skeleton className="h-32 rounded-lg" />
        <Skeleton className="h-32 rounded-lg" />
      </div>
    </div>
  );
}
