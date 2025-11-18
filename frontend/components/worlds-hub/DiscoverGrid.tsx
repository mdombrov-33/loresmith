import WorldCard from "./WorldCard";
import EmptyState from "./states/EmptyState";
import { World } from "@/lib/schemas";

interface DiscoverGridProps {
  worlds: World[];
  scope: "my" | "global";
}

export default function DiscoverGrid({ worlds, scope }: DiscoverGridProps) {
  if (worlds.length === 0) {
    return <EmptyState scope={scope} />;
  }

  return (
    <section className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
      {worlds.map((world: World) => (
        <WorldCard key={world.id} world={world} scope={scope} />
      ))}
    </section>
  );
}
