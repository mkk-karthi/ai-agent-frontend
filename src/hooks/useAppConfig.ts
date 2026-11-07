import { useQuery } from "@tanstack/react-query";
import { fetchService } from "../lib/fetchService";
import type { AppConfig, apiResponse } from "../types/type";

export const DEFAULT_FRONTEND_CONFIG: AppConfig = {
  appName: "MKK Agent",
  upload: {
    maxFileSize: 5 * 1024 * 1024,
    maxFiles: 1,
    allowedExtensions: {
      DOC: [".pdf", ".doc", ".docx", ".txt", ".md"],
      IMAGE: [".png", ".jpg", ".jpeg", ".webp"],
      OTHER: [".csv", ".json", ".xml", ".html", ".css", ".js", ".ts", ".py", ".sql", ".sh"],
    },
    allowedMimeTypes: {
      DOC: [
        "application/pdf",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "text/plain",
        "text/markdown",
      ],
      IMAGE: ["image/png", "image/jpeg", "image/jpg", "image/webp"],
      OTHER: [
        "text/csv",
        "application/json",
        "application/xml",
        "text/xml",
        "text/html",
        "text/css",
        "application/javascript",
        "text/javascript",
      ],
    },
  },
  agent: {
    maxDynamicFields: 5,
    fieldTypes: ["SMALL_TEXT", "LONG_TEXT", "DOCUMENT", "IMAGE", "FILE", "SELECT"],
    fieldTypeConfigs: {},
    fieldTypeList: [
      {
        value: "SMALL_TEXT",
        label: "Small Text",
        desc: "Single-line text input",
        isFileType: false,
      },
      { value: "LONG_TEXT", label: "Long Text", desc: "Multi-line text area", isFileType: false },
      {
        value: "DOCUMENT",
        label: "Document Upload",
        desc: "PDF, DOC, DOCX, TXT (Max 5MB)",
        isFileType: true,
        allowedExtensions: [".pdf", ".doc", ".docx", ".txt", ".md"],
      },
      {
        value: "IMAGE",
        label: "Image Upload",
        desc: "PNG, JPG, JPEG (Max 5MB)",
        isFileType: true,
        allowedExtensions: [".png", ".jpg", ".jpeg", ".webp"],
      },
      {
        value: "FILE",
        label: "General File Upload",
        desc: "Any supported format (Max 5MB)",
        isFileType: true,
        allowedExtensions: [
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
        ],
      },
      {
        value: "SELECT",
        label: "Select Box",
        desc: "Dropdown list with predefined options",
        isFileType: false,
      },
    ],
  },
};

export const fetchAppConfig = async (): Promise<AppConfig> => {
  try {
    const res: apiResponse<AppConfig> = await fetchService.get("/config");
    if (res && res.code === 200 && res.data) {
      return res.data;
    }
  } catch (err) {
    console.error("Failed to fetch app configuration from backend, using defaults:", err);
  }
  return DEFAULT_FRONTEND_CONFIG;
};

export const useAppConfig = () => {
  const { data, isLoading, error } = useQuery({
    queryKey: ["appConfig"],
    queryFn: fetchAppConfig,
    staleTime: 12 * 60 * 60 * 1000, // 12 hours
    initialData: DEFAULT_FRONTEND_CONFIG,
  });

  return {
    config: data ?? DEFAULT_FRONTEND_CONFIG,
    isLoading,
    error,
  };
};
