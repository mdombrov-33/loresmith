import SharedActionButton from "@/components/shared/buttons/ActionButton";

interface GenerateErrorProps {
  error: string | null;
  onRefetch: () => void;
}

export default function GenerateError({
  error,
  onRefetch,
}: GenerateErrorProps) {
  if (!error) return null;

  return (
    <section className="bg-destructive/10 border-destructive text-destructive mb-8 rounded-lg border p-4">
      <p className="font-semibold">Error:</p>
      <p>{error}</p>
      <SharedActionButton onClick={onRefetch}>Try again</SharedActionButton>
    </section>
  );
}
