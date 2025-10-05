export default function Home() {
  return (
    <main className="container mx-auto px-4 py-8">
      <div className="flex min-h-[calc(100vh-8rem)] flex-col items-center justify-center gap-8">
        <h1 className="from-primary to-accent bg-gradient-to-r bg-clip-text text-center text-4xl font-bold text-transparent md:text-6xl">
          Welcome to LoreSmith
        </h1>
        <p className="text-muted-foreground max-w-2xl text-center text-lg">
          Create epic adventures, build immersive worlds, and embark on
          legendary quests. Choose your theme and begin your journey.
        </p>
        <div className="flex gap-4">
          <button className="bg-primary text-primary-foreground rounded-lg px-6 py-3 font-semibold transition hover:opacity-90">
            Start Adventure
          </button>
          <button className="bg-secondary text-secondary-foreground rounded-lg px-6 py-3 font-semibold transition hover:opacity-90">
            Learn More
          </button>
        </div>
      </div>
    </main>
  );
}
