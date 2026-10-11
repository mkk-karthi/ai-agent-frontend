import { LayoutDashboard, SquareChevronRight, User } from "lucide-react";
import { useContext, useRef, useState } from "react";
import { useOutsideClick } from "../../../hooks/useOutsideClick";
import { Link, useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { fetchService } from "../../../lib/fetchService";
import type { apiResponse } from "../../../types/type";
import { toast } from "react-toastify";
import { useUserStore } from "../../../stores/UserStore";
import { UserContext } from "../../../context/userContext";
import { useAppStore } from "../../../stores/AppStore";
import { settingsList } from "../../../data";
import { useBreakpoint } from "../../../hooks/useBreakpoint";
import { queryClient } from "../../../lib/queryClient";

export default function SettingsMenu(): React.ReactElement {
  const isNavOpen = useAppStore((state) => state.navBarOpen);
  const setNavBarOpen = useAppStore((state) => state.setNavBarOpen);
  const { setSettingTab, setSettingsOpen } = useContext(UserContext);
  const breakpoint = useBreakpoint();

  const [isMenuOpen, setMenuOpen] = useState(false);
  const settingsMenuRef = useRef<HTMLUListElement>(null);

  useOutsideClick(settingsMenuRef, () => setMenuOpen(false), isMenuOpen);

  const { user, setUser } = useUserStore.getState();
  const navigate = useNavigate();

  const logoutMutation = useMutation({
    mutationFn: async () => {
      const response = await fetchService.post("/auth/logout", {});
      return response;
    },
    onSuccess: (data: apiResponse<null>) => {
      if (data.success) {
        setUser(null);
        toast.success(data.message);
        queryClient.clear();

        navigate("/auth/login", { viewTransition: true });
      } else toast.error(data.message);
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const onSettingsOpen = (value: string) => {
    setSettingTab(value);
    setSettingsOpen(true);
    setMenuOpen(false);
    ["xs", "sm", "md"].includes(breakpoint) && setNavBarOpen(false);
  };

  const handleLogout = () => {
    setMenuOpen(false);
    logoutMutation.mutate();
  };

  return (
    <>
      <div
        className={`flex items-center bg-gray-100 dark:bg-gray-900 w-full cursor-pointer rounded shadow-[0_0_5px_5px] shadow-gray-100 dark:shadow-gray-900 transition-[pading] duration-300 min-h-15 ${isNavOpen ? "p-2 hover:bg-gray-900/5 dark:hover:bg-gray-800/50" : "py-2"}`}
        onClick={() => setMenuOpen(true)}
      >
        <div className="bg-white dark:bg-gray-800 border border-gray-400 dark:border-gray-700 rounded-full p-2">
          <User className="text-gray-900 dark:text-white size-4" />
        </div>
        <div className={`transition-[width_margin] duration-300 ${isNavOpen && "ml-2"}`}>
          <div
            className={`font-semibold whitespace-nowrap overflow-hidden text-ellipsis lowercase first-letter:uppercase`}
          >
            {isNavOpen && user?.firstName}
          </div>
          <div
            className={`text-sm text-gray/900/50 dark:text-white/50 lowercase first-letter:uppercase`}
          >
            {isNavOpen && user?.role}
          </div>
        </div>
      </div>

      {/* Settings menu */}
      <ul
        ref={settingsMenuRef}
        className={`fixed ${isMenuOpen ? "bottom-20 opacity-100 pointer-events-auto" : "bottom-16 opacity-0 pointer-events-none"} left-4 z-25 transition-all duration-300 min-w-56 bg-white dark:bg-gray-900 p-2 rounded-xl border border-gray-400 dark:border-gray-700 shadow-md shadow-gray-900/10 dark:shadow-gray-800/90`}
      >
        {settingsList.map(({ id, name, Icon }) => (
          <li
            key={id}
            onClick={() => onSettingsOpen(id)}
            className="flex items-center px-4 p-2 gap-2 transition-all hover:bg-gray-900/5 dark:hover:bg-gray-800/50 rounded cursor-pointer"
          >
            <Icon className="size-4" />
            <span className="ml-2">{name}</span>
          </li>
        ))}

        {user && user.roleId == 1 && (
          <Link
            to="/admin"
            onClick={() => setMenuOpen(false)}
            className="flex items-center px-4 p-2 gap-2 transition-all text-gray-950! dark:text-white! hover:bg-gray-900/5 dark:hover:bg-gray-800/50 rounded cursor-pointer"
          >
            <LayoutDashboard className="size-4" />
            <span className="ml-2">Dashboard</span>
          </Link>
        )}
        <li
          onClick={handleLogout}
          className="flex items-center px-4 p-2 gap-2 transition-all hover:bg-gray-900/5 dark:hover:bg-gray-800/50 rounded cursor-pointer"
        >
          <SquareChevronRight className="size-4" />
          <span className="ml-2">LogOut</span>
        </li>
      </ul>
    </>
  );
}
