import { Link, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { fetchService } from "../../lib/fetchService";
import { useUserStore } from "../../stores/UserStore";
import ChatMessages from "../../components/user/chats/ChatMessages";
import Logo from "../../assets/logo.svg";
import { AlertCircle, Check, Loader, LogIn, Share, SquarePen } from "lucide-react";
import { useState } from "react";
import MetaHead from "../../components/common/MetaHead";

interface SharedConversationData {
  id: string;
  name: string;
}

interface CustomFetchError extends Error {
  code?: number;
}

export default function SharedConversation(): React.ReactElement {
  const { id } = useParams<{ id: string }>();
  const [copied, setCopied] = useState(false);
  const user = useUserStore((state) => state.user);

  const { data, isLoading, isError, error } = useQuery<SharedConversationData, CustomFetchError>({
    queryKey: ["sharedConversation", id],
    queryFn: async () => {
      if (!id) throw new Error("Shared conversation id is required");
      const res = await fetchService.get<SharedConversationData>(`/shared/conversation/${id}`);

      if (res.code === 200 && res.data) {
        return res.data;
      }

      const err: CustomFetchError = new Error(res.message || "Failed to fetch shared conversation");
      err.code = res.code || 400;
      throw err;
    },
    enabled: !!id,
    retry: false,
  });

  const baseUrl = import.meta.env.VITE_BASE_URL || window.location.origin;
  const shareUrl = id ? `${baseUrl}/share/${id}` : "";

  const handleCopy = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const metaTitle = isLoading
    ? "Loading Shared Conversation..."
    : isError
      ? "Shared Conversation Unavailable"
      : data?.name
        ? `${data.name} (Shared)`
        : "Shared Conversation";

  const metaDescription = isError
    ? "This shared conversation is not available or restricted."
    : data?.name
      ? `Shared conversation: ${data.name}`
      : "View shared conversation on MKK Agent.";

  return (
    <div className="flex flex-col h-dvh w-dvw bg-white dark:bg-gray-950 overflow-hidden">
      <MetaHead
        title={metaTitle}
        description={metaDescription}
        ogType="article"
        canonicalUrl={shareUrl}
      />
      {/* Header */}
      <header className="h-16 shrink-0 border-b border-gray-200 dark:border-white/10 px-4 sm:px-6 flex items-center justify-between z-10 bg-white/80 dark:bg-gray-950/80 backdrop-blur-sm">
        <div className="flex items-center gap-3 min-w-0">
          <Link to={user?.id ? "/new" : "/"} className="flex items-center gap-2 shrink-0">
            <img src={Logo} alt="AI Agent" className="size-8" />
          </Link>
          {data?.name && (
            <h1 className="font-semibold text-sm sm:text-base text-gray-800 dark:text-gray-100 truncate max-w-44 sm:max-w-md lg:max-w-lg">
              {data.name}
            </h1>
          )}
        </div>

        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* Share button */}
          <button
            type="button"
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs sm:text-sm font-medium rounded-lg border border-gray-300 dark:border-white/10 bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer shadow-xs"
            title="Copy share link"
          >
            {copied ? (
              <>
                <Check className="size-4 text-green-500" />
                <span className="text-green-500">Copied!</span>
              </>
            ) : (
              <>
                <Share className="size-4" />
                <span className="hidden sm:inline">Share</span>
              </>
            )}
          </button>

          {/* Auth-aware Action */}
          {user && user.id ? (
            <Link
              to="/new"
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs sm:text-sm font-medium rounded-lg bg-indigo-500 text-white! hover:bg-indigo-400 transition-colors shadow-xs"
            >
              <SquarePen className="size-4" />
              <span>New chat</span>
            </Link>
          ) : (
            <Link
              to="/auth/login"
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs sm:text-sm font-medium rounded-lg bg-indigo-500 text-white! hover:bg-indigo-400 transition-colors shadow-xs"
            >
              <LogIn className="size-4" />
              <span>Log in</span>
            </Link>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 relative overflow-hidden size-full">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center size-full">
            <Loader className="size-8 animate-[spin_2s_linear_infinite] text-indigo-500" />
            <p className="mt-3 text-sm text-gray-500 dark:text-gray-400">Loading conversation...</p>
          </div>
        ) : isError || !data?.id ? (
          <div className="flex flex-col items-center justify-center size-full px-4 text-center">
            <div className="p-4 rounded-full bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 mb-4">
              <AlertCircle className="size-10 text-red-500" />
            </div>
            <div className="text-xs font-semibold uppercase tracking-wider text-red-500 mb-1">
              Error {error?.code || 404}
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Unable to load conversation
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 max-w-md mb-6">
              {error?.message || "This conversation may be private, deleted, or does not exist."}
            </p>
            <Link
              to={user?.id ? "/new" : "/auth/login"}
              className="rounded-md px-4 py-2 text-sm font-semibold bg-indigo-500 text-white! hover:bg-indigo-400 transition-colors"
            >
              {user?.id ? "Start a new chat" : "Log in to AI Agent"}
            </Link>
          </div>
        ) : (
          <ChatMessages chatId={data.id} isShared={true} />
        )}
      </main>
    </div>
  );
}
