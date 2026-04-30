import { useCallback, useEffect, useRef, useState } from "react";

export function useToast(timeoutMs = 1500) {
  const [message, setMessage] = useState<string | null>(null);
  const timer = useRef<number | null>(null);

  const show = useCallback(
    (msg: string) => {
      setMessage(msg);
      if (timer.current) window.clearTimeout(timer.current);
      timer.current = window.setTimeout(() => setMessage(null), timeoutMs);
    },
    [timeoutMs]
  );

  useEffect(() => {
    return () => {
      if (timer.current) window.clearTimeout(timer.current);
    };
  }, []);

  return { message, show, clear: () => setMessage(null) };
}

