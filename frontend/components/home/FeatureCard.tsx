interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  colorClass: "primary" | "secondary" | "accent";
}

export default function FeatureCard({
  icon,
  title,
  description,
  colorClass,
}: FeatureCardProps) {
  return (
    <div
      className={`group border-border bg-card rounded-xl border hover:border-${colorClass} flex flex-col items-center p-6 text-center transition-all hover:shadow-lg`}
    >
      <div
        className={`bg-${colorClass} text-${colorClass}-foreground mb-4 flex h-14 w-14 items-center justify-center rounded-xl transition-transform group-hover:scale-110`}
      >
        {icon}
      </div>
      <h3 className="text-card-foreground mb-2 text-xl font-bold">{title}</h3>
      <p className="text-muted-foreground">{description}</p>
    </div>
  );
}
