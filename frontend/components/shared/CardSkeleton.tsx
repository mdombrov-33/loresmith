export default function CardSkeleton() {
  return (
    <div className="bg-card border-border animate-pulse rounded-xl border p-6">
      {/* Header skeleton */}
      <div className="mb-3 flex items-center justify-between">
        <div className="bg-muted h-6 w-32 rounded"></div>
        <div className="bg-accent/20 h-6 w-20 rounded"></div>
      </div>

      {/* Description skeleton */}
      <div className="mb-4 space-y-2">
        <div className="bg-muted h-4 w-full rounded"></div>
        <div className="bg-muted h-4 w-5/6 rounded"></div>
        <div className="bg-muted h-4 w-4/6 rounded"></div>
      </div>

      {/* Details skeleton */}
      <div className="border-border space-y-3 border-t pt-4">
        <div className="bg-muted h-4 w-24 rounded"></div>
        <div className="bg-muted h-4 w-full rounded"></div>
      </div>
    </div>
  );
}
