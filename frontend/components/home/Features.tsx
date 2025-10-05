import FeatureCard from "@/components/home/FeatureCard";
import { Globe, Users, Map, TrendingUp } from "lucide-react";

export default function Features() {
  return (
    <section className="container mx-auto px-4 py-8">
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {/* World Generation */}
        <FeatureCard
          icon={<Globe className="h-7 w-7" />}
          title="World Generation"
          description="Create rich lore and compelling narratives with AI-powered world building"
          colorClass="primary"
        />

        {/* Party Management */}
        <FeatureCard
          icon={<Users className="h-7 w-7" />}
          title="Party Management"
          description="Manage your adventuring party, track stats, and develop characters"
          colorClass="primary"
        />

        {/* Interactive Adventure */}
        <FeatureCard
          icon={<Map className="h-7 w-7" />}
          title="Interactive Adventure"
          description="Make choices that shape your story with branching narratives"
          colorClass="primary"
        />

        {/* Character Progression */}
        <FeatureCard
          icon={<TrendingUp className="h-7 w-7" />}
          title="Character Progression"
          description="Track health, stress, inventory and watch your heroes evolve"
          colorClass="primary"
        />
      </div>
    </section>
  );
}
