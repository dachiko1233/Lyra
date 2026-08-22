import { Bot, User } from "lucide-react";
import { useEffect, useRef } from "react";

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  streaming?: boolean;
}

export function MessageList({ messages }: { messages: ChatMessage[] }) {
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="chat-scroll flex-1 space-y-5 overflow-y-auto px-1 py-4">
      {messages.map((m, i) => (
        <div
          key={i}
          className={`flex gap-3 ${m.role === "user" ? "flex-row-reverse" : ""}`}
        >
          <span
            className={`mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-full ${
              m.role === "user"
                ? "bg-ink/10 text-ink dark:bg-paper/10 dark:text-paper"
                : "bg-moss-500/15 text-moss-600 dark:text-moss-300"
            }`}
          >
            {m.role === "user" ? <User size={15} /> : <Bot size={15} />}
          </span>
          <div
            className={`max-w-[80%] whitespace-pre-wrap rounded-2xl px-4 py-2.5 text-[15px] leading-relaxed ${
              m.role === "user"
                ? "bg-moss-500 text-white"
                : "bg-white text-ink dark:bg-white/[0.06] dark:text-paper"
            }`}
          >
            {m.content}
            {m.streaming && (
              <span className="ml-0.5 inline-block h-4 w-1.5 animate-pulse bg-moss-400 align-middle" />
            )}
          </div>
        </div>
      ))}
      <div ref={endRef} />
    </div>
  );
}
