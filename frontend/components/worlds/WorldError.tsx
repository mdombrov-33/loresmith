import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import ActionButton from "@/components/shared/ActionButton";

interface WorldErrorProps {
  error: string;
}

export default function WorldError({ error }: WorldErrorProps) {
  return (
    <main className="flex min-h-screen items-center justify-center">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-destructive">Error</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="mb-4">{error}</p>
          <ActionButton href="/">Return Home</ActionButton>
        </CardContent>
      </Card>
    </main>
  );
}
