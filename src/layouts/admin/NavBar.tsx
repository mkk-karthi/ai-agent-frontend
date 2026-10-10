import { Link, NavLink } from "react-router-dom";
import { Bolt, House, SquareChevronLeft, SquareChevronRight, User } from "lucide-react";
import Logo from "../../assets/logo.svg";
import type { MenuListType } from "../../types/type";
import { useAppStore } from "../../stores/AppStore";

export default function NavBar() {
  const isNavOpen = useAppStore((state) => state.navBarOpen);
  const setNavBarOpen = useAppStore((state) => state.setNavBarOpen);

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
      icon: <Bolt className="size-4" />,
      link: "/admin/providers",
      name: "Providers",
    },
  ];

  return (
    <div
      className={`fixed md:relative z-20 transition-all duration-300 ${isNavOpen ? "inset-0 backdrop-blur-sm md:backdrop-blur-none" : "-left-full md:left-0"}`}
    >
      <div
        className={`bg-gray-100 dark:bg-gray-900 h-auto min-h-dvh border-r border-gray-800/20 dark:border-white/10 p-2 z-15 transition-all duration-300 ${isNavOpen ? "fixed md:relative min-w-72" : "min-w-0 -translate-x-full md:translate-x-0"}`}
      >
        <div className="group relative cursor-pointer h-10 mt-2">
          <Link
            to="/admin/dashboard"
            className={`absolute top-0 left-0 transition-opacity ${isNavOpen ? "duration-300" : "opacity-100 group-hover:opacity-0"}`}
          >
            <img src={Logo} className="size-8" alt="MKK" />
          </Link>
          <div
            className={`absolute top-0 right-0 p-1 transition-opacity ${isNavOpen ? "duration-300" : "opacity-0 group-hover:opacity-100"}`}
            onClick={() => setNavBarOpen(!isNavOpen)}
          >
            {isNavOpen ? (
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
                    `flex justify-start items-center rounded text-gray-950! dark:text-white! hover:bg-gray-900/5 dark:hover:bg-white/5 cursor-pointer whitespace-nowrap overflow-hidden ${isNavOpen ? "px-2 py-1" : "p-2 m-auto"} ${isActive && "bg-gray-900/5 dark:bg-white/5"}`
                  }
                >
                  {item.icon}
                  <span
                    className={`transition-all duration-300 ${isNavOpen ? "ml-2 w-46" : "w-0"}`}
                  >
                    {isNavOpen && item.name}
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
