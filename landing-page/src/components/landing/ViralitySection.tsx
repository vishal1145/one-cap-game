import { MessageCircle, Instagram, Video, MessageSquare, ArrowRight } from 'lucide-react';
import { ScrollReveal } from '@/components/ScrollReveal';

const platforms = [
  { icon: MessageCircle, name: "WhatsApp", color: "bg-green-500" },
  { icon: Instagram, name: "Instagram", color: "bg-gradient-to-br from-purple-500 via-pink-500 to-orange-400" },
  { icon: Video, name: "TikTok", color: "bg-foreground" },
  { icon: MessageSquare, name: "SMS", color: "bg-blue-500" },
];

export const ViralitySection = () => {
  return (
    <section className="py-24 px-4 overflow-hidden">
      <div className="container max-w-5xl mx-auto">
        {/* Section header */}
        <ScrollReveal>
          <div className="text-center mb-16">
            <span className="text-primary font-semibold text-sm uppercase tracking-wider">
              Built to Spread
            </span>
            <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold mt-4 mb-6">
              One link. <span className="text-gradient">Infinite chains.</span>
            </h2>
            <p className="text-muted-foreground max-w-lg mx-auto">
              Every guess creates a new challenge. Friends challenge friends. 
              Watch it spread like wildfire.
            </p>
          </div>
        </ScrollReveal>

        {/* Viral flow diagram */}
        <div className="relative flex flex-col items-center">
          {/* Center user */}
          <ScrollReveal>
            <div className="relative z-10 w-20 h-20 rounded-full bg-gradient-primary shadow-glow flex items-center justify-center mb-8">
              <span className="text-3xl">😎</span>
            </div>
          </ScrollReveal>

          {/* "Creates challenge" label */}
          <ScrollReveal delay={0.1}>
            <div className="flex items-center gap-2 mb-8 text-sm font-medium text-muted-foreground">
              <span>Creates a challenge</span>
              <ArrowRight className="w-4 h-4" />
            </div>
          </ScrollReveal>

          {/* Platform spread */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 w-full max-w-2xl">
            {platforms.map((platform, index) => (
              <ScrollReveal key={index} delay={0.2 + index * 0.1}>
                <div 
                  className="group flex flex-col items-center gap-4 p-6 rounded-3xl bg-card shadow-soft hover:shadow-card transition-all duration-300 hover:-translate-y-1"
                >
                  <div className={`w-14 h-14 rounded-2xl ${platform.color} flex items-center justify-center shadow-soft group-hover:scale-110 transition-transform duration-300`}>
                    <platform.icon className="w-6 h-6 text-primary-foreground" />
                  </div>
                  <span className="font-semibold text-sm">{platform.name}</span>
                  
                  {/* Mini chain indicator */}
                  <div className="flex items-center gap-1">
                    <span className="text-xs text-muted-foreground">→</span>
                    <div className="flex -space-x-2">
                      {[...Array(3)].map((_, i) => (
                        <div key={i} className="w-5 h-5 rounded-full bg-secondary border-2 border-card flex items-center justify-center text-[8px]">
                          {['🤔', '😮', '🎯'][i]}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>

          {/* Chain continuation */}
          <ScrollReveal delay={0.6}>
            <div className="mt-12 text-center">
              <div className="inline-flex items-center gap-3 px-6 py-3 rounded-full bg-secondary">
                <span className="text-2xl">🔗</span>
                <span className="font-semibold">Each friend creates their own challenge</span>
                <span className="text-2xl">🔥</span>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
};
