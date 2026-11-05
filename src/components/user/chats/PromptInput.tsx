import { ChevronDown, Loader, Paperclip, Play, X } from "lucide-react";
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
import { toast } from "react-toastify";
import type { AttachmentType } from "../../../types/conversation";

export interface PromptInputState {
  prompt: string;
  files?: File[];
  existingAttachments?: AttachmentType[];
  editId?: string;
}

export interface PromptInputRef {
  setPrompt: (v: string) => void;
  restoreState: (state: PromptInputState) => void;
  clear: () => void;
}

interface PromptInputProps {
  className?: string;
  isLoading: boolean;
  sendMessage: (data: {
    id: string;
    prompt: string;
    rawPrompt?: string;
    files?: File[];
    attachmentIds?: string[];
    existingAttachments?: AttachmentType[];
  }) => void;
}

// Read limits from env (defaults: 5MB, 1 file)
const MAX_FILE_SIZE_MB = Number(import.meta.env.VITE_MAX_FILE_SIZE_MB) || 5;
const MAX_FILE_SIZE = MAX_FILE_SIZE_MB * 1024 * 1024;
const MAX_FILES = Number(import.meta.env.VITE_MAX_FILES) || 1;

const ALLOWED_EXTENSIONS = [
  ".pdf",
  ".doc",
  ".docx",
  ".txt",
  ".md",
  ".png",
  ".jpg",
  ".jpeg",
  ".webp",
  ".csv",
  ".json",
  ".xml",
  ".html",
  ".css",
  ".js",
  ".ts",
  ".py",
  ".sql",
  ".sh",
];

