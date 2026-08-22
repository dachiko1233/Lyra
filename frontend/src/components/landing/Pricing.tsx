import { Check } from "lucide-react";
import { useScrollReveal } from "../../hooks/useScrollReveal";
import { Button } from "../ui/Button";
import { Container } from "../ui/Container";

interface Tier {
  name: string;
  price: string;
  cadence: string;
  tagline: string;
  features: string[];
  highlighted?: boolean;
  cta: string;
}

// NOTE: Pro price is a placeholder ($XX) — change it in one place here.
const PRO_PRICE = "$XX";

const tiers: Tier[] = [
  {
    name: "Free",
    price: "$0",
    cadence: "/mo",
    tagline: "Try it on your own docs. Free forever.",
    features: [
      "Answers in 100+ languages",
      "20 questions a day",
      "Up to 25 documents",
      "Runs on your servers",
      "Logins and email verification",
    ],
    cta: "Start free",
  },
  {
    name: "Pro",
    price: PRO_PRICE,
    cadence: "/mo",
    tagline: "For teams with real support volume.",
    highlighted: true,
    features: [
      "Everything in Free",
      "1,000 questions a day",
      "Up to 1,000 documents",
      "Answers stay fast when it's busy",
      "Receipts and easy cancellation",
    ],
    cta: "Upgrade to Pro",
  },
];

export function Pricing() {
  const ref = useScrollReveal<HTMLDivElement>();
  return (
    <section id="pricing" className="scroll-mt-20 py-20 sm:py-28">
      <Container>
        <div ref={ref} className="mx-auto max-w-2xl text-center">
          <h2 className="font-display text-3xl font-semibold tracking-tight text-ink dark:text-paper sm:text-4xl">
            Simple pricing, honest limits
          </h2>
          <p className="mt-4 text-lg text-ink-soft dark:text-paper/70">
            Start free. Upgrade when you grow. You get exactly what you pay for —
            we check every limit on our server.
          </p>
        </div>

        <div className="mx-auto mt-14 grid max-w-4xl gap-6 md:grid-cols-2">
          {tiers.map((t) => (
            <div
              key={t.name}
              className={`relative flex flex-col rounded-2xl border p-8 ${
                t.highlighted
                  ? "border-moss-500/40 bg-white shadow-xl ring-1 ring-moss-500/20 dark:bg-white/[0.05]"
                  : "border-ink/10 bg-white/60 dark:border-paper/10 dark:bg-white/[0.02]"
              }`}
            >
              {t.highlighted && (
                <span className="absolute -top-3 left-8 rounded-full bg-moss-500 px-3 py-1 text-xs font-semibold text-white">
                  Most popular
                </span>
              )}
              <h3 className="font-display text-xl font-semibold text-ink dark:text-paper">
                {t.name}
              </h3>
              <p className="mt-1 text-sm text-ink-muted dark:text-paper/50">
                {t.tagline}
              </p>
              <div className="mt-5 flex items-baseline gap-1">
                <span className="font-display text-4xl font-semibold text-ink dark:text-paper">
                  {t.price}
                </span>
                <span className="text-ink-muted dark:text-paper/50">{t.cadence}</span>
              </div>

              <ul className="mt-6 flex-1 space-y-3">
                {t.features.map((f) => (
                  <li key={f} className="flex items-start gap-2.5 text-[15px] text-ink-soft dark:text-paper/70">
                    <Check size={18} className="mt-0.5 shrink-0 text-moss-500" />
                    {f}
                  </li>
                ))}
              </ul>

              <Button
                as="link"
                to="/register"
                variant={t.highlighted ? "primary" : "secondary"}
                size="lg"
                className="mt-8 w-full"
              >
                {t.cta}
              </Button>
            </div>
          ))}
        </div>

        <p className="mx-auto mt-6 max-w-xl text-center text-sm text-ink-muted dark:text-paper/50">
          Pro entitlements are enforced server-side. The frontend is never trusted
          for limits or features.
        </p>
      </Container>
    </section>
  );
}
