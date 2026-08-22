import { useScrollReveal } from "../../hooks/useScrollReveal";
import { Accordion, type AccordionItem } from "../ui/Accordion";
import { Container } from "../ui/Container";

const faqs: AccordionItem[] = [
  {
    question: "What languages does it speak?",
    answer:
      "More than 100, and it's strong on Asian languages like Chinese, Japanese, Korean, and Thai. You only upload your docs once. A customer can ask in Japanese and get an answer from docs you wrote in English — no separate setup per language.",
  },
  {
    question: "Where does our data live?",
    answer:
      "On your own servers. You run Lyra with Docker or Railway, and your docs and your customers' questions stay there. We never get a copy, and nothing is used to train outside AI models.",
  },
  {
    question: "Will it make things up?",
    answer:
      "No. Every answer comes from your docs, and it shows the source. If your docs don't cover the question, Lyra says it doesn't have that information instead of guessing. An honest \"I don't know\" beats a confident wrong answer.",
  },
  {
    question: "How does billing work?",
    answer:
      "Free is free forever, with a daily limit. Pro is a monthly plan through Dodo Payments. The moment you pay, your account upgrades and the higher limits kick in. Cancel anytime and you drop back to Free at the end of the month.",
  },
  {
    question: "Which AI model does it use?",
    answer:
      "Any model with an OpenAI-style API — you choose. Run a local model on your machine while testing, then point it at a hosted provider in production. Nothing in the code changes; you just swap a setting.",
  },
  {
    question: "How hard is it to set up?",
    answer:
      "Not hard. Locally, copy the example settings and run two commands. For production, deploy on Railway and the database sets itself up on release. Most teams are answering real questions the same afternoon.",
  },
];

export function FAQ() {
  const ref = useScrollReveal<HTMLDivElement>();
  return (
    <section
      id="faq"
      className="scroll-mt-20 border-y border-ink/5 bg-white/40 py-20 dark:border-paper/5 dark:bg-white/[0.02] sm:py-28"
    >
      <Container>
        <div ref={ref} className="mx-auto max-w-3xl">
          <div className="text-center">
            <h2 className="font-display text-3xl font-semibold tracking-tight text-ink dark:text-paper sm:text-4xl">
              Frequently asked questions
            </h2>
            <p className="mt-4 text-lg text-ink-soft dark:text-paper/70">
              Everything you need to know before you deploy.
            </p>
          </div>
          <div className="mt-10">
            <Accordion items={faqs} />
          </div>
        </div>
      </Container>
    </section>
  );
}
