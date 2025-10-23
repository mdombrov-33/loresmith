"use client";

import Hero from "@/components/home/Hero";
import Features from "@/components/home/Features";
import HowItWorks from "@/components/home/HowItWorks";
import CTA from "@/components/home/CTA";
import { useAppStore } from "@/stores/appStore";
import { useEffect } from "react";

export default function Home() {
  const { setAppStage } = useAppStore();

  useEffect(() => {
    setAppStage("home");
  }, [setAppStage]);

  return (
    <main className="bg-background min-h-screen">
      <Hero />
      <Features />
      <HowItWorks />
      <CTA />
    </main>
  );
}
