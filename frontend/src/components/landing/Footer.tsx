import { MessagesSquare } from "lucide-react";
import { Link } from "react-router-dom";
import { Container } from "../ui/Container";

const columns = [
  {
    title: "Product",
    links: [
      { label: "Features", href: "#features" },
      { label: "How it works", href: "#how" },
      { label: "Pricing", href: "#pricing" },
      { label: "FAQ", href: "#faq" },
    ],
  },
  {
    title: "Account",
    links: [
      { label: "Log in", href: "/login" },
      { label: "Get started", href: "/register" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="border-t border-ink/5 py-14 dark:border-paper/5">
      <Container>
        <div className="grid gap-10 md:grid-cols-[1.5fr_1fr_1fr]">
          <div>
            <Link to="/" className="flex items-center gap-2 font-display text-lg font-semibold">
              <span className="grid h-8 w-8 place-items-center rounded-lg bg-moss-500 text-white">
                <MessagesSquare size={16} />
              </span>
              Lyra
            </Link>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-ink-muted dark:text-paper/50">
              Self-hosted, grounded AI customer support in 100+ languages. Your
              docs, your infrastructure, no hallucinations.
            </p>
          </div>

          {columns.map((col) => (
            <div key={col.title}>
              <h4 className="text-sm font-semibold text-ink dark:text-paper">
                {col.title}
              </h4>
              <ul className="mt-4 space-y-2.5">
                {col.links.map((l) => (
                  <li key={l.label}>
                    {l.href.startsWith("#") ? (
                      <a
                        href={l.href}
                        className="text-sm text-ink-muted transition-colors hover:text-moss-600 dark:text-paper/50 dark:hover:text-moss-300"
                      >
                        {l.label}
                      </a>
                    ) : (
                      <Link
                        to={l.href}
                        className="text-sm text-ink-muted transition-colors hover:text-moss-600 dark:text-paper/50 dark:hover:text-moss-300"
                      >
                        {l.label}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-3 border-t border-ink/5 pt-6 text-sm text-ink-muted dark:border-paper/5 dark:text-paper/40 sm:flex-row">
          <p>© {new Date().getFullYear()} Lyra. Self-hosted support, done right.</p>
          <p>Built with FastAPI, LlamaIndex, and BGE-M3.</p>
        </div>
      </Container>
    </footer>
  );
}
