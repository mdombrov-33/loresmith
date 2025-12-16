import { Globe } from "lucide-react";

export default function EmptyMyWorldsState() {
  return (
    <div className="border-border bg-card/50 flex min-h-[400px] flex-col items-center justify-center gap-4 rounded-2xl border p-12">
      <Globe className="text-muted-foreground h-16 w-16" />
      <h3 className="text-foreground text-xl font-semibold">No Worlds Yet</h3>
      <p className="text-muted-foreground text-center">
        Start creating your first world by clicking the Create button above!
      </p>
    </div>
  );
}
