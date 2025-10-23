import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Sparkles } from "lucide-react";

interface WorldStoryContentProps {
  paragraphs: string[];
}

export default function WorldStoryContent({
  paragraphs,
}: WorldStoryContentProps) {
  return (
    <Card className="shadow-md">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Sparkles className="text-primary h-5 w-5" />
          <CardTitle className="text-2xl">The Story</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4 text-base leading-relaxed">
          {paragraphs.length > 0 ? (
            paragraphs.map((paragraph: string, index: number) => (
              <p key={index} className="text-foreground">
                {paragraph}
              </p>
            ))
          ) : (
            <p className="text-muted-foreground">No story content available.</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
