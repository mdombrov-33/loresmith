"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useEffect } from "react";
import GenerateHeader from "@/components/generate/GenerateHeader";
import ActionButton from "@/components/shared/buttons/ActionButton";
import { getThemeFont } from "@/constants/game-themes";
import { useAppStore } from "@/stores/appStore";

export default function ModeSelectionClient() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const theme = searchParams.get("theme") || "fantasy";
  const themeFont = getThemeFont(theme);
  const { setAppStage, setTheme } = useAppStore();

  useEffect(() => {
    setAppStage("generating");
    setTheme(theme);
  }, [setAppStage, setTheme, theme]);

  const handleSelectRandom = () => {
    router.push(`/generate/random?theme=${theme}`);
  };

  const handleSelectCustom = () => {
    router.push(`/generate/custom?theme=${theme}`);
  };

  return (
    <main className={`container mx-auto px-4 py-12 ${themeFont}`}>
      <GenerateHeader
        title="Choose Your Adventure Type"
        description="Select how you'd like to generate your world"
      />
      <div className="mt-12 flex flex-col items-center justify-center gap-6 sm:flex-row">
        <ActionButton
          onClick={handleSelectRandom}
          size="lg"
          className="w-full px-12 py-6 text-xl font-semibold sm:w-auto"
        >
          Random Adventure
        </ActionButton>
        <ActionButton
          onClick={handleSelectCustom}
          disabled
          size="lg"
          className="w-full px-12 py-6 text-xl font-semibold sm:w-auto"
        >
          Custom Adventure (Coming Soon)
        </ActionButton>
      </div>
    </main>
  );
}
