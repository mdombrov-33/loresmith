interface SearchErrorProps {
  error: Error | null;
}

export default function SearchError({ error }: SearchErrorProps) {
  return (
    <section className="py-12 text-center">
      <p className="text-destructive">
        Error loading worlds: {error?.message || "Unknown error"}
      </p>
    </section>
  );
}
