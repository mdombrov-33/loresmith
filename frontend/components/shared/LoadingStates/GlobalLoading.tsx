import { Loader2 } from "lucide-react";

interface GlobalLoadingProps {
  message?: string;
  fullScreen?: boolean;
}

export default function GlobalLoading({
  message = "Loading...",
  fullScreen = false,
}: GlobalLoadingProps) {
  const containerClasses = fullScreen
    ? "flex min-h-screen items-center justify-center"
    : "flex min-h-[400px] items-center justify-center";

  return (
    <main className={containerClasses}>
      <div className="text-center">
        <Loader2 className="text-primary mx-auto mb-4 h-8 w-8 animate-spin" />
        <p className="text-muted-foreground">{message}</p>
      </div>
    </main>
  );
}
