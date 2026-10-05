import { createContext, useState, type ReactNode } from "react";
import type { ChatMessageType, ChatType } from "../types/conversation";

interface ConversationContextType {
  isEdit: boolean;
  editData: ChatMessageType | null;
  setEditData: (v: ChatMessageType | null) => void;
  setEdit: (v: boolean) => void;

  conversationId: ChatType["id"] | null;
  conversationEdit: boolean;
  conversationOptionOpen: boolean;
  conversationOptionPosition: DOMRect | null;
  conversationOptionHeight: number;
  setConversationId: (v: ChatType["id"] | null) => void;
  setConversationEdit: (v: boolean) => void;
  setConversationOptionOpen: (v: boolean) => void;
  setConversationOptionPosition: (v: DOMRect | null) => void;
  setConversationOptionHeight: (v: number) => void;
}

export const ConversationContext = createContext<ConversationContextType>({
  isEdit: false,
  editData: null,
  setEdit: (v: boolean) => {},
  setEditData: (v: ChatMessageType | null) => {},

  conversationId: null,
  conversationEdit: false,
  conversationOptionOpen: false,
  conversationOptionPosition: null,
  conversationOptionHeight: 0,
  setConversationId: (v: ChatType["id"] | null) => {},
  setConversationEdit: (v: boolean) => {},
  setConversationOptionOpen: (v: boolean) => {},
  setConversationOptionPosition: (v: DOMRect | null) => {},
  setConversationOptionHeight: (v: number) => {},
});

// Create a Provider component
export function ConversationProvider({ children }: { children: ReactNode }) {
  const [isEdit, setEdit] = useState(false);
  const [editData, setEditData] = useState<ChatMessageType | null>(null);

  const [conversationId, setConversationId] = useState<ChatType["id"] | null>(null);
  const [conversationEdit, setConversationEdit] = useState(false);
  const [conversationOptionOpen, setConversationOptionOpen] = useState(false);
  const [conversationOptionPosition, setConversationOptionPosition] = useState<DOMRect | null>(
    null,
  );
  const [conversationOptionHeight, setConversationOptionHeight] = useState<number>(0);

  return (
    <ConversationContext.Provider
      value={{
        isEdit,
        editData,
        setEditData,
        setEdit,
        conversationId,
        setConversationId,
        conversationOptionOpen,
        setConversationOptionOpen,
        conversationOptionPosition,
        setConversationOptionPosition,
        conversationOptionHeight,
        setConversationOptionHeight,
        conversationEdit,
        setConversationEdit,
      }}
    >
      {children}
    </ConversationContext.Provider>
  );
}
