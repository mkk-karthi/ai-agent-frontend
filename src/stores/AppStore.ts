import { create } from "zustand";
import { persist } from "zustand/middleware";

interface AppStore {
  navBarOpen: boolean;
  setNavBarOpen: (val: boolean) => void;
}

export const useAppStore = create<AppStore>()(
  persist(
    (set) => ({
      navBarOpen: false,
      setNavBarOpen: (val) => set({ navBarOpen: val }),
    }),
    {
      name: "mkk_agent",
    },
  ),
);
