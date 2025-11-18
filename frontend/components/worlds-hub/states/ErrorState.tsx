interface ErrorStateProps {
  error: Error | null;
}

export default function ErrorState({ error }: ErrorStateProps) {
  return (
    <section className="py-12 text-center">
      <p className="text-destructive">
        Error loading worlds: {error?.message || "Unknown error"}
      </p>
    </section>
  );
}
