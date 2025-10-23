"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useAppStore } from "@/stores/appStore";
import { toast } from "sonner";

export default function Hero() {
  const searchParams = useSearchParams();
  const theme = searchParams.get("theme") || "fantasy";
  const { user, setIsLoginModalOpen } = useAppStore();

  return (
    <section className="container mx-auto px-4 py-24 md:py-32">
      <div className="flex flex-col items-center justify-center gap-8 text-center">
        {/* Beta Badge */}
        <div className="border-border bg-card inline-flex items-center gap-2 rounded-full border px-4 py-2">
          <span className="relative flex h-2 w-2">
            <span className="bg-primary absolute inline-flex h-full w-full animate-ping rounded-full opacity-75"></span>
            <span className="bg-primary relative inline-flex h-2 w-2 rounded-full"></span>
          </span>
          <span className="text-muted-foreground text-sm">
            Now in Open Beta
          </span>
        </div>

        {/* Main Heading */}
        <h1 className="text-foreground max-w-5xl text-5xl font-bold tracking-tight md:text-7xl">
          Create & Play Epic Adventures
        </h1>

        {/* Subheading */}
        <p className="text-muted-foreground max-w-3xl text-xl">
          Generate unique worlds, assemble your party, and embark on AI-driven
          interactive adventures where every choice matters
        </p>

        {/* CTA Button */}
        <Button
          asChild
          variant="default"
          size="lg"
          className="group bg-primary text-primary-foreground mt-4 rounded-lg px-8 py-4 text-lg font-semibold shadow-lg transition-all hover:scale-105 hover:shadow-xl"
        >
          <Link
            href={`/generate?theme=${theme}`}
            onClick={(e) => {
              if (!user) {
                e.preventDefault();
                toast("Please login to start your adventure", {
                  action: {
                    label: "Login",
                    onClick: () => setIsLoginModalOpen(true),
                  },
                });
              }
            }}
          >
            Begin Your Adventure
            <span className="ml-2 inline-block transition-transform group-hover:translate-x-1">
              →
            </span>
          </Link>
        </Button>
      </div>
    </section>
  );
}
