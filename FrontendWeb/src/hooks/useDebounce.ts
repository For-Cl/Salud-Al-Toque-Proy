import { useCallback, useEffect, useRef, useState } from 'react';

export function useDebounce<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debounced;
}

export function useRetry(fn: () => Promise<void>, maxRetries = 3) {
  const [retryCount, setRetryCount] = useState(0);
  const [isRetrying, setIsRetrying] = useState(false);
  const fnRef = useRef(fn);
  fnRef.current = fn;

  const retry = useCallback(async () => {
    if (retryCount >= maxRetries) return;
    setIsRetrying(true);
    try {
      await fnRef.current();
      setRetryCount(0);
    } catch {
      setRetryCount((c) => c + 1);
    } finally {
      setIsRetrying(false);
    }
  }, [retryCount, maxRetries]);

  return { retry, retryCount, isRetrying, canRetry: retryCount < maxRetries };
}

