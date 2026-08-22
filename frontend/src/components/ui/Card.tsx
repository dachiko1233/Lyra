import type { ReactNode } from "react";

export function Card({
  children,
  className = "",
  hover = false,
}: {
  children: ReactNode;
  className?: string;
  hover?: boolean;
}) {
  return (
    <div
      className={`rounded-2xl border border-ink/10 bg-white/70 p-6 backdrop-blur dark:border-paper/10 dark:bg-white/[0.03] ${
        hover
          ? "transition-all duration-300 hover:-translate-y-1 hover:border-moss-400/50 hover:shadow-lg"
          : ""
      } ${className}`}
    >
      {children}
    </div>
  );
}
