import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Modal from "../ui/Modal";
import { providerSchema, type providerInput } from "../../schemas/providerSchema";
import { Eye, EyeOff, KeyRound } from "lucide-react";
import type { Provider } from "../../types/type";

interface ProviderFormModelProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: providerInput) => void;
  isLoading: boolean;
  provider?: Provider | null;
}

export default function ProviderFormModel({
  isOpen,
  onClose,
  onSubmit,
  isLoading,
  provider,
}: ProviderFormModelProps) {
  const isEditing = Boolean(provider);
  const [showToken, setShowToken] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<providerInput>({
    resolver: zodResolver(providerSchema),
    defaultValues: {
      token: "",
      status: provider?.status ?? undefined,
    },
  });

  useEffect(() => {
    if (isOpen) {
      if (provider) {
        reset({
          token: "",
          status: provider?.status ?? undefined,
        });
      } else {
        reset({
          token: "",
          status: "ACTIVE",
        });
      }
      setShowToken(false);
    }
  }, [isOpen, provider, reset]);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? `Configure ${provider?.name}` : "Create Provider"}
      size="md"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-200">
            Provider API Key <span className="text-red-500">*</span>
          </label>
          <div className="relative flex items-center">
            <KeyRound className="pointer-events-none absolute left-3.5 size-4 text-gray-400" />
            <input
              {...register("token")}
              type={showToken ? "text" : "password"}
              placeholder="Enter provider API key / token"
              className={`w-full rounded-xl border pl-10 pr-11 py-2.5 text-sm bg-gray-50 dark:bg-gray-900/60 text-gray-900 dark:text-white placeholder:text-gray-400 transition-colors focus:outline-none ${
                errors.token
                  ? "border-red-500 focus:border-red-500 focus:ring-1 focus:ring-red-500"
                  : "border-gray-200 dark:border-white/10 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              }`}
            />
            <button
              type="button"
              onClick={() => setShowToken((prev) => !prev)}
              className="absolute right-3 p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors cursor-pointer"
            >
              {showToken ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
            </button>
          </div>
          {errors.token && <p className="mt-1 text-xs text-red-500">{errors.token.message}</p>}
          <p className="mt-1.5 text-xs text-gray-500 dark:text-gray-400">
            API keys are securely encrypted with AES-256 before database storage.
          </p>
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-200">
            Provider Status
          </label>
          <select
            {...register("status")}
            className="w-full rounded-xl border border-gray-200 dark:border-white/10 px-3.5 py-2.5 text-sm bg-gray-50 dark:bg-gray-900/60 text-gray-900 dark:text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
          >
            <option value="ACTIVE">ACTIVE</option>
            <option value="INACTIVE">INACTIVE</option>
          </select>
        </div>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100 dark:border-white/10">
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="rounded-xl border border-gray-200 dark:border-white/10 px-4 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-indigo-500 active:scale-95 disabled:opacity-50 transition-all shadow-xs cursor-pointer"
          >
            {isLoading ? "Saving..." : isEditing ? "Save Configuration" : "Create Provider"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
