import { Card, CardContent } from "@/components/ui/card";
import { MessageSquare, Construction } from "lucide-react";

export default function WorldComments() {
  return (
    <Card className="shadow-sm">
      <CardContent className="flex flex-col items-center justify-center py-16 text-center">
        <div className="border-primary/30 bg-primary/10 mb-6 flex h-20 w-20 items-center justify-center rounded-full">
          <Construction className="text-primary h-10 w-10" />
        </div>

        <h3 className="text-foreground mb-2 text-xl font-semibold">Comments Coming Soon</h3>

        <p className="text-muted-foreground mb-6 max-w-md text-sm leading-relaxed">
          We're building a community discussion feature where you can share your thoughts,
          ask questions, and connect with other adventurers.
        </p>

        <div className="flex items-center gap-2">
          <MessageSquare className="text-muted-foreground h-5 w-5" />
          <span className="text-muted-foreground text-sm">Stay tuned for updates</span>
        </div>

        {/* Optional: Notify button for future */}
        {/* <Button variant="outline" className="mt-6">
          Notify Me When Available
        </Button> */}
      </CardContent>
    </Card>
  );
}
