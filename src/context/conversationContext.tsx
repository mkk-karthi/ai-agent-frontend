import { createContext, useState, type ReactNode } from "react";
import type { ChatMessageType, ChatType } from "../types/conversation";

interface ConversationContextType {
  isEdit: boolean;
  editData: ChatMessageType | null;
  setEditData: (v: ChatMessageType | null) => void;
  setEdit: (v: boolean) => void;
}

export const ConversationContext = createContext<ConversationContextType>({
  isEdit: false,
  editData: null,
  setEdit: (v: boolean) => {},
  setEditData: (v: ChatMessageType | null) => {},
});

// Create a Provider component
export function ConversationProvider({ children }: { children: ReactNode }) {
  const [isEdit, setEdit] = useState(false);
  const [editData, setEditData] = useState<ChatMessageType | null>(null);

  return (
    <ConversationContext.Provider
      value={{
        isEdit,
        editData,
        setEditData,
        setEdit,
      }}
    >
      {children}
    </ConversationContext.Provider>
  );
}
