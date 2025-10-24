export const particleConfigs: Record<
  string,
  { count: number; color: string; speed: number }
> = {
  fantasy: { count: 40, color: "rgba(255, 215, 0, 0.6)", speed: 0.3 },
  "norse-mythology": {
    count: 35,
    color: "rgba(100, 149, 237, 0.6)",
    speed: 0.4,
  },
  cyberpunk: { count: 50, color: "rgba(255, 0, 255, 0.7)", speed: 0.6 },
  "post-apocalyptic": {
    count: 30,
    color: "rgba(255, 140, 0, 0.5)",
    speed: 0.2,
  },
  steampunk: { count: 35, color: "rgba(205, 133, 63, 0.6)", speed: 0.35 },
};
