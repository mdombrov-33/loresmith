import { LucideIcon, Sparkles, Globe } from "lucide-react";

interface EmptyStateProps {
  scope: "my" | "global";
  icon?: LucideIcon;
  title?: string;
  description?: string;
}

export default function EmptyState({ scope, icon, title, description }: EmptyStateProps) {
  const Icon = icon || (scope === "my" ? Sparkles : Globe);
  const defaultTitle = scope === "my" ? "No worlds yet" : "No worlds found";
  const defaultDescription = scope === "my"
    ? "Create your first world to get started!"
    : "Try adjusting your filters or search query";

  return (
    <div className="border-border bg-card/30 flex flex-col items-center justify-center rounded-lg border py-16 text-center col-span-full">
      <Icon className="text-muted-foreground mb-4 h-12 w-12" />
      <h3 className="text-foreground mb-2 text-lg font-semibold">
        {title || defaultTitle}
      </h3>
      <p className="text-muted-foreground text-sm">
        {description || defaultDescription}
      </p>
    </div>
  );
}
