import { Crown, Sparkles } from 'lucide-react';
import { ScrollReveal } from '@/components/ScrollReveal';

const proFeatures = [
  "Unlimited challenges",
  "Custom themes & styles",
  "Advanced analytics",
  "Priority chain placement",
  "Exclusive badges",
  "No ads, ever",
];

export const ProTeaserSection = () => {
  return (
    <section className="py-24 px-4">
      <div className="container max-w-4xl mx-auto">
        <ScrollReveal>
          <div className="relative rounded-[32px] bg-foreground p-8 md:p-12 overflow-hidden">
            {/* Background decoration */}
            <div className="absolute top-0 right-0 w-72 h-72 bg-primary/20 rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 w-56 h-56 bg-accent/20 rounded-full blur-3xl" />
            
            <div className="relative z-10 flex flex-col md:flex-row items-center gap-10">
              {/* Content */}
              <div className="flex-1 text-center md:text-left">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/20 mb-6">
                  <Crown className="w-4 h-4 text-primary" />
                  <span className="text-sm font-semibold text-primary">One Cap! Pro</span>
                </div>
                
                <h2 className="font-display text-2xl sm:text-3xl md:text-4xl font-bold text-background mb-4">
                  Go Pro. Cap harder.
                </h2>
                
                <p className="text-background/70 mb-8 max-w-md">
                  Unlock premium features to become the ultimate cap master. 
                  Create more, customize everything, dominate the leaderboards.
                </p>

                {/* Feature list */}
                <div className="grid grid-cols-2 gap-3">
                  {proFeatures.map((feature, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-primary" />
                      <span className="text-sm text-background/80">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Pro badge visual */}
              <div className="relative">
                <div className="w-40 h-40 md:w-52 md:h-52 rounded-3xl bg-gradient-primary shadow-glow flex flex-col items-center justify-center text-primary-foreground">
                  <Crown className="w-12 h-12 md:w-16 md:h-16 mb-2" />
                  <span className="font-display text-xl md:text-2xl font-bold">PRO</span>
                  <span className="text-xs opacity-80 mt-1">Coming Soon</span>
                </div>
                {/* Floating elements */}
                <div className="absolute -top-4 -right-4 w-10 h-10 rounded-full bg-accent flex items-center justify-center animate-bounce-subtle">
                  <span className="text-lg">✨</span>
                </div>
                <div className="absolute -bottom-2 -left-4 w-8 h-8 rounded-full bg-background flex items-center justify-center animate-float">
                  <span className="text-sm">🧢</span>
                </div>
              </div>
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
};
