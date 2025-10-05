export default function Home() {
  return (
    <main className="bg-background min-h-screen">
      {/* Hero Section */}
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
          <button className="group bg-primary text-primary-foreground mt-4 rounded-lg px-8 py-4 text-lg font-semibold shadow-lg transition-all hover:scale-105 hover:shadow-xl">
            Begin Your Adventure
            <span className="ml-2 inline-block transition-transform group-hover:translate-x-1">
              →
            </span>
          </button>
        </div>
      </section>

      {/* Features Grid */}
      <section className="container mx-auto px-4 py-20">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {/* World Generation */}
          <div className="group border-border bg-card hover:border-primary rounded-xl border p-6 transition-all hover:shadow-lg">
            <div className="bg-primary text-primary-foreground mb-4 flex h-14 w-14 items-center justify-center rounded-xl text-3xl transition-transform group-hover:scale-110">
              🌍
            </div>
            <h3 className="text-card-foreground mb-2 text-xl font-bold">
              World Generation
            </h3>
            <p className="text-muted-foreground">
              Create rich lore and compelling narratives with AI-powered world
              building
            </p>
          </div>

          {/* Party Management */}
          <div className="group border-border bg-card hover:border-secondary rounded-xl border p-6 transition-all hover:shadow-lg">
            <div className="bg-secondary text-secondary-foreground mb-4 flex h-14 w-14 items-center justify-center rounded-xl text-3xl transition-transform group-hover:scale-110">
              👥
            </div>
            <h3 className="text-card-foreground mb-2 text-xl font-bold">
              Party Management
            </h3>
            <p className="text-muted-foreground">
              Assemble heroes with unique abilities and dynamic relationships
            </p>
          </div>

          {/* Interactive Adventure */}
          <div className="group border-border bg-card hover:border-accent rounded-xl border p-6 transition-all hover:shadow-lg">
            <div className="bg-accent text-accent-foreground mb-4 flex h-14 w-14 items-center justify-center rounded-xl text-3xl transition-transform group-hover:scale-110">
              ⚔️
            </div>
            <h3 className="text-card-foreground mb-2 text-xl font-bold">
              Interactive Adventure
            </h3>
            <p className="text-muted-foreground">
              Make choices that shape your story with branching narratives
            </p>
          </div>

          {/* Character Progression */}
          <div className="group border-border bg-card hover:border-primary rounded-xl border p-6 transition-all hover:shadow-lg">
            <div className="bg-primary text-primary-foreground mb-4 flex h-14 w-14 items-center justify-center rounded-xl text-3xl transition-transform group-hover:scale-110">
              📊
            </div>
            <h3 className="text-card-foreground mb-2 text-xl font-bold">
              Character Progression
            </h3>
            <p className="text-muted-foreground">
              Track health, stress, inventory and watch your heroes evolve
            </p>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="mb-12 text-center">
          <h2 className="text-foreground mb-4 text-4xl font-bold">
            How It Works
          </h2>
          <p className="text-muted-foreground text-xl">
            From idea to adventure in three simple steps
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-3">
          {/* Step 1 */}
          <div className="flex flex-col items-center text-center">
            <div className="bg-primary text-primary-foreground mb-4 flex h-16 w-16 items-center justify-center rounded-full text-2xl font-bold">
              1
            </div>
            <h3 className="text-foreground mb-2 text-xl font-bold">
              Choose Your Theme
            </h3>
            <p className="text-muted-foreground">
              Select from Fantasy, Norse, Cyberpunk, Post-Apocalyptic, or
              Steampunk settings
            </p>
          </div>

          {/* Step 2 */}
          <div className="flex flex-col items-center text-center">
            <div className="bg-secondary text-secondary-foreground mb-4 flex h-16 w-16 items-center justify-center rounded-full text-2xl font-bold">
              2
            </div>
            <h3 className="text-foreground mb-2 text-xl font-bold">
              Build Your World
            </h3>
            <p className="text-muted-foreground">
              Let AI generate unique locations, NPCs, and quests tailored to
              your theme
            </p>
          </div>

          {/* Step 3 */}
          <div className="flex flex-col items-center text-center">
            <div className="bg-accent text-accent-foreground mb-4 flex h-16 w-16 items-center justify-center rounded-full text-2xl font-bold">
              3
            </div>
            <h3 className="text-foreground mb-2 text-xl font-bold">
              Start Playing
            </h3>
            <p className="text-muted-foreground">
              Dive into your adventure and make choices that shape the narrative
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-24">
        <div className="border-border bg-card relative overflow-hidden rounded-2xl border p-12 text-center shadow-xl md:p-20">
          <div className="relative z-10 flex flex-col items-center gap-6">
            <h2 className="text-card-foreground max-w-3xl text-4xl font-bold md:text-5xl">
              Ready to Build Worlds?
            </h2>
            <p className="text-muted-foreground max-w-2xl text-lg">
              Join storytellers and adventurers creating epic narratives with
              AI. Every world is unique, every adventure is yours to shape.
            </p>
          </div>

          {/* Decorative blur */}
          <div className="bg-primary absolute -top-20 -right-20 h-64 w-64 rounded-full opacity-10 blur-3xl"></div>
          <div className="bg-secondary absolute -bottom-20 -left-20 h-64 w-64 rounded-full opacity-10 blur-3xl"></div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-border bg-card mt-20 border-t">
        <div className="container mx-auto px-4 py-12">
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            {/* Adventure Features */}
            <div>
              <h3 className="text-card-foreground mb-4 text-lg font-bold">
                Adventure Features
              </h3>
              <ul className="text-muted-foreground space-y-2">
                <li>
                  <a href="#" className="hover:text-primary transition">
                    AI World Generation
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-primary transition">
                    Interactive Gameplay
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-primary transition">
                    Party Management
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-primary transition">
                    Dynamic Encounters
                  </a>
                </li>
              </ul>
            </div>

            {/* Game Themes */}
            <div>
              <h3 className="text-card-foreground mb-4 text-lg font-bold">
                Game Themes
              </h3>
              <ul className="text-muted-foreground space-y-2">
                <li>
                  <a href="#" className="hover:text-primary transition">
                    High Fantasy
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-primary transition">
                    Norse Mythology
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-primary transition">
                    Cyberpunk Future
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-primary transition">
                    Post-Apocalyptic
                  </a>
                </li>
              </ul>
            </div>

            {/* Community */}
            <div>
              <h3 className="text-card-foreground mb-4 text-lg font-bold">
                Community
              </h3>
              <ul className="text-muted-foreground space-y-2">
                <li>
                  <a href="#" className="hover:text-primary transition">
                    Discord Server
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-primary transition">
                    Reddit Community
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-primary transition">
                    Player Stories
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-primary transition">
                    Competitions
                  </a>
                </li>
              </ul>
            </div>

            {/* Resources */}
            <div>
              <h3 className="text-card-foreground mb-4 text-lg font-bold">
                Resources
              </h3>
              <ul className="text-muted-foreground space-y-2">
                <li>
                  <a href="#" className="hover:text-primary transition">
                    Documentation
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-primary transition">
                    Tutorials
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-primary transition">
                    FAQ
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-primary transition">
                    Support
                  </a>
                </li>
              </ul>
            </div>
          </div>

          {/* Footer Bottom */}
          <div className="border-border mt-12 flex flex-col items-center justify-between gap-4 border-t pt-8 md:flex-row">
            <div className="flex items-center gap-2 text-xl font-bold">
              <span className="text-primary">⚔️</span>
              <span className="text-foreground">LoreSmith</span>
            </div>

            {/* Social Icons */}
            <div className="flex items-center gap-4">
              <a
                href="#"
                className="text-muted-foreground hover:text-primary transition"
              >
                <svg
                  className="h-6 w-6"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515a.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0a12.64 12.64 0 0 0-.617-1.25a.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057a19.9 19.9 0 0 0 5.993 3.03a.078.078 0 0 0 .084-.028a14.09 14.09 0 0 0 1.226-1.994a.076.076 0 0 0-.041-.106a13.107 13.107 0 0 1-1.872-.892a.077.077 0 0 1-.008-.128a10.2 10.2 0 0 0 .372-.292a.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127a12.299 12.299 0 0 1-1.873.892a.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028a19.839 19.839 0 0 0 6.002-3.03a.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.956-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.955-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.946 2.418-2.157 2.418z" />
                </svg>
              </a>
              <a
                href="#"
                className="text-muted-foreground hover:text-primary transition"
              >
                <svg
                  className="h-6 w-6"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                </svg>
              </a>
              <a
                href="#"
                className="text-muted-foreground hover:text-primary transition"
              >
                <svg
                  className="h-6 w-6"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                </svg>
              </a>
              <a
                href="#"
                className="text-muted-foreground hover:text-primary transition"
              >
                <svg
                  className="h-6 w-6"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </a>
            </div>

            <p className="text-muted-foreground text-sm">
              © 2025 LoreSmith. Craft your destiny.
            </p>
          </div>
        </div>
      </footer>
    </main>
  );
}
