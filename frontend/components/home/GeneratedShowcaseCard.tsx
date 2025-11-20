import { LucideIcon } from "lucide-react";

interface GeneratedShowcaseCardProps {
  icon: LucideIcon;
  label: string;
  title: string;
  description: string;
}

export default function GeneratedShowcaseCard({
  icon: Icon,
  label,
  title,
  description,
}: GeneratedShowcaseCardProps) {
  return (
    <div className="border-border bg-card/50 overflow-hidden rounded-2xl border backdrop-blur-sm">
      <div className="bg-primary/10 border-primary/20 flex items-center gap-3 border-b px-6 py-4">
        <Icon className="text-primary h-5 w-5" />
        <div>
          <div className="text-primary text-xs font-semibold uppercase tracking-wider">
            {label}
          </div>
          <div className="text-foreground text-lg font-bold">{title}</div>
        </div>
      </div>
      <div className="p-6">
        <p className="text-muted-foreground text-sm leading-relaxed">
          {description}
        </p>
      </div>
    </div>
  );
}
