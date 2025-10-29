import CardSkeleton from "@/components/shared/CardSkeleton";

interface GenerateLoadingProps {
  isLoading: boolean;
  category: string;
}

export default function GenerateLoading({
  isLoading,
  category,
}: GenerateLoadingProps) {
  if (!isLoading) return null;

  return (
    <div>
      <p className="text-muted-foreground mb-6 text-center">
        Generating {category}...
      </p>
      <section className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        <CardSkeleton />
        <CardSkeleton />
        <CardSkeleton />
      </section>
    </div>
  );
}
