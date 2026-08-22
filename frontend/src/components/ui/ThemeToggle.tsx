import { Moon, Sun } from "lucide-react";
import { useTheme } from "../../hooks/useTheme";

export function ThemeToggle() {
  const { theme, toggle } = useTheme();
  const isDark = theme === "dark";
  return (
    <button
      onClick={toggle}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      className="grid h-9 w-9 place-items-center rounded-lg border border-ink/10 text-ink-soft transition-colors hover:border-moss-500 hover:text-moss-600 dark:border-paper/15 dark:text-paper/70 dark:hover:text-moss-300"
    >
      {isDark ? <Sun size={17} /> : <Moon size={17} />}
    </button>
  );
}
