import { Loader2 } from "lucide-react";

export default function WorldLoading() {
  return (
    <main className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <Loader2 className="mx-auto mb-4 h-8 w-8 animate-spin" />
        <p className="text-muted-foreground">Loading your world...</p>
      </div>
    </main>
  );
}
