import { Link, NavLink } from "react-router-dom";
import {
  EllipsisVertical,
  Pencil,
  PlayingCardsFan,
  Search,
  SettingsIcon,
  Share,
  SquareChevronLeft,
  SquareChevronRight,
  SquarePen,
  Trash,
  UserIcon,
} from "lucide-react";
import Logo from "../../assets/logo.svg";
import SettingsMenu from "../../components/user/settings/SettingsMenu";
import SearchModel from "../../components/user/SearchModel";
import { useCallback, useRef, useState } from "react";
import { useBreakpoint } from "../../hooks/useBreakpoint";
import Account from "../../components/user/settings/account/Account";
import General from "../../components/user/settings/General";
import Tokens from "../../components/user/settings/Tokens";
import SettingsModel from "../../components/user/settings/SettingsModel";
import { useOutsideClick } from "../../hooks/useOutsideClick";

interface ChatListType {
  id: string | number;
  name: string;
  link: string;
}

interface SettingsType {
  id: string;
  name: string;
  icon: React.ReactNode;
  child: React.ReactElement;
}

export default function NavBar({
  menuOpen,
  onMenuOpen,
}: {
  menuOpen: boolean;
  onMenuOpen: (value: boolean) => void;
}) {
  const [isModelOpen, setModelOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("account");
  const [isSearchModelOpen, setSearchModelOpen] = useState(false);
  const [chatOptionOpen, setChatOptionOpen] = useState(false);
  const [chatId, setChatId] = useState<ChatListType["id"] | null>(null);
  const [chatOptionMenuTargetPosition, setChatOptionMenuTargetPosition] = useState<DOMRect | null>(
    null,
  );
  const breakpoint = useBreakpoint();

  const chatOptionMenuRef = useRef<HTMLUListElement>(null);

  useOutsideClick(
    chatOptionMenuRef,
    () => (setChatOptionOpen(false), setChatId(null)),
    chatOptionOpen,
  );

  const closeModel = useCallback(() => setModelOpen(false), [isModelOpen]);

  const settingsList: SettingsType[] = [
    {
      id: "account",
      icon: <UserIcon className="size-4" />,
      name: "Account",
      child: <Account onClose={closeModel} />,
    },
    {
      id: "general",
      icon: <SettingsIcon className="size-4" />,
      name: "General",
      child: <General onClose={closeModel} />,
    },
    {
      id: "tokens",
      icon: <PlayingCardsFan className="size-4" />,
      name: "Tokens",
      child: <Tokens onClose={closeModel} />,
    },
  ];

  const chatList: ChatListType[] = [
    {
      id: 1,
      name: "new Chat 1",
      link: "/1",
    },
    {
      id: 2,
      name: "new Chat 2",
      link: "/2",
    },
    {
      id: 3,
      name: "new Chat 3",
      link: "/3",
    },
    {
      id: 4,
      name: "new Chat 4",
      link: "/4",
    },
    {
      id: 5,
      name: "new Chat 5",
      link: "/5",
    },
    {
      id: 6,
      name: "new Chat 6",
      link: "/6",
    },
    {
      id: 7,
      name: "new Chat 7",
      link: "/7",
    },
    {
      id: 8,
      name: "new Chat 8",
      link: "/8",
    },
    {
      id: 9,
      name: "new Chat 9",
      link: "/9",
    },
    {
      id: 10,
      name: "new Chat 10",
      link: "/10",
    },
    {
      id: 11,
      name: "new Chat 11",
      link: "/11",
    },
  ];

  const handleOpenChatOption = (e: React.MouseEvent, val: ChatListType) => {
    e.preventDefault();
    e.stopPropagation();

    const rect = e.currentTarget.getBoundingClientRect();
    rect.y =
      chatOptionMenuRef.current?.offsetHeight &&
      rect.y > chatOptionMenuRef.current.offsetHeight + 20
        ? rect.y - (chatOptionMenuRef.current.offsetHeight + 10)
        : rect.y;
    setChatOptionMenuTargetPosition(rect);

    setChatId(val.id);
    setChatOptionOpen(true);
  };
  return (
    <>
      <div
        className={`fixed lg:relative z-20 transition-all duration-300 ${menuOpen ? "inset-0 backdrop-blur-sm lg:backdrop-blur-none" : "-left-full lg:left-0"}`}
        onMouseDown={() => onMenuOpen(false)}
      >
        <div
          className={`bg-gray-100 dark:bg-gray-900 h-auto min-h-dvh border-r border-gray-800/50 dark:border-white/10 p-2 z-15 transition-all duration-300 ${menuOpen ? "fixed lg:relative" : "min-w-0 -translate-x-full lg:translate-x-0"}`}
          onMouseDown={(event) => event.stopPropagation()}
        >
          <div className="group relative cursor-pointer h-10 mt-2">
            <Link
              to="/new"
              className={`absolute top-0 left-0 transition-opacity duration-300 ${menuOpen ? "" : "opacity-100 group-hover:opacity-0"}`}
            >
              <img src={Logo} className="size-8" alt="MKK" />
            </Link>
            <div
              className={`absolute top-0 right-0 p-1 transition-opacity duration-300 ${menuOpen ? "" : "opacity-0 group-hover:opacity-100"}`}
              onClick={() => onMenuOpen(!menuOpen)}
            >
              {menuOpen ? (
                <SquareChevronLeft className="size-6" />
              ) : (
                <SquareChevronRight className="size-6" />
              )}
            </div>
          </div>

          <nav className="mt-2 w-full overflow-hidden">
            <ul>
              <li className="my-1">
                <NavLink
                  to="/new"
                  onClick={() => ["xs", "sm", "md"].includes(breakpoint) && onMenuOpen(false)}
                  className={({ isActive }) =>
                    `flex justify-start items-center rounded text-gray-950! dark:text-white! hover:bg-gray-900/5 dark:hover:bg-white/5 cursor-pointer whitespace-nowrap overflow-hidden ${menuOpen ? "px-2 py-1" : "p-2 m-auto"} ${isActive && "bg-gray-900/5 dark:bg-white/5"}`
                  }
                >
                  <SquarePen className="size-4" />
                  <span
                    className={`transition-[width_margin] duration-300 ${menuOpen ? "ml-2 w-40" : "w-0"}`}
                  >
                    {menuOpen && "New Chat"}
                  </span>
                </NavLink>
              </li>
              <li className="my-1">
                <div
                  onClick={() => (
                    ["xs", "sm", "md"].includes(breakpoint) && onMenuOpen(false),
                    setSearchModelOpen(true)
                  )}
                  className={`flex justify-start items-center rounded hover:bg-gray-900/5 dark:hover:bg-white/5 cursor-pointer whitespace-nowrap overflow-hidden ${menuOpen ? "px-2 py-1" : "p-2 m-auto"}`}
                >
                  <Search className="size-4" />
                  <span
                    className={`transition-[width_margin] duration-300 ${menuOpen ? "ml-2 w-40" : "w-0"}`}
                  >
                    {menuOpen && "Search"}
                  </span>
                </div>
              </li>
            </ul>
            <div className="h-[calc(100dvh-13rem)] overflow-y-auto">
              <div
                className={`text-base text-gray-900/50 dark:text-white/50 font-semibold transition-[width_pading] duration-300 mt-2 ${menuOpen ? "w-60 px-2" : "w-0"}`}
              >
                {menuOpen && "Recents"}
              </div>
              <ul>
                {chatList.map((item) => (
                  <li className={`${menuOpen ? "my-1" : "my-0"}`} key={item.id}>
                    <NavLink
                      to={item.link}
                      onClick={() => ["xs", "sm", "md"].includes(breakpoint) && onMenuOpen(false)}
                      className={({ isActive }) =>
                        `flex justify-start items-center rounded text-gray-950! dark:text-white! hover:bg-gray-900/5 dark:hover:bg-white/5 cursor-pointer ${menuOpen && ""} ${isActive && "bg-gray-900/5 dark:bg-white/5"} group`
                      }
                    >
                      <div
                        className={`whitespace-nowrap overflow-hidden text-ellipsis transition-[width] duration-300 ${menuOpen ? "pl-4 pr-2 py-1 w-56" : "w-0"}`}
                      >
                        {menuOpen && item.name}
                      </div>
                      <EllipsisVertical
                        className={`opacity-100 lg:opacity-0 group-hover:opacity-100 transition-opacity ${menuOpen ? "size-8 px-2 py-1" : "size-0"} ${chatId === item.id && "opacity-100"}`}
                        onClick={(e) => handleOpenChatOption(e, item)}
                      />
                    </NavLink>
                  </li>
                ))}
              </ul>
            </div>
          </nav>

          <SettingsMenu
            isNavOpen={menuOpen}
            onMenuOpen={onMenuOpen}
            setModelOpen={setModelOpen}
            settingsList={settingsList}
            setActiveTab={setActiveTab}
          />
        </div>
      </div>

      {/* Chat options menu */}
      <ul
        ref={chatOptionMenuRef}
        className={`fixed ${chatOptionOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"} z-25 transition-opacity duration-300 min-w-42 h-fit bg-white dark:bg-gray-800 rounded-xl border border-gray-400 dark:border-gray-900`}
        style={{
          left: chatOptionMenuTargetPosition ? chatOptionMenuTargetPosition.left - 16 : 0,
          top: chatOptionMenuTargetPosition ? chatOptionMenuTargetPosition.top : 0,
        }}
      >
        <li
          onClick={() => (setChatOptionOpen(false), setChatId(null))}
          className="flex items-center px-4 p-2 gap-x-2 transition-all hover:bg-gray-900 dark:hover:bg-gray-900/50 rounded cursor-pointer"
        >
          <Share className="size-4" />
          <span className="ml-2">Share</span>
        </li>
        <li
          onClick={() => (setChatOptionOpen(false), setChatId(null))}
          className="flex items-center px-4 p-2 gap-x-2 transition-all hover:bg-gray-900 dark:hover:bg-gray-900/50 rounded cursor-pointer"
        >
          <Pencil className="size-4" />
          <span className="ml-2">Rename</span>
        </li>
        <li
          onClick={() => (setChatOptionOpen(false), setChatId(null))}
          className="flex items-center px-4 p-2 gap-x-2 transition-all hover:bg-gray-900 dark:hover:bg-gray-900/50 rounded cursor-pointer"
        >
          <Trash className="size-4" />
          <span className="ml-2">Delete</span>
        </li>
      </ul>

      {/* Settings Model */}
      <SettingsModel
        isModelOpen={isModelOpen}
        setModelOpen={setModelOpen}
        settingsList={settingsList}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />

      {/* Search Model */}
      <SearchModel isOpen={isSearchModelOpen} onClose={() => setSearchModelOpen(false)} />
    </>
  );
}
