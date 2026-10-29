import ChatHeader from "../../components/user/chats/ChatHeader";
import { useCallback, useContext, useEffect, useRef, useState } from "react";
import PromptInput, { type PromptInputRef } from "../../components/user/chats/PromptInput";
import { useNavigate, useParams } from "react-router-dom";
import ChatMessages from "../../components/user/chats/ChatMessages";
import { useUserStore } from "../../stores/UserStore";
import { fetchService } from "../../lib/fetchService";
import { useMutation, useQuery } from "@tanstack/react-query";
import { ConversationContext } from "../../context/conversationContext";
import { toast } from "react-toastify";
import { AlertCircle, Loader, SquarePen } from "lucide-react";
import { queryClient } from "../../lib/queryClient";
import type { ConversationType } from "../../types/conversation";
import MetaHead from "../../components/common/MetaHead";

export default function Conversation(): React.ReactElement {
  const { id } = useParams<{ id: string }>();

  if (!id) return <></>;
  const isNew = id === "new";

  const [streamedText, setStreamedText] = useState("");
  const [modelId, setModelId] = useState("");
  const promptRef = useRef<PromptInputRef>(null);
  const { setEditData } = useContext(ConversationContext);

  const { user } = useUserStore.getState();
  const navigate = useNavigate();

  const {
    data: conversationData,
    isLoading: isConversationLoading,
    isError: isConversationError,
    error: conversationError,
  } = useQuery({
    queryKey: ["conversation", id],
    queryFn: async (): Promise<ConversationType> => {
      const res = await fetchService.get<ConversationType>(`/conversation/${id}`);
      if (res.code !== 200 || !res.data) {
        throw new Error(res.message || "Conversation not found");
      }
      return res.data;
    },
    enabled: !isNew && Boolean(id),
    retry: false,
  });

  useEffect(() => {
    promptRef.current?.reset();
  }, [id]);

  const parseStreamResponse = (str: string) => {
    if (!str || !str.trim()) return [];

    try {
      // Convert the fused chunks into a clean valid JSON array layout
      const formatted = "[" + str.replace(/}{/g, "},{") + "]";
      return JSON.parse(formatted);
    } catch (err) {
      // FALLBACK: regex grabs every individual {"type": ... } object blocks independently
      const matchRegex = /{"type":"[^]*?","text":"[^]*?"}/g;
      const results = [];
      let match;

      while ((match = matchRegex.exec(str)) !== null) {
        try {
          results.push(JSON.parse(match[0]));
        } catch (e) {
          console.error(e);
          continue;
        }
      }
      console.log(results);
      return results;
    }
  };

  const handleStreamResponse = (chunk: string, prompt: string, editId?: string) => {
    const chunks = parseStreamResponse(chunk);

    chunks.forEach((v: { type: "coversation" | "stream" | "error" | "end"; text: string }) => {
      if (v.type == "coversation") {
        const coversation = JSON.parse(v.text);

        if (editId) setEditData(null);
        promptRef.current?.reset();

        queryClient.setQueryData(["conversation", coversation.id], coversation);

        if (isNew) {
          navigate(`/${coversation.id}`, { replace: true });
          queryClient.invalidateQueries({ queryKey: ["coversations"] });
        }
        queryClient.refetchQueries({
          queryKey: ["coversationsMessage", coversation.id],
        });
      } else if (v.type == "stream") {
        setStreamedText((prev) => prev + v.text);
      } else if (v.type == "error") {
        console.log("streaming error", v.text);

        try {
          const error = JSON.parse(v.text);
          toast.error(error.message);
        } catch {
          toast.error(v.text);
        }

        promptRef.current?.setPrompt(prompt);
      } else if (v.type == "end") {
        // if (conversationId) {
        //   queryClient.refetchQueries({
        //     queryKey: ["coversationsMessage", conversationId],
        //   });
        // }
      }
    });
  };

  const generateMutation = useMutation({
    mutationFn: async ({ prompt, editId }: { prompt: string; editId?: string }) => {
      setStreamedText("");
      const response = await fetchService.stream(
        "/conversation/generate-stream-content",
        { prompt, modelId, conversationId: isNew ? "" : id, id: editId ?? "" },
        {},
        (chunk) => handleStreamResponse(chunk, prompt, editId),
      );

      if (!response.success) {
        toast.error(response.message);
      }
    },
    onError: (error) => {
      console.log("error", error);
      toast.error(error.message);
    },
  });
  const retryMutation = useMutation({
    mutationFn: async ({ editId }: { editId?: string }) => {
      setStreamedText("");
      const response = await fetchService.stream(
        "/conversation/retry-stream-content",
        { prompt, conversationId: id, id: editId },
        {},
        (chunk) => handleStreamResponse(chunk, "", editId),
      );

      if (!response.success) {
        toast.error(response.message);
      }
    },
    onError: (error) => {
      console.log("error", error);
      toast.error(error.message);
    },
  });

  const generateContent = useCallback(
    (data: { id: string; prompt: string }) => {
      if (!generateMutation.isPending)
        generateMutation.mutate({ prompt: data.prompt, editId: data.id });
    },
    [generateMutation],
  );

  const regenerateContent = useCallback(
    (id: string) => {
      if (!retryMutation.isPending) retryMutation.mutate({ editId: id });
    },
    [generateMutation],
  );

  const canShowChat =
    !isNew && !isConversationLoading && !isConversationError && Boolean(conversationData);
  const canShare = !isNew && !isConversationLoading && !isConversationError;

  const metaTitle = isNew
    ? "New Chat"
    : isConversationLoading
      ? "Loading Chat..."
      : isConversationError
        ? "Conversation Not Found"
        : conversationData?.name || "Chat";

  const metaDescription = isNew
    ? "Start a new AI conversation with MKK Agent."
    : isConversationError
      ? "The requested AI conversation could not be found."
      : conversationData?.name
        ? `Chat conversation: ${conversationData.name}`
        : "View and continue your AI conversation with MKK Agent.";

  return (
    <>
      <MetaHead title={metaTitle} description={metaDescription} />
      <ChatHeader chatId={id} modelId={modelId} setModelId={setModelId} canShare={canShare} />

      {!isNew && isConversationLoading && (
        <div className="flex flex-col items-center justify-center w-full h-[calc(100%-120px)] pt-18 pb-10">
          <Loader size={36} className="animate-[spin_2s_linear_infinite] text-gray-500" />
        </div>
      )}

      {!isNew && !isConversationLoading && isConversationError && (
        <div className="flex flex-col items-center justify-center w-full h-full p-6 text-center">
          <div className="p-4 rounded-full bg-red-100 dark:bg-red-950/40 text-red-600 dark:text-red-400 mb-4 shadow-sm">
            <AlertCircle className="size-10" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
            Conversation Not Found
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 max-w-md mb-6">
            {conversationError instanceof Error
              ? conversationError.message
              : "This conversation may have been deleted or you do not have permission to view it."}
          </p>
          <button
            type="button"
            onClick={() => navigate("/new")}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gray-900 hover:bg-gray-800 dark:bg-gray-100 dark:hover:bg-white text-white dark:text-gray-900 font-medium text-sm transition-all duration-200 shadow-sm hover:shadow active:scale-95 cursor-pointer"
          >
            <SquarePen className="size-4" />
            New Conversation
          </button>
        </div>
      )}

      {canShowChat && (
        <ChatMessages
          chatId={id}
          setModelId={setModelId}
          isLoading={generateMutation.isPending || retryMutation.isPending}
          streamedText={streamedText}
          setStreamedText={setStreamedText}
          regenerateContent={regenerateContent}
        />
      )}

      {(isNew || canShowChat) && (
        <div
          className={`absolute flex flex-col items-center w-full px-4 md:px-8 transition-all duration-300 ${isNew ? "top-1/3" : "bottom-4 md:bottom-8 z-2"}`}
        >
          <div
            className={`${isNew && !generateMutation.isPending ? "flex" : "hidden"} text-4xl my-8 text-center`}
          >
            Ask your query,
            <span className="lowercase first-letter:uppercase ml-2">{user?.firstName}</span>
          </div>
          <div
            className={`${isNew && generateMutation.isPending ? "flex" : "hidden"} text-4xl my-8`}
          >
            <Loader size={32} className="animate-[spin_2s_linear_infinite]" />
          </div>
          <PromptInput
            ref={promptRef}
            className="w-full max-w-xl md:max-w-2xl lg:max-w-3xl shadow-lg dark:shadow-gray-950/50"
            sendMessage={generateContent}
            isLoading={generateMutation.isPending || retryMutation.isPending}
          />
        </div>
      )}
    </>
  );
}
