import { Bot, ShieldCheck, User } from "lucide-react";

/**
 * Hero visual: a mock chat showing a Japanese question answered with a
 * grounded, cited response — the product thesis in one image.
 */
export function MockChat() {
  return (
    <div className="relative">
      <div className="absolute -inset-4 -z-10 rounded-[2rem] bg-gradient-to-br from-moss-500/20 via-moss-300/10 to-transparent blur-2xl" />
      <div className="overflow-hidden rounded-2xl border border-ink/10 bg-white shadow-xl dark:border-paper/10 dark:bg-ink/95">
        {/* Window chrome */}
        <div className="flex items-center gap-2 border-b border-ink/5 bg-paper/60 px-4 py-3 dark:border-paper/5 dark:bg-white/[0.02]">
          <span className="grid h-6 w-6 place-items-center rounded-md bg-moss-500 text-white">
            <Bot size={13} />
          </span>
          <span className="text-sm font-medium text-ink dark:text-paper">
            Support · Lyra
          </span>
          <span className="ml-auto inline-flex items-center gap-1 rounded-full bg-moss-500/10 px-2 py-0.5 text-[11px] font-medium text-moss-600 dark:text-moss-300">
            <span className="h-1.5 w-1.5 rounded-full bg-moss-500" /> Grounded
          </span>
        </div>

        <div className="space-y-4 p-4">
          {/* User question (Japanese) */}
          <div className="flex flex-row-reverse gap-2.5">
            <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-ink/10 text-ink dark:bg-paper/10 dark:text-paper">
              <User size={13} />
            </span>
            <div className="rounded-2xl rounded-tr-sm bg-moss-500 px-3.5 py-2 text-[14px] text-white">
              返品はどのくらいの期間可能ですか？
            </div>
          </div>

          {/* Grounded answer */}
          <div className="flex gap-2.5">
            <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-moss-500/15 text-moss-600 dark:text-moss-300">
              <Bot size={13} />
            </span>
            <div className="space-y-2">
              <div className="rounded-2xl rounded-tl-sm bg-paper px-3.5 py-2.5 text-[14px] leading-relaxed text-ink dark:bg-white/[0.06] dark:text-paper">
                商品到着後<strong>30日以内</strong>であれば返品可能です。未使用・未開封の商品に限ります。
              </div>
              <div className="flex items-center gap-1.5 pl-1 text-[11px] text-ink-muted dark:text-paper/50">
                <ShieldCheck size={12} className="text-moss-500" />
                Source: <span className="font-medium">Returns Policy › Section 2</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
