import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowRight, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { ScrollReveal } from '@/components/ScrollReveal';

export const CTASection = () => {
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const trimmedEmail = email.trim().toLowerCase();
    
    if (!trimmedEmail) {
      toast.error('Please enter your email');
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedEmail)) {
      toast.error('Please enter a valid email');
      return;
    }

    if (trimmedEmail.length > 255) {
      toast.error('Email is too long');
      return;
    }

    setIsLoading(true);
    
    try {
      const { error } = await supabase
        .from('waitlist')
        .insert({ email: trimmedEmail });

      if (error) {
        if (error.code === '23505') {
          // Unique constraint violation - email already exists
          toast.error("You're already on the list!");
        } else {
          throw error;
        }
        setIsLoading(false);
        return;
      }

      setIsLoading(false);
      setIsSubmitted(true);
      toast.success("You're on the list! 🎉");
    } catch (error) {
      console.error('Waitlist signup error:', error);
      toast.error('Something went wrong. Please try again.');
      setIsLoading(false);
    }
  };

  return (
    <section id="cta" className="py-24 px-4">
      <div className="container max-w-2xl mx-auto text-center">
        <ScrollReveal>
          {/* Emoji decoration */}
          <div className="flex justify-center items-center gap-4 mb-8">
            <span className="text-4xl animate-bounce-subtle" style={{ animationDelay: '0s' }}>🧢</span>
            <span className="text-5xl animate-bounce-subtle" style={{ animationDelay: '0.2s' }}>🎯</span>
            <span className="text-4xl animate-bounce-subtle" style={{ animationDelay: '0.4s' }}>🔥</span>
          </div>

          <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold mb-4">
            Ready to spot the <span className="text-gradient">Cap?</span>
          </h2>
          
          <p className="text-lg text-muted-foreground mb-10 max-w-md mx-auto">
            Join early. Play with friends first. Be part of the viral wave.
          </p>
        </ScrollReveal>

        {!isSubmitted ? (
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
            <Input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="flex-1 h-14 text-base"
              disabled={isLoading}
            />
            <Button 
              type="submit" 
              variant="hero" 
              size="lg"
              disabled={isLoading}
              className="group"
            >
              {isLoading ? (
                <span className="animate-pulse">Joining...</span>
              ) : (
                <>
                  Get Early Access
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </Button>
          </form>
        ) : (
          <div className="flex flex-col items-center gap-4 p-8 rounded-3xl bg-secondary animate-scale-in">
            <CheckCircle className="w-16 h-16 text-primary" />
            <h3 className="font-display text-2xl font-bold">You're in! 🎉</h3>
            <p className="text-muted-foreground">
              We'll let you know when it's time to cap.
            </p>
          </div>
        )}

        {/* Social proof */}
        <div className="mt-12 flex flex-col items-center gap-4">
          <div className="flex -space-x-3">
            {['😎', '🤩', '😜', '🥳', '🔥'].map((emoji, i) => (
              <div 
                key={i}
                className="w-10 h-10 rounded-full bg-secondary border-2 border-background flex items-center justify-center text-lg"
              >
                {emoji}
              </div>
            ))}
          </div>
          <p className="text-sm text-muted-foreground">
            Join <span className="font-semibold text-foreground">2,847</span> others on the waitlist
          </p>
        </div>
      </div>
    </section>
  );
};
