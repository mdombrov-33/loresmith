export default function GenerateCardSkeleton() {
  return (
    <div className="bg-card border-border flex h-full min-h-[550px] animate-pulse flex-col rounded-xl border-2 p-6">
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

      {/* Hover hint skeleton - pushed to bottom */}
      <div className="bg-primary/5 border-primary/20 mt-auto flex items-center justify-center gap-2 rounded-lg border p-3">
        <div className="bg-muted h-4 w-4 rounded"></div>
        <div className="bg-muted h-3 w-32 rounded"></div>
      </div>
    </div>
  );
}
