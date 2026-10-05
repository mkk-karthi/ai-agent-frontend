import { NavLink } from "react-router-dom";
import { EllipsisVertical, Trash } from "lucide-react";
import { useState } from "react";
import { useBreakpoint } from "../../hooks/useBreakpoint";

interface ChatListType {
  id: string | number;
  name: string;
  link: string;
}

export default function ChatItem({
  menuOpen,
  onMenuOpen,
  item,
}: {
  menuOpen: boolean;
  onMenuOpen: (val: boolean) => void;
  item: ChatListType;
}) {
  const [isMenuOpen, setMenuOpen] = useState(false);
  const breakpoint = useBreakpoint();

  return (
    <>
      <li className={`relative ${menuOpen ? "my-1" : "my-0"}`} key={item.id}>
        <NavLink
          to={item.link}
          onClick={() => ["xs", "sm", "md"].includes(breakpoint) && onMenuOpen(false)}
          className={({ isActive }) =>
            `flex justify-start items-center rounded text-gray-950! dark:text-white! hover:bg-gray-900/5 dark:hover:bg-white/5 cursor-pointer ${menuOpen && "pl-4 pr-2 py-1"} ${isActive && "bg-gray-900/5 dark:bg-white/5"} group z-25`
          }
        >
          <div
            className={`whitespace-nowrap overflow-hidden text-ellipsis transition-[width] duration-300 ${menuOpen ? "w-56" : "w-0"}`}
          >
            {menuOpen && item.name}
          </div>
          <EllipsisVertical
            className={`opacity-0 group-hover:opacity-100 transition-opacity ${menuOpen ? "size-4" : "size-0"}`}
            onClick={(e) => (e.preventDefault(), setMenuOpen(true))}
          />
        </NavLink>

        <ul
          className={`absolute ${isMenuOpen ? "block" : "hidden"} left-full z-25 transition-all duration-300 min-w-56 bg-white dark:bg-gray-900 p-2 rounded-xl border border-gray-400 dark:border-gray-700 shadow-md shadow-gray-900/10 dark:shadow-gray-800/90`}
        >
          <li
            key={item.id}
            onClick={() => {}}
            className="flex items-center px-4 p-2 gap-2 transition-all hover:bg-gray-900/5 dark:hover:bg-gray-800/50 rounded cursor-pointer"
          >
            <Trash className="size-4" />
            <span className="ml-2">Delete</span>
          </li>
        </ul>
      </li>
    </>
  );
}
