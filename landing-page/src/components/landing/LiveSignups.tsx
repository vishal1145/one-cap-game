import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';

const firstNames = [
  'Emma', 'Liam', 'Olivia', 'Noah', 'Ava', 'Ethan', 'Sophia', 'Mason',
  'Isabella', 'William', 'Mia', 'James', 'Charlotte', 'Benjamin', 'Amelia',
  'Lucas', 'Harper', 'Henry', 'Evelyn', 'Alexander', 'Luna', 'Sebastian',
  'Gianna', 'Jack', 'Aria', 'Daniel', 'Ella', 'Michael', 'Chloe', 'Owen'
];

const locations = [
  'New York', 'Los Angeles', 'London', 'Toronto', 'Sydney', 'Miami',
  'Chicago', 'Berlin', 'Paris', 'Tokyo', 'Dubai', 'Singapore', 'Austin',
  'Seattle', 'Denver', 'Atlanta', 'Boston', 'Vancouver', 'Melbourne', 'Lagos',
  'Mumbai', 'São Paulo', 'Amsterdam', 'Stockholm', 'Barcelona', 'Dublin'
];

const emojis = ['🔥', '🎯', '⚡', '🚀', '✨', '🎉', '👀', '💯'];

interface Notification {
  id: number;
  name: string;
  location: string;
  emoji: string;
  visible: boolean;
}

export const LiveSignups = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [counter, setCounter] = useState(0);

  useEffect(() => {
    // Initial delay before first notification
    const initialDelay = setTimeout(() => {
      addNotification();
    }, 3000);

    return () => clearTimeout(initialDelay);
  }, []);

  useEffect(() => {
    if (counter === 0) return;

    // Random interval between 4-8 seconds for next notification
    const interval = setTimeout(() => {
      addNotification();
    }, 4000 + Math.random() * 4000);

    return () => clearTimeout(interval);
  }, [counter]);

  const addNotification = () => {
    const newNotification: Notification = {
      id: Date.now(),
      name: firstNames[Math.floor(Math.random() * firstNames.length)],
      location: locations[Math.floor(Math.random() * locations.length)],
      emoji: emojis[Math.floor(Math.random() * emojis.length)],
      visible: true,
    };

    setNotifications(prev => [...prev.slice(-2), newNotification]);
    setCounter(c => c + 1);

    // Hide notification after 4 seconds
    setTimeout(() => {
      setNotifications(prev =>
        prev.map(n =>
          n.id === newNotification.id ? { ...n, visible: false } : n
        )
      );
    }, 4000);

    // Remove notification after animation
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== newNotification.id));
    }, 4500);
  };

  return (
    <div className="fixed bottom-4 left-4 z-50 flex flex-col gap-2 pointer-events-none">
      {notifications.map((notification) => (
        <div
          key={notification.id}
          className={cn(
            "flex items-center gap-3 px-4 py-3 rounded-2xl bg-card shadow-elevated border border-border/50 backdrop-blur-sm transition-all duration-500 pointer-events-auto",
            notification.visible
              ? "opacity-100 translate-x-0"
              : "opacity-0 -translate-x-4"
          )}
        >
          {/* Avatar */}
          <div className="w-10 h-10 rounded-full bg-gradient-primary flex items-center justify-center text-primary-foreground font-bold text-sm shadow-soft">
            {notification.name.charAt(0)}
          </div>

          {/* Content */}
          <div className="flex flex-col">
            <p className="text-sm font-semibold text-foreground">
              {notification.name} from {notification.location}
            </p>
            <p className="text-xs text-muted-foreground">
              just joined the waitlist {notification.emoji}
            </p>
          </div>

          {/* Time badge */}
          <div className="ml-2 px-2 py-1 rounded-full bg-secondary text-[10px] font-medium text-muted-foreground">
            now
          </div>
        </div>
      ))}
    </div>
  );
};
