import { Skeleton } from "@/components/ui/skeleton";

export default function ConfigLoading() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-10 w-96" />
      <div className="border rounded-lg p-6 space-y-4">
        {Array.from({ length: 10 }).map((_, i) => (
          <Skeleton key={i} className="h-8 w-full" />
        ))}
      </div>
    </div>
  );
}
