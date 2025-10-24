import SearchResultCard from "./SearchResultCard";
import SearchEmpty from "./SearchEmpty";
import { World } from "@/types/api";

//TODO: add pagination later
interface SearchResultsProps {
  worlds: World[];
}

export default function SearchResults({ worlds }: SearchResultsProps) {
  return (
    <section className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
      {worlds.map((world: World) => (
        <SearchResultCard key={world.id} world={world} />
      ))}
      {worlds.length === 0 && <SearchEmpty />}
    </section>
  );
}
