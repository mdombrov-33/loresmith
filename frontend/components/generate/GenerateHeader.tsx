interface GenerateHeaderProps {
  title: string;
  description: string;
}

export default function GenerateHeader({
  title,
  description,
}: GenerateHeaderProps) {
  return (
    <header className="mb-8">
      <h1 className="mb-2 text-4xl font-bold">{title}</h1>
      <p className="text-muted-foreground">{description}</p>
    </header>
  );
}
