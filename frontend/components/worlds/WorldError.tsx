"use client";

import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import ActionButton from "@/components/shared/ActionButton";
import { useAppStore } from "@/stores/appStore";

interface WorldErrorProps {
  error: string;
}

export default function WorldError({ error }: WorldErrorProps) {
  const router = useRouter();
  const { theme } = useAppStore();

  const handleReturnHome = () => {
    router.push(`/?theme=${theme || "fantasy"}`);
  };

  return (
    <main className="flex min-h-screen items-center justify-center">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-destructive">Error</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="mb-4">{error}</p>
          <ActionButton onClick={handleReturnHome}>Return Home</ActionButton>
        </CardContent>
      </Card>
    </main>
  );
}
