import { NavLink, useParams } from "react-router-dom";
import { useAppStore } from "../../../stores/AppStore";
import React, { useCallback, useContext, useEffect, useRef, useState } from "react";
import { Check, EllipsisVertical, Loader } from "lucide-react";
import type { ChatType } from "../../../types/conversation";
import { ConversationContext } from "../../../context/conversationContext";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchService } from "../../../services/fetchService";
import type { apiResponse } from "../../../types/type";
import { toast } from "react-toastify";
import { useOutsideClick } from "../../../hooks/useOutsideClick";
import { useBreakpoint } from "../../../hooks/useBreakpoint";

export default function NavConversations({ item }: { item: ChatType }) {
  const isNavOpen = useAppStore((state) => state.navBarOpen);
  const setNavBarOpen = useAppStore((state) => state.setNavBarOpen);
  const {
    conversationId,
    conversationEdit,
    conversationOptionHeight,
    setConversationId,
    setConversationOptionOpen,
    setConversationOptionPosition,
    setConversationEdit,
  } = useContext(ConversationContext);

  const breakpoint = useBreakpoint();
  const [name, setName] = useState(item.name);
  const [loading, setLoading] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient();
  const { id } = useParams();

  useOutsideClick(
    formRef,
    () => (setConversationEdit(false), setConversationId(null), setName(item.name)),
    conversationEdit && conversationId === item.id,
  );

  useEffect(() => {
    if (conversationEdit && conversationId === item.id && inputRef.current) {
      // inputRef.current.focus();
      inputRef.current.select();
    }
  }, [conversationEdit]);

  const openOptions = (e: React.MouseEvent, val: ChatType) => {
    e.preventDefault();
    e.stopPropagation();
    console.log("openOptions");

    const rect = e.currentTarget.getBoundingClientRect();
    rect.y =
      conversationOptionHeight && rect.y > conversationOptionHeight + 20
        ? rect.y - (conversationOptionHeight + 10)
        : rect.y;
    setConversationOptionPosition(rect);

    setConversationId(val.id);
    setConversationOptionOpen(true);
  };

  const mutation = useMutation({
    mutationFn: async (data: string) => {
      setLoading(true);
      const response = await fetchService.put(`/conversation/${conversationId}`, { name: data });
      return response;
    },
    onSuccess: (data: apiResponse<null>) => {
      setLoading(false);
      if (data.success) {
        toast.success(data.message);
        queryClient.invalidateQueries({ queryKey: ["coversations"] });

        setConversationEdit(false);
        setConversationId(null);
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
      setConversationId(null);
    } else {
      mutation.mutate(name);
    }
  };

  const navOpen = useCallback(
    () => {
      if (["xs", "sm", "md"].includes(breakpoint)) {
        setNavBarOpen(false);
      }
    },
    [conversationEdit, conversationId],
  );

  return (
    <li className={`${isNavOpen ? "my-1" : "my-0"}`} title={item.name}>
      {isNavOpen && conversationEdit && conversationId === item.id ? (
        <form
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
          {loading ? (
            <Loader
              className={`opacity-100 lg:opacity-0 group-hover:opacity-100 transition-opacity size-8 px-2 py-1`}
            />
          ) : (
            <Check
              type="submit"
              onClick={handleRenameSubmit}
              className={`opacity-100 lg:opacity-0 group-hover:opacity-100 transition-opacity size-8 px-2 py-1`}
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
            className={`opacity-100 lg:opacity-0 ${conversationEdit && conversationId === item.id ? "" : "group-hover:opacity-100"} transition-opacity ${isNavOpen ? "size-8 px-2 py-1" : "size-0"}`}
            onClick={(e) => openOptions(e, item)}
          />
        </NavLink>
      )}
    </li>
  );
}
