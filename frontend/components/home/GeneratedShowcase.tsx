"use client";

import { useIntersectionObserver } from "@/hooks/styling/useIntersectionObserver";
import {
  Scroll,
  Users,
  Zap,
  Gem,
  AlertTriangle,
  BookOpen,
  Users as UsersIcon,
  Lightbulb,
  Eye,
  Heart,
  Brain,
} from "lucide-react";
import CardImage from "@/components/shared/card/CardImage";
import GeneratedShowcaseCard from "@/components/home/GeneratedShowcaseCard";
import { getTraitIcon, getTraitColor } from "@/lib/trait-icons";

export default function GeneratedShowcase() {
  const { elementRef, isVisible } = useIntersectionObserver();

  const portraitUrl = `${process.env.NEXT_PUBLIC_R2_PORTRAITS_URL}/portraits/162/477_portrait.png`;

  const loreCards = [
    {
      icon: Zap,
      label: "Event",
      title: "The Maelstrom of Eternity",
      description:
        "The Last Oracle spoke an ancient incantation, shattering the Star-Eater crystal in the heart of the Celestial Spires. A cataclysmic shockwave ravaged the skies, plunging the land into a perpetual twilight. The balance of the Elements is now skewed, as earthquakes and wildfires erupt with unpredictable ferocity.",
    },
    {
      icon: Users,
      label: "Faction",
      title: "Khra'gixx Brotherhood",
      description:
        "Members of the Khra'gixx Brotherhood wear tattered robes adorned with intricate fungal growth patterns in dark green and crimson thread, while polished obsidian skulls reflect their reverence for the ancient fungi that symbiotically fuse with their souls.",
    },
    {
      icon: Zap,
      label: "Setting",
      title: "Krael's Spirehold",
      description:
        "The windswept badlands of Krael's Spirehold writhe under the weight of ancient power, as iridescent crystals embedded in the shattered obsidian are the sole source of mystical energy. The Windcallers, masters of aeromancy, ration access to these precious resources through hereditary rites.",
    },
    {
      icon: Gem,
      label: "Relic",
      title: "Korvus Crucible Key",
      description:
        "Korvus Crucible Key is a rusty iron key with an oversized head and a worn wooden handle. Its presence seems to draw attention from other people, making them act irrationally or reveal secrets they'd rather keep hidden.",
    },
  ];

  return (
    <section
      ref={elementRef}
      className="from-background via-background/95 to-background relative overflow-hidden bg-gradient-to-b py-16"
    >
      <div className="relative container mx-auto px-4">
        {/* Section header */}
        <div className="mb-12 text-center">
          <div
            className={`transition-all duration-700 ${
              isVisible
                ? "translate-y-0 opacity-100"
                : "translate-y-4 opacity-0"
            }`}
          >
            <h2 className="text-foreground mb-4 text-4xl font-bold md:text-5xl">
              See What Gets Created
            </h2>
            <p className="text-muted-foreground mx-auto max-w-2xl text-xl">
              Real example from a generated fantasy world
            </p>
          </div>
        </div>

        {/* World Title Card */}
        <div
          className={`border-primary/30 bg-card/50 mx-auto mb-8 max-w-4xl overflow-hidden rounded-2xl border backdrop-blur-sm transition-all duration-700 ${
            isVisible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
          }`}
        >
          <div className="bg-primary/5 border-primary/20 border-b px-8 py-6">
            <h3 className="text-foreground text-3xl font-bold">
              Beyond the Shattered Spires of Old
            </h3>
            <p className="text-muted-foreground mt-2 text-sm">Fantasy World</p>
          </div>
          <div className="p-8">
            <div className="mb-4 flex items-center gap-2">
              <Scroll className="text-primary h-5 w-5" />
              <span className="text-primary text-sm font-semibold tracking-wider uppercase">
                Your Quest
              </span>
            </div>
            <p className="text-foreground leading-relaxed">
              Eira Flynn has stumbled upon an ancient prophecy hidden within the
              Korvus Crucible Key, foretelling a catastrophic convergence of the
              Elements that threatens to shatter Krael&apos;s Spirehold. To
              prevent this disaster, she must decipher the relic&apos;s secrets
              and reach the fabled Resonant Convergence before it&apos;s too
              late, but doing so will require navigating treacherous alliances
              with rival factions and confronting the dark forces manipulating
              them from the shadows.
            </p>
          </div>
        </div>

        {/* Character Cards - Front & Back */}
        <div
          className={`mx-auto mb-8 grid max-w-6xl gap-6 transition-all delay-100 duration-700 md:grid-cols-2 ${
            isVisible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
          }`}
        >
          {/* Character Front */}
          <div className="bg-card border-border overflow-hidden rounded-xl border-2">
            <CardImage
              src={portraitUrl}
              alt="Eira Flynn"
              objectFit="contain"
              height="h-56"
              priority={true}
            />
            <div className="flex flex-col p-4">
              <div className="mb-2 flex items-center justify-between">
                <h3 className="text-foreground text-lg font-semibold">
                  Eira Flynn
                </h3>
                <span className="text-accent bg-accent/10 rounded px-2 py-1 text-xs font-semibold uppercase">
                  Character
                </span>
              </div>
              <p className="text-muted-foreground mb-3 text-sm leading-relaxed">
                People know Eira Flynn for crafting intricate wooden carvings
                that seem to defy the darkness outside her workshop. What they
                don&apos;t know: she&apos;s been searching for a rare wood
                species said to hold the essence of the ancient forest, rumored
                to have fallen victim to the great shadow that consumed their
                world.
              </p>
            </div>
          </div>

          {/* Character Back */}
          <div className="bg-card border-border overflow-hidden rounded-xl border-2">
            <CardImage
              src={portraitUrl}
              alt="Eira Flynn"
              objectFit="contain"
              height="h-48"
              className="mb-4"
              priority={true}
            />
            <div className="space-y-3 px-4 pb-4">
              {/* Traits + Health/Stress Row */}
              <div className="flex items-start justify-between gap-4">
                {/* Traits */}
                <div className="flex-1">
                  <div className="text-accent mb-2 text-xs font-semibold uppercase">
                    Personality Traits
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {["Brave", "Honorable", "Curious"].map((trait) => {
                      const TraitIcon = getTraitIcon(trait);
                      const colorClass = getTraitColor(trait);
                      return (
                        <div
                          key={trait}
                          className="bg-muted/50 border-border flex items-center gap-1.5 rounded-lg border px-3 py-1.5"
                        >
                          <TraitIcon className={`h-4 w-4 ${colorClass}`} />
                          <span className="text-foreground text-sm font-medium">
                            {trait}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Health & Stress */}
                <div className="flex gap-4">
                  <div className="flex items-center gap-1.5">
                    <Heart className="h-4 w-4 text-red-500" />
                    <span className="text-muted-foreground text-xs">Health</span>
                    <span className="text-foreground text-sm font-bold">125</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Brain className="h-4 w-4 text-blue-500" />
                    <span className="text-muted-foreground text-xs">Stress</span>
                    <span className="text-foreground text-sm font-bold">10</span>
                  </div>
                </div>
              </div>

              {/* Flaw */}
              <div className="rounded-lg border border-red-500/20 bg-red-500/5 p-3">
                <div className="mb-1 flex items-center gap-1.5">
                  <AlertTriangle className="h-3.5 w-3.5 text-red-500" />
                  <div className="text-xs font-semibold text-red-500 uppercase">
                    Flaw
                  </div>
                </div>
                <div className="text-sm font-semibold text-red-400">
                  Survivor&apos;s Guilt
                </div>
                <div className="mt-0.5 text-xs text-red-300/70">
                  Haunted by deaths of fallen comrades
                </div>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-4 gap-2 pt-2">
                <div className="bg-muted/30 flex flex-col items-center gap-1 rounded-lg p-2">
                  <BookOpen className="h-4 w-4 text-yellow-500" />
                  <span className="text-muted-foreground text-[10px]">
                    Knowledge
                  </span>
                  <span className="text-foreground text-sm font-bold">16</span>
                </div>
                <div className="bg-muted/30 flex flex-col items-center gap-1 rounded-lg p-2">
                  <Eye className="h-4 w-4 text-indigo-500" />
                  <span className="text-muted-foreground text-[10px]">
                    Perception
                  </span>
                  <span className="text-foreground text-sm font-bold">15</span>
                </div>
                <div className="bg-muted/30 flex flex-col items-center gap-1 rounded-lg p-2">
                  <UsersIcon className="h-4 w-4 text-pink-500" />
                  <span className="text-muted-foreground text-[10px]">
                    Empathy
                  </span>
                  <span className="text-foreground text-sm font-bold">14</span>
                </div>
                <div className="bg-muted/30 flex flex-col items-center gap-1 rounded-lg p-2">
                  <Lightbulb className="h-4 w-4 text-orange-500" />
                  <span className="text-muted-foreground text-[10px]">
                    Creativity
                  </span>
                  <span className="text-foreground text-sm font-bold">13</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Lore Grid */}
        <div
          className={`mx-auto grid max-w-6xl gap-6 transition-all delay-200 duration-700 md:grid-cols-2 ${
            isVisible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
          }`}
        >
          {loreCards.map((card) => (
            <GeneratedShowcaseCard
              key={card.title}
              icon={card.icon}
              label={card.label}
              title={card.title}
              description={card.description}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
