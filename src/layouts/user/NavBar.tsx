import { Link, NavLink } from "react-router-dom";
import { Search, SquareChevronLeft, SquareChevronRight, SquarePen } from "lucide-react";
import Logo from "../../assets/logo.svg";
import SettingsMenu from "../../components/user/settings/SettingsMenu";
import React, { Fragment, useContext, useEffect, useRef } from "react";
import { UserContext } from "../../context/userContext";
import { useAppStore } from "../../stores/AppStore";
import { fetchService } from "../../lib/fetchService";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useInfiniteScroll } from "../../hooks/useInfinityScroll";
import type { ChatType } from "../../types/conversation";
import NavConversations from "../../components/user/chats/NavConversations";
import { useBreakpoint } from "../../hooks/useBreakpoint";

interface ChatListType {
  data: Array<ChatType>;
  nextToken: string | null;
}

export default function NavBar(): React.ReactElement {
  const isNavOpen = useAppStore((state) => state.navBarOpen);
  const setNavBarOpen = useAppStore((state) => state.setNavBarOpen);
  const { setSearchModelOpen } = useContext(UserContext);
  const breakpoint = useBreakpoint();

  const { data, error, fetchNextPage, hasNextPage, isFetchingNextPage, status } = useInfiniteQuery({
    queryKey: ["coversations"],
    queryFn: async ({ pageParam }: { pageParam: string | null }): Promise<ChatListType> => {
      const data = await fetchService.get(`/conversation?nextToken=${pageParam}&pageSize=10`);

      if (data.code == 200) return data.data ?? [];
      else throw new Error(data.message);
    },
    initialPageParam: "",
    getNextPageParam: (lastPage) => lastPage.nextToken ?? undefined,
  });

  const loaderRef = useInfiniteScroll({
    isLoading: isFetchingNextPage,
    hasMore: hasNextPage,
    loadMore: fetchNextPage,
  });

  const conversationListRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (conversationListRef.current) {
      conversationListRef.current.scrollTop = 0;
    }
  }, [data]);
  return (
    <>
      <div
        className={`fixed lg:relative z-20 transition-all duration-300 ${isNavOpen ? "inset-0 backdrop-blur-sm lg:backdrop-blur-none" : "-left-full lg:left-0"}`}
        onMouseDown={() => setNavBarOpen(false)}
      >
        <div
          className={`bg-gray-100 dark:bg-gray-900 h-auto min-h-dvh border-r border-gray-800/20 dark:border-white/10 p-2 z-15 transition-all duration-300 ${isNavOpen ? "fixed lg:relative w-72 lg:w-[20dvw]" : "min-w-0 -translate-x-full lg:translate-x-0 w-12"}`}
          onMouseDown={(event) => event.stopPropagation()}
        >
          <div className="group relative cursor-pointer h-10 mt-2">
            <Link
              to="/new"
              className={`absolute top-0 left-0 transition-opacity duration-300 ${isNavOpen ? "" : "opacity-100 group-hover:opacity-0"}`}
            >
              <img src={Logo} className="size-8" alt="MKK" />
            </Link>
            <div
              className={`absolute top-0 right-0 p-1 transition-opacity duration-300 ${isNavOpen ? "" : "opacity-0 group-hover:opacity-100"}`}
              onClick={() => setNavBarOpen(!isNavOpen)}
            >
              {isNavOpen ? (
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
                  onClick={() => ["xs", "sm", "md"].includes(breakpoint) && setNavBarOpen(false)}
                  className={({ isActive }) =>
                    `flex justify-start items-center rounded text-gray-950! dark:text-white! hover:bg-gray-900/5 dark:hover:bg-white/5 cursor-pointer whitespace-nowrap overflow-hidden ${isNavOpen ? "px-2 py-1" : "p-2 m-auto"} ${isActive && "bg-gray-900/5 dark:bg-white/5"}`
                  }
                >
                  <SquarePen className="size-4" />
                  <span className={`transition-[width_margin] duration-300 ${isNavOpen && "ml-2"}`}>
                    {isNavOpen && "New Chat"}
                  </span>
                </NavLink>
              </li>
              <li className="my-1">
                <div
                  onClick={() => (
                    ["xs", "sm", "md"].includes(breakpoint) && setNavBarOpen(false),
                    setSearchModelOpen(true)
                  )}
                  className={`flex justify-start items-center rounded hover:bg-gray-900/5 dark:hover:bg-white/5 cursor-pointer whitespace-nowrap overflow-hidden ${isNavOpen ? "px-2 py-1" : "p-2 m-auto"}`}
                >
                  <Search className="size-4" />
                  <span className={`transition-[width_margin] duration-300 ${isNavOpen && "ml-2"}`}>
                    {isNavOpen && "Search"}
                  </span>
                </div>
              </li>
            </ul>
            <div ref={conversationListRef} className="h-[calc(100dvh-13rem)] overflow-y-auto">
              {isNavOpen && (
                <>
                  <div
                    className={`text-base text-gray-900/50 dark:text-white/50 font-semibold transition-[width_pading] duration-300 mt-2 ${isNavOpen && "px-2"}`}
                  >
                    {isNavOpen && "Recents"}
                  </div>
                  {status === "pending" ? (
                    <p className="text-center">Loading...</p>
                  ) : status === "error" ? (
                    <span>Error: {error.message}</span>
                  ) : (
                    <ul>
                      {data?.pages.map((page, i) => (
                        <Fragment key={page.nextToken || i}>
                          {page?.data?.map((item) => (
                            <NavConversations item={item} key={item.id} />
                          ))}
                        </Fragment>
                      ))}
                      <li ref={loaderRef} className="text-center w-full py-4 min-h-4">
                        {isFetchingNextPage && <p>Loading...</p>}
                        {error && <p>Error</p>}
                      </li>
                    </ul>
                  )}
                </>
              )}
            </div>
          </nav>

          <SettingsMenu />
        </div>
      </div>

      {/* Chat options menu */}
    </>
  );
}
