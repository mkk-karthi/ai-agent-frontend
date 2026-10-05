import { createContext, useState, type ReactNode } from "react";

export const UserContext = createContext({
  isSettingsOpen: false,
  activeSettingTab: "",
  searchModelOpen: false,
  setSettingsOpen: (v: boolean) => {},
  setSettingTab: (v: string) => {},
  setSearchModelOpen: (v: boolean) => {},
});

// Create a Provider component
export function UserProvider({ children }: { children: ReactNode }) {
  const [isSettingsOpen, setSettingsOpen] = useState(false);
  const [activeSettingTab, setSettingTab] = useState("account");
  const [searchModelOpen, setSearchModelOpen] = useState(false);

  return (
    <UserContext.Provider
      value={{
        isSettingsOpen,
        activeSettingTab,
        searchModelOpen,
        setSettingsOpen,
        setSettingTab,
        setSearchModelOpen,
      }}
    >
      {children}
    </UserContext.Provider>
  );
}
