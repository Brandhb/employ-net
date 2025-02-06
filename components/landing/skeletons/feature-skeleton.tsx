import { Skeleton } from "@/components/ui/skeleton";

export default function FeatureSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-6 w-48 mx-auto mb-4" />
      <Skeleton className="h-4 w-64 mx-auto mb-8" />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        <Skeleton className="h-40 w-full rounded-lg" />
        <Skeleton className="h-40 w-full rounded-lg" />
        <Skeleton className="h-40 w-full rounded-lg" />
        <Skeleton className="h-40 w-full rounded-lg" />
        <Skeleton className="h-40 w-full rounded-lg" />
        <Skeleton className="h-40 w-full rounded-lg" />
      </div>
    </div>
  );
}
