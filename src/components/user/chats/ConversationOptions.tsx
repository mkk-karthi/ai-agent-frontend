import { Pencil, Pin, PinOff, Share, Trash } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { useOutsideClick } from "../../../hooks/useOutsideClick";
import { useMutation } from "@tanstack/react-query";
import { toast } from "react-toastify";
import type { apiResponse } from "../../../types/type";
import { fetchService } from "../../../lib/fetchService";
import Modal from "../../ui/Modal";
import { useNavigate, useParams } from "react-router-dom";
import { queryClient } from "../../../lib/queryClient";
import type { ChatType } from "../../../types/conversation";
import ShareConversation from "./ShareConversation";

export default function ConversationOptions({
  conversation,
  conversationOptionOpen,
  conversationOptionPosition,
  setConversation,
  setConversationOptionOpen,
  setConversationOptionHeight,
  setConversationEdit,
}: {
  conversation: ChatType | null;
  conversationOptionOpen: boolean;
  conversationOptionPosition: DOMRect | null;
  setConversation: (v: ChatType | null) => void;
  setConversationEdit: (v: boolean) => void;
  setConversationOptionOpen: (v: boolean) => void;
  setConversationOptionHeight: (v: number) => void;
}) {
  const { id } = useParams();

  const chatOptionMenuRef = useRef<HTMLUListElement>(null);
  const [isDelete, setDelete] = useState(false);
  const [isShareOpen, setShareOpen] = useState(false);
  const [shareConversationId, setShareConversationId] = useState<string | null>(null);

  useOutsideClick(
    chatOptionMenuRef,
    () => (setConversationOptionOpen(false), setConversation(null)),
    conversationOptionOpen,
  );

  useEffect(() => {
    if (chatOptionMenuRef && chatOptionMenuRef.current)
      setConversationOptionHeight(chatOptionMenuRef.current.offsetHeight);
  }, [chatOptionMenuRef]);

  const navigate = useNavigate();
  const mutation = useMutation({
    mutationFn: async () => {
      const response = await fetchService.delete(`/conversation/${conversation?.id}`);
      return response;
    },
    onSuccess: (data: apiResponse<null>) => {
      if (data.success) {
        toast.success(data.message);
        queryClient.invalidateQueries({ queryKey: ["coversations"] });

        if (id == conversation?.id) navigate("/new");
        setDelete(false);

        setConversation(null);
      } else toast.error(data.message);
    },
    onError: (error) => {
      setConversation(null);
      toast.error(error.message);
    },
  });

  const pinMutation = useMutation({
    mutationFn: async () => {
      const response = await fetchService.put(`/conversation/pin/${conversation?.id}`, {
        isPinned: !(conversation?.isPinned),
      });
      return response;
    },
    onSuccess: (data: apiResponse<null>) => {
      if (data.success) {
        toast.success(data.message);
        queryClient.invalidateQueries({ queryKey: ["coversations"] });
        queryClient.invalidateQueries({ queryKey: ["pinnedCoversations"] });

        setConversationOptionOpen(false);
        setConversation(null);
      } else toast.error(data.message);
    },
    onError: (error) => {
      setConversationOptionOpen(false);
      setConversation(null);
      toast.error(error.message);
    },
  });

  const handleRename = useCallback(() => {
    setConversationOptionOpen(false);
    setConversationEdit(true);
  }, [setConversationOptionOpen, setConversationEdit]);

  const handleShare = useCallback(() => {
    if (conversation) {
      setShareConversationId(conversation.id);
      setShareOpen(true);
    }
    setConversationOptionOpen(false);
  }, [conversation, setConversationOptionOpen]);

  const handlePin = useCallback(() => {
    pinMutation.mutate();
  }, [pinMutation]);

  const handleDelete = useCallback(() => {
    setConversationOptionOpen(false);
    setDelete(true);
  }, [setConversationOptionOpen, setDelete]);

  const confirmDelete = useCallback(() => {
    mutation.mutate();
  }, [mutation]);

  return (
    <>
      <ul
        ref={chatOptionMenuRef}
        className={`absolute ${conversationOptionOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"} z-25 transition-opacity duration-300 min-w-42 h-fit bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-900 shadow-md`}
        style={{
          left: conversationOptionPosition ? conversationOptionPosition.left - 16 : 0,
          top: conversationOptionPosition ? conversationOptionPosition.top : 0,
        }}
      >
        <li
          onClick={handlePin}
          className="flex items-center px-4 p-2 gap-x-2 transition-all hover:bg-gray-100 dark:hover:bg-gray-900/50 rounded cursor-pointer"
        >
          {conversation?.isPinned ? <PinOff className="size-4" /> : <Pin className="size-4" />}
          <span className="ml-2">{conversation?.isPinned ? "Un Pin" : "Pin"}</span>
        </li>
        <li
          onClick={handleRename}
          className="flex items-center px-4 p-2 gap-x-2 transition-all hover:bg-gray-100 dark:hover:bg-gray-900/50 rounded cursor-pointer"
        >
          <Pencil className="size-4" />
          <span className="ml-2">Rename</span>
        </li>
        <li
          onClick={handleShare}
          className="flex items-center px-4 p-2 gap-x-2 transition-all hover:bg-gray-100 dark:hover:bg-gray-900/50 rounded cursor-pointer"
        >
          <Share className="size-4" />
          <span className="ml-2">Share</span>
        </li>
        <li
          onClick={handleDelete}
          className="flex items-center px-4 p-2 gap-x-2 transition-all hover:bg-gray-100 dark:hover:bg-gray-900/50 rounded cursor-pointer"
        >
          <Trash className="size-4" />
          <span className="ml-2">Delete</span>
        </li>
      </ul>

      <Modal
        isOpen={isDelete}
        onClose={() => setDelete(false)}
        size="md"
        className="border border-gray-300 dark:border-white/9"
      >
        <div className="p-4">
          <p className="text-xl p-2">Are you sure delete this chat?</p>
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setDelete(false)}
              className="rounded-md px-4 py-1 text-sm font-semibold text-gray-700 dark:text-white border border-gray-300 dark:border-white/9 bg-white dark:bg-white/2 hover:bg-gray-50 dark:hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all cursor-pointer"
            >
              No
            </button>

            <button
              type="button"
              onClick={confirmDelete}
              className="rounded-md px-4 py-1 text-sm font-semibold bg-indigo-500 text-white hover:bg-indigo-400 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500 cursor-pointer"
            >
              Sure
            </button>
          </div>
        </div>
      </Modal>

      <ShareConversation
        isModalOpen={isShareOpen}
        onModalUpdate={(val) => {
          setShareOpen(val);
          if (!val) {
            setConversation(null);
          }
        }}
        conversationId={shareConversationId}
      />
    </>
  );
}
