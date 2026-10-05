import ChatHeader from "../../components/user/chats/ChatHeader";
import { useContext, useEffect, useRef, useState } from "react";
import PromptInput, { type PromptInputRef } from "../../components/user/chats/PromptInput";
import { useNavigate, useParams } from "react-router-dom";
import ChatMessages from "../../components/user/chats/ChatMessages";
import { useUserStore } from "../../stores/UserStore";
import { fetchService } from "../../services/fetchService";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ConversationContext } from "../../context/conversationContext";
import { toast } from "react-toastify";
import { Loader } from "lucide-react";

export default function Home(): React.ReactElement {
  const [streamedText, setStreamedText] = useState("");
  const [modelId, setModelId] = useState("");
  const { id } = useParams<{ id: string }>();
  const { user } = useUserStore.getState();

  if (!id) return <></>;
  const isNew = id === "new";

  const [_, setConversationId] = useState("");
  const promptRef = useRef<PromptInputRef>(null);
  const { setEditData } = useContext(ConversationContext);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

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
          console.log(match);
          results.push(JSON.parse(match[0]));
        } catch (e) {
          console.log(e);
          continue;
        }
      }
      console.log(results);
      return results;
    }
  };

  const handleStreamResponse = (chunk: string, prompt: string, editId?: string) => {
    const chunks = parseStreamResponse(chunk);
    console.log("chunks", chunks);

    chunks.forEach((v: { type: "coversation" | "stream" | "error" | "end"; text: string }) => {
      if (v.type == "coversation") {
        const coversation = JSON.parse(v.text);
        setConversationId(coversation.id);

        if (editId) setEditData(null);

        if (isNew) {
          navigate(`/${coversation.id}`, { replace: true });
          queryClient.invalidateQueries({ queryKey: ["coversations"] });
        }
        queryClient.refetchQueries({
          queryKey: ["coversationsMessage", coversation.id],
        });
        promptRef.current?.reset();
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
      }
    });
  };

  const generateMutation = useMutation({
    mutationFn: async ({ prompt, editId }: { prompt: string; editId?: string }) => {
      setStreamedText("");
      await fetchService.stream(
        "/generate-stream-content",
        { prompt, modelId, conversationId: isNew ? "" : id, id: editId ?? "" },
        {},
        (chunk) => handleStreamResponse(chunk, prompt, editId),
      );
    },
    onError: (error) => {
      console.log("error", error);
      toast.error(error.message);
    },
  });
  const retryMutation = useMutation({
    mutationFn: async ({ editId }: { editId?: string }) => {
      setStreamedText("");
      await fetchService.stream(
        "/retry-stream-content",
        { prompt, conversationId: id, id: editId },
        {},
        (chunk) => handleStreamResponse(chunk, "", editId),
      );
    },
    onError: (error) => {
      console.log("error", error);
      toast.error(error.message);
    },
  });

  const generateContent = (data: { id: string; prompt: string }) => {
    if (!generateMutation.isPending)
      generateMutation.mutate({ prompt: data.prompt, editId: data.id });
  };

  const regenerateContent = (id: string) => {
    if (!retryMutation.isPending) retryMutation.mutate({ editId: id });
  };

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
