import { Card, CardHeader } from "@/components/ui/card";
import { BookOpen } from "lucide-react";
import { FullStory } from "@/types/api";

interface WorldQuestDescriptionProps {
  parsedStory: FullStory;
}

export default function WorldQuestDescription({
  parsedStory,
}: WorldQuestDescriptionProps) {
  return (
    <section className="mb-8">
      <Card className="border-primary/30 from-card/80 to-card/50 border-2 bg-gradient-to-br shadow-xl backdrop-blur-sm">
        <CardHeader className="border-primary/20 bg-primary/5 border-b">
          <div className="flex items-start gap-4">
            <figure className="border-primary/30 bg-primary/10 flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl border">
              <BookOpen className="text-primary h-6 w-6" />
            </figure>
            <div className="flex-1">
              <h2 className="mb-2 text-xl font-bold">Your Quest</h2>
              <p className="text-muted-foreground text-base leading-relaxed">
                {parsedStory.quest?.description}
              </p>
            </div>
          </div>
        </CardHeader>
      </Card>
    </section>
  );
}
