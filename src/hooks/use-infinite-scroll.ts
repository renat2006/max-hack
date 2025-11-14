import { useEffect, useRef } from "react";

export type InfiniteScrollOptions = {
  enabled?: boolean;
  rootMargin?: string;
};

export const useInfiniteScroll = <T extends Element>(
  callback: () => void,
  { enabled = true, rootMargin = "0px" }: InfiniteScrollOptions = {},
) => {
  const targetRef = useRef<T | null>(null);

  useEffect(() => {
    if (!enabled) {
      return;
    }

    const node = targetRef.current;

    if (!node) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            callback();
          }
        });
      },
      { rootMargin },
    );

    observer.observe(node);

    return () => {
      observer.disconnect();
    };
  }, [callback, enabled, rootMargin]);

  return targetRef;
};
