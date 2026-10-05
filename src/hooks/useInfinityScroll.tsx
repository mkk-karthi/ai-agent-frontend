import { useCallback, useRef } from "react";

export interface UseInfiniteScrollProps {
  isLoading: boolean;
  hasMore: boolean;
  loadMore: () => any;
  rootMargin?: string;
  threshold?: number | number[];
}

export const useInfiniteScroll = ({
  isLoading,
  hasMore,
  loadMore,
  rootMargin = "100px",
  threshold = 0,
}: UseInfiniteScrollProps) => {
  const observerRef = useRef<IntersectionObserver | null>(null);

  const lastElementRef = useCallback(
    (node: HTMLElement | null) => {
      if (isLoading) return;

      if (observerRef.current) observerRef.current.disconnect();

      if (!node || !hasMore) return;

      observerRef.current = new IntersectionObserver(
        (entries) => {
          if (entries[0].isIntersecting) loadMore();
        },
        { rootMargin, threshold },
      );

      observerRef.current.observe(node);
    },
    [isLoading, hasMore, loadMore, rootMargin, threshold],
  );

  return lastElementRef;
};
