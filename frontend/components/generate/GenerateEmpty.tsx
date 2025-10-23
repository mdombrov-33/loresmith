interface GenerateEmptyProps {
  show: boolean;
}

export default function GenerateEmpty({ show }: GenerateEmptyProps) {
  if (!show) return null;

  return (
    <section className="py-12 text-center">
      <p className="text-muted-foreground">No options available.</p>
    </section>
  );
}
