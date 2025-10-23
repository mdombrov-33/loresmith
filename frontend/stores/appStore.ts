import { create } from "zustand";
import { LorePiece, SelectedLore } from "@/types/generate-world";

export interface User {
  id: number;
  username: string;
  email: string;
}

export type AppStage = "home" | "generating" | "story" | "adventure" | "search";

interface AppState {
  //* Theme
  theme: string;

  //* Auth
  user: User | null;
  token: string | null;

  //* App Stage
  appStage: AppStage;

  //* Selected Lore (for generation/story flow)
  selectedLore: SelectedLore;

  //* Modals
  isLoginModalOpen: boolean;
  isRegisterModalOpen: boolean;

  //* Hydration
  isHydrated: boolean;

  //* Actions
  setTheme: (theme: string) => void;
  login: (token: string, user: User) => void;
  logout: () => void;
  setAppStage: (stage: AppStage) => void;
  setSelectedLore: (selectedLore: SelectedLore) => void;
  updateSelectedLore: (
    key: keyof SelectedLore,
    value: LorePiece | undefined,
  ) => void;
  setIsLoginModalOpen: (open: boolean) => void;
  setIsRegisterModalOpen: (open: boolean) => void;
}

//* Create the store
export const useAppStore = create<AppState>((set) => ({
  //* Initial state
  theme: "fantasy", //* Default theme
  user: null,
  token: null,
  appStage: "home",
  selectedLore: {},
  isLoginModalOpen: false,
  isRegisterModalOpen: false,
  isHydrated: false,

  //* Actions
  setTheme: (theme: string) => set({ theme }),

  login: (token: string, user: User) => set({ token, user }),

  logout: () => set({ token: null, user: null, selectedLore: {} }),

  setAppStage: (appStage: AppStage) => set({ appStage }),

  setSelectedLore: (selectedLore: SelectedLore) => set({ selectedLore }),

  updateSelectedLore: (key: keyof SelectedLore, value: LorePiece | undefined) =>
    set((state) => ({
      selectedLore: { ...state.selectedLore, [key]: value },
    })),
  setIsLoginModalOpen: (open: boolean) => set({ isLoginModalOpen: open }),
  setIsRegisterModalOpen: (open: boolean) => set({ isRegisterModalOpen: open }),
}));

//* Manual persistence
useAppStore.subscribe((state) => {
  if (typeof window === "undefined") return; //* Skip on server
  const partial = {
    theme: state.theme,
    user: state.user,
    token: state.token,
    selectedLore: state.selectedLore,
  };
  localStorage.setItem("loresmith-store", JSON.stringify(partial));
});

//* Load from storage
if (typeof window !== "undefined") {
  const data = localStorage.getItem("loresmith-store");
  if (data) {
    try {
      const partial = JSON.parse(data);
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
