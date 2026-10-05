import type { SettingsType } from "./types/type";
import { PlayingCardsFan, SettingsIcon, UserIcon } from "lucide-react";
import Account from "./components/user/settings/account/Account";
import General from "./components/user/settings/General";
import Tokens from "./components/user/settings/Tokens";

export const settingsList: SettingsType[] = [
  {
    id: "account",
    name: "Account",
    Icon: UserIcon,
    Component: Account,
  },
  // {
  //   id: "general",
  //   name: "General",
  //   Icon: SettingsIcon,
  //   Component: General,
  // },
  {
    id: "tokens",
    name: "Tokens",
    Icon: PlayingCardsFan,
    Component: Tokens,
  },
];
