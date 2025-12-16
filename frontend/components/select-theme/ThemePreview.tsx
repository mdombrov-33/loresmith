import Image from "next/image";
import { Sparkles, ArrowRight } from "lucide-react";
import { Spotlight } from "@/components/ui/spotlight";
import { ShimmerButton } from "@/components/ui/shimmer-button";
import { THEME_DESCRIPTIONS } from "@/constants/theme-descriptions";

interface ThemePreviewProps {
  selectedTheme: string;
  selectedThemeLabel: string;
  particles: React.ReactNode;
  onContinue: () => void;
}

export default function ThemePreview({
  selectedTheme,
  selectedThemeLabel,
  particles,
  onContinue,
}: ThemePreviewProps) {
  const themeInfo = THEME_DESCRIPTIONS[selectedTheme];

  return (
    <main className="relative flex-1 overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0">
        <Image
          src={`/images/backgrounds/${selectedTheme === "post-apocalyptic" ? "post-apocalypse" : selectedTheme}.png`}
          alt={selectedThemeLabel}
          fill
          className="object-cover object-[50%_35%] transition-opacity duration-500 md:object-center"
          priority
        />
      </div>

      {/* Particles Overlay */}
      <div className="absolute inset-0 z-10">{particles}</div>

      {/* Dark overlay for readability */}
      <div className="absolute inset-0 z-20 bg-gradient-to-b from-black/70 via-black/50 to-black/80 md:from-black/60 md:via-black/40 md:to-black/70" />

      {/* Spotlight effect */}
      <Spotlight
        className="-top-40 left-0 md:-top-20 md:left-60"
        fill="white"
      />

      {/* Content - Description Panel (Centered) */}
      <div className="absolute inset-0 z-40 flex items-center justify-center p-4 md:p-8 lg:p-12">
        <div className="w-full max-w-2xl">
          {/* Glass morphism card */}
          <div className="border-primary/20 bg-card/90 relative overflow-hidden rounded-2xl border p-6 shadow-2xl backdrop-blur-xl md:p-8">
            {/* Top gradient accent */}
            <div className="via-primary/50 absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent to-transparent" />

            {/* Content */}
            <div className="relative z-10">
              {/* Theme name with sparkle */}
              <div className="mb-3 flex items-center gap-2 md:mb-4 md:gap-3">
                <Sparkles className="text-primary h-5 w-5 md:h-6 md:w-6" />
                <h2 className="font-heading text-foreground text-2xl font-bold md:text-4xl lg:text-5xl">
                  {selectedThemeLabel}
                </h2>
              </div>

              {/* Description */}
              <p className="text-muted-foreground mb-4 text-sm leading-relaxed md:mb-6 md:text-lg">
                {themeInfo?.description}
              </p>

              {/* Features */}
              <div className="mb-6 flex justify-center md:mb-8">
                <div className="grid grid-cols-2 gap-x-4 gap-y-2 md:gap-x-6 md:gap-y-3">
                  {themeInfo?.features.map((feature, idx) => (
                    <div
                      key={idx}
                      className="text-foreground/80 flex items-center gap-2 text-xs md:text-sm"
                    >
                      <div className="bg-primary h-1.5 w-1.5 flex-shrink-0 rounded-full" />
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Continue Button */}
              <div className="flex justify-center">
                <ShimmerButton
                  onClick={onContinue}
                  className="h-10 px-6 text-sm font-semibold md:h-12 md:px-8 md:text-base"
                  shimmerColor="hsl(var(--primary))"
                  background="hsl(var(--primary))"
                >
                  <span className="flex items-center gap-2">
                    Continue to Generation
                    <ArrowRight className="h-4 w-4 md:h-5 md:w-5" />
                  </span>
                </ShimmerButton>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
