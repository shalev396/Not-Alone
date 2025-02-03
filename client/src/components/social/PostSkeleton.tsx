import { Skeleton } from "@/components/ui/skeleton";

export const PostSkeleton = () => {
  return (
    <div className="space-y-4">
      {[1, 2, 3].map((i) => (
        <div key={i} className="p-6 bg-muted/50 rounded-lg space-y-3">
          <Skeleton className="h-6 w-1/3" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-8 w-28" />
        </div>
      ))}
    </div>
  );
};
