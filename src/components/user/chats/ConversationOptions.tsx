import { Pencil, Share, Trash } from "lucide-react";
import { useCallback, useContext, useEffect, useRef, useState } from "react";
import { ConversationContext } from "../../../context/conversationContext";
import { useOutsideClick } from "../../../hooks/useOutsideClick";
import { useMutation } from "@tanstack/react-query";
import { toast } from "react-toastify";
import type { apiResponse } from "../../../types/type";
import { fetchService } from "../../../lib/fetchService";
import Modal from "../../ui/Modal";
import { useNavigate, useParams } from "react-router-dom";
import { queryClient } from "../../../lib/queryClient";

export default function ConversationOptions() {
  const {
    conversationId,
    conversationOptionOpen,
    conversationOptionPosition,
    setConversationId,
    setConversationOptionOpen,
    setConversationOptionHeight,
    setConversationEdit,
  } = useContext(ConversationContext);
  const { id } = useParams();

  const chatOptionMenuRef = useRef<HTMLUListElement>(null);
  const [isDelete, setDelete] = useState(false);

  useOutsideClick(
    chatOptionMenuRef,
    () => (setConversationOptionOpen(false), setConversationId(null)),
    conversationOptionOpen,
  );

  useEffect(() => {
    if (chatOptionMenuRef && chatOptionMenuRef.current)
      setConversationOptionHeight(chatOptionMenuRef.current.offsetHeight);
  }, [chatOptionMenuRef]);

  const navigate = useNavigate();
  const mutation = useMutation({
    mutationFn: async () => {
      const response = await fetchService.delete(`/conversation/${conversationId}`);
      return response;
    },
    onSuccess: (data: apiResponse<null>) => {
      if (data.success) {
        toast.success(data.message);
        queryClient.invalidateQueries({ queryKey: ["coversations"] });

        if (id == conversationId) navigate("/new");
        setDelete(false);

        setConversationId(null);
      } else toast.error(data.message);
    },
    onError: (error) => {
      setConversationId(null);
      toast.error(error.message);
    },
  });

  const handleRename = useCallback(() => {
    setConversationOptionOpen(false);
    setConversationEdit(true);
  }, [setConversationOptionOpen, setConversationEdit]);

  const handleShare = useCallback(() => {
    setConversationOptionOpen(false);
    setConversationId(null);
  }, [setConversationOptionOpen, setConversationId]);

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
        className={`absolute ${conversationOptionOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"} z-25 transition-opacity duration-300 min-w-42 h-fit bg-white dark:bg-gray-800 rounded-xl border border-gray-400 dark:border-gray-900`}
        style={{
          left: conversationOptionPosition ? conversationOptionPosition.left - 16 : 0,
          top: conversationOptionPosition ? conversationOptionPosition.top : 0,
        }}
      >
        {/* <li
          onClick={handleShare}
          className="flex items-center px-4 p-2 gap-x-2 transition-all hover:bg-gray-900 dark:hover:bg-gray-900/50 rounded cursor-pointer"
        >
          <Share className="size-4" />
          <span className="ml-2">Share</span>
        </li> */}
        <li
          onClick={handleRename}
          className="flex items-center px-4 p-2 gap-x-2 transition-all hover:bg-gray-900 dark:hover:bg-gray-900/50 rounded cursor-pointer"
        >
          <Pencil className="size-4" />
          <span className="ml-2">Rename</span>
        </li>
        <li
          onClick={handleDelete}
          className="flex items-center px-4 p-2 gap-x-2 transition-all hover:bg-gray-900 dark:hover:bg-gray-900/50 rounded cursor-pointer"
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
    </>
  );
}
