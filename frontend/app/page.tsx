"use client";

import Hero from "@/components/home/Hero";
import ThemeShowcase from "@/components/home/ThemeShowcase";
import HowItWorks from "@/components/home/HowItWorks";
import CTA from "@/components/home/CTA";
import { useAppStore } from "@/stores/appStore";
import { useEffect } from "react";
import { useSearchParams } from "next/navigation";

export default function Home() {
  const { setAppStage, setTheme } = useAppStore();
  const searchParams = useSearchParams();

  useEffect(() => {
    setAppStage("home");
  }, [setAppStage]);

  useEffect(() => {
    const themeFromQuery = searchParams.get("theme");
    if (themeFromQuery) {
      setTheme(themeFromQuery);
    }
  }, [searchParams, setTheme]);

  return (
    <main className="bg-background min-h-screen">
      <Hero />
      <ThemeShowcase />
      <HowItWorks />
      <CTA />
    </main>
  );
}
