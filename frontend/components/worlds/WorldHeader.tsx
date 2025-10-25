import { Compass, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { FullStory } from "@/types/api";

interface WorldHeaderProps {
  parsedStory: FullStory;
  theme: string;
}

export default function WorldHeader({ parsedStory, theme }: WorldHeaderProps) {
  return (
    <header className="border-border from-card/50 via-card to-card/30 relative mb-12 overflow-hidden rounded-3xl border bg-gradient-to-br p-8 shadow-2xl backdrop-blur-sm md:p-12">
      {/* Animated background orbs */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="bg-primary/10 absolute -top-40 -right-40 h-96 w-96 animate-pulse rounded-full blur-3xl" />
        <div
          className="bg-secondary/10 absolute -bottom-40 -left-40 h-96 w-96 animate-pulse rounded-full blur-3xl"
          style={{ animationDelay: "1s" }}
        />
      </div>

      <div className="relative z-10">
        {/* Icon and Badge */}
        <figure className="mb-6 flex items-center justify-center">
          <div className="relative">
            <div className="border-primary/50 bg-primary/10 flex h-24 w-24 items-center justify-center rounded-2xl border-2 backdrop-blur-sm">
              <Compass className="text-primary h-12 w-12" />
            </div>
            <div className="bg-primary/20 absolute -inset-4 -z-10 animate-pulse rounded-3xl blur-xl" />
          </div>
        </figure>

        {/* Title */}
        <h1 className="from-foreground via-foreground to-muted-foreground mb-6 bg-gradient-to-br bg-clip-text text-center text-4xl font-bold text-transparent md:text-6xl">
          {parsedStory.quest?.title}
        </h1>

        {/* Theme Badge */}
        <div className="flex justify-center">
          <Badge variant="secondary" className="gap-2 px-4 py-2 text-base">
            <Sparkles className="h-4 w-4" />
            {theme.charAt(0).toUpperCase() + theme.slice(1).replace("-", " ")}
          </Badge>
        </div>
      </div>
    </header>
  );
}
