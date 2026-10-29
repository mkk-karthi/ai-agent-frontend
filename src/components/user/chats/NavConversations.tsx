import { NavLink, useParams } from "react-router-dom";
import { useAppStore } from "../../../stores/AppStore";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { Check, EllipsisVertical, Loader } from "lucide-react";
import type { ChatType } from "../../../types/conversation";
import { useMutation } from "@tanstack/react-query";
import { fetchService } from "../../../lib/fetchService";
import type { apiResponse } from "../../../types/type";
import { toast } from "react-toastify";
import { useOutsideClick } from "../../../hooks/useOutsideClick";
import { useBreakpoint } from "../../../hooks/useBreakpoint";
import { queryClient } from "../../../lib/queryClient";

export default function NavConversations({
  item,
  conversation,
  conversationEdit,
  conversationOptionHeight,
  setConversation,
  setConversationEdit,
  setConversationOptionOpen,
  setConversationOptionPosition,
}: {
  item: ChatType;
  conversation: ChatType | null;
  conversationEdit: boolean;
  conversationOptionHeight: number;
  setConversation: (v: ChatType | null) => void;
  setConversationEdit: (v: boolean) => void;
  setConversationOptionOpen: (v: boolean) => void;
  setConversationOptionPosition: (v: DOMRect | null) => void;
}) {
  const isNavOpen = useAppStore((state) => state.navBarOpen);
  const setNavBarOpen = useAppStore((state) => state.setNavBarOpen);

  const breakpoint = useBreakpoint();
  const [name, setName] = useState(item.name);
  const [isLoading, setLoading] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const { id } = useParams();

  useOutsideClick(
    formRef,
    () => (setConversationEdit(false), setConversation(null), setName(item.name)),
    conversationEdit && conversation?.id === item.id,
  );

  useEffect(() => {
    if (conversationEdit && conversation?.id === item.id && inputRef.current) {
      // inputRef.current.focus();
      inputRef.current.select();
    }
  }, [conversationEdit]);

  const openOptions = (e: React.MouseEvent, val: ChatType) => {
    e.preventDefault();
    e.stopPropagation();

    const rect = e.currentTarget.getBoundingClientRect();
    rect.y =
      conversationOptionHeight && rect.y > conversationOptionHeight + 20
        ? rect.y - (conversationOptionHeight + 10)
        : rect.y;
    setConversationOptionPosition(rect);

    setConversation(val);
    setConversationOptionOpen(true);
  };

  const mutation = useMutation({
    mutationFn: async (data: string) => {
      setLoading(true);
      const response = await fetchService.put(`/conversation/${conversation?.id}`, { name: data });
      return response;
    },
    onSuccess: (data: apiResponse<null>) => {
      setLoading(false);
      if (data.success) {
        toast.success(data.message);
        queryClient.invalidateQueries({ queryKey: ["coversations"] });

        setConversationEdit(false);
        setConversation(null);
      } else toast.error(data.message);
    },
    onError: (error) => {
      setLoading(false);
      toast.error(error.message);
    },
  });

  const handleRenameSubmit = (
    e: React.SubmitEvent<HTMLElement> | React.MouseEvent<SVGSVGElement>,
  ) => {
    e.preventDefault();

    if (!name || !name.trim()) {
      setName(item.name);
      setConversationEdit(false);
      setConversation(null);
    } else {
      mutation.mutate(name);
    }
  };

  const navOpen = useCallback(() => {
    if (["xs", "sm"].includes(breakpoint)) {
      setNavBarOpen(false);
    }
  }, [breakpoint, setNavBarOpen]);

  return (
    <li className={`${isNavOpen ? "my-1" : "my-0"}`} title={item.name}>
      {isNavOpen && conversationEdit && conversation?.id === item.id ? (
        <form
          ref={formRef}
          onSubmit={handleRenameSubmit}
          className={`flex justify-start items-center rounded text-gray-950! dark:text-white! hover:bg-gray-900/5 dark:hover:bg-white/5 cursor-pointer group ${id == item.id && "bg-gray-900/5 dark:bg-white/5"}`}
        >
          <input
            ref={inputRef}
            name="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="outline-none border-none w-full pl-4 pr-2 py-1"
          />
          {isLoading ? (
            <Loader
              className={`opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity size-8 px-2 py-1`}
            />
          ) : (
            <Check
              type="submit"
              onClick={handleRenameSubmit}
              className={`opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity size-8 px-2 py-1`}
            />
          )}
        </form>
      ) : (
        <NavLink
          to={`/${item.id}`}
          onClick={navOpen}
          className={({ isActive }) =>
            `flex justify-start items-center rounded text-gray-950! dark:text-white! hover:bg-gray-900/5 dark:hover:bg-white/5 cursor-pointer ${isActive && "bg-gray-900/5 dark:bg-white/5"} group`
          }
        >
          <div
            className={`whitespace-nowrap overflow-hidden text-ellipsis transition-[width] duration-300 w-full ${isNavOpen && "pl-4 pr-2 py-1"}`}
          >
            {item.name}
          </div>
          <EllipsisVertical
            className={`opacity-100 md:opacity-0 ${conversationEdit && conversation?.id === item.id ? "" : "group-hover:opacity-100"} transition-opacity ${isNavOpen ? "size-8 px-2 py-1" : "size-0"}`}
            onClick={(e) => openOptions(e, item)}
          />
        </NavLink>
      )}
    </li>
  );
}
