import { useState } from "react";
import { api, ApiError } from "../../api/client";
import { MessageInput } from "./MessageInput";
import { MessageList, type ChatMessage } from "./MessageList";

const GREETING: ChatMessage = {
  role: "assistant",
  content:
    "Hi! I answer only from your uploaded knowledge base — in any of 100+ languages. Ask me a support question, or try one in Japanese or Korean.",
};

export function ChatWindow({ onQuotaError }: { onQuotaError?: () => void }) {
  const [messages, setMessages] = useState<ChatMessage[]>([GREETING]);
  const [busy, setBusy] = useState(false);

  async function send(text: string) {
    setBusy(true);
    setMessages((prev) => [
      ...prev,
      { role: "user", content: text },
      { role: "assistant", content: "", streaming: true },
    ]);

    try {
      await api.chat(text, (chunk) => {
        setMessages((prev) => {
          const next = [...prev];
          const last = next[next.length - 1];
          if (last?.role === "assistant") {
            next[next.length - 1] = {
              ...last,
              content: last.content + chunk,
              streaming: true,
            };
          }
          return next;
        });
      });
      // finalize: drop the streaming cursor
      setMessages((prev) => {
        const next = [...prev];
        const last = next[next.length - 1];
        if (last?.role === "assistant") {
          next[next.length - 1] = { ...last, streaming: false };
        }
        return next;
      });
    } catch (err) {
      const message =
        err instanceof ApiError ? err.message : "Something went wrong. Try again.";
      setMessages((prev) => {
        const next = [...prev];
        next[next.length - 1] = { role: "assistant", content: `⚠️ ${message}` };
        return next;
      });
      if (err instanceof ApiError && err.status === 429) onQuotaError?.();
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex h-full flex-col">
      <MessageList messages={messages} />
      <MessageInput onSend={send} disabled={busy} />
    </div>
  );
}
