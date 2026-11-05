export interface AttachmentType {
  id: string;
  originalName: string;
  storedName: string;
  mimeType: string;
  size: number;
}

export interface ChatMessageType {
  id: string;
  message: string;
  rawMessage: string;
  role: string;
  modelId: string;
  isError?: boolean;
  attachments?: AttachmentType[];
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
