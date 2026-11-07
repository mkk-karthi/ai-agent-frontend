import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Modal from "../../ui/Modal";
import { toolSchema, type ToolFormInput } from "../../../schemas/toolSchema";
import type { Tool } from "../../../types/type";

interface ToolFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: ToolFormInput) => void;
  isLoading: boolean;
  tool?: Tool | null;
}

export default function ToolFormModal({
  isOpen,
  onClose,
  onSubmit,
  isLoading,
  tool,
}: ToolFormModalProps) {
  const isEditing = Boolean(tool);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ToolFormInput>({
    resolver: zodResolver(toolSchema),
    defaultValues: {
      name: "",
      status: "ACTIVE",
    },
  });

  useEffect(() => {
    if (isOpen) {
      if (tool) {
        reset({
          name: tool.name,
          status: tool.status,
        });
      } else {
        reset({
          name: "",
          status: "ACTIVE",
        });
      }
    }
  }, [isOpen, tool, reset]);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? `Edit Tool: ${tool?.name}` : "Create New Tool"}
      size="md"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-200">
            Tool Name <span className="text-red-500">*</span>
          </label>
          <input
            {...register("name")}
            type="text"
            placeholder="e.g. Job Search, Content Creation"
            className={`w-full rounded-lg border px-3 py-2 text-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 ${
              errors.name
                ? "border-red-500 focus:ring-red-500/20"
                : "border-gray-300 dark:border-white/10 focus:border-indigo-500 focus:ring-indigo-500/20"
            }`}
          />
          {errors.name && (
            <p className="mt-1 text-xs text-red-500">{errors.name.message}</p>
          )}
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-200">
            Status
          </label>
          <select
            {...register("status")}
            className="w-full rounded-lg border border-gray-300 dark:border-white/10 px-3 py-2 text-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
          >
            <option value="ACTIVE">ACTIVE</option>
            <option value="INACTIVE">INACTIVE</option>
          </select>
        </div>

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-200 dark:border-white/10">
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
            className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-500 disabled:opacity-50 transition-colors shadow-sm cursor-pointer"
          >
            {isLoading ? "Saving..." : isEditing ? "Save Changes" : "Create Tool"}
          </button>
        </div>
      </form>
    </Modal>
  );
}

