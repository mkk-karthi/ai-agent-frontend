import { Check, Copy, Pencil, RefreshCw } from "lucide-react";
import { MarkdownComponent } from "../../ui/MarkdownComponent";
import { useCallback, useContext, useState } from "react";
import type { ChatMessageType } from "../../../types/conversation";
import { ConversationContext } from "../../../context/conversationContext";

export default function ChatMessage({
  item,
  isEdit,
  isRetry,
  regenerateContent,
}: {
  item: ChatMessageType;
  isEdit: boolean;
  isRetry: boolean;
  regenerateContent: (v: string) => void;
}) {
  const { editData, setEditData } = useContext(ConversationContext);
  const [copied, setCopied] = useState(false);
  const handleCopy = useCallback((text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, []);

  return (
    <div
      className={`flex flex-col my-2 lg:m-4 px-4 ${item.role === "USER" ? "justify-end items-end" : "justify-start"}`}
    >
      <div
        className={`${item.role === "USER" ? "w-fit max-w-3/4 ml-auto bg-gray-200 dark:bg-gray-800/80 rounded-4xl text-left" : "w-full"} px-4 py-2`}
      >
        <MarkdownComponent source={item.message} />
      </div>
      <div className={`flex ${item.role === "USER" ? "max-w-3/4" : "w-full"}`}>
        <div
          className="p-2 cursor-pointer hover:opacity-80"
          title={copied ? "Copied" : "Copy"}
          onClick={() => !copied && handleCopy(item.rawMessage)}
        >
          {copied ? <Check size={16} /> : <Copy size={16} />}
        </div>
        {isEdit && editData?.id != item.id && (
          <div
            className="p-2 cursor-pointer hover:opacity-80"
            title="Edit"
            onClick={() => setEditData(item)}
          >
            <Pencil size={16} />
          </div>
        )}
        {isRetry && (
          <div
            className="p-2 cursor-pointer hover:opacity-80"
            title="Retry"
            onClick={() => regenerateContent(item.id)}
          >
            <RefreshCw size={16} />
          </div>
        )}
        {/* <Forward size={20} /> */}
      </div>
    </div>
  );
}
