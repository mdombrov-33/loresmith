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
  {
    value: THEMES.FANTASY,
    label: "Fantasy",
    icon: Flame,
    font: "font-heading",
  },
  {
    value: THEMES.NORSE,
    label: "Norse Mythology",
    icon: Axe,
    font: "font-fjalla-one",
  },
  { value: THEMES.CYBERPUNK, label: "Cyberpunk", icon: Cpu, font: "font-mono" },
  {
    value: THEMES.POST_APOCALYPTIC,
    label: "Post-Apocalyptic",
    icon: Radiation,
    font: "font-sans",
  },
  { value: THEMES.STEAMPUNK, label: "Steampunk", icon: Cog, font: "font-sans" },
] as const;

export function getThemeFont(theme: string): string {
  const themeOption = THEME_OPTIONS.find((t) => t.value === theme);
  return themeOption?.font || "font-sans";
}
