import { useMutation, useQuery } from "@tanstack/react-query";
import Modal from "../../ui/Modal";
import { fetchService } from "../../../lib/fetchService";
import { useEffect, useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  shareConversationSchema,
  type ShareConversationInput,
} from "../../../schemas/conversationSchema";
import z from "zod";
import { toast } from "react-toastify";
import { Check, Copy, Loader, X } from "lucide-react";
import type { apiResponse } from "../../../types/type";

interface ConversationData {
  id: string;
  name: string;
  conversationShare?: {
    id: string;
    type: string;
    userMails: string[];
  } | null;
}

export default function ShareConversation({
  isModalOpen,
  onModalUpdate,
  conversationId,
}: {
  isModalOpen: boolean;
  onModalUpdate: (val: boolean) => void;
  conversationId: string | null;
}) {
  const [copied, setCopied] = useState(false);
  const [shareId, setShareId] = useState<string | null>(null);
  const [emailInput, setEmailInput] = useState("");
  const [emailError, setEmailError] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  const baseUrl = import.meta.env.VITE_BASE_URL || window.location.origin;

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<ShareConversationInput>({
    resolver: zodResolver(shareConversationSchema),
    defaultValues: {
      type: "RESTRICTED",
      userMails: [],
    },
  });

  const selectedType = watch("type");
  const userMails = watch("userMails") || [];

  // Fetch Share Options
  const shareOptions = useQuery({
    queryKey: ["shareOptions"],
    queryFn: async (): Promise<{ value: string; label: string }[]> => {
      const data = await fetchService.get("/conversation/share/options");
      return data.data ?? [];
    },
    staleTime: 24 * 60 * 60 * 1000,
  });

  // Fetch Conversation Details
  const conversationDetails = useQuery({
    queryKey: ["conversation", conversationId],
    queryFn: async (): Promise<ConversationData | null> => {
      if (!conversationId || conversationId === "new") return null;
      const res = await fetchService.get<ConversationData>(`/conversation/${conversationId}`);
      return res.data ?? null;
    },
    enabled: isModalOpen && !!conversationId && conversationId !== "new",
  });

  // Auto-fill or reset form based on fetched conversation details
  useEffect(() => {
    if (!isModalOpen) {
      setShareId(null);
      setEmailInput("");
      setEmailError(null);
      return;
    }

    if (conversationDetails.data) {
      const share = conversationDetails.data.conversationShare;
      if (share) {
        reset({
          type: share.type || "RESTRICTED",
          userMails: share.userMails || [],
        });
        setShareId(share.id);
      } else {
        reset({
          type: "RESTRICTED",
          userMails: [],
        });
        setShareId(null);
      }
    } else if (!conversationId || conversationId === "new") {
      reset({
        type: "RESTRICTED",
        userMails: [],
      });
      setShareId(null);
    }
  }, [conversationDetails.data, isModalOpen, conversationId, reset]);

  // Handle adding emails
  const addEmailsFromText = (text: string, isFromAddButton = false) => {
    const rawTokens = text
      .split(/[\s,]+/)
      .map((t) => t.trim().toLowerCase())
      .filter(Boolean);

    if (rawTokens.length === 0) {
      if (isFromAddButton) {
        setEmailError("Email is required");
      }
      return;
    }

    const emailSchema = z.email("Invalid email");
    const invalidTokens = rawTokens.filter((token) => !emailSchema.safeParse(token).success);

    if (invalidTokens.length > 0) {
      if (isFromAddButton) {
        setEmailError("Invalid email");
      }
      return;
    }

    const updated = Array.from(new Set([...userMails, ...rawTokens]));
    setValue("userMails", updated, { shouldValidate: true });
    setEmailInput("");
    setEmailError(null);
  };

  const removeEmail = (indexToRemove: number) => {
    const updated = userMails.filter((_, idx) => idx !== indexToRemove);
    setValue("userMails", updated, { shouldValidate: true });
  };

  const handleEmailKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addEmailsFromText(emailInput, true);
    }
  };

  // Share Mutation
  const shareMutation = useMutation({
    mutationFn: async (formData: ShareConversationInput) => {
      if (!conversationId) throw new Error("Conversation ID is required");

      const payload: { id: string; type: string; userMails?: string[] } = {
        id: conversationId,
        type: formData.type,
      };

      if (formData.type === "SPECIFIC_USER") {
        payload.userMails = formData.userMails ?? [];
      }

      const res = await fetchService.post("/conversation/share", payload);
      return res as apiResponse<{ id: string }>;
    },
    onSuccess: async (data) => {
      if (data?.success) {
        toast.success(data.message || "Conversation shared successfully");
        const refetched = await conversationDetails.refetch();
        if (refetched.data?.conversationShare?.id) {
          setShareId(refetched.data.conversationShare.id);
        } else if (data.data?.id) {
          setShareId(data.data.id);
        }
      } else {
        toast.error(data?.message || "Failed to share conversation");
      }
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to share conversation");
    },
  });

  const onSubmit = (formData: ShareConversationInput) => {
    // If user has uncommitted text in the email field, append it first
    if (formData.type === "SPECIFIC_USER" && emailInput.trim()) {
      const rawTokens = emailInput.split(/[\s,]+/).map((t) => t.trim().toLowerCase());
      const validEmails = rawTokens.filter((token) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(token));
      if (validEmails.length > 0) {
        const merged = Array.from(new Set([...(formData.userMails || []), ...validEmails]));
        formData.userMails = merged;
        setValue("userMails", merged, { shouldValidate: true });
        setEmailInput("");
      }
    }

    startTransition(() => {
      shareMutation.mutate(formData);
    });
  };

  const handleCopy = () => {
    if (!shareId) return;
    const shareUrl = `${baseUrl}/share/${shareId}`;
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const shareUrl = shareId ? `${baseUrl}/share/${shareId}` : "";

  return (
    <Modal
      isOpen={isModalOpen}
      onClose={() => onModalUpdate(false)}
      title="Share Conversation"
      size="md"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Share Options */}
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-white/90">
            Share options
          </label>

          <select
            {...register("type")}
            className="w-full rounded-md px-3 py-2 text-sm bg-white dark:bg-gray-800 outline focus:outline-2 outline-gray-300 dark:outline-white/10 focus:outline-gray-400 text-gray-900 dark:text-white pr-2"
          >
            {shareOptions.data?.map((item) => (
              <option key={item.value} value={item.value}>
                {item.label}
              </option>
            ))}
          </select>
          {errors.type && <p className="mt-1 text-sm text-red-500">{errors.type.message}</p>}
        </div>

        {/* Select User (Only for SPECIFIC_USER) */}
        {selectedType === "SPECIFIC_USER" && (
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-white/90">
              Select User
            </label>

            {/* Email Chips */}
            {userMails.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mb-2 max-h-28 overflow-y-auto p-1">
                {userMails.map((mail, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-indigo-50 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-200 border border-indigo-200 dark:border-indigo-700/60"
                  >
                    <span>{mail}</span>
                    <button
                      type="button"
                      onClick={() => removeEmail(idx)}
                      className="cursor-pointer hover:text-red-500 rounded-full"
                      aria-label={`Remove ${mail}`}
                    >
                      <X className="size-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}

            <div className="flex gap-2">
              <input
                type="text"
                value={emailInput}
                onChange={(e) => {
                  setEmailInput(e.target.value);
                  if (emailError) setEmailError(null);
                }}
                onKeyDown={handleEmailKeyDown}
                onBlur={() => {
                  if (emailInput.trim()) addEmailsFromText(emailInput);
                }}
                placeholder="Enter email (Ex: ram@mail.com, john@mail.com)"
                className={`w-full rounded-md px-3 py-2 text-sm bg-white dark:bg-gray-800 outline focus:outline-2 ${
                  emailError || errors.userMails
                    ? "outline-red-500"
                    : "outline-gray-300 dark:outline-white/10 focus:outline-gray-400"
                } text-gray-900 dark:text-white`}
              />
              <button
                type="button"
                onClick={() => addEmailsFromText(emailInput, true)}
                className="px-3 py-2 text-xs font-medium rounded-md bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-white border border-gray-300 dark:border-white/10 hover:bg-gray-200 dark:hover:bg-gray-700 cursor-pointer transition-all"
              >
                Add
              </button>
            </div>
            {(emailError || errors.userMails) && (
              <p className="mt-1 text-sm text-red-500">{emailError || errors.userMails?.message}</p>
            )}
          </div>
        )}

        {/* Share URL & Copy Box */}
        {shareUrl && selectedType !== "RESTRICTED" && (
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-white/90">
              Share Link
            </label>
            <div className="flex items-center rounded-md outline outline-gray-300 dark:outline-white/10 overflow-hidden bg-white dark:bg-gray-800">
              <input
                type="text"
                readOnly
                value={shareUrl}
                className="w-full px-3 py-2 text-sm bg-transparent outline-none text-gray-800 dark:text-gray-200 select-all"
              />
              <button
                type="button"
                onClick={handleCopy}
                className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:bg-gray-100 dark:hover:bg-gray-700/50 cursor-pointer border-l border-gray-200 dark:border-white/10 transition-colors shrink-0"
              >
                {copied ? (
                  <>
                    <Check className="size-4 text-green-500" />
                    <span className="text-green-500">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="size-4" />
                    <span>Copy</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Actions: Close and Share buttons */}
        <div className="flex justify-end gap-2 pt-3">
          <button
            type="button"
            onClick={() => onModalUpdate(false)}
            className="rounded-md px-4 py-2 text-sm font-semibold text-gray-700 dark:text-white border border-gray-300 dark:border-white/10 bg-white dark:bg-white/5 hover:bg-gray-50 dark:hover:bg-white/10 cursor-pointer transition-all"
          >
            Close
          </button>
          <button
            type="submit"
            disabled={shareMutation.isPending || conversationDetails.isLoading}
            className="flex items-center gap-1.5 rounded-md px-4 py-2 text-sm font-semibold bg-indigo-500 text-white hover:bg-indigo-400 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            {shareMutation.isPending && (
              <Loader className="size-4 animate-[spin_2s_linear_infinite]" />
            )}
            <span>Share</span>
          </button>
        </div>
      </form>
    </Modal>
  );
}
