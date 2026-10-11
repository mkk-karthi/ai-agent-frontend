import { Loader, Search, X } from "lucide-react";
import Modal from "../ui/Modal";
import { NavLink } from "react-router-dom";
import { Fragment, useContext, useEffect, useMemo, useRef, useState } from "react";
import { UserContext } from "../../context/userContext";
import { useInfiniteQuery } from "@tanstack/react-query";
import { fetchService } from "../../lib/fetchService";
import { useInfiniteScroll } from "../../hooks/useInfinityScroll";
import type { ChatType } from "../../types/conversation";
import { useDebounce } from "../../hooks/useDebounce";

interface ChatListType {
  data: Array<ChatType>;
  nextToken: string | null;
}

export default function SearchModel(): React.ReactElement {
  const { searchModelOpen, setSearchModelOpen } = useContext(UserContext);

  const inputRef = useRef<HTMLInputElement>(null);
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 300);

  useEffect(() => {
    setTimeout(() => {
      if (searchModelOpen) {
        if (inputRef.current) {
          inputRef.current.focus();
          inputRef.current.select();
        }
      } else {
        setSearch("");
      }
    }, 500);
  }, [inputRef, searchModelOpen]);

  // const filteredList = useMemo(() => {
  //   if (!search) return chatList;
  //   const value = search.trim().toLowerCase();
  //   return chatList.filter((v) => v.name.includes(value));
  // }, [search]);

  const { data, error, fetchNextPage, hasNextPage, isFetchingNextPage, status } = useInfiniteQuery({
    queryKey: ["esrachCoversations", debouncedSearch],
    queryFn: async ({ pageParam }: { pageParam: string | null }): Promise<ChatListType> => {
      const data = await fetchService.get(
        `/conversation?nextToken=${pageParam}&pageSize=10&search=${debouncedSearch}`,
      );

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

  return (
    <>
      <Modal isOpen={searchModelOpen} onClose={() => setSearchModelOpen(false)} size="xl">
        <div className="flex items-center w-full gap-2 p-4 border-b border-gray-300 dark:border-white/9">
          <Search className="text-gray-400 dark:text-white size-4 md:size-5" />
          <input
            ref={inputRef}
            name="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="outline-none text-base w-full text-gray-900 dark:text-white"
            placeholder="Search Conversation"
          />
          <X
            className="text-gray-400 dark:text-white size-4 md:size-5 cursor-pointer"
            onClick={() => setSearchModelOpen(false)}
          />
        </div>
        <ul className="flex flex-col gap-1 p-2 h-[60dvh] overflow-x-hidden overflow-y-scroll">
          {status === "pending" ? (
            <div className="flex items-center justify-center gap-2 size-full">
              <Loader size={20} className="animate-spin" />
              <p>Loading...</p>
            </div>
          ) : status === "error" ? (
            <span>Error: {error.message}</span>
          ) : (
            <>
              {data?.pages.map((page, i) => (
                <Fragment key={page.nextToken || i}>
                  {page?.data?.map((item) => (
                    <li className="my-1" key={item.id}>
                      <NavLink
                        to={`/${item.id}`}
                        onClick={() => setSearchModelOpen(false)}
                        className={({ isActive }) =>
                          `flex justify-start items-center rounded-lg hover:bg-gray-900/5 dark:hover:bg-white/5 text-gray-950! dark:text-white! cursor-pointer px-4 py-2 ${isActive && "bg-gray-900/5 dark:bg-white/5"}`
                        }
                      >
                        <span className={`whitespace-nowrap overflow-hidden text-ellipsis`}>
                          {item.name}
                        </span>
                      </NavLink>
                    </li>
                  ))}
                </Fragment>
              ))}
              <li ref={loaderRef} className="text-center w-full py-4 min-h-4">
                {isFetchingNextPage && (
                  <div className="flex justify-center gap-2 size-full">
                    <Loader size={20} className="animate-spin" />
                    <p>Loading...</p>
                  </div>
                )}
                {error && <p>Error</p>}
              </li>
            </>
          )}
        </ul>
      </Modal>
    </>
  );
}
