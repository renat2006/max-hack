import { useEffect, useRef, useState } from "react";

// Глобальный кеш для предзагруженных изображений
const globalImageCache = new Map<string, boolean>();
const globalPreloadPromises = new Map<string, Promise<void>>();

/**
 * Предзагружает список изображений через Image API
 */
function preloadImage(src: string): Promise<void> {
  // Проверяем кеш
  if (globalImageCache.has(src)) {
    return Promise.resolve();
  }

  // Проверяем активные загрузки
  const existingPromise = globalPreloadPromises.get(src);
  if (existingPromise) {
    return existingPromise;
  }

  // Создаем новую загрузку
  const promise = new Promise<void>((resolve, reject) => {
    const img = new Image();
    
    img.onload = () => {
      globalImageCache.set(src, true);
      globalPreloadPromises.delete(src);
      resolve();
    };
    
    img.onerror = () => {
      globalPreloadPromises.delete(src);
      reject(new Error(`Failed to preload image: ${src}`));
    };
    
    img.src = src;
  });

  globalPreloadPromises.set(src, promise);
  return promise;
}

/**
 * Извлекает все уникальные пути к спрайтам из challenges
 */
function extractSpriteUrls(challenges: Array<{ tileSprites?: Record<string, Array<{ spriteUrl?: string }>> }>): string[] {
  const urls = new Set<string>();
  
  for (const challenge of challenges) {
    if (!challenge.tileSprites) continue;
    
    for (const sprites of Object.values(challenge.tileSprites)) {
      for (const sprite of sprites) {
        if (sprite.spriteUrl) {
          urls.add(sprite.spriteUrl);
        }
      }
    }
  }
  
  return Array.from(urls);
}

interface UseSpritePreloadOptions {
  challenges: Array<{ tileSprites?: Record<string, Array<{ spriteUrl?: string }>> }>; // Гибкий тип для совместимости с разными челленджами
  enabled?: boolean;
  batchSize?: number;
  priorityCount?: number;
}

export function useSpritePreload({
  challenges,
  enabled = true,
  batchSize = 5,
  priorityCount = 15,
}: UseSpritePreloadOptions) {
  const [isLoading, setIsLoading] = useState(false);
  const [loadedCount, setLoadedCount] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const abortControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    if (!enabled || challenges.length === 0) {
      setIsLoading(false);
      setLoadedCount(0);
      setTotalCount(0);
      return;
    }

    // Отменяем предыдущую загрузку если она была
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    const controller = new AbortController();
    abortControllerRef.current = controller;

    const spriteUrls = extractSpriteUrls(challenges);
    
    if (spriteUrls.length === 0) {
      setIsLoading(false);
      setLoadedCount(0);
      setTotalCount(0);
      return;
    }

    setTotalCount(spriteUrls.length);
    
    // Проверяем сколько уже загружено
    const alreadyLoaded = spriteUrls.filter(url => globalImageCache.has(url)).length;
    setLoadedCount(alreadyLoaded);

    if (alreadyLoaded === spriteUrls.length) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);

    const preloadBatch = async () => {
      try {
        // Приоритетная загрузка первых N изображений
        const priorityUrls = spriteUrls.slice(0, priorityCount);
        const remainingUrls = spriteUrls.slice(priorityCount);

        let loaded = alreadyLoaded;

        // Загружаем приоритетные
        for (let i = 0; i < priorityUrls.length; i += batchSize) {
          if (controller.signal.aborted) return;
          
          const batch = priorityUrls.slice(i, i + batchSize);
          const results = await Promise.allSettled(
            batch.map(url => preloadImage(url))
          );
          
          const successCount = results.filter(r => r.status === 'fulfilled').length;
          loaded += successCount;
          setLoadedCount(loaded);
        }

        // Загружаем остальные в фоне
        if (!controller.signal.aborted && remainingUrls.length > 0) {
          // Запускаем фоновую загрузку без блокировки
          void (async () => {
            for (let i = 0; i < remainingUrls.length; i += batchSize) {
              if (controller.signal.aborted) return;
              
              const batch = remainingUrls.slice(i, i + batchSize);
              const results = await Promise.allSettled(
                batch.map(url => preloadImage(url))
              );
              
              const successCount = results.filter(r => r.status === 'fulfilled').length;
              loaded += successCount;
              setLoadedCount(loaded);
              
              // Небольшая задержка между батчами
              await new Promise(resolve => setTimeout(resolve, 50));
            }
          })();
        }

        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      } catch (error) {
        if (!controller.signal.aborted) {
          console.error('Sprite preload error:', error);
          setIsLoading(false);
        }
      }
    };

    void preloadBatch();

    return () => {
      controller.abort();
    };
  }, [challenges, enabled, batchSize, priorityCount]);

  const progress = totalCount > 0 ? loadedCount / totalCount : 0;
  const isReady = !isLoading && loadedCount >= Math.min(priorityCount, totalCount);

  return {
    isLoading,
    loadedCount,
    totalCount,
    progress,
    isReady,
  };
}

