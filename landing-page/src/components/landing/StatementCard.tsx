import { cn } from '@/lib/utils';

interface StatementCardProps {
  text: string;
  isLie: boolean;
  isActive: boolean;
  index: number;
}

export const StatementCard = ({ text, isLie, isActive, index }: StatementCardProps) => {
  return (
    <div
      className={cn(
        "relative w-24 sm:w-32 md:w-40 aspect-[3/4] rounded-2xl transition-all duration-500 preserve-3d cursor-pointer",
        isActive ? "scale-110 z-10" : "scale-100 opacity-80",
        index === 0 && "-rotate-6",
        index === 2 && "rotate-6"
      )}
      style={{
        transform: isActive && isLie ? 'rotateY(180deg) scale(1.1)' : undefined,
        transformStyle: 'preserve-3d',
        transition: 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
      }}
    >
      {/* Front */}
      <div 
        className={cn(
          "absolute inset-0 rounded-2xl p-3 sm:p-4 flex flex-col justify-between backface-hidden shadow-card",
          "bg-gradient-to-br from-background to-secondary border-2 border-border"
        )}
      >
        <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-secondary flex items-center justify-center text-xs font-bold">
          {index + 1}
        </div>
        <p className="text-[10px] sm:text-xs font-medium leading-tight text-foreground">
          {text}
        </p>
        <div className="h-1 w-full bg-secondary rounded-full" />
      </div>

      {/* Back (revealed) */}
      <div 
        className={cn(
          "absolute inset-0 rounded-2xl p-3 sm:p-4 flex flex-col items-center justify-center backface-hidden rotate-y-180 shadow-elevated",
          "bg-gradient-primary text-primary-foreground"
        )}
      >
        <span className="text-2xl sm:text-4xl mb-2">🧢</span>
        <span className="text-xs sm:text-sm font-bold">CAP!</span>
      </div>
    </div>
  );
};
