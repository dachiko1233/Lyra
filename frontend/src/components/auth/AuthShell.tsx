import { MessagesSquare } from "lucide-react";
import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { ThemeToggle } from "../ui/ThemeToggle";

/** Centered card layout shared by login / register / verify. */
export function AuthShell({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
  footer?: ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col bg-paper dark:bg-ink">
      <header className="flex items-center justify-between px-6 py-5">
        <Link to="/" className="flex items-center gap-2 font-display text-lg font-semibold">
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-moss-500 text-white">
            <MessagesSquare size={16} />
          </span>
          Lyra
        </Link>
        <ThemeToggle />
      </header>

      <main className="flex flex-1 items-center justify-center px-5 pb-16">
        <div className="w-full max-w-md">
          <div className="rounded-2xl border border-ink/10 bg-white/80 p-8 shadow-sm backdrop-blur dark:border-paper/10 dark:bg-white/[0.04]">
            <h1 className="font-display text-2xl font-semibold text-ink dark:text-paper">
              {title}
            </h1>
            {subtitle && (
              <p className="mt-2 text-sm text-ink-soft dark:text-paper/60">{subtitle}</p>
            )}
            <div className="mt-6">{children}</div>
          </div>
          {footer && (
            <p className="mt-6 text-center text-sm text-ink-muted dark:text-paper/50">
              {footer}
            </p>
          )}
        </div>
      </main>
    </div>
  );
}

export function Field({
  label,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & { label: string }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-ink-soft dark:text-paper/70">
        {label}
      </span>
      <input
        {...props}
        className="w-full rounded-xl border border-ink/15 bg-white px-3.5 py-2.5 text-ink outline-none transition-colors placeholder:text-ink-muted/60 focus:border-moss-500 focus:ring-2 focus:ring-moss-500/20 dark:border-paper/15 dark:bg-white/[0.04] dark:text-paper"
      />
    </label>
  );
}

export function FormError({ message }: { message: string }) {
  return (
    <div
      role="alert"
      className="rounded-lg border border-clay-500/30 bg-clay-500/10 px-3.5 py-2.5 text-sm text-clay-600 dark:text-clay-400"
    >
      {message}
    </div>
  );
}

export function FormSuccess({ message }: { message: string }) {
  return (
    <div
      role="status"
      className="rounded-lg border border-moss-500/30 bg-moss-500/10 px-3.5 py-2.5 text-sm text-moss-600 dark:text-moss-300"
    >
      {message}
    </div>
  );
}
