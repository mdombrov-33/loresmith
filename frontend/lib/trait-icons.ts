import {
  CloudRain,
  Sun,
  Shield,
  Flame,
  EyeOff,
  Heart,
  Zap,
  Flower2,
  Star,
  Skull,
  Theater,
  Handshake,
  Trees,
  Anchor,
  Users2,
  Scale,
  Dice6,
  AlertTriangle,
  Settings,
  Sparkles,
  Mountain,
  Medal,
  ArrowRight,
  Search,
  CircleDot,
  Palette,
  Wrench,
  BookOpen,
  Eye,
  Glasses,
  Cloud,
  Sword,
  Coins,
  Gavel,
  Bird,
  Link2,
  Coffee,
  Gem,
  Feather,
  Trophy,
  Puzzle,
  Rabbit,
  Beef,
  HeartPulse,
  Crown,
  Footprints,
  ScrollText,
  User,
  Users,
  Target,
  ChevronUp,
  Waves,
  Swords,
  HeartHandshake,
  type LucideIcon,
} from "lucide-react";

/**
 * Maps personality trait names to their corresponding Lucide icons.
 * Based on TRAIT_METADATA from python-service/generate/traits.py
 */
export const TRAIT_ICONS: Record<string, LucideIcon> = {
  // EMOTIONAL TRAITS
  Melancholic: CloudRain,
  Optimistic: Sun,
  Stoic: Shield,
  Passionate: Flame,
  Cynical: EyeOff,
  Empathetic: Heart,
  Volatile: Zap,
  Serene: Flower2,

  // SOCIAL TRAITS
  Charismatic: Star,
  Intimidating: Skull,
  Shy: Theater,
  Diplomatic: Handshake,
  Abrasive: Trees,
  Loyal: Anchor,
  Manipulative: Users2,
  Honest: Scale,

  // BEHAVIORAL TRAITS
  Reckless: Dice6,
  Cautious: AlertTriangle,
  Methodical: Settings,
  Spontaneous: Sparkles,
  Stubborn: Beef,
  Adaptable: Waves,
  Disciplined: Medal,
  Impulsive: ArrowRight,

  // COGNITIVE TRAITS
  Analytical: Search,
  Intuitive: CircleDot,
  Creative: Palette,
  Pragmatic: Wrench,
  Curious: BookOpen,
  Paranoid: Eye,
  Perceptive: Glasses,
  Oblivious: Cloud,

  // MORAL TRAITS
  Honorable: Sword,
  Ruthless: Skull,
  Compassionate: HeartHandshake,
  Selfish: Coins,
  Just: Gavel,
  Vengeful: Swords,
  Merciful: Bird,
  Cruel: Link2,

  // AMBITION TRAITS
  Ambitious: ChevronUp,
  Content: Coffee,
  Greedy: Gem,
  Humble: Feather,
  Competitive: Trophy,
  Cooperative: Puzzle,

  // COURAGE TRAITS
  Brave: Target,
  Cowardly: Rabbit,
  Fearless: Mountain,
  Anxious: HeartPulse,

  // LEADERSHIP TRAITS
  Authoritative: Crown,
  Follower: Footprints,
  Rebellious: Flame,
  Obedient: ScrollText,
  Independent: User,
  "Team-Player": Users,
};

/**
 * Get the icon component for a given trait name.
 * Returns a default icon if the trait is not found.
 */
export function getTraitIcon(traitName: string): LucideIcon {
  return TRAIT_ICONS[traitName] || Star; // Default to Star icon if not found
}

/**
 * Trait display colors for visual distinction.
 * These colors provide thematic visual feedback for different trait categories.
 */
export const TRAIT_COLORS: Record<string, string> = {
  // EMOTIONAL TRAITS
  Melancholic: "text-blue-400",
  Optimistic: "text-yellow-400",
  Stoic: "text-gray-400",
  Passionate: "text-red-400",
  Cynical: "text-slate-400",
  Empathetic: "text-pink-400",
  Volatile: "text-purple-400",
  Serene: "text-green-400",

  // SOCIAL TRAITS
  Charismatic: "text-amber-400",
  Intimidating: "text-red-500",
  Shy: "text-indigo-400",
  Diplomatic: "text-blue-400",
  Abrasive: "text-orange-500",
  Loyal: "text-cyan-400",
  Manipulative: "text-violet-400",
  Honest: "text-emerald-400",

  // BEHAVIORAL TRAITS
  Reckless: "text-red-400",
  Cautious: "text-yellow-500",
  Methodical: "text-blue-500",
  Spontaneous: "text-pink-400",
  Stubborn: "text-stone-400",
  Adaptable: "text-teal-400",
  Disciplined: "text-indigo-500",
  Impulsive: "text-orange-400",

  // COGNITIVE TRAITS
  Analytical: "text-blue-400",
  Intuitive: "text-purple-400",
  Creative: "text-fuchsia-400",
  Pragmatic: "text-slate-400",
  Curious: "text-cyan-400",
  Paranoid: "text-red-500",
  Perceptive: "text-emerald-400",
  Oblivious: "text-gray-400",

  // MORAL TRAITS
  Honorable: "text-blue-400",
  Ruthless: "text-red-500",
  Compassionate: "text-pink-400",
  Selfish: "text-yellow-500",
  Just: "text-indigo-400",
  Vengeful: "text-orange-500",
  Merciful: "text-green-400",
  Cruel: "text-red-600",

  // AMBITION TRAITS
  Ambitious: "text-purple-400",
  Content: "text-green-400",
  Greedy: "text-yellow-400",
  Humble: "text-blue-300",
  Competitive: "text-orange-400",
  Cooperative: "text-teal-400",

  // COURAGE TRAITS
  Brave: "text-orange-400",
  Cowardly: "text-gray-400",
  Fearless: "text-red-400",
  Anxious: "text-yellow-400",

  // LEADERSHIP TRAITS
  Authoritative: "text-purple-500",
  Follower: "text-blue-300",
  Rebellious: "text-red-400",
  Obedient: "text-indigo-400",
  Independent: "text-cyan-400",
  "Team-Player": "text-green-400",
};

