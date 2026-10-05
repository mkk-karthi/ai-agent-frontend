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
}
