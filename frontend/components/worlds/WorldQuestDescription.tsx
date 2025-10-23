import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { BookOpen } from "lucide-react";
import { FullStory } from "@/types/api";

interface WorldQuestDescriptionProps {
  parsedStory: FullStory;
}

export default function WorldQuestDescription({
  parsedStory,
}: WorldQuestDescriptionProps) {
  return (
    <Card className="border-primary/50 mx-auto mb-8 max-w-4xl shadow-lg">
      <CardHeader className="bg-primary/5">
        <div className="flex items-start gap-3">
          <BookOpen className="text-primary mt-1 h-6 w-6 flex-shrink-0" />
          <div className="flex-1">
            <CardContent className="p-0 text-base">
              {parsedStory.quest?.description}
            </CardContent>
          </div>
        </div>
      </CardHeader>
    </Card>
  );
}
