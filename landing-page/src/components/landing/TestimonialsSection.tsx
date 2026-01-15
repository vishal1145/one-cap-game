import { ScrollReveal } from "@/components/ScrollReveal";
import { Star } from "lucide-react";

const testimonials = [
  {
    name: "Jake M.",
    avatar: "JM",
    rating: 5,
    quote: "My group chat has never been more chaotic. We've been playing for 3 weeks straight and someone gets roasted every single day. 10/10.",
  },
  {
    name: "Priya S.",
    avatar: "PS",
    rating: 5,
    quote: "Finally a game that actually gets everyone in our friend group participating. Even the quiet ones can't resist voting.",
  },
  {
    name: "Marcus T.",
    avatar: "MT",
    rating: 5,
    quote: "The questions are absolutely unhinged in the best way. My friends and I are crying laughing every time results drop.",
  },
  {
    name: "Emma L.",
    avatar: "EL",
    rating: 4,
    quote: "Perfect for our long-distance friend group. Takes 30 seconds but keeps us connected and laughing all day.",
  },
  {
    name: "Chris D.",
    avatar: "CD",
    rating: 5,
    quote: "We started a work group and now HR is concerned. Best team bonding exercise ever. Worth it.",
  },
  {
    name: "Sofia R.",
    avatar: "SR",
    rating: 5,
    quote: "I've won 'most likely to ghost their own birthday party' three times now. I feel seen and attacked.",
  },
];

const StarRating = ({ rating }: { rating: number }) => (
  <div className="flex gap-1">
    {[...Array(5)].map((_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${
          i < rating ? "fill-primary text-primary" : "fill-muted text-muted"
        }`}
      />
    ))}
  </div>
);

export const TestimonialsSection = () => {
  return (
    <section className="py-24 px-6 bg-background">
      <div className="max-w-6xl mx-auto">
        <ScrollReveal>
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-display font-black mb-4">
              What Players Are Saying
            </h2>
            <p className="text-lg text-muted-foreground">
              Join thousands of friend groups already playing
            </p>
          </div>
        </ScrollReveal>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {testimonials.map((testimonial, index) => (
            <ScrollReveal key={index} delay={index * 0.1}>
              <div className="bg-card border border-border rounded-2xl p-6 h-full flex flex-col">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                    {testimonial.avatar}
                  </div>
                  <div>
                    <p className="font-semibold">{testimonial.name}</p>
                    <StarRating rating={testimonial.rating} />
                  </div>
                </div>
                <p className="text-muted-foreground flex-1">
                  "{testimonial.quote}"
                </p>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
};
