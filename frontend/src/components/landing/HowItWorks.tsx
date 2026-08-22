import { MessagesSquare, Rocket, Upload } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useScrollReveal } from "../../hooks/useScrollReveal";
import { Container } from "../ui/Container";

interface Step {
  icon: LucideIcon;
  title: string;
  body: string;
}

const steps: Step[] = [
  {
    icon: Upload,
    title: "Add your docs",
    body: "Upload your FAQs, product docs, and policies. That's the only thing Lyra answers from.",
  },
  {
    icon: Rocket,
    title: "Turn it on",
    body: "Run it locally with Docker, or deploy to Railway in a few minutes. Pick any AI model you like.",
  },
  {
    icon: MessagesSquare,
    title: "Customers get answers",
    body: "They ask in any language and get a real answer from your docs — or an honest \"I don't know.\"",
  },
];

export function HowItWorks() {
  const ref = useScrollReveal<HTMLDivElement>();
  return (
    <section
      id="how"
      className="scroll-mt-20 border-y border-ink/5 bg-white/40 py-20 dark:border-paper/5 dark:bg-white/[0.02] sm:py-28"
    >
      <Container>
        <div ref={ref} className="mx-auto max-w-2xl text-center">
          <h2 className="font-display text-3xl font-semibold tracking-tight text-ink dark:text-paper sm:text-4xl">
            Up and running in three steps
          </h2>
          <p className="mt-4 text-lg text-ink-soft dark:text-paper/70">
            No pipelines to build. No English-only surprises.
          </p>
        </div>

        <div className="relative mt-16 grid gap-8 md:grid-cols-3">
          {/* connecting line */}
          <div className="absolute left-0 right-0 top-7 hidden h-px bg-gradient-to-r from-transparent via-moss-500/30 to-transparent md:block" />
          {steps.map((s, i) => (
            <div key={s.title} className="relative text-center">
              <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl border border-moss-500/20 bg-paper text-moss-600 shadow-sm dark:bg-ink dark:text-moss-300">
                <s.icon size={22} />
              </div>
              <div className="mt-2 font-mono text-xs font-semibold text-moss-500">
                STEP {i + 1}
              </div>
              <h3 className="mt-1 font-display text-xl font-semibold text-ink dark:text-paper">
                {s.title}
              </h3>
              <p className="mx-auto mt-2 max-w-xs text-[15px] leading-relaxed text-ink-soft dark:text-paper/65">
                {s.body}
              </p>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}
