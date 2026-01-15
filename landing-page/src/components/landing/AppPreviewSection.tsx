import { ScrollReveal } from '@/components/ScrollReveal';

export const AppPreviewSection = () => {
  return (
    <section className="py-24 px-4 overflow-hidden">
      <div className="container max-w-6xl mx-auto">
        {/* Section header */}
        <ScrollReveal>
          <div className="text-center mb-16">
            <span className="text-primary font-semibold text-sm uppercase tracking-wider">
              Sneak Peek
            </span>
            <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold mt-4 mb-6">
              Beautiful. <span className="text-gradient">Addictive.</span>
            </h2>
          </div>
        </ScrollReveal>

        {/* App screens */}
        <ScrollReveal delay={0.2}>
          <div className="flex justify-center items-end gap-4 md:gap-8 perspective-1000">
            {/* Screen 1 - Create */}
          <div className="relative w-[140px] sm:w-[180px] md:w-[220px] -rotate-6 hover:rotate-0 transition-transform duration-500">
            <div className="aspect-[9/19] rounded-[24px] sm:rounded-[32px] bg-foreground p-2 shadow-elevated">
              <div className="h-full rounded-[20px] sm:rounded-[28px] bg-background overflow-hidden flex flex-col">
                {/* Status bar mock */}
                <div className="flex justify-between items-center px-4 py-2 text-[8px] font-medium text-muted-foreground">
                  <span>9:41</span>
                  <div className="flex gap-1">
                    <div className="w-3 h-2 bg-foreground rounded-sm" />
                  </div>
                </div>
                
                {/* Content */}
                <div className="flex-1 p-3 flex flex-col">
                  <h4 className="font-display text-[10px] sm:text-xs font-bold mb-3">Create Your Cap</h4>
                  
                  {/* Statement inputs */}
                  <div className="space-y-2 flex-1">
                    {[1, 2, 3].map((num) => (
                      <div key={num} className="flex items-center gap-2">
                        <span className="w-4 h-4 rounded-full bg-secondary text-[8px] flex items-center justify-center font-bold">{num}</span>
                        <div className="flex-1 h-6 sm:h-8 bg-secondary rounded-lg" />
                      </div>
                    ))}
                  </div>
                  
                  {/* Select lie */}
                  <div className="mt-3 p-2 rounded-xl bg-primary/10 border border-primary/20">
                    <span className="text-[8px] font-medium text-primary">Tap your lie 🧢</span>
                  </div>
                  
                  {/* Share button */}
                  <div className="mt-3 h-8 sm:h-10 rounded-xl bg-gradient-primary flex items-center justify-center">
                    <span className="text-[8px] sm:text-[10px] font-bold text-primary-foreground">Share Challenge</span>
                  </div>
                </div>
              </div>
            </div>
            <span className="block mt-4 text-center text-xs font-semibold text-muted-foreground">Create</span>
          </div>

          {/* Screen 2 - Guess (center, larger) */}
          <div className="relative w-[160px] sm:w-[200px] md:w-[260px] z-10 hover:scale-105 transition-transform duration-500">
            <div className="aspect-[9/19] rounded-[28px] sm:rounded-[36px] bg-foreground p-2 shadow-elevated">
              <div className="h-full rounded-[24px] sm:rounded-[32px] bg-background overflow-hidden flex flex-col">
                {/* Status bar mock */}
                <div className="flex justify-between items-center px-4 py-2 text-[8px] font-medium text-muted-foreground">
                  <span>9:41</span>
                  <div className="flex gap-1">
                    <div className="w-3 h-2 bg-foreground rounded-sm" />
                  </div>
                </div>
                
                {/* Content */}
                <div className="flex-1 p-4 flex flex-col">
                  {/* User info */}
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-8 h-8 rounded-full bg-gradient-primary flex items-center justify-center text-sm">😎</div>
                    <div>
                      <p className="text-[10px] font-bold">@alex_cap</p>
                      <p className="text-[8px] text-muted-foreground">Can you spot my lie?</p>
                    </div>
                  </div>
                  
                  {/* Statements */}
                  <div className="space-y-2 flex-1">
                    {[
                      "I've been skydiving 🪂",
                      "I speak 3 languages 🌍", 
                      "I met Drake once 🎤"
                    ].map((text, i) => (
                      <button 
                        key={i}
                        className="w-full p-2 sm:p-3 rounded-xl bg-secondary hover:bg-primary hover:text-primary-foreground transition-colors text-left text-[8px] sm:text-[10px] font-medium"
                      >
                        {text}
                      </button>
                    ))}
                  </div>
                  
                  <p className="text-center text-[8px] text-muted-foreground mt-2">
                    Tap the lie to guess
                  </p>
                </div>
              </div>
            </div>
            <span className="block mt-4 text-center text-xs font-semibold text-foreground">Guess</span>
          </div>

          {/* Screen 3 - Reveal */}
          <div className="relative w-[140px] sm:w-[180px] md:w-[220px] rotate-6 hover:rotate-0 transition-transform duration-500">
            <div className="aspect-[9/19] rounded-[24px] sm:rounded-[32px] bg-foreground p-2 shadow-elevated">
              <div className="h-full rounded-[20px] sm:rounded-[28px] bg-background overflow-hidden flex flex-col">
                {/* Status bar mock */}
                <div className="flex justify-between items-center px-4 py-2 text-[8px] font-medium text-muted-foreground">
                  <span>9:41</span>
                  <div className="flex gap-1">
                    <div className="w-3 h-2 bg-foreground rounded-sm" />
                  </div>
                </div>
                
                {/* Content */}
                <div className="flex-1 p-3 flex flex-col items-center justify-center text-center">
                  {/* Result emoji */}
                  <div className="w-16 h-16 rounded-full bg-gradient-primary flex items-center justify-center mb-3 shadow-glow">
                    <span className="text-3xl">🧢</span>
                  </div>
                  
                  <h4 className="font-display text-sm font-bold mb-1">CAP!</h4>
                  <p className="text-[8px] text-muted-foreground mb-4">
                    "I met Drake once" was the lie!
                  </p>
                  
                  {/* Stats */}
                  <div className="flex gap-4 mb-4">
                    <div className="text-center">
                      <span className="text-sm font-bold">73%</span>
                      <p className="text-[8px] text-muted-foreground">Got it</p>
                    </div>
                    <div className="text-center">
                      <span className="text-sm font-bold">156</span>
                      <p className="text-[8px] text-muted-foreground">Guesses</p>
                    </div>
                  </div>
                  
                  {/* Chain CTA */}
                  <div className="w-full h-8 rounded-xl bg-gradient-primary flex items-center justify-center">
                    <span className="text-[8px] font-bold text-primary-foreground">Create Your Own →</span>
                  </div>
                </div>
              </div>
            </div>
            <span className="block mt-4 text-center text-xs font-semibold text-muted-foreground">Reveal</span>
          </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
};
