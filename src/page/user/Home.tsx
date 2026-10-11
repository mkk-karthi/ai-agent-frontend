import ChatHeader from "../../components/user/chats/ChatHeader";
import { useCallback, useContext, useEffect, useRef, useState } from "react";
import PromptInput, { type PromptInputRef } from "../../components/user/chats/PromptInput";
import { useNavigate, useParams } from "react-router-dom";
import ChatMessages from "../../components/user/chats/ChatMessages";
import { useUserStore } from "../../stores/UserStore";
import { fetchService } from "../../lib/fetchService";
import { useMutation } from "@tanstack/react-query";
import { ConversationContext } from "../../context/conversationContext";
import { toast } from "react-toastify";
import { Loader } from "lucide-react";
import { queryClient } from "../../lib/queryClient";

export default function Home(): React.ReactElement {
  const { id } = useParams<{ id: string }>();

  if (!id) return <></>;
  const isNew = id === "new";

  const [streamedText, setStreamedText] = useState("");
  const [modelId, setModelId] = useState("");
  const promptRef = useRef<PromptInputRef>(null);
  const { setEditData } = useContext(ConversationContext);

  const { user } = useUserStore.getState();
  const navigate = useNavigate();

  useEffect(() => {
    promptRef.current?.reset();
  }, [id]);

  const parseStreamResponse = (str: string) => {
    if (!str || !str.trim()) return [];

    try {
      // 1. Convert the fused chunks into a clean valid JSON array layout
      const formatted = "[" + str.replace(/}{/g, "},{") + "]";
      return JSON.parse(formatted);
    } catch (err) {
      // 2. FALLBACK: regex grabs every individual {"type": ... } object blocks independently
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

  return (
    <>
      <ChatHeader chatId={id} modelId={modelId} setModelId={setModelId} />
      {!isNew && (
        <ChatMessages
          chatId={id}
          setModelId={setModelId}
          isLoading={generateMutation.isPending || retryMutation.isPending}
          streamedText={streamedText}
          setStreamedText={setStreamedText}
          regenerateContent={regenerateContent}
        />
      )}
      <div
        className={`absolute flex flex-col items-center w-full transition-all duration-300 ${isNew ? "top-1/3" : "bottom-0 lg:bottom-8 z-2"}`}
      >
        <div
          className={`${isNew && !generateMutation.isPending ? "flex" : "hidden"} text-4xl my-8`}
        >
          Ask your query,
          <span className="lowercase first-letter:uppercase ml-2">{user?.firstName}</span>
        </div>
        <div className={`${isNew && generateMutation.isPending ? "flex" : "hidden"} text-4xl my-8`}>
          <Loader size={32} className="animate-[spin_2s_linear_infinite]" />
        </div>
        <PromptInput
          ref={promptRef}
          className="w-sm md:w-3xl"
          sendMessage={generateContent}
          isLoading={generateMutation.isPending || retryMutation.isPending}
        />
      </div>
    </>
  );
}
