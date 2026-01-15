import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from '@/components/ThemeProvider';
import { cn } from '@/lib/utils';

export const StickyHeader = () => {
  const [isVisible, setIsVisible] = useState(false);
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    const handleScroll = () => {
      // Show header after scrolling 100px
      setIsVisible(window.scrollY > 100);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToCTA = () => {
    document.getElementById('cta')?.scrollIntoView({ behavior: 'smooth' });
  };

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
        isVisible
          ? "translate-y-0 opacity-100"
          : "-translate-y-full opacity-0 pointer-events-none"
      )}
    >
      <div className="mx-4 mt-4">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-3 rounded-2xl bg-background/80 backdrop-blur-xl border border-border/50 shadow-elevated">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <a href="/" className="flex items-center gap-2 group">
              <span className="text-2xl group-hover:animate-bounce-subtle">🧢</span>
              <span className="font-display text-lg font-bold">One Cap!</span>
            </a>

            {/* Right side */}
            <div className="flex items-center gap-3">
              {/* Theme toggle */}
              <button
                onClick={toggleTheme}
                className="w-9 h-9 rounded-full bg-secondary flex items-center justify-center hover:bg-secondary/80 transition-colors"
                aria-label="Toggle theme"
              >
                <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
              </button>

              {/* CTA Button */}
              <Button 
                onClick={scrollToCTA}
                variant="hero" 
                size="sm"
                className="hidden sm:flex"
              >
                Get Early Access
              </Button>
              <Button 
                onClick={scrollToCTA}
                variant="hero" 
                size="sm"
                className="sm:hidden"
              >
                Join
              </Button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
