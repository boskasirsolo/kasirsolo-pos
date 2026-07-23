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

import { ErrorBoundary } from '@/components/ErrorBoundary';

const sectionConfig = [
  { key: 'header', title: 'Header Navigasi' },
  { key: 'hero', title: 'Hero Section' },
  { key: 'trust', title: 'Trust Strip' },
  { key: 'problem-solution', title: 'Problem & Solution' },
  { key: 'app-catalog', title: 'App Catalog' },
  { key: 'how-it-works', title: 'Cara Kerja' },
  { key: 'features', title: 'Fitur Lengkap' },
  { key: 'pricing', title: 'Harga' },
  { key: 'testimonials', title: 'Testimoni Pengguna' },
  { key: 'trial-form', title: 'Form Trial Gratis' },
  { key: 'faq', title: 'FAQ' },
  { key: 'cta', title: 'Final Call to Action' },
];

const sectionTitles: Record<string, string> = Object.fromEntries(
  sectionConfig.map(({ key, title }) => [key, title])
);

function SectionErrorBoundary({ children, keyName }: { children: React.ReactNode; keyName: string }) {
  return (
    <ErrorBoundary
      title={sectionTitles[keyName] || 'Section'}
      message="Wah, ada masalah teknis di bagian ini. Coba refresh halaman biar muncul lagi!"
      replayLabel="Refresh"
    >
      {children}
    </ErrorBoundary>
  );
}

export default function LandingPage() {
  return (
    <>
      <SectionErrorBoundary keyName="header">
        <Header />
      </SectionErrorBoundary>
      <main>
        <SectionErrorBoundary keyName="hero">
          <HeroSection />
        </SectionErrorBoundary>
        <SectionErrorBoundary keyName="trust">
          <TrustStrip />
        </SectionErrorBoundary>
        <SectionErrorBoundary keyName="problem-solution">
          <ProblemSolution />
        </SectionErrorBoundary>
        <SectionErrorBoundary keyName="app-catalog">
          <AppGrid />
        </SectionErrorBoundary>
        <SectionErrorBoundary keyName="how-it-works">
          <HowItWorks />
        </SectionErrorBoundary>
        <SectionErrorBoundary keyName="features">
          <FeaturesSection />
        </SectionErrorBoundary>
        <SectionErrorBoundary keyName="pricing">
          <PricingSection />
        </SectionErrorBoundary>
        <SectionErrorBoundary keyName="testimonials">
          <TestimonialsSection />
        </SectionErrorBoundary>
        <SectionErrorBoundary keyName="trial-form">
          <TrialForm />
        </SectionErrorBoundary>
        <SectionErrorBoundary keyName="faq">
          <FaqSection />
        </SectionErrorBoundary>
        <SectionErrorBoundary keyName="cta">
          <FinalCta />
        </SectionErrorBoundary>
      </main>
      <SectionErrorBoundary keyName="footer">
        <Footer />
      </SectionErrorBoundary>
      <WaFloat />
      <MobileCta />
    </>
  );
}
