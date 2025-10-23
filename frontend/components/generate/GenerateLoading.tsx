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
    <section className="py-12 text-center">
      <div className="border-primary inline-block h-12 w-12 animate-spin rounded-full border-b-2"></div>
      <p className="text-muted-foreground mt-4">Generating {category}...</p>
    </section>
  );
}
