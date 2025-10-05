export default function CTA() {
  return (
    <section className="container mx-auto px-4 py-24">
      <div className="border-border bg-card relative overflow-hidden rounded-2xl border p-12 text-center shadow-xl md:p-20">
        <div className="relative z-10 flex flex-col items-center gap-6">
          <h2 className="text-card-foreground max-w-3xl text-4xl font-bold md:text-5xl">
            Ready to Build Worlds?
          </h2>
          <p className="text-muted-foreground max-w-2xl text-lg">
            Join storytellers and adventurers creating epic narratives with AI.
            Every world is unique, every adventure is yours to shape.
          </p>
        </div>

        {/* Decorative blur */}
        <div className="bg-primary absolute -top-20 -right-20 h-64 w-64 rounded-full opacity-10 blur-3xl"></div>
        <div className="bg-secondary absolute -bottom-20 -left-20 h-64 w-64 rounded-full opacity-10 blur-3xl"></div>
      </div>
    </section>
  );
}
