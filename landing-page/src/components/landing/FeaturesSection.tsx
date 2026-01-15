import { Flame, Link, Smile, Trophy, Zap, Star } from 'lucide-react';
import { ScrollReveal } from '@/components/ScrollReveal';

const features = [
  {
    icon: Flame,
    title: "Daily Streaks",
    description: "Keep your streak alive by playing every day. Don't break the chain.",
    emoji: "🔥",
  },
  {
    icon: Link,
    title: "Challenge Chains",
    description: "When friends guess, they create their own. Watch it spread.",
    emoji: "🔗",
  },
  {
    icon: Smile,
    title: "Live Reactions",
    description: "See real-time reactions as friends try to spot your lie.",
    emoji: "😂",
  },
  {
    icon: Trophy,
    title: "Leaderboards",
    description: "Who's the best lie detector? Who caps the hardest?",
    emoji: "🏆",
  },
  {
    icon: Zap,
    title: "Instant Play",
    description: "No signup needed to guess. Start playing in seconds.",
    emoji: "⚡",
  },
  {
    icon: Star,
    title: "Cap Collection",
    description: "Collect badges for your best caps and saves.",
    emoji: "🧢",
  },
];

export const FeaturesSection = () => {
  return (
    <section className="py-24 px-4 bg-gradient-subtle">
      <div className="container max-w-5xl mx-auto">
        {/* Section header */}
        <ScrollReveal>
          <div className="text-center mb-16">
            <span className="text-primary font-semibold text-sm uppercase tracking-wider">
              Addictive by Design
            </span>
            <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold mt-4 mb-6">
              Features that keep you <span className="text-gradient">coming back.</span>
            </h2>
          </div>
        </ScrollReveal>

        {/* Features grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <ScrollReveal key={index} delay={index * 0.1}>
              <div 
                className="group p-6 rounded-3xl bg-card shadow-soft hover:shadow-card transition-all duration-300 hover:-translate-y-1 border border-transparent hover:border-primary/20 h-full"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 rounded-2xl bg-secondary flex items-center justify-center group-hover:bg-gradient-primary transition-all duration-300">
                    <feature.icon className="w-5 h-5 group-hover:text-primary-foreground transition-colors" />
                  </div>
                  <span className="text-2xl">{feature.emoji}</span>
                </div>
                
                <h3 className="font-display text-lg font-bold mb-2">
                  {feature.title}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
};
