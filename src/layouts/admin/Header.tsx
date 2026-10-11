import { Fragment, useCallback, useRef, useState } from "react";
import { LogOut, MessageCircle, Search, SquareChevronRight, User } from "lucide-react";
import Logo from "../../assets/logo.svg";
import { Link, useNavigate } from "react-router-dom";
import { useOutsideClick } from "../../hooks/useOutsideClick";
import { useUserStore } from "../../stores/UserStore";
import { useMutation } from "@tanstack/react-query";
import { fetchService } from "../../lib/fetchService";
import type { apiResponse } from "../../types/type";
import { toast } from "react-toastify";
import { useAppStore } from "../../stores/AppStore";
import { queryClient } from "../../lib/queryClient";

export default function Header() {
  const setNavBarOpen = useAppStore((state) => state.setNavBarOpen);

  const [isProfileOpen, setProfileOpen] = useState(false);
  const profileOpenRef = useRef<HTMLUListElement>(null);

  useOutsideClick(profileOpenRef, () => setProfileOpen(false), isProfileOpen);

  const userStore = useUserStore((state) => state);
  const navigate = useNavigate();

  const logoutMutation = useMutation({
    mutationFn: async () => {
      const response = await fetchService.post("/auth/logout", {});
      return response;
    },
    onSuccess: (data: apiResponse<null>) => {
      if (data.success) {
        userStore.setUser(null);
        toast.success(data.message);
        queryClient.clear();

        navigate("/auth/login", { viewTransition: true });
      } else toast.error(data.message);
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const logout = useCallback(() => {
    logoutMutation.mutate();
    setProfileOpen(false);
  }, [isProfileOpen]);

  const menuList = [
    { label: "Chat", icon: <MessageCircle size={12} />, fn: () => navigate("/new") },
    { label: "Logout", icon: <LogOut size={12} />, fn: logout },
  ];

  return (
    <Fragment>
      <div
        className={`relative top-0 left-0 w-full py-2 px-4 md:px-8 border-b border-gray-800/30 dark:border-white/10 bg-white dark:bg-gray-950 z-5`}
      >
        <div className={`flex justify-between items-center gap-3`}>
          <div className="flex md:hidden gap-2 items-center">
            <SquareChevronRight
              className="block md:hidden size-6 text-white cursor-pointer mr-2"
              onClick={() => setNavBarOpen(true)}
            />
            <Link to="/">
              <img src={Logo} className="w-8 md:w-10 mr-4" alt="MKK" />
            </Link>
          </div>
          <form className="hidden md:flex w-full gap-2">
            <Search className="text-gray-400 dark:text-white size-4 md:size-5" />
            <input
              name="search"
              className="outline-none text-base w-full text-gray-900 dark:text-white"
              placeholder="Search"
            />
          </form>
          <div className="flex items-center cursor-pointer" onClick={() => setProfileOpen(true)}>
            <div className="bg-white dark:bg-gray-800 border border-gray-400 dark:border-gray-700 rounded-full p-2">
              <User className="text-gray-900 dark:text-white size-4 md:size-5" />
            </div>
            <p className=" hidden sm:block text-gray-900 dark:text-white text-base ml-2">Admin</p>
          </div>

          {/* Dropdown Menu */}
          <ul
            ref={profileOpenRef}
            className={`fixed ${isProfileOpen ? "top-14 opacity-100 pointer-events-auto" : "top-10 opacity-0 pointer-events-none"} right-4 z-25 transition-all duration-300 min-w-36 bg-white dark:bg-gray-900 rounded-xl border border-gray-400 dark:border-gray-700 shadow-md shadow-gray-900/10 dark:shadow-gray-800/90`}
          >
            {menuList.map((item) => (
              <li
                key={item.label}
                onClick={item.fn}
                className="flex items-center px-4 p-2 gap-2 transition-all hover:bg-gray-900/5 dark:hover:bg-gray-800/50 rounded cursor-pointer"
              >
                {item.icon} {item.label}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </Fragment>
  );
}
