import { ScrollReveal } from "@/components/ScrollReveal";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  {
    question: "What is One Cap?",
    answer: "One Cap is a daily cap-guessing game where you and your friends vote on who in the group is most likely to do something wild. Think 'Most Likely To' meets viral party games—one question per day, endless laughs.",
  },
  {
    question: "How do I play?",
    answer: "Each day, you'll get a new 'cap' question like 'Who's most likely to show up late to their own wedding?' Vote for the friend you think fits best, see the results, and roast accordingly. It takes 30 seconds but the group chat drama lasts all day.",
  },
  {
    question: "Is One Cap free?",
    answer: "Yes! The core game is completely free. Play daily questions, create groups, and compete on leaderboards without paying a cent. We'll have optional Pro features coming soon for the truly dedicated cap enthusiasts.",
  },
  {
    question: "How many friends can join a group?",
    answer: "Groups can have 3 to 50 players. Small enough to stay personal, big enough to cause chaos. Most groups find the sweet spot around 8-15 friends.",
  },
  {
    question: "When do new questions drop?",
    answer: "Fresh caps drop daily at midnight in your timezone. You have 24 hours to vote before results are revealed. Miss a day? No worries—jump back in tomorrow.",
  },
  {
    question: "Can I create custom questions?",
    answer: "Coming soon! Pro users will be able to submit custom caps for their groups. For now, our team crafts each daily question to maximize the roasting potential.",
  },
];

export const FAQSection = () => {
  return (
    <section className="py-24 px-6 bg-muted/30">
      <div className="max-w-3xl mx-auto">
        <ScrollReveal>
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-display font-black mb-4">
              Got Questions?
            </h2>
            <p className="text-lg text-muted-foreground">
              Everything you need to know about the game
            </p>
          </div>
        </ScrollReveal>

        <ScrollReveal delay={0.1}>
          <Accordion type="single" collapsible className="space-y-4">
            {faqs.map((faq, index) => (
              <AccordionItem
                key={index}
                value={`item-${index}`}
                className="bg-card border border-border rounded-2xl px-6 overflow-hidden"
              >
                <AccordionTrigger className="text-left font-semibold text-lg hover:no-underline py-6">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground pb-6">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </ScrollReveal>
      </div>
    </section>
  );
};
