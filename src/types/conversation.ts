export interface ChatMessageType {
  id: string;
  message: string;
  rawMessage: string;
  role: string;
  modelId: string;
}

export interface ChatType {
  id: string;
  name: string;
  isPinned: boolean;
}

export interface ConversationType {
  id: string;
  name: string;
  conversationShare?: {
    id: string;
    type: "RESTRICTED" | "PUBLIC" | "SPECIFIC_USER";
    userMails: string[];
  } | null;
}
