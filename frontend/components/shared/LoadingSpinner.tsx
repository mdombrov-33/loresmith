import { Compass } from "lucide-react";

interface LoadingSpinnerProps {
  title?: string;
  description?: string;
}

export default function LoadingSpinner({
  title = "Loading",
  description = "Please wait...",
}: LoadingSpinnerProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
      <div className="flex flex-col items-center gap-6">
        <div className="relative h-24 w-24">
          <Compass
            className="absolute inset-0 h-24 w-24 animate-spin text-primary"
            style={{ animationDuration: "3s" }}
          />
          <div className="absolute inset-4 h-16 w-16 animate-pulse rounded-full bg-primary/20" />
        </div>
        <div className="text-center">
          <h2 className="text-2xl font-bold text-foreground">{title}</h2>
          <p className="text-muted-foreground mt-2">{description}</p>
        </div>
      </div>
    </div>
  );
}
