import { useEffect, useState, useRef } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery } from "@tanstack/react-query";
import { fetchService } from "../../../lib/fetchService";
import Modal from "../../ui/Modal";
import { agentFormSchema, type AgentFormInput } from "../../../schemas/agentSchema";
import type { Agent, Tool } from "../../../types/type";
import { useAppConfig } from "../../../hooks/useAppConfig";
import DynamicFieldBuilder from "./DynamicFieldBuilder";
import { getStaticAssetUrl } from "../../../common";
import { Upload, X, Bot, Wrench, MessageSquare, Loader, FormIcon } from "lucide-react";

interface AgentFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: FormData) => void;
  isLoading: boolean;
  agent?: Agent | null;
  tools: Tool[];
  selectedToolId?: number;
}

export default function AgentFormModal({
  isOpen,
  onClose,
  onSubmit,
  isLoading,
  agent,
  tools,
  selectedToolId,
}: AgentFormModalProps) {
  const { config } = useAppConfig();
  const maxDynamicFields = config.agent.maxDynamicFields;
  const isEditing = Boolean(agent);
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);
  const [isThumbnailRemoved, setIsThumbnailRemoved] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch full agent details on-demand when editing (tools list returns limited data)
  const { data: fullAgentData, isLoading: isAgentLoading } = useQuery({
    queryKey: ["agent", agent?.id],
    queryFn: async (): Promise<Agent> => {
      const res = await fetchService.get<Agent>(`/agent/${agent!.id}`);
      if (res.code === 200 && res.data) {
        return res.data;
      }
      throw new Error(res.message || "Failed to fetch agent details");
    },
    enabled: Boolean(isOpen && agent?.id),
  });

  const currentToolId = selectedToolId || agent?.toolId || (tools[0]?.id ?? 1);
  const currentTool = tools.find((t) => t.id === currentToolId);

  const {
    register,
    handleSubmit,
    control,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<AgentFormInput>({
    resolver: zodResolver(agentFormSchema),
    defaultValues: {
      name: "",
      description: "",
      systemPrompt: "",
      status: "ACTIVE",
      inputFields: [],
    },
  });

  const currentStatus = watch("status");
  const isStatusActive = currentStatus === "ACTIVE";

  useEffect(() => {
    if (isOpen) {
      setThumbnailFile(null);
      setIsThumbnailRemoved(false);
      const targetAgent = fullAgentData || agent;
      if (targetAgent) {
        setThumbnailPreview(targetAgent.thumbnailImage || null);
        reset({
          name: targetAgent.name,
          description: targetAgent.description || "",
          systemPrompt: targetAgent.systemPrompt || "",
          status: targetAgent.status,
          inputFields: (targetAgent.inputFields || []).map((f) => ({
            id: f.id,
            key: f.key,
            label: f.label,
            type: f.type,
            isRequired: f.isRequired,
            maxFile: f.maxFile ?? 1,
            selectOptions: Array.isArray(f.selectOptions)
              ? f.selectOptions
              : typeof f.selectOptions === "string"
                ? (() => {
                    try {
                      const p = JSON.parse(f.selectOptions);
                      return Array.isArray(p) ? p : [];
                    } catch {
                      return [];
                    }
                  })()
                : [],
            sortOrder: f.sortOrder ?? 0,
          })),
        });
      } else {
        setThumbnailPreview(null);
        reset({
          name: "",
          description: "",
          systemPrompt: "",
          status: "ACTIVE",
          inputFields: [],
        });
      }
    }
  }, [isOpen, agent, fullAgentData, selectedToolId, tools, reset]);

  useEffect(() => {
    return () => {
      if (thumbnailPreview && thumbnailPreview.startsWith("blob:")) {
        URL.revokeObjectURL(thumbnailPreview);
      }
    };
  }, [thumbnailPreview]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (thumbnailPreview && thumbnailPreview.startsWith("blob:")) {
        URL.revokeObjectURL(thumbnailPreview);
      }
      setThumbnailFile(file);
      setThumbnailPreview(URL.createObjectURL(file));
      setIsThumbnailRemoved(false);
    }
    e.target.value = "";
  };

  const handleFormSubmit = (data: AgentFormInput) => {
    const formData = new FormData();
    formData.append("name", data.name);
    formData.append("toolId", String(currentToolId));
    formData.append("status", data.status);
    formData.append("systemPrompt", data.systemPrompt);
    if (data.description) formData.append("description", data.description);

    if (thumbnailFile) {
      formData.append("thumbnail", thumbnailFile);
    } else if (isThumbnailRemoved || thumbnailPreview === null) {
      formData.append("removeThumbnail", "true");
      formData.append("thumbnailImage", "");
    }

    const sanitizedFields = (data.inputFields || []).map((f) => ({
      ...f,
      selectOptions:
        f.type === "SELECT" && f.selectOptions
          ? f.selectOptions.map((s) => s.trim()).filter(Boolean)
          : undefined,
    }));
    formData.append("inputFields", JSON.stringify(sanitizedFields));
    onSubmit(formData);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        isEditing
          ? `Edit Agent: ${agent?.name}`
          : currentTool
            ? `Create New Agent (${currentTool.name})`
            : "Create New Agent"
      }
      size="xl"
    >
      {isEditing && isAgentLoading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <Loader className="size-8 animate-spin text-indigo-600 dark:text-indigo-400" />
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
            Loading agent details...
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit(handleFormSubmit)} className="max-h-[75vh]">
          {/* Section: Basic Details */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-gray-100 dark:border-white/5">
              <Wrench className="size-4 text-indigo-600 dark:text-indigo-400" />
              <h3 className="text-sm font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300">
                Basic Details
              </h3>
              {currentTool && (
                <span className="ml-auto inline-flex items-center gap-1.5 rounded-full bg-indigo-50 dark:bg-indigo-950/50 px-2.5 py-0.5 text-xs font-semibold text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900/40">
                  Tool: {currentTool.name}
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Agent Name */}
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-200">
                  Agent Name <span className="text-red-500">*</span>
                </label>
                <input
                  {...register("name")}
                  type="text"
                  placeholder="e.g. Tailor CV, Interview Prep"
                  className={`w-full rounded-lg border px-3 py-2 text-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-1 ${
                    errors.name
                      ? "border-red-500 focus:border-red-500 focus:ring-red-500/20"
                      : "border-gray-300 dark:border-white/10 focus:border-indigo-500 focus:ring-indigo-500/20"
                  }`}
                />
                {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name.message}</p>}
              </div>

              {/* Status Toggle */}
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-200">
                  Status
                </label>
                <div className="flex items-center gap-3 pt-1.5">
                  <button
                    type="button"
                    role="switch"
                    aria-checked={isStatusActive}
                    onClick={() =>
                      setValue("status", isStatusActive ? "INACTIVE" : "ACTIVE", {
                        shouldDirty: true,
                        shouldValidate: true,
                      })
                    }
                    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                      isStatusActive ? "bg-indigo-600" : "bg-gray-300 dark:bg-gray-700"
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block size-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                        isStatusActive ? "translate-x-5" : "translate-x-0"
                      }`}
                    />
                  </button>
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {isStatusActive ? "Active" : "Inactive"}
                  </span>
                </div>
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-200">
                Description
              </label>
              <textarea
                {...register("description")}
                rows={2}
                placeholder="Brief summary of what this agent does..."
                className="w-full rounded-lg border border-gray-300 dark:border-white/10 p-3 text-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/20"
              />
              {errors.description && (
                <p className="mt-1 text-xs text-red-500">{errors.description.message}</p>
              )}
            </div>

            {/* Thumbnail upload */}
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-200">
                Thumbnail Image (PNG, JPG, max 5MB)
              </label>
              <div className="flex items-center gap-4">
                {thumbnailPreview ? (
                  <div className="relative size-16 shrink-0 rounded-xl overflow-hidden border border-gray-200 dark:border-white/10">
                    <img
                      src={getStaticAssetUrl(thumbnailPreview)}
                      alt="Thumbnail preview"
                      className="size-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setThumbnailFile(null);
                        setThumbnailPreview(null);
                        setIsThumbnailRemoved(true);
                        if (fileInputRef.current) {
                          fileInputRef.current.value = "";
                        }
                      }}
                      className="absolute top-1 right-1 rounded-full bg-black/60 p-0.5 text-white hover:bg-black/80 cursor-pointer"
                    >
                      <X className="size-3" />
                    </button>
                  </div>
                ) : (
                  <div className="flex size-16 shrink-0 items-center justify-center rounded-xl bg-gray-100 text-gray-400 dark:bg-gray-800">
                    <Bot className="size-8" />
                  </div>
                )}
                <div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/png,image/jpeg,image/jpg,image/webp"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="inline-flex items-center gap-2 rounded-lg border border-gray-300 dark:border-white/10 px-3 py-1.5 text-xs font-semibold text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors cursor-pointer"
                  >
                    <Upload className="size-3.5" />
                    {thumbnailPreview ? "Change Image" : "Upload Image"}
                  </button>
                  <p className="mt-1 text-xs text-gray-400">
                    Recommended: square image, at least 128x128.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* System Prompt */}
          <div className="space-y-3 my-6">
            <div className="flex items-center gap-2 pb-2 border-b border-gray-100 dark:border-white/5">
              <MessageSquare className="size-4 text-indigo-600 dark:text-indigo-400" />
              <div>
                <h3 className="text-sm font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300">
                  System Prompt <span className="text-red-500">*</span>
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 font-normal">
                  Direct system instructions prepended to the AI completion. Never exposed to
                  regular users.
                </p>
              </div>
            </div>

            <div>
              <textarea
                {...register("systemPrompt")}
                rows={6}
                placeholder="You are an expert resume consultant. Analyze the user's submitted CV and job description to provide targeted improvements..."
                className={`w-full rounded-lg border p-3 text-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-white font-mono leading-relaxed focus:outline-none focus:ring-1 ${
                  errors.systemPrompt
                    ? "border-red-500 focus:border-red-500 focus:ring-red-500/20"
                    : "border-gray-300 dark:border-white/10 focus:border-indigo-500 focus:ring-indigo-500/20"
                }`}
              />
              {errors.systemPrompt && (
                <p className="mt-1 text-xs text-red-500">{errors.systemPrompt.message}</p>
              )}
            </div>
          </div>

          {/* Dynamic Input Fields (Minimum 1 Required) */}
          <div className="space-y-3 my-6">
            <div className="flex items-center justify-between pb-2 border-b border-gray-100 dark:border-white/5">
              <div className="flex items-center gap-2">
                <FormIcon className="size-4 text-indigo-600 dark:text-indigo-400" />
                <h3 className="text-sm font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300">
                  Input Fields{" "}
                  <span className="text-xs font-normal text-red-500">
                    (Min 1, Max {maxDynamicFields} fields)
                  </span>
                </h3>
              </div>
            </div>

            <Controller
              name="inputFields"
              control={control}
              render={({ field }) => (
                <DynamicFieldBuilder
                  fields={field.value}
                  onChange={field.onChange}
                  errors={errors.inputFields}
                />
              )}
            />
            {errors.inputFields?.message && (
              <p className="text-xs font-medium text-red-500">{errors.inputFields.message}</p>
            )}
            {errors.inputFields?.root?.message && (
              <p className="text-xs font-medium text-red-500">{errors.inputFields.root.message}</p>
            )}
          </div>

          {/* Modal footer */}
          <div className="flex items-center justify-end gap-3 py-4 border-t border-gray-200 dark:border-white/10">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="rounded-lg border border-gray-300 dark:border-white/10 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-500 disabled:opacity-50 transition-colors shadow-xs cursor-pointer"
            >
              {isLoading ? "Saving..." : isEditing ? "Save Changes" : "Create Agent"}
            </button>
          </div>
        </form>
      )}
    </Modal>
  );
}
