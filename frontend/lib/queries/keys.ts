import { SelectedLore } from "@/lib/schemas";

//* Query keys for react-query
export const queryKeys = {
  world: (id: number) => ["world", id],
  worlds: (filters?: {
    scope?: "my" | "global";
    theme?: string;
    status?: string;
    limit?: number;
    offset?: number;
    search?: string;
  }) => {
    if (filters?.search && filters.search.trim()) {
      //* For search queries, exclude pagination params from key since we fetch all and paginate locally
      return [
        "worlds",
        {
          scope: filters.scope,
          theme: filters.theme,
          status: filters.status,
          search: filters.search,
        },
      ];
    }
    return ["worlds", filters || {}];
  },
  lore: (
    category: string,
    theme: string,
    count: number,
    regenerate?: boolean,
  ) => ["lore", category, theme, count, regenerate || false],
  fullStory: (selectedLore: SelectedLore, theme: string) => [
    "fullStory",
    selectedLore,
    theme,
  ],
  activeSession: (worldId: number) => ["activeSession", worldId],
  adventureSession: (sessionId: number) => ["adventureSession", sessionId],
};
