export interface AppNotificationItem {
  id: string;
  title: string;
  description: string;
  timeLabel: string;
  category: "activity" | "event" | "leaderboard" | "system";
  unread?: boolean;
}

export const demoNotifications: AppNotificationItem[] = [
  {
    id: "notif-1",
    title: "Leaderboard update",
    description: "Rohan moved ahead of you in local territory rank.",
    timeLabel: "5 min ago",
    category: "leaderboard",
    unread: true,
  },
  {
    id: "notif-2",
    title: "Tonight's route looks clear",
    description: "AQI is moderate near your saved park loop for evening walks.",
    timeLabel: "18 min ago",
    category: "system",
    unread: true,
  },
  {
    id: "notif-3",
    title: "Event reminder",
    description: "Metro Fit Collective starts in 2 hours. Check in to join.",
    timeLabel: "1 hr ago",
    category: "event",
    unread: true,
  },
  {
    id: "notif-4",
    title: "Walk logged successfully",
    description: "Your last activity added 84 XP and extended your streak.",
    timeLabel: "Today",
    category: "activity",
  },
  {
    id: "notif-5",
    title: "Weekly summary ready",
    description: "You captured more territory this week than 68% of nearby users.",
    timeLabel: "Yesterday",
    category: "system",
  },
];
