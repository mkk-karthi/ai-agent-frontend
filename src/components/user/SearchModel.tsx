import { Search, X } from "lucide-react";
import Modal from "../ui/Modal";
import { NavLink } from "react-router-dom";
import { useEffect, useMemo, useRef, useState } from "react";

interface ChatListType {
  id: string | number;
  name: string;
  link: string;
}

export default function SearchModel({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}): React.ReactElement {
  const inputRef = useRef<HTMLInputElement>(null);
  const [search, setSearch] = useState("");
  const [chatList, setChatList] = useState<ChatListType[]>([
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
  ]);

  useEffect(() => {
    setTimeout(() => {
      if (isOpen) {
        if (inputRef.current) {
          inputRef.current.focus();
          inputRef.current.select();
        }
      } else {
        setSearch("");
      }
    }, 500);
  }, [inputRef, isOpen]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
  };

  const filteredList = useMemo(() => {
    if (!search) return chatList;
    const value = search.trim().toLowerCase();
    return chatList.filter((v) => v.name.includes(value));
  }, [search]);

  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose} size="xl">
        <div className="flex items-center w-full gap-2 p-4 border-b border-gray-300 dark:border-white/9">
          <Search className="text-gray-400 dark:text-white size-4 md:size-5" />
          <input
            ref={inputRef}
            name="search"
            value={search}
            onChange={handleSearch}
            className="outline-none text-base w-full text-gray-900 dark:text-white"
            placeholder="Search"
          />
          <X
            className="text-gray-400 dark:text-white size-4 md:size-5 cursor-pointer"
            onClick={onClose}
          />
        </div>
        <ul className="flex flex-col gap-1 p-2 h-[60dvh] overflow-x-hidden overflow-y-scroll">
          {filteredList.map((item) => (
            <li className="my-1" key={item.id}>
              <NavLink
                to={item.link}
                onClick={onClose}
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
        </ul>
      </Modal>
    </>
  );
}
