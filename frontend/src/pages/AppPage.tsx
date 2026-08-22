import { Crown, LogOut, MessagesSquare, Sparkles, Zap } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { api, ApiError } from "../api/client";
import { ChatWindow } from "../components/chat/ChatWindow";
import { Button } from "../components/ui/Button";
import { ThemeToggle } from "../components/ui/ThemeToggle";
import { useAuth } from "../hooks/useAuth";

export function AppPage() {
  const { user, logout, refreshMe } = useAuth();
  const [upgradeError, setUpgradeError] = useState<string | null>(null);
  const [upgrading, setUpgrading] = useState(false);

  if (!user) return null;
  const isPro = user.plan === "pro";
  const ent = user.entitlements;

  async function upgrade() {
    setUpgradeError(null);
    setUpgrading(true);
    try {
      const { checkout_url } = await api.checkout();
      window.location.href = checkout_url;
    } catch (err) {
      setUpgradeError(
        err instanceof ApiError ? err.message : "Could not start checkout.",
      );
    } finally {
      setUpgrading(false);
    }
  }

  return (
    <div className="flex h-screen flex-col bg-paper dark:bg-ink">
      {/* Top bar */}
      <header className="flex items-center justify-between border-b border-ink/10 px-5 py-3 dark:border-paper/10">
        <Link to="/" className="flex items-center gap-2 font-display text-lg font-semibold">
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-moss-500 text-white">
            <MessagesSquare size={16} />
          </span>
          Lyra
        </Link>
        <div className="flex items-center gap-3">
          <span className="hidden text-sm text-ink-muted dark:text-paper/50 sm:inline">
            {user.email}
          </span>
          <ThemeToggle />
          <Button variant="ghost" size="sm" onClick={logout} aria-label="Log out">
            <LogOut size={16} /> <span className="hidden sm:inline">Log out</span>
          </Button>
        </div>
      </header>

      <div className="mx-auto grid w-full max-w-6xl flex-1 grid-cols-1 gap-6 overflow-hidden p-4 lg:grid-cols-[300px_1fr]">
        {/* Sidebar */}
        <aside className="hidden flex-col gap-4 lg:flex">
          <div className="rounded-2xl border border-ink/10 bg-white/70 p-5 dark:border-paper/10 dark:bg-white/[0.03]">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-ink-soft dark:text-paper/70">
                Current plan
              </span>
              <span
                className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${
                  isPro
                    ? "bg-moss-500/15 text-moss-600 dark:text-moss-300"
                    : "bg-ink/10 text-ink-soft dark:bg-paper/10 dark:text-paper/70"
                }`}
              >
                {isPro ? <Crown size={12} /> : <Sparkles size={12} />}
                {isPro ? "Pro" : "Free"}
              </span>
            </div>

            <dl className="mt-4 space-y-3 text-sm">
              <div className="flex items-center justify-between">
                <dt className="text-ink-muted dark:text-paper/50">Messages left today</dt>
                <dd className="font-semibold tabular-nums text-ink dark:text-paper">
                  {ent.messages_remaining_today}
                  <span className="text-ink-muted dark:text-paper/40">
                    /{ent.max_messages_per_day}
                  </span>
                </dd>
              </div>
              <div className="flex items-center justify-between">
                <dt className="text-ink-muted dark:text-paper/50">Max documents</dt>
                <dd className="font-semibold tabular-nums text-ink dark:text-paper">
                  {ent.max_documents}
                </dd>
              </div>
              <div className="flex items-center justify-between">
                <dt className="text-ink-muted dark:text-paper/50">Priority answers</dt>
                <dd className="font-semibold text-ink dark:text-paper">
                  {ent.priority ? "Yes" : "No"}
                </dd>
              </div>
            </dl>
          </div>

          {!isPro && (
            <div className="rounded-2xl border border-moss-500/20 bg-moss-500/5 p-5">
              <div className="flex items-center gap-2 font-display text-lg font-semibold text-ink dark:text-paper">
                <Zap size={18} className="text-moss-500" /> Upgrade to Pro
              </div>
              <p className="mt-1.5 text-sm text-ink-soft dark:text-paper/60">
                Higher daily limits, more documents, and priority answers.
                Enforced server-side the moment you upgrade.
              </p>
              {upgradeError && (
                <p className="mt-3 text-sm text-clay-600 dark:text-clay-400">
                  {upgradeError}
                </p>
              )}
              <Button
                onClick={upgrade}
                size="md"
                className="mt-4 w-full"
                disabled={upgrading}
              >
                {upgrading ? "Starting checkout…" : "Upgrade — $XX/mo"}
              </Button>
            </div>
          )}

          <button
            onClick={() => refreshMe()}
            className="text-left text-xs text-ink-muted underline-offset-2 hover:underline dark:text-paper/40"
          >
            Refresh plan status
          </button>
        </aside>

        {/* Chat panel */}
        <main className="flex flex-col overflow-hidden rounded-2xl border border-ink/10 bg-white/50 dark:border-paper/10 dark:bg-white/[0.02]">
          <ChatWindow onQuotaError={() => refreshMe()} />
        </main>
      </div>
    </div>
  );
}
