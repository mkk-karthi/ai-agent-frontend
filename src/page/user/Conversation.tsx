import ChatHeader from "../../components/user/chats/ChatHeader";
import { useCallback, useContext, useEffect, useRef, useState } from "react";
import PromptInput, {
  type PromptInputRef,
  type PromptInputState,
} from "../../components/user/chats/PromptInput";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import ChatMessages from "../../components/user/chats/ChatMessages";
import ChatSkeleton from "../../components/user/chats/ChatSkeleton";
import { useUserStore } from "../../stores/UserStore";
import { fetchService } from "../../lib/fetchService";
import { useMutation, useQuery } from "@tanstack/react-query";
import { ConversationContext } from "../../context/conversationContext";
import { toast } from "react-toastify";
import { AlertCircle, Loader, SquarePen } from "lucide-react";
import { queryClient } from "../../lib/queryClient";
import type { AttachmentType, ConversationType } from "../../types/conversation";
import MetaHead from "../../components/common/MetaHead";
import { getClientLocaleContext } from "../../common";

export default function Conversation(): React.ReactElement {
  const { id } = useParams<{ id: string }>();

  if (!id) return <></>;
  const isNew = id === "new";

  const [streamedText, setStreamedText] = useState("");
  const [modelId, setModelId] = useState("");
  const promptRef = useRef<PromptInputRef>(null);
  const pendingPromptBackupRef = useRef<PromptInputState | null>(null);
  const handledAutoStreamRef = useRef<string | null>(null);
  const { setEditData } = useContext(ConversationContext);

  const { user } = useUserStore.getState();
  const navigate = useNavigate();
  const location = useLocation();

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

  const parseStreamResponse = (str: string) => {
    if (!str || !str.trim()) return [];

    const results: Array<{ type: "start" | "stream" | "error" | "end"; text: string }> = [];
    let start = -1;
    let depth = 0;
    let inString = false;
    let isEscaped = false;

    for (let i = 0; i < str.length; i++) {
      const char = str[i];

      if (inString) {
        if (isEscaped) {
          isEscaped = false;
        } else if (char === "\\") {
          isEscaped = true;
        } else if (char === '"') {
          inString = false;
        }
        continue;
      }

      if (char === '"') {
        inString = true;
      } else if (char === "{") {
        if (depth === 0) start = i;
        depth++;
      } else if (char === "}") {
        depth--;
        if (depth === 0 && start !== -1) {
          const jsonStr = str.slice(start, i + 1);
          try {
            results.push(JSON.parse(jsonStr));
          } catch (e) {
            console.error("Failed to parse JSON stream token:", jsonStr, e);
          }
          start = -1;
        }
      }
    }

    return results;
  };

  const handleStreamResponse = (
    chunk: string,
    _prompt: string,
    activeConversationId: string,
    editId?: string,
  ) => {
    const chunks = parseStreamResponse(chunk);

    chunks.forEach((v: { type: "start" | "stream" | "error" | "end"; text: string }) => {
      if (v.type === "start") {
        pendingPromptBackupRef.current = null;
        promptRef.current?.clear();
      } else if (v.type === "stream") {
        setStreamedText((prev) => prev + v.text);
      } else if (v.type === "error") {
        try {
          const error = JSON.parse(v.text);
          toast.error(error.message);
        } catch {
          toast.error(v.text);
        }

        if (pendingPromptBackupRef.current) {
          promptRef.current?.restoreState(pendingPromptBackupRef.current);
          pendingPromptBackupRef.current = null;
        }
      } else if (v.type === "end") {
        pendingPromptBackupRef.current = null;
        if (editId) setEditData(null);
        promptRef.current?.clear();
        queryClient.invalidateQueries({ queryKey: ["coversations"] });
      }

      if (v.type !== "stream") {
        queryClient.refetchQueries({
          queryKey: ["coversationsMessage", activeConversationId],
        });
      }
    });
  };

  const generateMutation = useMutation({
    mutationFn: async ({
      prompt,
      editId,
      files,
      attachmentIds,
      selectedModelId,
      targetConversationId,
    }: {
      prompt: string;
      editId?: string;
      files?: File[];
      attachmentIds?: string[];
      selectedModelId?: string;
      targetConversationId?: string;
    }) => {
      setStreamedText("");
      const activeConversationId = targetConversationId || id;

      // Stream message into the conversation
      const formData = new FormData();
      formData.append("prompt", prompt);
      formData.append("modelId", selectedModelId ?? modelId);
      formData.append("conversationId", activeConversationId);
      if (editId) formData.append("id", editId);

      const { timezone, locale } = getClientLocaleContext();
      if (timezone) formData.append("timezone", timezone);
      if (locale) formData.append("locale", locale);

      if (attachmentIds && attachmentIds.length > 0) {
        attachmentIds.forEach((attId) => {
          formData.append("attachmentIds", attId);
        });
      }
      if (files && files.length > 0) {
        files.forEach((file) => {
          formData.append("files", file);
        });
      }

      const response = await fetchService.stream(
        "/conversation/generate-stream-content",
        formData,
        {},
        (chunk) => handleStreamResponse(chunk, prompt, activeConversationId, editId),
      );

      if (!response.success) {
        if (pendingPromptBackupRef.current) {
          promptRef.current?.restoreState(pendingPromptBackupRef.current);
          pendingPromptBackupRef.current = null;
        }
        toast.error((response as any).message || "Failed to generate response");
      }
    },
    onError: (error: any) => {
      console.error(error);
      if (pendingPromptBackupRef.current) {
        promptRef.current?.restoreState(pendingPromptBackupRef.current);
        pendingPromptBackupRef.current = null;
      }
      toast.error(error.message);
    },
  });

  useEffect(() => {
    if (
      location.state?.autoStream &&
      id &&
      !isNew &&
      handledAutoStreamRef.current !== id
    ) {
      handledAutoStreamRef.current = id;
      const { prompt, modelId: streamModelId, files } = location.state.autoStream;
      if (streamModelId) setModelId(String(streamModelId));

      pendingPromptBackupRef.current = {
        prompt,
        files,
      };

      generateMutation.mutate({
        prompt,
        files,
        selectedModelId: streamModelId,
        targetConversationId: id,
      });
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [id, isNew, location.state, location.pathname, navigate, generateMutation]);

  const retryMutation = useMutation({
    mutationFn: async ({ editId }: { editId?: string }) => {
      setStreamedText("");
      const { timezone, locale } = getClientLocaleContext();

      const response = await fetchService.stream(
        "/conversation/retry-stream-content",
        {
          conversationId: id,
          id: editId,
          timezone,
          locale,
        },
        {},
        (chunk) => handleStreamResponse(chunk, "", id, editId),
      );

      if (!response.success) {
        toast.error(response.message);
      }
    },
    onError: (error) => {
      console.error(error);
      toast.error(error.message);
    },
  });

  const conversationMutation = useMutation({
    mutationFn: async (data: {
      id: string;
      prompt: string;
      files?: File[];
      attachmentIds?: string[];
    }) => {
      setStreamedText("");
      const { timezone, locale } = getClientLocaleContext();

      const response = await fetchService.post<{ id: string; name: string }>(
        "/conversation/create",
        {
          modelId: Number(modelId),
          prompt: data.prompt,
          timezone,
          locale,
        },
      );

      if (!response.success || !response.data) {
        toast.error(response.message || "Failed to create conversation");
      } else {
        const newConversation = response.data;

        queryClient.setQueryData(["conversation", newConversation.id], newConversation);
        navigate(`/${newConversation.id}`, { replace: true });
        queryClient.invalidateQueries({ queryKey: ["coversations"] });

        generateMutation.mutate({
          prompt: data.prompt,
          editId: data.id,
          files: data.files,
          attachmentIds: data.attachmentIds,
          targetConversationId: newConversation.id,
        });
      }
    },
    onError: (error) => {
      console.error(error);
      if (pendingPromptBackupRef.current) {
        promptRef.current?.restoreState(pendingPromptBackupRef.current);
        pendingPromptBackupRef.current = null;
      }
      toast.error(error.message);
    },
  });

  const generateContent = useCallback(
    (data: {
      id: string;
      prompt: string;
      rawPrompt?: string;
      files?: File[];
      attachmentIds?: string[];
      existingAttachments?: AttachmentType[];
    }) => {
      if (!generateMutation.isPending) {
        pendingPromptBackupRef.current = {
          prompt: data.rawPrompt ?? data.prompt,
          files: data.files,
          existingAttachments: data.existingAttachments,
          editId: data.id,
        };

        // If this is a new conversation, first create it via the dedicated create endpoint
        if (isNew) {
          conversationMutation.mutate(data);
        } else {
          generateMutation.mutate({
            prompt: data.prompt,
            editId: data.id,
            files: data.files,
            attachmentIds: data.attachmentIds,
          });
        }
      }
    },
    [conversationMutation, generateMutation],
  );

  const regenerateContent = useCallback(
    (id: string) => {
      if (!retryMutation.isPending) retryMutation.mutate({ editId: id });
    },
    [retryMutation],
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
        <div className="h-[calc(100dvh-2rem)] overflow-y-auto px-4 md:px-8 pb-12 pt-4">
          <ChatSkeleton />
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
          isLoading={
            conversationMutation.isPending || generateMutation.isPending || retryMutation.isPending
          }
          streamedText={streamedText}
          setStreamedText={setStreamedText}
          regenerateContent={regenerateContent}
        />
      )}

      {(isNew || canShowChat) && (
        <div
          className={`absolute inset-x-0 flex flex-col items-center w-full px-4 md:px-8 transition-all duration-300 ${isNew ? "top-1/3" : "bottom-8 z-2"}`}
        >
          <div
            className={`${isNew && !generateMutation.isPending && !conversationMutation.isPending ? "flex" : "hidden"} text-4xl my-8 text-center`}
          >
            Ask your query,
            <span className="lowercase first-letter:uppercase ml-2">{user?.firstName}</span>
          </div>
          <div
            className={`${isNew && (generateMutation.isPending || conversationMutation.isPending) ? "flex items-center gap-2" : "hidden"} my-8 text-gray-600 dark:text-gray-300`}
          >
            <Loader size={20} className="animate-spin text-indigo-500" />
            <span className="text-base font-medium">Starting conversation...</span>
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
