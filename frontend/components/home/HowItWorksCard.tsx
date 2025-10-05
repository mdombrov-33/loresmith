interface HowItWorksCardProps {
  step: number;
  title: string;
  description: string;
  colorClass: "primary" | "secondary" | "accent";
}

export default function HowItWorksCard({
  step,
  title,
  description,
  colorClass,
}: HowItWorksCardProps) {
  return (
    <div className="flex flex-col items-center text-center">
      <div
        className={`bg-${colorClass} text-${colorClass}-foreground mb-4 flex h-16 w-16 items-center justify-center rounded-full text-2xl font-bold`}
      >
        {step}
      </div>
      <h3 className="text-foreground mb-2 text-xl font-bold">{title}</h3>
      <p className="text-muted-foreground">{description}</p>
    </div>
  );
}
