import { Loader2 } from "lucide-react";

export default function SearchLoading() {
  return (
    <section className="flex min-h-[400px] flex-col items-center justify-center space-y-4">
      <div className="relative">
        <Loader2 className="text-primary h-12 w-12 animate-spin" />
        <div className="animate-spin-reverse absolute inset-0 h-12 w-12 opacity-50">
          <Loader2 className="text-secondary m-2 h-8 w-8" />
        </div>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="bg-accent h-2 w-2 animate-ping rounded-full"></div>
        </div>
      </div>
      <p className="text-muted-foreground animate-pulse text-sm">
        Searching the realms...
      </p>
    </section>
  );
}
