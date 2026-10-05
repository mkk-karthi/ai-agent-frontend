import { Play, Square } from "lucide-react";
import {
  forwardRef,
  useCallback,
  useContext,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import { ConversationContext } from "../../../context/conversationContext";

export interface PromptInputRef {
  reset: () => void;
  setPrompt: (v: string) => void;
}

interface PromptInputProps {
  className?: string;
  isLoading: boolean;
  sendMessage: (data: { id: string; prompt: string }) => void;
}

export default forwardRef<PromptInputRef, PromptInputProps>(function PromptInput(
  { className, isLoading, sendMessage },
  ref,
): React.ReactElement {
  const { editData, setEditData } = useContext(ConversationContext);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [prompt, setPrompt] = useState("");
  const [editId, setEditId] = useState("");
  const [isSingleLine, setSingleLine] = useState(true);

  const MIN_ROWS = 1;
  const MAX_ROWS = 5;
  const LINE_HEIGHT = 24;

  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    // Calculate height bounds
    const minHeight = MIN_ROWS * LINE_HEIGHT;
    const maxHeight = MAX_ROWS * LINE_HEIGHT;

    // Reset height to compute actual text height
    textarea.style.height = "auto";
    const scrollHeight = textarea.scrollHeight;

    // Apply strict heights
    if (scrollHeight <= minHeight) {
      textarea.style.height = `${minHeight}px`;
      textarea.style.overflowY = "hidden";
    } else if (scrollHeight >= maxHeight) {
      textarea.style.height = `${maxHeight}px`;
      textarea.style.overflowY = "auto";
    } else {
      textarea.style.height = `${scrollHeight}px`;
      textarea.style.overflowY = "hidden";
    }
    setSingleLine(textarea.scrollHeight <= LINE_HEIGHT);
  }, [prompt]);

  useEffect(() => {
    if (editData) {
      setEditId(editData.id);
      setPrompt(editData.rawMessage);
    }
  }, [editData]);

  const formRef = useRef<HTMLFormElement>(null);

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent) => {
      if (!formRef) return;
      if (event.key === "Enter" && !event.shiftKey) {
        event.preventDefault();

        const form = formRef.current;
        form?.requestSubmit();
      }
    },
    [formRef],
  );

  useImperativeHandle(ref, () => ({
    reset: () => {
      setEditId("");
      setPrompt("");
    },
    setPrompt,
  }));

  const handleSubmit = useCallback(
    (e: React.SubmitEvent<HTMLFormElement>) => {
      e.preventDefault();

      if (prompt && prompt.trim()) {
        sendMessage({ id: editId, prompt });
      }
    },
    [prompt],
  );

  return (
    <>
      <form
        ref={formRef}
        onSubmit={handleSubmit}
        className={`flex items-center ${isSingleLine ? "flex-row" : "flex-col items-end"} bg-gray-200 dark:bg-gray-800 rounded-4xl px-6 py-4 gap-3 ${className}`}
      >
        <textarea
          ref={textareaRef}
          name="prompt"
          placeholder="Ask anything"
          className={`text-base outline-none w-full resize-none`}
          value={prompt}
          rows={1}
          onChange={(e) => {
            if (!e.target.value) setEditData(null);
            setPrompt(e.target.value);
          }}
          onKeyDown={handleKeyDown}
        />
        <button
          type="submit"
          disabled={isLoading}
          className={`flex border border-dashed p-2 rounded-full text-sm cursor-pointer`}
        >
          {isLoading ? <Square size={12} /> : <Play size={12} />}
        </button>
      </form>
    </>
  );
});
