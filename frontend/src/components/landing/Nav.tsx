import { Menu, MessagesSquare, X } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "../ui/Button";
import { Container } from "../ui/Container";
import { ThemeToggle } from "../ui/ThemeToggle";

const links = [
  { href: "#features", label: "Features" },
  { href: "#how", label: "How it works" },
  { href: "#pricing", label: "Pricing" },
  { href: "#faq", label: "FAQ" },
];

export function Nav() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-ink/5 bg-paper/80 backdrop-blur-md dark:border-paper/5 dark:bg-ink/80">
      <Container>
        <div className="flex h-16 items-center justify-between">
          <Link to="/" className="flex items-center gap-2 font-display text-xl font-semibold">
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-moss-500 text-white">
              <MessagesSquare size={16} />
            </span>
            Lyra
          </Link>

          <nav className="hidden items-center gap-1 md:flex">
            {links.map((l) => (
              <a
                key={l.href}
                href={l.href}
                className="rounded-lg px-3 py-2 text-sm font-medium text-ink-soft transition-colors hover:text-moss-600 dark:text-paper/70 dark:hover:text-moss-300"
              >
                {l.label}
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Link
              to="/login"
              className="hidden rounded-lg px-3 py-2 text-sm font-medium text-ink-soft hover:text-moss-600 dark:text-paper/70 dark:hover:text-moss-300 sm:block"
            >
              Log in
            </Link>
            <Button as="link" to="/register" size="sm" className="hidden sm:inline-flex">
              Get started
            </Button>
            <button
              className="grid h-9 w-9 place-items-center rounded-lg text-ink-soft md:hidden dark:text-paper/70"
              onClick={() => setOpen((o) => !o)}
              aria-label="Toggle menu"
              aria-expanded={open}
            >
              {open ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </Container>

      {open && (
        <div className="border-t border-ink/5 md:hidden dark:border-paper/5">
          <Container>
            <nav className="flex flex-col gap-1 py-4">
              {links.map((l) => (
                <a
                  key={l.href}
                  href={l.href}
                  onClick={() => setOpen(false)}
                  className="rounded-lg px-3 py-2.5 text-sm font-medium text-ink-soft dark:text-paper/70"
                >
                  {l.label}
                </a>
              ))}
              <div className="mt-2 flex gap-2">
                <Button as="link" to="/login" variant="secondary" size="sm" className="flex-1">
                  Log in
                </Button>
                <Button as="link" to="/register" size="sm" className="flex-1">
                  Get started
                </Button>
              </div>
            </nav>
          </Container>
        </div>
      )}
    </header>
  );
}
