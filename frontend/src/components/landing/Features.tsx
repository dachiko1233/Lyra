import {
  Languages,
  Rocket,
  ServerCog,
  ShieldCheck,
  SlidersHorizontal,
  UserCheck,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useScrollReveal } from "../../hooks/useScrollReveal";
import { Card } from "../ui/Card";
import { Container } from "../ui/Container";

interface Feature {
  icon: LucideIcon;
  title: string;
  body: string;
}

const features: Feature[] = [
  {
    icon: Languages,
    title: "Speaks 100+ languages",
    body: "One set of docs answers customers in Japanese, Korean, Chinese, and 100 more. No translation step. No extra setup.",
  },
  {
    icon: ShieldCheck,
    title: "Never makes things up",
    body: "Every answer comes from your docs, with a source you can check. If the answer isn't there, Lyra says so instead of guessing.",
  },
  {
    icon: ServerCog,
    title: "Your data stays yours",
    body: "Your docs and your customers' questions run on your servers. Nothing is copied to us — ever.",
  },
  {
    icon: UserCheck,
    title: "Logins built in",
    body: "Sign-ups, email verification, and secure passwords come ready. No third-party auth tool to add.",
  },
  {
    icon: Rocket,
    title: "Live in an afternoon",
    body: "Run it with Docker or push to Railway. Most teams are answering real questions the same day.",
  },
  {
    icon: SlidersHorizontal,
    title: "Fair limits, honestly kept",
    body: "Free and Pro limits are checked on the server, not in the browser. You get exactly what you pay for.",
  },
];

export function Features() {
  const ref = useScrollReveal<HTMLDivElement>();
  return (
    <section id="features" className="scroll-mt-20 py-20 sm:py-28">
      <Container>
        <div ref={ref} className="mx-auto max-w-2xl text-center">
          <h2 className="font-display text-3xl font-semibold tracking-tight text-ink dark:text-paper sm:text-4xl">
            A support agent that tells the truth
          </h2>
          <p className="mt-4 text-lg text-ink-soft dark:text-paper/70">
            It answers from your docs, in any language, and keeps your data on your
            side. That's it.
          </p>
        </div>

        <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f) => (
            <Card key={f.title} hover>
              <span className="grid h-11 w-11 place-items-center rounded-xl bg-moss-500/12 text-moss-600 dark:text-moss-300">
                <f.icon size={20} />
              </span>
              <h3 className="mt-4 font-display text-lg font-semibold text-ink dark:text-paper">
                {f.title}
              </h3>
              <p className="mt-2 text-[15px] leading-relaxed text-ink-soft dark:text-paper/65">
                {f.body}
              </p>
            </Card>
          ))}
        </div>
      </Container>
    </section>
  );
}
