import React, { useCallback, useContext, useEffect, useRef } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import { parseMarkdown } from "@tanstack/markdown/parser";
import { streamingMarkdownExtension } from "@tanstack/markdown/extensions/streaming";
import { fetchService } from "../../../lib/fetchService";
import { useInfiniteScroll } from "../../../hooks/useInfinityScroll";
import { MarkdownComponent } from "../../ui/MarkdownComponent";
import { ChevronDown, Loader } from "lucide-react";
import ChatMessage from "./ChatMessage";
import ChatSkeleton from "./ChatSkeleton";
import type { ChatMessageType } from "../../../types/conversation";
import { useNavigate } from "react-router-dom";
import { queryClient } from "../../../lib/queryClient";
import { ConversationContext } from "../../../context/conversationContext";

interface ChatMessagesType {
  data: Array<ChatMessageType>;
  nextToken: string | null;
}

export default function ChatMessages({
  chatId,
  setModelId,
  setStreamedText,
  regenerateContent,
  streamedText = "",
  isLoading = false,
  isShared = false,
}: {
  chatId: string;
  setModelId?: (v: string) => void;
  setStreamedText?: (v: string) => void;
  regenerateContent?: (v: string) => void;
  streamedText?: string;
  isLoading?: boolean;
  isShared?: boolean;
}) {
  const {
    showScrollBottom: contextShowScrollBottom,
    setShowScrollBottom,
    setScrollToBottom,
  } = useContext(ConversationContext);
  const navigate = useNavigate();

  const { data, error, fetchNextPage, hasNextPage, isFetchingNextPage, status } = useInfiniteQuery({
    queryKey: [isShared ? "sharedCoversationsMessage" : "coversationsMessage", chatId],
    queryFn: async ({ pageParam }: { pageParam: string | null }): Promise<ChatMessagesType> => {
      const endpoint = isShared
        ? `/shared/conversation/messages/${chatId}?nextToken=${pageParam}&pageSize=10`
        : `/conversation/messages/${chatId}?nextToken=${pageParam}&pageSize=10`;
      const data = await fetchService.get(endpoint);

      if (data.code == 200) {
        if (data.data && data.data.data && data.data.data.length > 0) {
          // if (pageParam == "") setModelId?.(data.data.data[0].modelId);
          return {
            ...data.data,
            data: data.data.data.map((v: ChatMessagesType["data"][0]) => ({
              ...v,
              rawMessage: v.message,
              message: parseMarkdown(v.message),
              attachments: v.attachments || [],
            })),
          };
        } else return { data: [], nextToken: "" };
      } else if (data.code == 404 && !isShared) {
        navigate(`/new`, { replace: true });
        return { data: [], nextToken: "" };
      } else throw new Error(data.message);
    },
    initialPageParam: "",
    getNextPageParam: (lastPage) => {
      return lastPage.nextToken || undefined;
    },
  });

  const chatContainerRef = useRef<HTMLDivElement>(null);
  const containerBottomRef = useRef<HTMLDivElement>(null);
  const loaderRef = useInfiniteScroll({
    isLoading: isFetchingNextPage,
    hasMore: hasNextPage,
    loadMore: async () => {
      if (!chatContainerRef.current) return;

      // Store the current scroll dimensions before the network request updates the DOM
      const container = chatContainerRef.current;
      const previousScrollHeight = container.scrollHeight;
      const previousScrollTop = container.scrollTop;

      if (hasNextPage && !isFetchingNextPage) await fetchNextPage();

      // After DOM updates, adjust scroll position so the view doesn't jump
      requestAnimationFrame(() => {
        const newScrollHeight = container.scrollHeight;
        container.scrollTop = previousScrollTop + (newScrollHeight - previousScrollHeight);
      });
    },
  });

  useEffect(() => {
    if (chatContainerRef.current && data?.pages.length === 1 && !isLoading) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }

    if (
      setModelId &&
      data &&
      data.pages[0].data[0] &&
      data.pages.length > 0 &&
      data.pages[0].data.length > 0
    ) {
      setModelId(data.pages[0].data[0].modelId);
    }
  }, [data, chatId, setModelId]);

  useEffect(() => {
    if (!isLoading && streamedText) {
      setStreamedText?.("");
      queryClient.refetchQueries({
        queryKey: [isShared ? "sharedCoversationsMessage" : "coversationsMessage", chatId],
      });
    }
  }, [isLoading, isShared, chatId, setStreamedText, streamedText]);

  const scrollToBottom = useCallback(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTo({
        top: chatContainerRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, []);

  useEffect(() => {
    setScrollToBottom(scrollToBottom);
    return () => {
      setShowScrollBottom(false);
    };
  }, [scrollToBottom, setScrollToBottom, setShowScrollBottom]);

  // Monitor scroll position to show/hide the floating button
  const handleScroll = useCallback(() => {
    if (!chatContainerRef.current) return;

    const { scrollTop, scrollHeight, clientHeight } = chatContainerRef.current;

    // Show button if the user scrolls up more than 300px from the bottom
    const isScrolledUp = scrollHeight - scrollTop - clientHeight > 300;
    setShowScrollBottom(isScrolledUp);
  }, [chatContainerRef, setShowScrollBottom]);

  return (
    <>
      <div
        ref={chatContainerRef}
        className="relative h-[calc(100dvh-2rem)] overflow-y-scroll px-4 md:px-8 pb-12"
        onScroll={handleScroll}
      >
        {isShared && (
          <div
            className={`sticky top-[85vh] md:top-[75vh] w-full flex justify-center z-15 ${contextShowScrollBottom ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10 pointer-events-none"}`}
          >
            <ChevronDown
              size={32}
              className="p-1 rounded-full bg-gray-700/50 cursor-pointer border border-gray-200/50 backdrop-blur-xs"
              onClick={scrollToBottom}
            />
          </div>
        )}

        {status === "pending" ? (
          <ChatSkeleton />
        ) : status === "error" ? (
          <div className="flex justify-center items-center size-full text-2xl">
            Error: {error.message}
          </div>
        ) : (
          <div className="flex my-6 flex-col-reverse gap-3">
            <div ref={containerBottomRef} className="h-2 w-full"></div>
            {isLoading && !streamedText && (
              <div className="flex items-center gap-2 w-fit mx-10 my-4 p-4 bg-gray-200 dark:bg-gray-800/80 rounded-4xl min-h-7.5">
                <span className="flex items-center gap-1.5">
                  {[0, 150, 300].map((delay) => (
                    <span
                      key={delay}
                      className="size-1.5 rounded-full bg-gray-900 dark:bg-white animate-bounce"
                      style={{ animationDelay: `${delay}ms` }}
                    />
                  ))}
                </span>
              </div>
            )}
            {streamedText && (
              <div className="flex justify-start m-4 px-4">
                <div className="px-4 py-2 w-full">
                  <MarkdownComponent
                    source={streamedText}
                    extensions={[streamingMarkdownExtension()]}
                    frontmatter={false}
                    headingIds={false}
                  />
                </div>
              </div>
            )}

            {data?.pages.map((page, i) => (
              <React.Fragment key={page.nextToken || i}>
                {page?.data?.map(
                  (item, j) =>
                    item.rawMessage && (
                      <ChatMessage
                        key={item.id}
                        item={item}
                        isEdit={!isShared && !isLoading && item.role === "USER"}
                        isRetry={!isShared && i === 0 && j === 0 && !isLoading}
                        regenerateContent={regenerateContent ?? (() => {})}
                        isShared={isShared}
                      />
                    ),
                )}
              </React.Fragment>
            ))}
            <div
              ref={loaderRef}
              className="flex justify-center items-center w-full py-4 min-h-10 text-gray-500"
            >
              {isFetchingNextPage && (
                <div className="flex items-center gap-2 text-sm">
                  <Loader size={16} className="animate-spin text-gray-400" />
                  <span>Loading older messages...</span>
                </div>
              )}
              {error && <p className="text-sm text-red-500">Failed to load older messages</p>}
            </div>
          </div>
        )}
      </div>
    </>
  );
}
