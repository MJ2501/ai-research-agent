import { useEffect } from "react";

export function useEventSource(
  url: string,
  onMessage: (ev: MessageEvent) => void
) {
  useEffect(() => {
    const es = new EventSource(url);
    es.onmessage = onMessage;
    es.addEventListener("log", onMessage);
    return () => es.close();
  }, [url, onMessage]);
}
