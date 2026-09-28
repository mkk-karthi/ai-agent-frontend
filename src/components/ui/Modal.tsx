import { useEffect, useState, type ReactNode } from "react";
import { X } from "lucide-react";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  className?: string;
  children: ReactNode;
  size?: "sm" | "md" | "lg" | "xl";
}

export default function Modal({ isOpen, onClose, title, children, className, size = "md" }: ModalProps) {
  const [shouldRender, setShouldRender] = useState(isOpen);
  const [isClosing, setIsClosing] = useState(false);

  // Handle open / close animation
  useEffect(() => {
    if (isOpen) {
      setShouldRender(true);
      setIsClosing(false);
      return;
    }

    if (shouldRender) {
      setIsClosing(true);

      const timer = setTimeout(() => {
        setShouldRender(false);
        setIsClosing(false);
      }, 200);

      return () => clearTimeout(timer);
    }
  }, [isOpen, shouldRender]);

  // Escape key + body scroll lock
  useEffect(() => {
    if (!shouldRender) return;

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", handleEscape);

    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "";
    };
  }, [shouldRender, onClose]);

  if (!shouldRender) {
    return null;
  }

  const sizeClasses = {
    sm: "max-w-sm",
    md: "max-w-md",
    lg: "max-w-lg",
    xl: "max-w-2xl",
  };

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center w-dvw bg-black/50 p-4 ${isClosing ? "animate-[overlayOut_0.2s_ease-in_forwards]" : "animate-[overlayIn_0.2s_ease-out_forwards]"}`}
      onMouseDown={onClose}
    >
      <div
        className={`flex w-full ${sizeClasses[size]} ${className} max-h-[90vh] flex-col overflow-hidden rounded-lg bg-white dark:bg-gray-900 shadow-xl ${isClosing ? "animate-[zoomOut_0.2s_ease-in_forwards]" : "animate-[zoomIn_0.2s_ease-out_forwards]"}`}
        onMouseDown={(event) => event.stopPropagation()}
      >
        {/* Header */}
        {title ? (
          <>
            <div className="flex shrink-0 items-center justify-between border-b border-gray-200 dark:border-white/10 px-5 py-4">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h2>

              <button
                type="button"
                onClick={onClose}
                className="rounded-md p-2 text-gray-700 dark:text-white border border-gray-300 dark:border-white/9 bg-white dark:bg-white/2 hover:bg-gray-50 dark:hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all cursor-pointer"
                aria-label="Close modal"
              >
                <X size={20} />
              </button>
            </div>

            {/* Scrollable Body */}
            <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5 dark:bg-gray-800/50">
              {children}
            </div>
          </>
        ) : (
          children
        )}
      </div>
    </div>
  );
}
