import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface userStore {
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: string;
    roleId: number;
    createdAt: string;
  } | null;
  accessToken: string;
  setUser: (val: userStore["user"]) => void;
  setAccessToken: (val: userStore["accessToken"]) => void;
}

export const useUserStore = create<userStore>()(
  persist(
    (set, _) => ({
      user: null,
      accessToken: "",

      setUser: (val: userStore["user"]) => set({ user: val }),
      setAccessToken: (val) => set({ accessToken: val }),
    }),
    {
      name: "user",
    },
  ),
);
