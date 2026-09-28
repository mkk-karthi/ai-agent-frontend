import { Link, NavLink } from "react-router-dom";
import { ChartPie, House, SquareChevronLeft, SquareChevronRight, User } from "lucide-react";
import Logo from "../../assets/logo.svg";
import type { MenuListType } from "../../types/type";

export default function NavBar({
  menuOpen,
  onMenuOpen,
}: {
  menuOpen: boolean;
  onMenuOpen: (value: boolean) => void;
}) {
  const MenuList: MenuListType[] = [
    {
      icon: <House className="size-4" />,
      link: "/admin/dashboard",
      name: "Dashboard",
    },
    {
      icon: <User className="size-4" />,
      link: "/admin/user",
      name: "User",
    },
    {
      icon: <ChartPie className="size-4" />,
      link: "/admin/tokens",
      name: "Tokens",
    },
  ];

  return (
    <div
      className={`fixed md:relative z-20 transition-all duration-300 ${menuOpen ? "inset-0 backdrop-blur-sm md:backdrop-blur-none" : "-left-full md:left-0"}`}
    >
      <div
        className={`bg-gray-100 dark:bg-gray-900 h-auto min-h-dvh border-r border-gray-800/50 dark:border-white/10 p-2 z-15 transition-all duration-300 ${menuOpen ? "fixed md:relative min-w-72" : "min-w-0 -translate-x-full md:translate-x-0"}`}
      >
        <div className="group relative cursor-pointer h-10 mt-2">
          <Link
            to="/admin/dashboard"
            className={`absolute top-0 left-0 transition-opacity ${menuOpen ? "duration-300" : "opacity-100 group-hover:opacity-0"}`}
          >
            <img src={Logo} className="size-8" alt="MKK" />
          </Link>
          <div
            className={`absolute top-0 right-0 p-1 transition-opacity ${menuOpen ? "duration-300" : "opacity-0 group-hover:opacity-100"}`}
            onClick={() => onMenuOpen(!menuOpen)}
          >
            {menuOpen ? (
              <SquareChevronLeft className="size-6" />
            ) : (
              <SquareChevronRight className="size-6" />
            )}
          </div>
        </div>

        <nav className="mt-2">
          <ul>
            {MenuList.map((item) => (
              <li className="my-1" key={item.name}>
                <NavLink
                  to={item.link}
                  className={({ isActive }) =>
                    `flex justify-start items-center rounded text-gray-950! dark:text-white! hover:bg-gray-900/5 dark:hover:bg-white/5 cursor-pointer whitespace-nowrap overflow-hidden ${menuOpen ? "px-2 py-1" : "p-2 m-auto"} ${isActive && "bg-gray-900/5 dark:bg-white/5"}`
                  }
                >
                  {item.icon}
                  <span className={`transition-all duration-300 ${menuOpen ? "ml-2 w-46" : "w-0"}`}>
                    {menuOpen && item.name}
                  </span>
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </div>
  );
}
