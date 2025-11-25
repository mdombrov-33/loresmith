import { create } from "zustand";
import { LorePiece, SelectedLore } from "@/lib/schemas";

export interface User {
  id: number;
  username: string;
  email: string;
}

export type AppStage = "home" | "hub" | "discover" | "generating" | "story" | "adventure" | "plans";

interface AppState {
  //* Theme
  theme: string;
  audioTheme: string;
  userChangedTheme: boolean;

  //* Auth
  user: User | null;
  token: string | null;

  //* App Stage
  appStage: AppStage;

  //* Selected Lore (for generation/story flow)
  selectedLore: SelectedLore;

  //* Search
  searchScope: "my" | "global";
  searchTheme: string;
  searchStatus: string;

  //* Modals
  isLoginModalOpen: boolean;
  isRegisterModalOpen: boolean;

  //* Hydration
  isHydrated: boolean;

  //* Actions
  setTheme: (theme: string) => void;
  setAudioTheme: (audioTheme: string) => void;
  setUserChangedTheme: (changed: boolean) => void;
  login: (token: string, user: User) => void;
  logout: () => void;
  setAppStage: (stage: AppStage) => void;
  setSelectedLore: (selectedLore: SelectedLore) => void;
  updateSelectedLore: (
    key: keyof SelectedLore,
    value: LorePiece | undefined,
  ) => void;
  setSearchScope: (scope: "my" | "global") => void;
  setSearchTheme: (theme: string) => void;
  setSearchStatus: (status: string) => void;
  setIsLoginModalOpen: (open: boolean) => void;
  setIsRegisterModalOpen: (open: boolean) => void;
}

//* Create the store
export const useAppStore = create<AppState>((set) => ({
  //* Initial state
  theme: "fantasy", //* Default theme
  audioTheme: "fantasy", //* Default audio theme
  userChangedTheme: false,
  user: null,
  token: null,
  appStage: "home",
  selectedLore: {},
  searchScope: "my",
  searchTheme: "",
  searchStatus: "",
  isLoginModalOpen: false,
  isRegisterModalOpen: false,
  isHydrated: false,

  //* Actions
  setTheme: (theme: string) => set({ theme, audioTheme: theme }), //* Always sync audioTheme with theme
  setAudioTheme: (audioTheme: string) => set({ audioTheme }), //* For manual override
  setUserChangedTheme: (changed: boolean) => set({ userChangedTheme: changed }),

  login: (token: string, user: User) => set({ token, user }),

  logout: () => set({ token: null, user: null, selectedLore: {} }),

  setAppStage: (appStage: AppStage) => set({ appStage }),

  setSelectedLore: (selectedLore: SelectedLore) => set({ selectedLore }),

  updateSelectedLore: (key: keyof SelectedLore, value: LorePiece | undefined) =>
    set((state) => ({
      selectedLore: { ...state.selectedLore, [key]: value },
    })),
  setSearchScope: (searchScope: "my" | "global") => set({ searchScope }),
  setSearchTheme: (searchTheme: string) => set({ searchTheme }),
  setSearchStatus: (searchStatus: string) => set({ searchStatus }),
  setIsLoginModalOpen: (open: boolean) => set({ isLoginModalOpen: open }),
  setIsRegisterModalOpen: (open: boolean) => set({ isRegisterModalOpen: open }),
}));

//* Manual persistence
useAppStore.subscribe((state) => {
  if (typeof window === "undefined") return; //* Skip on server
  const partial = {
    theme: state.theme,
    audioTheme: state.audioTheme,
    user: state.user,
    token: state.token,
    selectedLore: state.selectedLore,
    searchScope: state.searchScope,
    searchTheme: state.searchTheme,
    searchStatus: state.searchStatus,
  };
  localStorage.setItem("loresmith-store", JSON.stringify(partial));
});

//* Load from storage
if (typeof window !== "undefined") {
  const data = localStorage.getItem("loresmith-store");
  if (data) {
    try {
      const partial = JSON.parse(data);

      //* Safety check: Sync audioTheme with theme if they don't match
      if (partial.theme && partial.audioTheme !== partial.theme) {
        console.warn(
          `[Store] Theme/Audio mismatch detected. Syncing audioTheme from "${partial.audioTheme}" to "${partial.theme}"`,
        );
        partial.audioTheme = partial.theme;
      }

      useAppStore.setState({ ...partial, isHydrated: true });
    } catch (e) {
      console.error("Failed to load from localStorage", e);
      useAppStore.setState({ isHydrated: true });
    }
  } else {
    useAppStore.setState({ isHydrated: true });
  }
} else {
  useAppStore.setState({ isHydrated: true });
}
