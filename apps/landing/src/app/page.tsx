import { Header } from '@/features/header/ui/Header';
import { HeroSection } from '@/features/hero/ui/HeroSection';
import { TrustStrip } from '@/features/trust/ui/TrustStrip';
import { ProblemSolution } from '@/features/problem-solution/ui/ProblemSolution';
import { AppGrid } from '@/features/app-catalog/ui/AppGrid';
import { HowItWorks } from '@/features/how-it-works/ui/HowItWorks';
import { FeaturesSection } from '@/features/features/ui/FeaturesSection';
import { PricingSection } from '@/features/pricing/ui/PricingSection';
import { TestimonialsSection } from '@/features/testimonials/ui/TestimonialsSection';
import { TrialForm } from '@/features/trial-form/ui/TrialForm';
import { FaqSection } from '@/features/faq/ui/FaqSection';
import { FinalCta } from '@/features/cta/ui/FinalCta';
import { Footer } from '@/features/footer/ui/Footer';
import { WaFloat } from '@/features/floating/ui/WaFloat';
import { MobileCta } from '@/features/floating/ui/MobileCta';

export default function LandingPage() {
  return (
    <>
      <Header />
      <main>
        <HeroSection />
        <TrustStrip />
        <ProblemSolution />
        <AppGrid />
        <HowItWorks />
        <FeaturesSection />
        <PricingSection />
        <TestimonialsSection />
        <TrialForm />
        <FaqSection />
        <FinalCta />
      </main>
      <Footer />
      <WaFloat />
      <MobileCta />
    </>
  );
}
