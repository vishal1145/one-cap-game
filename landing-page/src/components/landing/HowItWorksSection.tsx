import { Lightbulb, Send, Users } from 'lucide-react';
import { ScrollReveal } from '@/components/ScrollReveal';

const steps = [
  {
    icon: Lightbulb,
    number: "01",
    title: "Write 3 Statements",
    description: "Two truths and one lie. Make it interesting.",
  },
  {
    icon: Send,
    number: "02",
    title: "Share the Link",
    description: "Send to friends via WhatsApp, Stories, or DM.",
  },
  {
    icon: Users,
    number: "03",
    title: "Watch Them Guess",
    description: "See who knows you best. Reveal the cap.",
  },
];

export const HowItWorksSection = () => {
  return (
    <section id="how-it-works" className="py-24 px-4 bg-gradient-subtle">
      <div className="container max-w-5xl mx-auto">
        {/* Section header */}
        <ScrollReveal>
          <div className="text-center mb-16">
            <span className="text-primary font-semibold text-sm uppercase tracking-wider">
              How It Works
            </span>
            <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold mt-4 mb-6">
              Three steps to <span className="text-gradient">viral.</span>
            </h2>
            <p className="text-muted-foreground max-w-lg mx-auto">
              Create your challenge in seconds. Share with friends. Start a chain.
            </p>
          </div>
        </ScrollReveal>

        {/* Steps */}
        <div className="grid md:grid-cols-3 gap-8">
          {steps.map((step, index) => (
            <ScrollReveal key={index} delay={index * 0.15}>
              <div 
                className="group relative p-8 rounded-3xl bg-card shadow-card hover:shadow-elevated transition-all duration-300 hover:-translate-y-2 h-full"
              >
                {/* Step number */}
                <span className="absolute -top-4 -right-4 w-12 h-12 rounded-2xl bg-gradient-primary text-primary-foreground flex items-center justify-center font-bold text-sm shadow-soft">
                  {step.number}
                </span>
                
                {/* Icon */}
                <div className="w-14 h-14 rounded-2xl bg-secondary flex items-center justify-center mb-6 group-hover:bg-primary group-hover:text-primary-foreground transition-colors duration-300">
                  <step.icon className="w-6 h-6" />
                </div>

                {/* Content */}
                <h3 className="font-display text-xl font-bold mb-3">
                  {step.title}
                </h3>
                <p className="text-muted-foreground">
                  {step.description}
                </p>

                {/* Connector line (except last) */}
                {index < 2 && (
                  <div className="hidden md:block absolute top-1/2 -right-4 w-8 h-0.5 bg-border" />
                )}
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
};
