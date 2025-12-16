import { BookOpen } from "lucide-react";

export default function EmptyPlayingState() {
  return (
    <div className="border-border bg-card/50 flex min-h-[400px] flex-col items-center justify-center gap-4 rounded-2xl border p-12">
      <BookOpen className="text-muted-foreground h-16 w-16" />
      <h3 className="text-foreground text-xl font-semibold">
        No Active Adventures
      </h3>
      <p className="text-muted-foreground text-center">
        Start an adventure in any published world to see it here!
      </p>
    </div>
  );
}
