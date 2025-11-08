import SearchResultCard from "./SearchResultCard";
import SearchEmpty from "./SearchEmpty";
import { World } from "@/lib/schemas";

interface SearchResultsProps {
  worlds: World[];
  scope: "my" | "global";
}

export default function SearchResults({ worlds, scope }: SearchResultsProps) {
  return (
    <section className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
      {worlds.map((world: World) => (
        <SearchResultCard key={world.id} world={world} scope={scope} />
      ))}
      {worlds.length === 0 && <SearchEmpty />}
    </section>
  );
}
