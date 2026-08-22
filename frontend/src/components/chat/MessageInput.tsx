import { SendHorizontal } from "lucide-react";
import { useState } from "react";

export function MessageInput({
  onSend,
  disabled,
}: {
  onSend: (message: string) => void;
  disabled?: boolean;
}) {
  const [value, setValue] = useState("");

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = value.trim();
    if (!trimmed || disabled) return;
    onSend(trimmed);
    setValue("");
  }

  return (
    <form
      onSubmit={submit}
      className="flex items-end gap-2 border-t border-ink/10 bg-paper/60 p-3 dark:border-paper/10 dark:bg-transparent"
    >
      <textarea
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey) submit(e);
        }}
        rows={1}
        placeholder="Ask a question in any language…"
        aria-label="Message"
        className="max-h-32 flex-1 resize-none rounded-xl border border-ink/15 bg-white px-3.5 py-2.5 text-[15px] text-ink outline-none placeholder:text-ink-muted/60 focus:border-moss-500 focus:ring-2 focus:ring-moss-500/20 dark:border-paper/15 dark:bg-white/[0.04] dark:text-paper"
      />
      <button
        type="submit"
        disabled={disabled || !value.trim()}
        aria-label="Send message"
        className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-moss-500 text-white transition-colors hover:bg-moss-600 disabled:opacity-40"
      >
        <SendHorizontal size={18} />
      </button>
    </form>
  );
}
