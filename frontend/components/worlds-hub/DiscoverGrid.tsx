import WorldCard from "./WorldCard";
import EmptyState from "./states/EmptyState";
import { World } from "@/lib/schemas";

interface DiscoverGridProps {
  worlds: World[];
  scope: "my" | "global";
}

export default function DiscoverGrid({ worlds, scope }: DiscoverGridProps) {
  return (
    <section className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
      {worlds.map((world: World) => (
        <WorldCard key={world.id} world={world} scope={scope} />
      ))}
      {worlds.length === 0 && <EmptyState />}
    </section>
  );
}