export default forwardRef<PromptInputRef, PromptInputProps>(function PromptInput(
  { className, isLoading, sendMessage },
  ref,
): React.ReactElement {
  const { editData, setEditData, showScrollBottom, scrollToBottom } =
    useContext(ConversationContext);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [prompt, setPrompt] = useState("");
  const [editId, setEditId] = useState("");
  const [existingAttachments, setExistingAttachments] = useState<AttachmentType[]>([]);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isSingleLine, setSingleLine] = useState(true);

  const MIN_ROWS = 1;
  const MAX_ROWS = 5;
  const LINE_HEIGHT = 24;

  const totalFilesCount = existingAttachments.length + selectedFiles.length;

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
    setSingleLine(
      textarea.scrollHeight <= LINE_HEIGHT &&
        selectedFiles.length === 0 &&
        existingAttachments.length === 0 &&
        !editId,
    );
  }, [prompt, selectedFiles, existingAttachments, editId]);

  useEffect(() => {
    if (editData) {
      setEditId(editData.id);
      setPrompt(editData.rawMessage);
      setExistingAttachments(editData.attachments || []);
    } else {
      setEditId("");
      setExistingAttachments([]);
    }
  }, [editData]);

  const formRef = useRef<HTMLFormElement>(null);

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent) => {
      if (!formRef) return;
      if (event.key === "Enter" && !event.shiftKey && !event.nativeEvent.isComposing) {
        event.preventDefault();

        const form = formRef.current;
        form?.requestSubmit();
      }
    },
    [formRef],
  );

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileList = e.target.files;
    if (!fileList || fileList.length === 0) return;

    const incoming = Array.from(fileList);

    // Enforce total max files
    if (totalFilesCount + incoming.length > MAX_FILES) {
      toast.error(`You can only upload up to ${MAX_FILES} file${MAX_FILES > 1 ? "s" : ""}`);
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    // Existing file names for deduplication
    const existingNames = new Set([
      ...existingAttachments.map((a) => a.originalName.toLowerCase().trim()),
      ...selectedFiles.map((f) => f.name.toLowerCase().trim()),
    ]);

    const validFiles: File[] = [];

    for (const file of incoming) {
      const normalizedName = file.name.toLowerCase().trim();
      if (existingNames.has(normalizedName)) {
        toast.info(`"${file.name}" is already attached`);
        continue;
      }

      // Size validation calculated from env MB
      if (file.size > MAX_FILE_SIZE) {
        toast.error(
          `"${file.name}" exceeds the ${MAX_FILE_SIZE_MB}MB limit (${(file.size / (1024 * 1024)).toFixed(1)}MB)`,
        );
        continue;
      }

      // Extension validation
      const ext = "." + file.name.split(".").pop()?.toLowerCase();
      if (!ALLOWED_EXTENSIONS.includes(ext)) {
        toast.error(`File type "${ext}" is not supported`);
        continue;
      }

      existingNames.add(normalizedName);
      validFiles.push(file);
    }

    if (validFiles.length > 0) {
      setSelectedFiles((prev) => [...prev, ...validFiles]);
    }

    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const removeFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const removeExistingAttachment = (attId: string) => {
    setExistingAttachments((prev) => prev.filter((a) => a.id !== attId));
  };

  const cancelEdit = () => {
    setEditData(null);
    setEditId("");
    setPrompt("");
    setExistingAttachments([]);
    setSelectedFiles([]);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const clear = () => {
    setEditId("");
    setPrompt("");
    setSelectedFiles([]);
    setExistingAttachments([]);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  useImperativeHandle(ref, () => ({
    setPrompt,
    restoreState: (state: PromptInputState) => {
      setPrompt(state.prompt || "");
      setSelectedFiles(state.files ? [...state.files] : []);
      setExistingAttachments(state.existingAttachments ? [...state.existingAttachments] : []);
      setEditId(state.editId || "");
    },
    clear: clear,
  }));

  const handleSubmit = useCallback(
    (e: React.SubmitEvent<HTMLFormElement>) => {
      e.preventDefault();

      const hasContent =
        (prompt && prompt.trim()) || selectedFiles.length > 0 || existingAttachments.length > 0;

      if (hasContent && !isLoading) {
        const fileNames = [
          ...existingAttachments.map((a) => a.originalName),
          ...selectedFiles.map((f) => f.name),
        ].join(", ");

        const submittedPrompt = prompt.trim() || `[Attached: ${fileNames}]`;
        const payload = {
          id: editId,
          prompt: submittedPrompt,
          rawPrompt: prompt,
          files: selectedFiles.length > 0 ? [...selectedFiles] : undefined,
          attachmentIds: existingAttachments.map((a) => a.id),
          existingAttachments: [...existingAttachments],
        };

        // Immediately remove prompted text and images/files from input on send
        clear();

        sendMessage(payload);
      }
    },
    [prompt, selectedFiles, existingAttachments, editId, isLoading, sendMessage],
  );

  const formatSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="relative w-full max-w-xl md:max-w-2xl lg:max-w-3xl mx-auto">
      {showScrollBottom && (
        <div className="absolute bottom-full mb-3 left-1/2 -translate-x-1/2 z-10 transition-all duration-200">
          <button
            type="button"
            onClick={scrollToBottom}
            className="p-1.5 rounded-full bg-gray-100/90 dark:bg-gray-800/90 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 border border-gray-300 dark:border-gray-600/80 shadow-md backdrop-blur-sm cursor-pointer transition active:scale-95 flex items-center justify-center"
            title="Scroll to bottom"
          >
            <ChevronDown size={20} />
          </button>
        </div>
      )}
      <form
        ref={formRef}
        onSubmit={handleSubmit}
        className={`flex ${totalFilesCount > 0 || editId ? "flex-col items-stretch" : isSingleLine ? "flex-row items-center" : "flex-col items-end"} bg-gray-200 dark:bg-gray-800 rounded-3xl md:rounded-4xl px-4 md:px-6 py-3 md:py-4 gap-2 md:gap-3 w-full mx-auto ${className}`}
      >
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept={ALLOWED_EXTENSIONS.join(",")}
          multiple={MAX_FILES > 1}
          className="hidden"
        />
        {(totalFilesCount > 0 || editId) && (
          <div className="flex items-center justify-between gap-2">
            {totalFilesCount > 0 ? (
              <div className="flex flex-wrap gap-2 max-h-36 overflow-y-auto">
                {/* Existing uploaded attachments */}
                {existingAttachments.map((att) => (
                  <div
                    key={`existing-${att.id}`}
                    className="flex items-center gap-1.5 max-w-44 sm:max-w-52 w-fit px-2.5 py-1.5 rounded-xl bg-blue-50/80 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800/50 text-xs shadow-xs"
                  >
                    <Paperclip size={14} className="text-blue-500 shrink-0" />
                    <span
                      className="font-medium truncate min-w-0 text-gray-800 dark:text-gray-200"
                      title={att.originalName}
                    >
                      {att.originalName}
                    </span>
                    <span className="text-[10px] font-semibold text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/60 px-1.5 py-0.5 rounded shrink-0">
                      {formatSize(att.size)}
                    </span>
                    <button
                      type="button"
                      onClick={() => removeExistingAttachment(att.id)}
                      className="p-0.5 hover:text-red-500 rounded transition cursor-pointer text-gray-500 shrink-0"
                      title="Remove existing attachment"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}

                {/* Newly selected files */}
                {selectedFiles.map((file, idx) => (
                  <div
                    key={`${file.name}-${idx}`}
                    className="flex items-center gap-1.5 max-w-44 sm:max-w-52 w-fit px-2.5 py-1.5 rounded-xl bg-white/70 dark:bg-gray-900/60 border border-gray-300 dark:border-white/10 text-xs shadow-xs"
                  >
                    <Paperclip size={14} className="text-emerald-500 shrink-0" />
                    <span
                      className="font-medium truncate min-w-0 text-gray-800 dark:text-gray-200"
                      title={file.name}
                    >
                      {file.name}
                    </span>
                    <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-900/60 px-1.5 py-0.5 rounded shrink-0">
                      {formatSize(file.size)}
                    </span>
                    <button
                      type="button"
                      onClick={() => removeFile(idx)}
                      className="p-0.5 hover:text-red-500 rounded transition cursor-pointer text-gray-500 shrink-0"
                      title="Remove file"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex items-center gap-1.5 text-xs text-blue-600 dark:text-blue-400 font-medium">
                <span>Editing message</span>
              </div>
            )}

            {editId && (
              <button
                type="button"
                onClick={cancelEdit}
                className="border border-gray-400 dark:border-gray-500 text-gray-400 dark:text-gray-500 p-1 rounded-full cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed hover:bg-white dark:hover:bg-gray-700/50 transition shrink-0"
                title="Cancel edit"
              >
                <X size={12} />
              </button>
            )}
          </div>
        )}

        <div className="flex items-center w-full gap-2">
          <button
            type="button"
            disabled={isLoading || totalFilesCount >= MAX_FILES}
            onClick={() => fileInputRef.current?.click()}
            className="p-2 rounded-full hover:bg-gray-300 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 transition cursor-pointer shrink-0 disabled:opacity-40 disabled:cursor-not-allowed"
            title={`Attach files (max ${MAX_FILES} file${MAX_FILES > 1 ? "s" : ""}, up to ${MAX_FILE_SIZE_MB}MB each)`}
          >
            <Paperclip size={18} />
          </button>

          <textarea
            ref={textareaRef}
            name="prompt"
            placeholder={
              totalFilesCount > 0
                ? "Ask about the attached files or add instructions..."
                : "Ask anything"
            }
            className="text-base outline-none w-full resize-none bg-transparent placeholder:text-xl"
            value={prompt}
            rows={1}
            onChange={(e) => {
              if (!e.target.value && !editId) setEditData(null);
              setPrompt(e.target.value);
            }}
            onKeyDown={handleKeyDown}
          />

          <button
            type="submit"
            disabled={isLoading || (!prompt.trim() && totalFilesCount === 0)}
            className="flex border border-dashed border-gray-400 dark:border-gray-500 p-2 rounded-full cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed hover:bg-white dark:hover:bg-gray-700 transition shrink-0"
          >
            {isLoading ? (
              <Loader size={14} className="animate-[spin_2s_linear_infinite]" />
            ) : (
              <Play size={14} />
            )}
          </button>
        </div>
      </form>
    </div>
  );
});
