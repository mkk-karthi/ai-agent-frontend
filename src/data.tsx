import type { SettingsType } from "./types/type";
import { ChartColumn, PlayingCardsFan, UserIcon } from "lucide-react";
import Account from "./components/user/settings/account/Account";
import Tokens from "./components/user/settings/Tokens";
import { Usage } from "./components/user/settings/Usage";

export const settingsList: SettingsType[] = [
  {
    id: "account",
    name: "Account",
    Icon: UserIcon,
    Component: Account,
  },
  {
    id: "tokens",
    name: "Tokens",
    Icon: PlayingCardsFan,
    Component: Tokens,
  },
  {
    id: "usage",
    name: "Usage",
    Icon: ChartColumn,
    Component: Usage,
  },
];
