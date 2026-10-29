import { createContext, useState, type ReactNode } from "react";

export const UserContext = createContext<{
  isSettingsOpen: boolean;
  activeSettingTab: string;
  searchModelOpen: boolean;
  setSettingsOpen: (v: boolean) => void;
  setSettingTab: (v: string) => void;
  setSearchModelOpen: (v: boolean) => void;
}>({
  isSettingsOpen: false,
  activeSettingTab: "",
  searchModelOpen: false,
  setSettingsOpen: () => {},
  setSettingTab: () => {},
  setSearchModelOpen: () => {},
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
