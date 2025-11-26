"use client";

import { useAppStore } from "@/stores/appStore";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Logo from "@/components/shared/Logo";
import { PrimaryButton, SecondaryButton } from "@/components/shared/buttons";
import { LoginModal } from "@/components/navbar/LoginModal";
import { RegisterModal } from "@/components/navbar/RegisterModal";
import Image from "next/image";
import { Wand2, Gamepad2, Globe2, Scroll, Users, Zap, Gem, AlertTriangle, BookOpen, Eye, Heart, Brain, Lightbulb, ArrowRight, Sparkles } from "lucide-react";
import { InfiniteMovingCards } from "@/components/ui/infinite-moving-cards";
import { ScrollProgress } from "@/components/ui/scroll-progress";
import CardImage from "@/components/shared/card/CardImage";
import { getTraitIcon, getTraitColor } from "@/lib/trait-icons";
import Link from "next/link";

export default function Home() {
  const {
    setAppStage,
    user,
    isLoginModalOpen,
    setIsLoginModalOpen,
    isRegisterModalOpen,
    setIsRegisterModalOpen,
  } = useAppStore();
  const router = useRouter();
  const isAuthenticated = !!user;

  useEffect(() => {
    setAppStage("home");
  }, [setAppStage]);

  const handleStartCreating = () => {
    if (isAuthenticated) {
      router.push("/my-worlds");
    } else {
      setIsLoginModalOpen(true);
    }
  };

  const portraitUrl = `${process.env.NEXT_PUBLIC_R2_PORTRAITS_URL}/portraits/162/477_portrait.png`;

  // Static curated worlds for public homepage (since auth is required for API)
  const curatedWorlds = [
    {
      quote: "Eira Flynn has stumbled upon an ancient prophecy hidden within the Korvus Crucible Key, foretelling a catastrophic convergence of the Elements that threatens to shatter Krael's Spirehold.",
      name: "Beyond the Shattered Spires of Old",
      title: "Fantasy",
    },
    {
      quote: "In the neon-soaked streets of Neo-Tokyo, corporate secrets and street samurai collide in a brutal battle for control of the digital underground.",
      name: "Neon Shadows of Neo-Tokyo",
      title: "Cyberpunk",
    },
    {
      quote: "When the old world fell to nuclear fire, humanity's remnants gathered at the edges of the irradiated wasteland, forging desperate alliances in the ashes.",
      name: "The Last Bastion",
      title: "Post-Apocalyptic",
    },
    {
      quote: "The All-Father's ravens have spoken: Ragnarok approaches, and the Nine Realms tremble as ancient enemies gather their forces for the final battle.",
      name: "Echoes of Valhalla",
      title: "Norse Mythology",
    },
    {
      quote: "In the brass-and-steam city of Cogsworth, an inventor's guild discovers blueprints for a machine that could rewrite reality itself.",
      name: "The Clockwork Conspiracy",
      title: "Steampunk",
    },
    {
      quote: "Deep beneath the Crystal Caverns, an ancient dragon stirs from its thousand-year slumber, sensing the return of the Lost Crown.",
      name: "Dragon's Awakening",
      title: "Fantasy",
    },
  ];

  return (
    <main className="min-h-screen relative">
      <ScrollProgress className="top-0" />

      {/* Hero Section */}
      <div className="relative h-screen w-full">
        <Image
          src="/images/backgrounds/hero.png"
          alt="Hero background"
          fill
          className="object-cover"
          priority
          quality={100}
        />
        {/* Dark overlay for readability */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/70" />

        {/* Logo - top left */}
        <div className="absolute left-8 top-8 z-10">
          <Logo size="sm" />
        </div>

        {/* Sign In button - top right */}
        <div className="absolute right-8 top-8 z-10">
          <PrimaryButton onClick={() => setIsLoginModalOpen(true)}>
            <span className="text-sm font-medium tracking-wide">Sign In</span>
          </PrimaryButton>
        </div>

        {/* Upper Center Logo Card - moved up to not cover forge */}
        <div className="absolute inset-x-0 top-1/4 z-10 flex justify-center">
          <div className="rounded-2xl bg-black/80 backdrop-blur-md border border-primary/20 px-16 py-12 shadow-2xl">
            <Logo size="lg" showTagline />
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="absolute inset-x-0 bottom-24 z-10 flex justify-center">
          <SecondaryButton
            onClick={handleStartCreating}
            containerClassName="rounded-xl"
            className="bg-black/80 backdrop-blur-md text-white px-12 py-4 text-lg font-semibold tracking-wide hover:bg-black/90"
          >
            Start Creating
          </SecondaryButton>
        </div>
      </div>

      {/* What is LoreSmith Section */}
      <section className="relative bg-background py-16">
        <div className="container mx-auto px-4">
          {/* Section Header */}
          <div className="mb-16 text-center">
            <h2 className="mb-4 text-4xl font-bold md:text-5xl">
              What is <span className="text-primary">LoreSmith</span>?
            </h2>
            <p className="text-muted-foreground mx-auto max-w-2xl text-xl">
              AI-powered platform that generates thematic worlds and transforms them into playable text-based RPG adventures
            </p>
          </div>

          {/* Feature Cards */}
          <div className="mx-auto grid max-w-6xl gap-8 md:grid-cols-3">
            {/* Create Worlds */}
            <div className="group relative overflow-hidden rounded-2xl border border-primary/20 bg-card/50 p-8 backdrop-blur-sm transition-all duration-300 hover:border-primary/50 hover:bg-card/80 hover:shadow-lg hover:shadow-primary/10">
              <div className="mb-6 inline-flex rounded-xl bg-primary/10 p-4">
                <Wand2 className="h-8 w-8 text-primary" />
              </div>
              <h3 className="mb-3 text-2xl font-bold">Generate Worlds</h3>
              <p className="text-muted-foreground leading-relaxed">
                AI creates rich lore with characters, factions, settings, and quests across multiple genres
              </p>
            </div>

            {/* Play Adventures */}
            <div className="group relative overflow-hidden rounded-2xl border border-secondary/20 bg-card/50 p-8 backdrop-blur-sm transition-all duration-300 hover:border-secondary/50 hover:bg-card/80 hover:shadow-lg hover:shadow-secondary/10">
              <div className="mb-6 inline-flex rounded-xl bg-secondary/10 p-4">
                <Gamepad2 className="h-8 w-8 text-secondary" />
              </div>
              <h3 className="mb-3 text-2xl font-bold">Play Adventures</h3>
              <p className="text-muted-foreground leading-relaxed">
                Embark on dynamic text-based RPG adventures with party management, choices, and consequences
              </p>
            </div>

            {/* Explore & Share */}
            <div className="group relative overflow-hidden rounded-2xl border border-accent/20 bg-card/50 p-8 backdrop-blur-sm transition-all duration-300 hover:border-accent/50 hover:bg-card/80 hover:shadow-lg hover:shadow-accent/10">
              <div className="mb-6 inline-flex rounded-xl bg-accent/10 p-4">
                <Globe2 className="h-8 w-8 text-accent" />
              </div>
              <h3 className="mb-3 text-2xl font-bold">Discover Worlds</h3>
              <p className="text-muted-foreground leading-relaxed">
                Browse community-created worlds with advanced AI-powered search and thematic filters
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* See What Gets Created */}
      <section className="relative overflow-hidden bg-gradient-to-b from-background via-background/95 to-background py-16">
        <div className="container mx-auto px-4">
          {/* Section header */}
          <div className="mb-16 text-center">
            <h2 className="mb-4 text-4xl font-bold md:text-5xl">
              See What Gets Created
            </h2>
            <p className="text-muted-foreground mx-auto max-w-2xl text-xl">
              Real example from a generated fantasy world
            </p>
          </div>

          {/* World Title Card */}
          <div className="mx-auto mb-12 max-w-4xl overflow-hidden rounded-2xl border border-primary/30 bg-card/50 backdrop-blur-sm">
            <div className="border-b border-primary/20 bg-primary/5 px-8 py-6">
              <h3 className="text-3xl font-bold">
                Beyond the Shattered Spires of Old
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
              <p className="leading-relaxed">
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

          {/* Character Cards */}
          <div className="mx-auto mb-12 grid max-w-6xl gap-6 md:grid-cols-2">
            {/* Character Front */}
            <div className="overflow-hidden rounded-xl border-2 border-border bg-card">
              <CardImage
                src={portraitUrl}
                alt="Eira Flynn"
                objectFit="contain"
                height="h-56"
                priority={true}
              />
              <div className="flex flex-col p-4">
                <div className="mb-2 flex items-center justify-between">
                  <h3 className="text-lg font-semibold">Eira Flynn</h3>
                  <span className="rounded bg-accent/10 px-2 py-1 text-xs font-semibold uppercase text-accent">
                    Character
                  </span>
                </div>
                <p className="text-muted-foreground mb-3 text-sm leading-relaxed">
                  People know Eira Flynn for crafting intricate wooden carvings
                  that seem to defy the darkness outside her workshop. What they
                  don&apos;t know: she&apos;s been searching for a rare wood
                  species said to hold the essence of the ancient forest.
                </p>
              </div>
            </div>

            {/* Character Back */}
            <div className="overflow-hidden rounded-xl border-2 border-border bg-card">
              <CardImage
                src={portraitUrl}
                alt="Eira Flynn"
                objectFit="contain"
                height="h-48"
                className="mb-4"
                priority={true}
              />
              <div className="space-y-3 px-4 pb-4">
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
                          className="flex items-center gap-1.5 rounded-lg border border-border bg-muted/50 px-3 py-1.5"
                        >
                          <TraitIcon className={`h-4 w-4 ${colorClass}`} />
                          <span className="text-sm font-medium">{trait}</span>
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
                    <span className="text-sm font-bold">125</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Brain className="h-4 w-4 text-blue-500" />
                    <span className="text-muted-foreground text-xs">Stress</span>
                    <span className="text-sm font-bold">10</span>
                  </div>
                </div>

                {/* Flaw */}
                <div className="rounded-lg border border-red-500/20 bg-red-500/5 p-3">
                  <div className="mb-1 flex items-center gap-1.5">
                    <AlertTriangle className="h-3.5 w-3.5 text-red-500" />
                    <div className="text-xs font-semibold uppercase text-red-500">
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
              </div>
            </div>
          </div>

          {/* Lore Cards */}
          <div className="mx-auto grid max-w-6xl gap-6 md:grid-cols-2">
            {[
              {
                icon: Zap,
                label: "Event",
                title: "The Maelstrom of Eternity",
                description: "The Last Oracle spoke an ancient incantation, shattering the Star-Eater crystal in the heart of the Celestial Spires.",
              },
              {
                icon: Users,
                label: "Faction",
                title: "Khra'gixx Brotherhood",
                description: "Members wear tattered robes adorned with intricate fungal growth patterns in dark green and crimson thread.",
              },
              {
                icon: Gem,
                label: "Setting",
                title: "Krael's Spirehold",
                description: "The windswept badlands writhe under the weight of ancient power, as iridescent crystals provide mystical energy.",
              },
              {
                icon: Scroll,
                label: "Relic",
                title: "Korvus Crucible Key",
                description: "A rusty iron key with an oversized head that draws attention from others, making them act irrationally.",
              },
            ].map((card) => (
              <div
                key={card.title}
                className="group overflow-hidden rounded-xl border border-border bg-card/30 p-6 backdrop-blur-sm transition-all hover:border-primary/50 hover:bg-card/50"
              >
                <div className="mb-4 flex items-center gap-3">
                  <div className="rounded-lg bg-primary/10 p-2">
                    <card.icon className="h-5 w-5 text-primary" />
                  </div>
                  <span className="text-xs font-semibold uppercase tracking-wider text-primary">
                    {card.label}
                  </span>
                </div>
                <h3 className="mb-3 text-xl font-bold">{card.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{card.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="relative overflow-hidden py-16">
        <div className="container mx-auto px-4">
          {/* Section Header */}
          <div className="mb-16 text-center">
            <h2 className="mb-4 text-4xl font-bold md:text-5xl">How It Works</h2>
            <p className="text-muted-foreground mx-auto max-w-2xl text-xl">
              From concept to adventure in minutes
            </p>
          </div>

          {/* Steps */}
          <div className="mx-auto max-w-5xl space-y-8">
            {[
              {
                number: "01",
                title: "Choose Your Theme",
                description: "Select from five distinct worlds - each with its own visual style, narrative voice, and storytelling elements.",
                details: "Themes: Fantasy · Norse Mythology · Cyberpunk · Steampunk · Post-Apocalyptic",
              },
              {
                number: "02",
                title: "Generate & Customize",
                description: "Our AI crafts a complete world: rich backstory, compelling characters, intricate factions, and story hooks.",
                details: "Generated: World Lore · Characters · Factions · Story Hooks · Visual Portraits",
              },
              {
                number: "03",
                title: "Play Your Story",
                description: "Embark on an interactive narrative where every choice matters. Face moral dilemmas, manage your party's health and stress.",
                details: "Features: Choice-driven narrative · Character progression · Consequence system",
              },
            ].map((step, index) => (
              <div
                key={index}
                className="group relative overflow-hidden rounded-2xl border border-border bg-card/30 backdrop-blur-sm transition-all hover:border-primary/50"
              >
                <div className="flex flex-col gap-6 p-8 md:flex-row md:items-center md:gap-8">
                  {/* Number */}
                  <div className="flex-shrink-0">
                    <div className="bg-gradient-to-br from-primary to-primary/50 bg-clip-text text-6xl font-bold text-transparent md:text-7xl">
                      {step.number}
                    </div>
                  </div>

                  {/* Content */}
                  <div className="flex-1">
                    <h3 className="mb-3 text-2xl font-bold md:text-3xl">{step.title}</h3>
                    <p className="text-muted-foreground mb-4 text-lg leading-relaxed">
                      {step.description}
                    </p>
                    <div className="rounded-lg border border-primary/20 bg-background/50 px-4 py-3">
                      <p className="text-sm text-primary/80">{step.details}</p>
                    </div>
                  </div>

                  {/* Arrow */}
                  <div className="flex-shrink-0 opacity-0 transition-opacity group-hover:opacity-100">
                    <ArrowRight className="text-primary h-8 w-8" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Curated Worlds */}
      <section className="relative overflow-hidden bg-gradient-to-b from-background to-background/95 py-16">
        <div className="container mx-auto px-4">
          <div className="mb-16 text-center">
            <h2 className="mb-4 text-4xl font-bold md:text-5xl">Curated Worlds</h2>
            <p className="text-muted-foreground mx-auto max-w-2xl text-xl">
              Explore handpicked adventures across different themes
            </p>
          </div>

          <div className="flex flex-col items-center justify-center overflow-hidden rounded-lg antialiased">
            <InfiniteMovingCards items={curatedWorlds} direction="right" speed="slow" />
          </div>
        </div>
      </section>

      {/* Plans CTA */}
      <section className="relative overflow-hidden bg-gradient-to-b from-background to-background/95 py-16">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="mb-4 text-4xl font-bold md:text-5xl">Ready to Begin?</h2>
            <p className="text-muted-foreground mb-8 text-xl">
              Explore our plans and unlock unlimited world creation
            </p>
            <div className="flex justify-center">
              <Link href="/plans">
                <PrimaryButton className="px-12 py-4">
                  <span className="text-lg font-semibold tracking-wide">View Plans</span>
                </PrimaryButton>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Auth Modals */}
      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        onSwitchToRegister={() => {
          setIsLoginModalOpen(false);
          setIsRegisterModalOpen(true);
        }}
      />
      <RegisterModal
        isOpen={isRegisterModalOpen}
        onClose={() => setIsRegisterModalOpen(false)}
        onSwitchToLogin={() => {
          setIsRegisterModalOpen(false);
          setIsLoginModalOpen(true);
        }}
      />
    </main>
  );
}
