import { Flame, Axe, Cpu, Radiation, Cog } from "lucide-react";
import { THEMES } from "./game-themes";

export const THEME_SHOWCASE_DATA = [
  {
    name: "Fantasy",
    slug: THEMES.FANTASY,
    icon: Flame,
    description: "Medieval magic, mythical creatures, and epic quests",
    gradient: "from-purple-500/20 to-pink-500/20",
    borderColor: "border-purple-500/30",
    textColor: "text-purple-400",
    examples: ["Ancient prophecies", "Magical artifacts", "Dragon encounters"],
  },
  {
    name: "Norse Mythology",
    slug: THEMES.NORSE,
    icon: Axe,
    description: "Viking sagas, Nordic gods, and frozen wilderness",
    gradient: "from-blue-500/20 to-cyan-500/20",
    borderColor: "border-blue-500/30",
    textColor: "text-blue-400",
    examples: ["Runic mysteries", "Warrior's honor", "Mythic beasts"],
  },
  {
    name: "Cyberpunk",
    slug: THEMES.CYBERPUNK,
    icon: Cpu,
    description: "Neon streets, corporate intrigue, and digital warfare",
    gradient: "from-pink-500/20 to-cyan-500/20",
    borderColor: "border-pink-500/30",
    textColor: "text-pink-400",
    examples: ["Corporate conspiracies", "Augmented reality", "Street gangs"],
  },
  {
    name: "Steampunk",
    slug: THEMES.STEAMPUNK,
    icon: Cog,
    description: "Victorian machinery, brass inventions, and airship adventures",
    gradient: "from-amber-500/20 to-orange-500/20",
    borderColor: "border-amber-500/30",
    textColor: "text-amber-400",
    examples: [
      "Clockwork marvels",
      "Steam-powered tech",
      "Industrial intrigue",
    ],
  },
  {
    name: "Post-Apocalyptic",
    slug: THEMES.POST_APOCALYPTIC,
    icon: Radiation,
    description: "Wasteland survival, faction wars, and scarce resources",
    gradient: "from-red-500/20 to-orange-500/20",
    borderColor: "border-red-500/30",
    textColor: "text-red-400",
    examples: ["Survival struggles", "Faction warfare", "Scavenged technology"],
  },
] as const;
