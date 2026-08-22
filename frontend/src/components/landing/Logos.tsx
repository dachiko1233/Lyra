import { useScrollReveal } from "../../hooks/useScrollReveal";
import { Container } from "../ui/Container";

const companies = ["Northwind", "Aperture", "Meridian", "Kintsugi", "Lumen", "Sakura"];

export function Logos() {
  const ref = useScrollReveal<HTMLDivElement>();
  return (
    <section className="border-y border-ink/5 py-10 dark:border-paper/5">
      <Container>
        <div ref={ref}>
          <p className="text-center text-xs font-medium uppercase tracking-widest text-ink-muted dark:text-paper/40">
            Trusted by support teams at
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-x-10 gap-y-4">
            {companies.map((c) => (
              <span
                key={c}
                className="font-display text-lg font-semibold text-ink/40 transition-colors hover:text-ink/70 dark:text-paper/30 dark:hover:text-paper/60"
              >
                {c}
              </span>
            ))}
          </div>
        </div>
      </Container>
    </section>
  );
}