/**
 * Get the color class for a given trait name.
 * Returns a default color if the trait is not found.
 */
export function getTraitColor(traitName: string): string {
  return TRAIT_COLORS[traitName] || "text-primary";
}

/**
 * Trait descriptions for tooltips.
 * These match the descriptions from python-service/generate/traits.py
 */
export const TRAIT_DESCRIPTIONS: Record<string, string> = {
  // EMOTIONAL TRAITS
  Melancholic: "Introspective and prone to sadness, sees the weight of the world",
  Optimistic: "Sees the bright side, maintains hope in darkness",
  Stoic: "Emotionally controlled and resilient under pressure",
  Passionate: "Driven by strong emotions and convictions",
  Cynical: "Distrustful and expects the worst from people",
  Empathetic: "Deeply attuned to others' emotions and suffering",
  Volatile: "Unpredictable mood swings and emotional outbursts",
  Serene: "Calm and peaceful, rarely disturbed",

  // SOCIAL TRAITS
  Charismatic: "Naturally magnetic and influential personality",
  Intimidating: "Commands respect through fear and presence",
  Shy: "Reserved and uncomfortable in social situations",
  Diplomatic: "Skilled at negotiation and finding common ground",
  Abrasive: "Harsh and difficult to get along with",
  Loyal: "Steadfast and faithful to allies and causes",
  Manipulative: "Skilled at using others for personal gain",
  Honest: "Values truth above convenience",

  // BEHAVIORAL TRAITS
  Reckless: "Takes dangerous risks without considering consequences",
  Cautious: "Carefully weighs risks before acting",
  Methodical: "Systematic and organized approach to problems",
  Spontaneous: "Acts on instinct and impulse",
  Stubborn: "Refuses to change course or admit mistakes",
  Adaptable: "Flexible and adjusts easily to new situations",
  Disciplined: "Follows rules and maintains strict self-control",
  Impulsive: "Acts without thinking through consequences",

  // COGNITIVE TRAITS
  Analytical: "Logical and data-driven thinker",
  Intuitive: "Relies on gut feelings and instinct",
  Creative: "Imaginative and thinks outside the box",
  Pragmatic: "Practical and results-focused",
  Curious: "Driven to learn and explore",
  Paranoid: "Constantly suspects threats and conspiracies",
  Perceptive: "Notices details others miss",
  Oblivious: "Misses obvious signs and social cues",

  // MORAL TRAITS
  Honorable: "Lives by a strict code of ethics",
  Ruthless: "Achieves goals without moral restraint",
  Compassionate: "Driven to help those in need",
  Selfish: "Prioritizes personal gain above others",
  Just: "Seeks fairness and proper punishment for wrongs",
  Vengeful: "Never forgets a slight, seeks retribution",
  Merciful: "Believes in second chances and redemption",
  Cruel: "Takes pleasure in others' suffering",

  // AMBITION TRAITS
  Ambitious: "Driven to achieve greatness and power",
  Content: "Satisfied with simple life, lacks drive",
  Greedy: "Obsessed with wealth and possessions",
  Humble: "Modest and downplays achievements",
  Competitive: "Driven to win and be the best",
  Cooperative: "Values teamwork and collaboration",

  // COURAGE TRAITS
  Brave: "Faces danger without hesitation",
  Cowardly: "Avoids danger and conflict when possible",
  Fearless: "Completely unafraid, sometimes dangerously so",
  Anxious: "Constantly worried about potential dangers",

  // LEADERSHIP TRAITS
  Authoritative: "Natural leader who commands respect",
  Follower: "Prefers to take direction from others",
  Rebellious: "Challenges authority and established order",
  Obedient: "Follows rules and respects hierarchy",
  Independent: "Self-reliant and prefers working alone",
  "Team-Player": "Thrives in group settings and collaboration",
};

/**
 * Get the description for a given trait name.
 * Returns a default description if the trait is not found.
 */
export function getTraitDescription(traitName: string): string {
  return TRAIT_DESCRIPTIONS[traitName] || "A unique personality trait";
}
