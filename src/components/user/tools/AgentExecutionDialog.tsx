import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import Modal from "../../ui/Modal";
import { fetchService } from "../../../lib/fetchService";
import type { Agent, AgentField } from "../../../types/type";
import { useAppConfig } from "../../../hooks/useAppConfig";
import { getStaticAssetUrl, getClientLocaleContext } from "../../../common";
import {
  Bot,
  FileText,
  Image as ImageIcon,
  FileUp,
  Loader,
  AlertCircle,
  X,
  CheckCircle,
} from "lucide-react";
import { queryClient } from "../../../lib/queryClient";

interface AgentExecutionDialogProps {
  isOpen: boolean;
  onClose: () => void;
  agent: Agent | null;
}

interface ProviderWithModels {
  id: string;
  name: string;
  status: string;
  models?: Array<{ id: string; modelName: string; status: string }>;
}

export default function AgentExecutionDialog({
  isOpen,
  onClose,
  agent,
}: AgentExecutionDialogProps) {
  const navigate = useNavigate();
  const { config } = useAppConfig();
  const documentExtensions = config.upload.allowedExtensions.DOC;
  const imageExtensions = config.upload.allowedExtensions.IMAGE;
  const generalExtensions = Object.values(config.upload.allowedExtensions).flat();
  const maxFileSize = config.upload.maxFileSize;
  const maxFileSizeMb = Math.round(maxFileSize / (1024 * 1024));

  // Model selection
  const [selectedModelId, setSelectedModelId] = useState<string>("");
  const [fieldValues, setFieldValues] = useState<Record<string, string>>({});
  const [fileValues, setFileValues] = useState<Record<string, File>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfirmClose, setShowConfirmClose] = useState(false);

  // Fetch active models
  const { data: providersData, isLoading: isModelsLoading } = useQuery({
    queryKey: ["models"],
    queryFn: async (): Promise<ProviderWithModels[]> => {
      const res = await fetchService.get<ProviderWithModels[]>("/provider/model");
      return res.data ?? [];
    },
    enabled: isOpen,
  });

  // Fetch complete agent details (including inputFields) on demand
  const { data: fullAgentData, isLoading: isAgentLoading } = useQuery({
    queryKey: ["agent", agent?.id],
    queryFn: async (): Promise<Agent> => {
      const res = await fetchService.get<Agent>(`/agent/${agent?.id}`);
      if (res.code === 200 && res.data) return res.data;
      throw new Error(res.message || "Failed to fetch agent details");
    },
    enabled: Boolean(isOpen && agent?.id),
  });

  const activeAgent = fullAgentData || agent;

  const availableModels = (providersData || []).flatMap((provider) =>
    (provider.models || [])
      .filter((m) => m.status === "ACTIVE" && provider.status === "ACTIVE")
      .map((m) => ({
        ...m,
        providerName: provider.name,
      })),
  );

  useEffect(() => {
    if (availableModels.length > 0 && !selectedModelId) {
      setSelectedModelId(availableModels[0].id);
    }
  }, [availableModels, selectedModelId]);

  useEffect(() => {
    if (isOpen) {
      setFieldValues({});
      setFileValues({});
      setErrors({});
      setIsSubmitting(false);
      setShowConfirmClose(false);
    }
  }, [isOpen]);

  const isFormDirty = () => {
    const hasText = Object.values(fieldValues).some((v) => v && v.trim().length > 0);
    const hasFiles = Object.keys(fileValues).length > 0;
    return hasText || hasFiles;
  };

  const handleRequestClose = () => {
    if (isSubmitting) return;
    if (isFormDirty()) {
      setShowConfirmClose(true);
    } else {
      onClose();
    }
  };

  const handleConfirmClose = () => {
    setShowConfirmClose(false);
    onClose();
  };

  const handleCancelConfirm = () => {
    setShowConfirmClose(false);
  };

  useEffect(() => {
    if (!showConfirmClose) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.stopPropagation();
        e.preventDefault();
        setShowConfirmClose(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown, true);
    return () => window.removeEventListener("keydown", handleKeyDown, true);
  }, [showConfirmClose]);

  useEffect(() => {
    if (isOpen && activeAgent?.inputFields) {
      // Pre-populate select fields with first option or empty
      const initialFields: Record<string, string> = {};
      activeAgent.inputFields.forEach((f) => {
        if (f.type === "SELECT" && f.selectOptions && f.selectOptions.length > 0) {
          initialFields[f.key] = f.selectOptions[0];
        }
      });
      setFieldValues((prev) => ({ ...initialFields, ...prev }));
    }
  }, [isOpen, activeAgent]);

  if (!agent) return null;

  const handleTextChange = (key: string, value: string) => {
    setFieldValues((prev) => ({ ...prev, [key]: value }));
    if (errors[key]) {
      setErrors((prev) => {
        const copy = { ...prev };
        delete copy[key];
        return copy;
      });
    }
  };

  const handleFileChange = (field: AgentField, file: File | null) => {
    if (!file) {
      setFileValues((prev) => {
        const copy = { ...prev };
        delete copy[field.key];
        return copy;
      });
      return;
    }

    // Validate size
    if (file.size > maxFileSize) {
      setErrors((prev) => ({
        ...prev,
        [field.key]: `File size exceeds ${maxFileSizeMb} MB limit (${(file.size / (1024 * 1024)).toFixed(1)} MB)`,
      }));
      return;
    }

    // Validate extension
    const ext = "." + (file.name.split(".").pop() || "").toLowerCase();
    if (field.type === "DOCUMENT" && !documentExtensions.includes(ext)) {
      setErrors((prev) => ({
        ...prev,
        [field.key]: `Allowed formats: ${documentExtensions.join(", ")}`,
      }));
      return;
    }

    if (field.type === "IMAGE" && !imageExtensions.includes(ext)) {
      setErrors((prev) => ({
        ...prev,
        [field.key]: `Allowed formats: ${imageExtensions.join(", ")}`,
      }));
      return;
    }

    if (field.type === "FILE" && !generalExtensions.includes(ext)) {
      setErrors((prev) => ({
        ...prev,
        [field.key]: `Unsupported file type: ${ext}`,
      }));
      return;
    }

    // Clear error and set file
    setErrors((prev) => {
      const copy = { ...prev };
      delete copy[field.key];
      return copy;
    });
    setFileValues((prev) => ({ ...prev, [field.key]: file }));
  };

  const validateAll = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!selectedModelId) {
      newErrors.model = "Please select an AI model";
    }

    for (const field of activeAgent?.inputFields || []) {
      if (field.isRequired) {
        if (["DOCUMENT", "IMAGE", "FILE"].includes(field.type)) {
          if (!fileValues[field.key]) {
            newErrors[field.key] = `${field.label} is required`;
          }
        } else {
          const val = (fieldValues[field.key] || "").trim();
          if (!val) {
            newErrors[field.key] = `${field.label} is required`;
          }
        }
      }

      // Check select box
      if (field.type === "SELECT" && fieldValues[field.key]) {
        const val = fieldValues[field.key];
        if (field.selectOptions && !field.selectOptions.includes(val)) {
          newErrors[field.key] = `Selected option is not valid`;
        }
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateAll()) return;

    setIsSubmitting(true);

    try {
      // Prepare submitted details JSON & prompt text
      const rawDetails: Record<string, unknown> = {};
      const promptLines: string[] = [];

      for (const field of activeAgent?.inputFields || []) {
        if (["DOCUMENT", "IMAGE", "FILE"].includes(field.type)) {
          const file = fileValues[field.key];
          if (file) {
            rawDetails[field.key] = file.name;
            promptLines.push(`${field.label}: ${file.name}`);
          }
        } else {
          const val = fieldValues[field.key] || "";
          rawDetails[field.key] = val;
          if (val) {
            promptLines.push(`${field.label}: ${val}`);
          }
        }
      }

      const formattedPrompt =
        promptLines.length > 0 ? promptLines.join("\n\n") : `Run ${activeAgent?.name || "Agent"}`;

      // Create the conversation on backend
      const { timezone, locale } = getClientLocaleContext();

      const createRes = await fetchService.post<{ id: string; name: string }>(
        "/conversation/create",
        {
          modelId: Number(selectedModelId),
          prompt: formattedPrompt,
          agentId: activeAgent?.id,
          agentSubmittedDetails: rawDetails,
          timezone,
          locale,
        },
      );

      if (!createRes.success || !createRes.data) {
        throw new Error(createRes.message || "Failed to create conversation");
      }

      const newConversationId = createRes.data.id;
      const uploadedFilesList = Object.values(fileValues);

      // Close dialog
      onClose();

      queryClient.invalidateQueries({ queryKey: ["coversations"] });
      // Redirect to the newly created conversation with autoStream instructions
      navigate(`/${newConversationId}`, {
        state: {
          autoStream: {
            prompt: formattedPrompt,
            modelId: selectedModelId,
            files: uploadedFilesList,
          },
        },
      });
    } catch (err: any) {
      setIsSubmitting(false);
      setErrors((prev) => ({
        ...prev,
        submit: err.message || "An error occurred while creating conversation",
      }));
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={handleRequestClose} title="" size="lg" className="relative p-0">
      <form onSubmit={handleSubmit} className="flex flex-col max-h-[85vh]">
        {/* Header with Agent Branding: Full title and full description */}
        <div className="flex items-center gap-4 px-5 py-4 bg-linear-to-r from-indigo-50/80 via-indigo-50/40 to-white dark:from-indigo-950/40 dark:via-indigo-950/20 dark:to-gray-900 border-b border-gray-200 dark:border-white/10 shrink-0">
          {activeAgent?.thumbnailImage ? (
            <img
              src={getStaticAssetUrl(activeAgent.thumbnailImage)}
              alt={activeAgent.name}
              className="size-14 shrink-0 rounded-2xl object-cover border border-white/60 dark:border-white/10 shadow-sm"
            />
          ) : (
            <div className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-indigo-600 text-white shadow-sm">
              <Bot className="size-7" />
            </div>
          )}

          <div className="min-w-0 flex-1">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">{activeAgent?.name}</h2>
          </div>
          <button
            type="button"
            onClick={handleRequestClose}
            className="rounded-md p-2 text-gray-700 dark:text-white border border-gray-300 dark:border-white/9 bg-white dark:bg-white/2 hover:bg-gray-50 dark:hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all cursor-pointer"
            aria-label="Close modal"
          >
            <X size={20} />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {activeAgent?.description && (
            <p className="mt-1 text-xs text-gray-600 dark:text-gray-300 leading-relaxed whitespace-pre-line">
              {activeAgent.description}
            </p>
          )}

          {/* Global error alert */}
          {errors.submit && (
            <div className="flex items-center gap-2 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 p-3 text-xs text-red-700 dark:text-red-300">
              <AlertCircle className="size-4 shrink-0 text-red-500" />
              <span>{errors.submit}</span>
            </div>
          )}

          {/* Model Selector */}
          <div>
            <label className="mb-1 block text-sm font-semibold text-gray-900 dark:text-white">
              AI Model <span className="text-red-500">*</span>
            </label>
            {isModelsLoading ? (
              <div className="h-10 rounded-xl bg-gray-100 dark:bg-white/5 animate-pulse" />
            ) : availableModels.length === 0 ? (
              <p className="text-xs text-amber-600 dark:text-amber-400">
                No active AI models found. Please configure an active provider in admin.
              </p>
            ) : (
              <select
                value={selectedModelId}
                onChange={(e) => setSelectedModelId(e.target.value)}
                className={`w-full rounded-xl border px-3.5 py-2.5 text-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 ${
                  errors.model
                    ? "border-red-500 focus:ring-red-500/20"
                    : "border-gray-300 dark:border-white/10 focus:border-indigo-500 focus:ring-indigo-500/20"
                }`}
              >
                {availableModels.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.modelName} ({m.providerName})
                  </option>
                ))}
              </select>
            )}
            {errors.model && <p className="mt-1 text-xs text-red-500">{errors.model}</p>}
          </div>

          {/* Dynamic Fields */}
          {isAgentLoading ? (
            <div className="space-y-4 pt-2 border-t border-gray-100 dark:border-white/5">
              <div className="h-4 w-28 bg-gray-200 dark:bg-white/10 rounded animate-pulse" />
              <div className="h-10 bg-gray-100 dark:bg-white/5 rounded-xl animate-pulse" />
              <div className="h-10 bg-gray-100 dark:bg-white/5 rounded-xl animate-pulse" />
            </div>
          ) : activeAgent?.inputFields && activeAgent.inputFields.length > 0 ? (
            <div className="space-y-4 pt-2 border-t border-gray-100 dark:border-white/5">
              <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500">
                Agent Inputs
              </h3>

              {activeAgent.inputFields.map((field) => {
                const error = errors[field.key];

                return (
                  <div key={field.key} className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="text-sm font-medium text-gray-800 dark:text-gray-200">
                        {field.label} {field.isRequired && <span className="text-red-500">*</span>}
                      </label>
                      {field.isRequired && <span className="text-xs text-gray-400">Required</span>}
                    </div>

                    {/* Small Text */}
                    {field.type === "SMALL_TEXT" && (
                      <input
                        type="text"
                        value={fieldValues[field.key] || ""}
                        onChange={(e) => handleTextChange(field.key, e.target.value)}
                        placeholder={`Enter ${field.label.toLowerCase()}...`}
                        className={`w-full rounded-xl border px-3.5 py-2.5 text-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 ${
                          error
                            ? "border-red-500 focus:ring-red-500/20"
                            : "border-gray-300 dark:border-white/10 focus:border-indigo-500 focus:ring-indigo-500/20"
                        }`}
                      />
                    )}

                    {/* Long Text */}
                    {field.type === "LONG_TEXT" && (
                      <textarea
                        rows={3}
                        value={fieldValues[field.key] || ""}
                        onChange={(e) => handleTextChange(field.key, e.target.value)}
                        placeholder={`Paste or enter ${field.label.toLowerCase()}...`}
                        className={`w-full rounded-xl border p-3 text-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 ${
                          error
                            ? "border-red-500 focus:ring-red-500/20"
                            : "border-gray-300 dark:border-white/10 focus:border-indigo-500 focus:ring-indigo-500/20"
                        }`}
                      />
                    )}

                    {/* Select box */}
                    {field.type === "SELECT" && (
                      <select
                        value={fieldValues[field.key] || ""}
                        onChange={(e) => handleTextChange(field.key, e.target.value)}
                        className={`w-full rounded-xl border px-3.5 py-2.5 text-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 ${
                          error
                            ? "border-red-500 focus:ring-red-500/20"
                            : "border-gray-300 dark:border-white/10 focus:border-indigo-500 focus:ring-indigo-500/20"
                        }`}
                      >
                        <option value="">Select an option...</option>
                        {(field.selectOptions || []).map((opt) => (
                          <option key={opt} value={opt}>
                            {opt}
                          </option>
                        ))}
                      </select>
                    )}

                    {/* File Uploads (Document, Image, File) */}
                    {["DOCUMENT", "IMAGE", "FILE"].includes(field.type) && (
                      <div>
                        {fileValues[field.key] ? (
                          <div className="flex items-center justify-between rounded-xl border border-indigo-200 dark:border-indigo-900/60 bg-indigo-50/50 dark:bg-indigo-950/20 p-3">
                            <div className="flex items-center gap-2.5 min-w-0">
                              <CheckCircle className="size-4 shrink-0 text-indigo-600 dark:text-indigo-400" />
                              <div className="min-w-0">
                                <p className="truncate text-xs font-semibold text-gray-900 dark:text-white">
                                  {fileValues[field.key].name}
                                </p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                  {(fileValues[field.key].size / (1024 * 1024)).toFixed(2)} MB
                                </p>
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={() => handleFileChange(field, null)}
                              className="rounded-lg p-1 text-gray-400 hover:text-red-600 dark:hover:text-red-400 cursor-pointer"
                              title="Remove file"
                            >
                              <X className="size-4" />
                            </button>
                          </div>
                        ) : (
                          <label
                            className={`flex flex-col items-center justify-center rounded-xl border border-dashed p-4 text-center cursor-pointer transition-colors ${
                              error
                                ? "border-red-400 bg-red-50/30 dark:bg-red-950/10"
                                : "border-gray-300 dark:border-white/10 hover:border-indigo-400 dark:hover:border-indigo-500/50 hover:bg-gray-50/50 dark:hover:bg-white/5"
                            }`}
                          >
                            <input
                              type="file"
                              accept={
                                field.type === "DOCUMENT"
                                  ? documentExtensions.join(",")
                                  : field.type === "IMAGE"
                                    ? imageExtensions.join(",")
                                    : undefined
                              }
                              onChange={(e) => {
                                const f = e.target.files?.[0] || null;
                                handleFileChange(field, f);
                                e.target.value = "";
                              }}
                              className="hidden"
                            />
                            {field.type === "DOCUMENT" && (
                              <FileText className="size-6 text-gray-400 mb-1" />
                            )}
                            {field.type === "IMAGE" && (
                              <ImageIcon className="size-6 text-gray-400 mb-1" />
                            )}
                            {field.type === "FILE" && (
                              <FileUp className="size-6 text-gray-400 mb-1" />
                            )}
                            <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                              Click to upload {field.label.toLowerCase()}
                            </span>
                            <span className="text-xs text-gray-400 mt-0.5">
                              {field.type === "DOCUMENT"
                                ? "PDF, DOC, DOCX, TXT (Max 5MB)"
                                : field.type === "IMAGE"
                                  ? "PNG, JPG, JPEG (Max 5MB)"
                                  : "Supported file (Max 5MB)"}
                            </span>
                          </label>
                        )}
                      </div>
                    )}

                    {error && <p className="text-xs text-red-500">{error}</p>}
                  </div>
                );
              })}
            </div>
          ) : null}

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200 dark:border-white/10 shrink-0">
            <button
              type="button"
              onClick={handleRequestClose}
              disabled={isSubmitting}
              className="rounded-xl border border-gray-300 dark:border-white/10 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-white dark:hover:bg-white/10 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || availableModels.length === 0}
              className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 active:scale-95 disabled:opacity-50 transition-all cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <Loader className="size-4 animate-spin" />
                  <span>Starting Conversation...</span>
                </>
              ) : (
                <span>Start</span>
              )}
            </button>
          </div>
        </div>
      </form>

      {/* Close Confirmation Overlay */}
      {showConfirmClose && (
        <div
          className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 rounded-lg"
          onClick={(e) => {
            e.stopPropagation();
            handleCancelConfirm();
          }}
        >
          <div
            className="w-full max-w-sm rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-white/10 p-5 shadow-2xl text-center space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400">
              <AlertCircle className="size-6" />
            </div>

            <div>
              <h3 className="text-base font-bold text-gray-900 dark:text-white">Close Dialog?</h3>
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                Are you sure you want to close? Any entered details will be lost.
              </p>
            </div>

            <div className="flex items-center justify-center gap-3 pt-1">
              <button
                type="button"
                onClick={handleCancelConfirm}
                className="flex-1 rounded-xl border border-gray-300 dark:border-white/10 px-4 py-2 text-xs font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmClose}
                className="flex-1 rounded-xl bg-red-600 px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-red-500 transition-colors cursor-pointer"
              >
                Yes, Close
              </button>
            </div>
          </div>
        </div>
      )}
    </Modal>
  );
}
