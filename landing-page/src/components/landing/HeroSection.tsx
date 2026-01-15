import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowDown } from 'lucide-react';
import { StatementCard } from './StatementCard';

export const HeroSection = () => {
  const [activeCard, setActiveCard] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveCard((prev) => (prev + 1) % 3);
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  const statements = [
    { text: "I've never been on a plane ✈️", isLie: false },
    { text: "I once met Beyoncé 👑", isLie: true },
    { text: "I can solve a Rubik's cube 🧩", isLie: false },
  ];

  const scrollToDemo = () => {
    document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center px-4 py-20 overflow-hidden">
      {/* Background decorations */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl animate-pulse-soft" />
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-accent/10 rounded-full blur-3xl animate-pulse-soft" />
      
      <div className="container relative z-10 max-w-4xl mx-auto text-center">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary mb-8 animate-fade-in">
          <span className="w-2 h-2 bg-primary rounded-full animate-pulse" />
          <span className="text-sm font-medium text-muted-foreground">Coming Soon</span>
        </div>

        {/* Main headline */}
        <h1 className="font-display text-4xl sm:text-5xl md:text-7xl font-extrabold leading-tight mb-6 animate-slide-up">
          One of these is a{' '}
          <span className="text-gradient">lie.</span>
          <br />
          <span className="text-muted-foreground/60">Can your friends spot the</span>{' '}
          <span className="text-gradient">Cap?</span>
        </h1>

        {/* Subheadline */}
        <p className="text-lg sm:text-xl text-muted-foreground max-w-xl mx-auto mb-10 animate-slide-up" style={{ animationDelay: '0.1s' }}>
          The viral social game where you share truths, hide lies, and challenge your friends to guess which is which.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16 animate-slide-up" style={{ animationDelay: '0.2s' }}>
          <Button variant="hero" size="xl" onClick={() => document.getElementById('cta')?.scrollIntoView({ behavior: 'smooth' })}>
            Get Early Access
          </Button>
          <Button variant="hero-outline" size="lg" onClick={scrollToDemo}>
            See How It Works
          </Button>
        </div>

        {/* Animated Demo Cards */}
        <div className="relative flex justify-center items-center gap-4 sm:gap-6 perspective-1000 mb-12">
          {statements.map((statement, index) => (
            <StatementCard
              key={index}
              text={statement.text}
              isLie={statement.isLie}
              isActive={activeCard === index}
              index={index}
            />
          ))}
        </div>

        {/* Hint text */}
        <p className="text-sm text-muted-foreground animate-bounce-subtle">
          👆 One of these is capping
        </p>
      </div>

      {/* Scroll indicator */}
      <button 
        onClick={scrollToDemo}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-muted-foreground hover:text-primary transition-colors cursor-pointer"
      >
        <span className="text-xs font-medium">Scroll</span>
        <ArrowDown className="w-5 h-5 animate-bounce" />
      </button>
    </section>
  );
};
