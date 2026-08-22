import { ArrowRight } from "lucide-react";
import { useScrollReveal } from "../../hooks/useScrollReveal";
import { Button } from "../ui/Button";
import { Container } from "../ui/Container";

export function CTA() {
  const ref = useScrollReveal<HTMLDivElement>();
  return (
    <section className="py-20 sm:py-28">
      <Container>
        <div
          ref={ref}
          className="relative overflow-hidden rounded-3xl border border-moss-500/20 bg-gradient-to-br from-moss-600 to-moss-700 px-8 py-16 text-center shadow-xl sm:px-16"
        >
          <div className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
          <h2 className="mx-auto max-w-2xl font-display text-3xl font-semibold tracking-tight text-white sm:text-4xl">
            Stop making customers wait for an answer
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-lg text-white/80">
            Put a support agent on your own docs today. Free to start, and you can
            be live this afternoon.
          </p>
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Button
              as="link"
              to="/register"
              size="lg"
              className="bg-white text-moss-700 hover:bg-white/90"
            >
              Get started free <ArrowRight size={18} />
            </Button>
            <Button
              as="a"
              href="#pricing"
              size="lg"
              className="border border-white/30 bg-transparent text-white hover:bg-white/10"
            >
              See pricing
            </Button>
          </div>
        </div>
      </Container>
    </section>
  );
}
