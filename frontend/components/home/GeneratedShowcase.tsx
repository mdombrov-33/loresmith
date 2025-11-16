"use client";

import { useIntersectionObserver } from "@/hooks/styling/useIntersectionObserver";
import { Scroll, Users, Zap, Gem, User } from "lucide-react";

export default function GeneratedShowcase() {
  const { elementRef, isVisible } = useIntersectionObserver();

  return (
    <section
      ref={elementRef}
      className="relative overflow-hidden bg-gradient-to-b from-background via-background/95 to-background py-16"
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
              When Clockwork Dreams Shatter the Frost
            </h3>
            <p className="text-muted-foreground mt-2 text-sm">Fantasy World</p>
          </div>
          <div className="p-8">
            <div className="mb-4 flex items-center gap-2">
              <Scroll className="text-primary h-5 w-5" />
              <span className="text-primary text-sm font-semibold uppercase tracking-wider">
                Your Quest
              </span>
            </div>
            <p className="text-foreground leading-relaxed">
              Cedric Fells has received a cryptic message from a reclusive
              clockmaker, hinting at long-lost blueprints for the mechanical
              heart of the city hidden within an ancient ice cavern, but he
              must navigate treacherous Wyrmkin-infested tunnels to retrieve
              them before they fall into the wrong hands.
            </p>
          </div>
        </div>

        {/* Lore Grid */}
        <div
          className={`mx-auto grid max-w-6xl gap-6 transition-all delay-200 duration-700 md:grid-cols-2 ${
            isVisible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
          }`}
        >
          {/* Protagonist Card */}
          <div className="border-border bg-card/50 overflow-hidden rounded-2xl border backdrop-blur-sm">
            <div className="bg-secondary/10 border-secondary/20 flex items-center gap-3 border-b px-6 py-4">
              <User className="text-secondary h-5 w-5" />
              <div>
                <div className="text-secondary text-xs font-semibold uppercase tracking-wider">
                  Protagonist
                </div>
                <div className="text-foreground text-lg font-bold">
                  Cedric Fells
                </div>
              </div>
            </div>
            <div className="p-6">
              <p className="text-muted-foreground mb-4 text-sm leading-relaxed">
                A young clockmaker in his mid-twenties with rugged features and
                unruly dark brown hair. A worn leather apron and cracked pocket
                watch tell the story of his craft.
              </p>
              <div className="mb-4 space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Knowledge</span>
                  <span className="text-foreground font-semibold">16</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Perception</span>
                  <span className="text-foreground font-semibold">17</span>
                </div>
              </div>
              <div className="bg-red-500/10 border-red-500/30 rounded-lg border p-3">
                <div className="text-red-400 mb-1 text-xs font-semibold uppercase">
                  Flaw
                </div>
                <div className="text-red-300 text-sm font-semibold">
                  Aquaphobia
                </div>
                <div className="text-red-200/70 text-xs">
                  Terror of deep water or drowning
                </div>
              </div>
            </div>
          </div>

          {/* Faction Card */}
          <div className="border-border bg-card/50 overflow-hidden rounded-2xl border backdrop-blur-sm">
            <div className="bg-primary/10 border-primary/20 flex items-center gap-3 border-b px-6 py-4">
              <Users className="text-primary h-5 w-5" />
              <div>
                <div className="text-primary text-xs font-semibold uppercase tracking-wider">
                  Faction
                </div>
                <div className="text-foreground text-lg font-bold">
                  Order of the Golden Spire
                </div>
              </div>
            </div>
            <div className="p-6">
              <p className="text-muted-foreground text-sm leading-relaxed">
                Members clothe themselves in intricately embroidered robes that
                shimmer like burnished copper and gold. They pursue a radical
                goal of liberating individuals from their memories through
                systematic recall using the rare hallucinogenic flower
                "Elysium's Tear".
              </p>
            </div>
          </div>

          {/* Setting Card */}
          <div className="border-border bg-card/50 overflow-hidden rounded-2xl border backdrop-blur-sm">
            <div className="bg-accent/10 border-accent/20 flex items-center gap-3 border-b px-6 py-4">
              <Zap className="text-accent h-5 w-5" />
              <div>
                <div className="text-accent text-xs font-semibold uppercase tracking-wider">
                  Setting
                </div>
                <div className="text-foreground text-lg font-bold">
                  Frostbitten Foothills
                </div>
              </div>
            </div>
            <div className="p-6">
              <p className="text-muted-foreground text-sm leading-relaxed">
                A treacherous landscape of icy spires and aurora-lit skies,
                where ancient rituals govern access to winds that fuel trade
                routes. Tensions simmer between Windcaller clans and merchant
                guilds over control of rare, gemstone-encrusted wind chimes.
              </p>
            </div>
          </div>

          {/* Relic Card */}
          <div className="border-border bg-card/50 overflow-hidden rounded-2xl border backdrop-blur-sm">
            <div className="bg-primary/10 border-primary/20 flex items-center gap-3 border-b px-6 py-4">
              <Gem className="text-primary h-5 w-5" />
              <div>
                <div className="text-primary text-xs font-semibold uppercase tracking-wider">
                  Relic
                </div>
                <div className="text-foreground text-lg font-bold">
                  Starweaver's Orb
                </div>
              </div>
            </div>
            <div className="p-6">
              <p className="text-muted-foreground text-sm leading-relaxed">
                A delicate, gemstone-encrusted clockwork sphere the size of an
                eyeball, its intricate gears rusting to reveal copper threads
                like veins. Those who gaze into its mirrored surface begin to
                recall fragments of their own forgotten dreams.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
