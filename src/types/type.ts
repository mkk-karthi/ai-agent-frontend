import type { ComponentType } from "react";

export interface MenuListType {
  icon: React.ReactNode;
  link: string;
  name: string;
}

export interface FormProps<T> {
  defaultValues?: T;
  onSubmit: (data: T) => void;
  isLoading?: boolean;
}

export interface apiResponse<T> {
  success: boolean;
  code: number;
  message: string;
  data?: T;
  errors?: { [index: string]: string };
}

export interface SettingsType {
  id: string;
  name: string;
  Icon: ComponentType<{ className?: string }>;
  Component: ComponentType<{ onClose: () => void }>;
}
export interface Provider {
  id: string;
  name: string;
  status: "ACTIVE" | "INACTIVE";
  models: {
    id: string;
    modelName: string;
    type?: string;
    status: "ACTIVE" | "INACTIVE";
  }[];
}

export const AGENT_FIELD_TYPES = [
  "SMALL_TEXT",
  "LONG_TEXT",
  "DOCUMENT",
  "IMAGE",
  "FILE",
  "SELECT",
] as const;

export const MAX_AGENT_DYNAMIC_FIELDS = 5;

export type AgentFieldType = (typeof AGENT_FIELD_TYPES)[number];

export interface AgentFieldTypeOption {
  value: AgentFieldType;
  label: string;
  desc: string;
  isFileType?: boolean;
  allowedExtensions?: string[];
}

export interface AppConfig {
  appName: string;
  upload: {
    maxFileSize: number;
    maxFiles: number;
    allowedExtensions: {
      DOC: string[];
      IMAGE: string[];
      OTHER: string[];
    };
    allowedMimeTypes: {
      DOC: string[];
      IMAGE: string[];
      OTHER: string[];
    };
  };
  agent: {
    maxDynamicFields: number;
    fieldTypes: string[];
    fieldTypeConfigs: Record<string, any>;
    fieldTypeList: AgentFieldTypeOption[];
  };
}

export interface AgentField {
  id?: number;
  agentId?: number;
  key: string;
  label: string;
  type: AgentFieldType;
  isRequired: boolean;
  maxFile?: number;
  selectOptions?: string[] | null;
  sortOrder?: number;
}

export interface Agent {
  id: number;
  name: string;
  thumbnailImage?: string | null;
  description?: string | null;
  systemPrompt?: string;
  toolId: number;
  status: "ACTIVE" | "INACTIVE";
  inputFields: AgentField[];
  tool?: {
    id: number;
    name: string;
    status: "ACTIVE" | "INACTIVE";
  };
}

export interface Tool {
  id: number;
  name: string;
  status: "ACTIVE" | "INACTIVE";
  createdAt?: string;
  updatedAt?: string;
  _count?: {
    agents: number;
  };
  agents?: Agent[];
}
