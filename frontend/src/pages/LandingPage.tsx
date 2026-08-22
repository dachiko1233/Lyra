import { CTA } from "../components/landing/CTA";
import { FAQ } from "../components/landing/FAQ";
import { Features } from "../components/landing/Features";
import { Footer } from "../components/landing/Footer";
import { Hero } from "../components/landing/Hero";
import { HowItWorks } from "../components/landing/HowItWorks";
import { Logos } from "../components/landing/Logos";
import { Nav } from "../components/landing/Nav";
import { Pricing } from "../components/landing/Pricing";

export function LandingPage() {
  return (
    <div className="min-h-screen bg-paper text-ink dark:bg-ink dark:text-paper">
      <Nav />
      <main>
        <Hero />
        <Logos />
        <Features />
        <HowItWorks />
        <Pricing />
        <FAQ />
        <CTA />
      </main>
      <Footer />
    </div>
  );
}
