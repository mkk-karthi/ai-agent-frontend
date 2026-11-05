import { createContext, useState, useCallback, type ReactNode } from "react";
import type { ChatMessageType } from "../types/conversation";

interface ConversationContextType {
  isEdit: boolean;
  editData: ChatMessageType | null;
  setEditData: (v: ChatMessageType | null) => void;
  setEdit: (v: boolean) => void;
  showScrollBottom: boolean;
  setShowScrollBottom: (v: boolean) => void;
  scrollToBottom: () => void;
  setScrollToBottom: (fn: () => void) => void;
}

export const ConversationContext = createContext<ConversationContextType>({
  isEdit: false,
  editData: null,
  setEdit: () => {},
  setEditData: () => {},
  showScrollBottom: false,
  setShowScrollBottom: () => {},
  scrollToBottom: () => {},
  setScrollToBottom: () => {},
});

// Create a Provider component
export function ConversationProvider({ children }: { children: ReactNode }) {
  const [isEdit, setEdit] = useState(false);
  const [editData, setEditData] = useState<ChatMessageType | null>(null);
  const [showScrollBottom, setShowScrollBottom] = useState(false);
  const [scrollToBottomHandler, setScrollToBottomHandler] = useState<(() => void) | null>(null);

  const scrollToBottom = useCallback(() => {
    if (scrollToBottomHandler) {
      scrollToBottomHandler();
    }
  }, [scrollToBottomHandler]);

  const setScrollToBottom = useCallback((fn: () => void) => {
    setScrollToBottomHandler(() => fn);
  }, []);

  return (
    <ConversationContext.Provider
      value={{
        isEdit,
        editData,
        setEditData,
        setEdit,
        showScrollBottom,
        setShowScrollBottom,
        scrollToBottom,
        setScrollToBottom,
      }}
    >
      {children}
    </ConversationContext.Provider>
  );
}
