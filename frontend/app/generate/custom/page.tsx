"use client";

import { useSearchParams } from "next/navigation";
import { getThemeFont } from "@/constants/game-themes";
import GenerateHeader from "@/components/generate/GenerateHeader";

export default function CustomGeneratePage() {
  const searchParams = useSearchParams();
  const theme = searchParams.get("theme") || "fantasy";
  const themeFont = getThemeFont(theme);

  return (
    <main className={`container mx-auto px-4 py-12 ${themeFont}`}>
      <GenerateHeader
        title="Custom Adventure"
        description="Create a personalized adventure with your own prompts and preferences"
      />
      <div className="mt-12 flex flex-col items-center justify-center gap-6">
        <div className="rounded-lg border border-border bg-card p-8 text-center">
          <h2 className="mb-4 text-2xl font-bold text-foreground">
            Coming Soon
          </h2>
          <p className="text-muted-foreground">
            Custom adventure generation is currently under development.
            <br />
            Check back soon for this feature!
          </p>
        </div>
      </div>
    </main>
  );
}
