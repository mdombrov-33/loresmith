import ActionButton from "@/components/shared/ActionButton";
import { Compass, Wand2, Eye, Home } from "lucide-react";

interface WorldActionsProps {
  theme: string;
}

export default function WorldActions({ theme }: WorldActionsProps) {
  return (
    <section className="bg-background/95 supports-[backdrop-filter]:bg-background/60 sticky bottom-0 mt-8 border-t py-4 backdrop-blur">
      <div className="flex flex-col items-center gap-4 sm:gap-6">
        <ActionButton
          size="lg"
          className="h-12 px-6 text-base sm:h-14 sm:px-8 sm:text-lg"
          icon={<Compass className="h-4 w-4 sm:h-5 sm:w-5" />}
        >
          Begin Adventure
        </ActionButton>

        <div className="flex flex-col justify-center gap-2 px-4 sm:flex-row sm:gap-4 sm:px-0">
          <ActionButton
            variant="outline"
            size="sm"
            className="sm:size-lg"
            href={`/generate?theme=${theme}`}
            icon={<Wand2 className="h-3 w-3 sm:h-4 sm:w-4" />}
          >
            Create New Story
          </ActionButton>
          <ActionButton
            variant="outline"
            size="sm"
            className="sm:size-lg"
            href="/search"
            icon={<Eye className="h-3 w-3 sm:h-4 sm:w-4" />}
          >
            Check Other Worlds
          </ActionButton>
          <ActionButton
            variant="outline"
            size="sm"
            className="sm:size-lg"
            href="/"
            icon={<Home className="h-3 w-3 sm:h-4 sm:w-4" />}
          >
            Return Home
          </ActionButton>
        </div>
      </div>
    </section>
  );
}
