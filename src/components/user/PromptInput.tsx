import { Search } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

export default function PromptInput({ className }: { className?: string }): React.ReactElement {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [prompt, setPrompt] = useState("");

  const MIN_ROWS = 1;
  const MAX_ROWS = 5;
  const LINE_HEIGHT = 24;

  const isSingleLine: boolean = useMemo(() => {
    const textarea = textareaRef.current;
    if (!textarea) return true;

    // Calculate the layout heights
    const scrollHeight = textarea.scrollHeight;
    return scrollHeight <= LINE_HEIGHT ? true : false;
  }, [prompt]);

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
  }, [prompt]);

  return (
    <>
      <div
        className={`flex items-center ${isSingleLine ? "flex-row" : "flex-col"} bg-gray-200 dark:bg-gray-800 rounded-4xl px-6 py-4 gap-3 ${className}`}
      >
        <textarea
          ref={textareaRef}
          name="prompt"
          placeholder="Ask anything"
          className={`text-base outline-none w-full resize-none ${isSingleLine ? "order-2" : "order-1"}`}
          value={prompt}
          rows={1}
          onChange={(e) => setPrompt(e.target.value)}
        ></textarea>
        <div
          className={`flex items-center ${isSingleLine ? "justify-center order-1 w-6" : "justify-between order-2 w-full"}`}
        >
          <Search className="size-5" />
        </div>
      </div>
    </>
  );
}
