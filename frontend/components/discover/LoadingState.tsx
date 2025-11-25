export default function LoadingState() {
  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <div
          key={i}
          className="h-96 w-full animate-pulse rounded-lg border border-border bg-card/50"
        />
      ))}
    </div>
  );
}
