import { ArrowRight, ShieldCheck } from "lucide-react";
import { Button } from "../ui/Button";
import { Container } from "../ui/Container";
import { MockChat } from "./MockChat";

export function Hero() {
  return (
    <section className="relative overflow-hidden pt-16 pb-20 sm:pt-24 sm:pb-28">
      {/* Ambient background */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute left-1/2 top-0 h-[500px] w-[900px] -translate-x-1/2 rounded-full bg-moss-500/[0.07] blur-3xl" />
      </div>

      <Container>
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <div className="animate-fade-up">
            <span className="inline-flex items-center gap-2 rounded-full border border-moss-500/20 bg-moss-500/5 px-3 py-1 text-xs font-medium text-moss-600 dark:text-moss-300">
              <span className="h-1.5 w-1.5 rounded-full bg-moss-500" />
              Self-hosted · 100+ languages · No made-up answers
            </span>

            <h1 className="mt-5 font-display text-4xl font-semibold leading-[1.08] tracking-tight text-ink dark:text-paper sm:text-5xl lg:text-6xl">
              Answer every customer, in their own language.
            </h1>

            <p className="mt-5 max-w-xl text-lg leading-relaxed text-ink-soft dark:text-paper/70">
              Lyra reads your help docs and answers customer questions from them —
              in 100+ languages. It shows where each answer came from, and never
              makes things up. You host it, so your data stays yours.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button as="link" to="/register" size="lg">
                Start free <ArrowRight size={18} />
              </Button>
              <Button as="a" href="#how" variant="secondary" size="lg">
                See how it works
              </Button>
            </div>

            <p className="mt-6 flex items-center gap-2 text-sm text-ink-muted dark:text-paper/50">
              <ShieldCheck size={16} className="text-moss-500" />
              Your docs and chats stay on your servers. Always.
            </p>
          </div>

          <div className="animate-fade-up [animation-delay:120ms]">
            <MockChat />
          </div>
        </div>
      </Container>
    </section>
  );
}
