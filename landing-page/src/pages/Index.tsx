import { HeroSection } from '@/components/landing/HeroSection';
import { HowItWorksSection } from '@/components/landing/HowItWorksSection';
import { ViralitySection } from '@/components/landing/ViralitySection';
import { FeaturesSection } from '@/components/landing/FeaturesSection';
import { AppPreviewSection } from '@/components/landing/AppPreviewSection';
import { ProTeaserSection } from '@/components/landing/ProTeaserSection';
import { TestimonialsSection } from '@/components/landing/TestimonialsSection';
import { FAQSection } from '@/components/landing/FAQSection';
import { CTASection } from '@/components/landing/CTASection';
import { Footer } from '@/components/landing/Footer';
import { LiveSignups } from '@/components/landing/LiveSignups';
import { StickyHeader } from '@/components/landing/StickyHeader';

const Index = () => {
  return (
    <main className="min-h-screen bg-background overflow-x-hidden">
      <StickyHeader />
      <LiveSignups />
      <HeroSection />
      <HowItWorksSection />
      <ViralitySection />
      <FeaturesSection />
      <AppPreviewSection />
      <ProTeaserSection />
      <TestimonialsSection />
      <FAQSection />
      <CTASection />
      <Footer />
    </main>
  );
};

export default Index;
