import { AlertCircle, Check, Copy, Pencil, RefreshCw } from "lucide-react";
import { MarkdownComponent } from "../../ui/MarkdownComponent";
import { useCallback, useContext, useState } from "react";
import type { ChatMessageType } from "../../../types/conversation";
import { ConversationContext } from "../../../context/conversationContext";
import FileAttachment from "./FileAttachment";

export default function ChatMessage({
  item,
  isEdit,
  isRetry,
  regenerateContent,
  isShared = false,
}: {
  item: ChatMessageType;
  isEdit: boolean;
  isRetry: boolean;
  regenerateContent: (v: string) => void;
  isShared?: boolean;
}) {
  const { editData, setEditData } = useContext(ConversationContext);
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback((text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, []);

  const isUser = item.role === "USER";
  const isError = Boolean(item.isError);

  return (
    <div
      className={`flex flex-col my-2 md:m-4 px-4 ${isUser ? "justify-end items-end" : "justify-start"}`}
    >
      {item.attachments && item.attachments.length > 0 && (
        <div
          className={`flex flex-wrap gap-2 mb-2 ${isUser ? "justify-end max-w-3/4 ml-auto" : "justify-start w-full"}`}
        >
          {item.attachments.map((att) => (
            <FileAttachment key={att.id} attachment={att} isShared={isShared} />
          ))}
        </div>
      )}

      {isError ? (
        <div className="w-full max-w-3xl rounded-xl border border-red-300 dark:border-red-900/60 bg-red-50 dark:bg-red-950/30 p-4 text-red-800 dark:text-red-200">
          <div className="flex items-center gap-2 font-medium text-red-600 dark:text-red-400 mb-1">
            <AlertCircle size={18} />
            <span>Generation failed</span>
          </div>
          <div className="text-sm">
            <MarkdownComponent source={item.message} />
          </div>
        </div>
      ) : (
        <div
          className={`${isUser ? "w-fit max-w-3/4 ml-auto bg-gray-200 dark:bg-gray-800/80 rounded-4xl text-left" : "w-full"} px-4 py-2`}
        >
          <MarkdownComponent source={item.message} />
        </div>
      )}

      <div className={`flex items-center gap-1 mt-1 ${isUser ? "max-w-3/4" : "w-full"}`}>
        <button
          type="button"
          className="p-2 cursor-pointer hover:opacity-80 rounded"
          title={copied ? "Copied" : "Copy"}
          onClick={() => !copied && handleCopy(item.rawMessage)}
        >
          {copied ? <Check size={16} /> : <Copy size={16} />}
        </button>

        {isEdit && editData?.id !== item.id && (
          <button
            type="button"
            className="p-2 cursor-pointer hover:opacity-80 rounded"
            title="Edit"
            onClick={() => setEditData(item)}
          >
            <Pencil size={16} />
          </button>
        )}

        {(isRetry || (isError && !isShared)) && (
          <button
            type="button"
            className={`p-2 cursor-pointer hover:opacity-80 rounded ${isError ? "text-red-600 dark:text-red-400" : "text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"} flex items-center gap-1`}
            title="Retry"
            onClick={() => regenerateContent(item.id)}
          >
            <RefreshCw size={16} />
            {isError && <span className="text-xs">Retry</span>}
          </button>
        )}
      </div>
    </div>
  );
}
