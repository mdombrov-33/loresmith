import { Axe, Cpu, Radiation, Cog, Flame } from "lucide-react";

export const THEMES = {
  FANTASY: "fantasy",
  NORSE: "norse-mythology",
  CYBERPUNK: "cyberpunk",
  POST_APOCALYPTIC: "post-apocalyptic",
  STEAMPUNK: "steampunk",
} as const;

//* Type check for api calls
export type GameTheme = (typeof THEMES)[keyof typeof THEMES];

export const THEME_OPTIONS = [
  { value: THEMES.FANTASY, label: "Fantasy", icon: Flame },
  { value: THEMES.NORSE, label: "Norse Mythology", icon: Axe },
  { value: THEMES.CYBERPUNK, label: "Cyberpunk", icon: Cpu },
  {
    value: THEMES.POST_APOCALYPTIC,
    label: "Post-Apocalyptic",
    icon: Radiation,
  },
  { value: THEMES.STEAMPUNK, label: "Steampunk", icon: Cog },
] as const;
