import { Compass } from "lucide-react";
import { FullStory } from "@/types/api";

interface WorldHeaderProps {
  parsedStory: FullStory;
}

export default function WorldHeader({ parsedStory }: WorldHeaderProps) {
  return (
    <header className="mb-12 text-center">
      <div className="mb-4 flex justify-center">
        <div className="bg-primary/10 border-primary flex h-20 w-20 items-center justify-center rounded-full border-2">
          <Compass className="text-primary h-10 w-10" />
        </div>
      </div>
      <h1 className="mb-4 text-5xl font-bold">{parsedStory.quest?.title}</h1>
    </header>
  );
}
