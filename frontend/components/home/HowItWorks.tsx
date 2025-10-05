import HowItWorksCard from "@/components/home/HowItWorksCard";

export default function HowItWorks() {
  return (
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
        <HowItWorksCard
          step={1}
          title="Generate a World"
          description="Choose a theme, set the tone, and let our AI craft a unique world filled with lore, locations, and quests"
          colorClass="primary"
        />
        <HowItWorksCard
          step={2}
          title="Assemble Your Party"
          description="Create and customize your adventuring party with diverse characters, each with their own skills and backstories"
          colorClass="secondary"
        />
        <HowItWorksCard
          step={3}
          title="Embark on Your Adventure"
          description="Dive into an interactive story where your choices shape the narrative and lead to epic outcomes"
          colorClass="primary"
        />
      </div>
    </section>
  );
}
