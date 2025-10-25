import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
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
      <Card className="shadow-xl">
        <CardHeader className="border-border/50 border-b">
          <div className="flex items-center gap-3">
            <figure className="border-primary/30 bg-primary/10 flex h-10 w-10 items-center justify-center rounded-lg border">
              <BookOpen className="text-primary h-5 w-5" />
            </figure>
            <CardTitle className="text-2xl">Your Quest</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <p className="text-foreground/90 text-base leading-relaxed">
            {parsedStory.quest?.description}
          </p>
        </CardContent>
      </Card>
    </section>
  );
}
