export interface UpdateItem {
  id: string;
  title: string;
  summary: string;
  content: string;
  category: "Training" | "Nutrition" | "Recovery" | "Events";
  source: string;
  publishedAt: string;
  imageUrl: string;
}

export const updatesFeed: UpdateItem[] = [
  {
    id: "upd-hydration-basics",
    title: "Hydration Timing for Better Workout Output",
    summary:
      "Simple hydration timing before and after workouts can improve consistency and reduce early fatigue.",
    content:
      "Hydration affects power output, concentration, and recovery quality. For most people, starting with 300 to 500 ml of water 30 to 45 minutes before training helps maintain performance. After training, replace fluids steadily over the next 2 to 3 hours instead of all at once. If your session is long or outdoors, add electrolytes.",
    category: "Recovery",
    source: "InOut Coach Desk",
    publishedAt: "Today, 8:45 AM",
    imageUrl:
      "https://images.unsplash.com/photo-1600271886742-f049cd451bba?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: "upd-strength-progression",
    title: "Progressive Overload: Small Weekly Wins",
    summary:
      "You do not need big jumps. Add reps, sets, or control tempo to keep progressing safely.",
    content:
      "Progressive overload is about gradual challenge. Increase one variable at a time: 1 to 2 reps, a little load, or better form quality. Keep your technique stable and track sessions to avoid guesswork. Small, repeatable progress beats aggressive spikes that disrupt recovery.",
    category: "Training",
    source: "InOut Training Lab",
    publishedAt: "Yesterday, 7:30 PM",
    imageUrl:
      "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: "upd-protein-checklist",
    title: "Daily Protein Checklist for Busy Schedules",
    summary:
      "A practical way to spread protein intake across the day without overcomplicating meals.",
    content:
      "Aim for balanced distribution across main meals and one snack if needed. Build each meal around one core source: dairy, eggs, legumes, tofu, fish, or lean meats. Consistent intake supports recovery and muscle retention more than occasional high-protein days.",
    category: "Nutrition",
    source: "InOut Nutrition Notes",
    publishedAt: "2 days ago",
    imageUrl:
      "https://images.unsplash.com/photo-1490645935967-10de6ba17061?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: "upd-weekend-community-run",
    title: "Weekend Community Run Window Announced",
    summary:
      "Best participation expected between 6:30 AM and 8:00 AM in central zones.",
    content:
      "Community coordinators have marked the highest participation window for weekend runs between 6:30 AM and 8:00 AM. Join slots are now visible in Events. Early check-in is recommended for smoother warm-up groups and route pacing.",
    category: "Events",
    source: "InOut Community",
    publishedAt: "3 days ago",
    imageUrl:
      "https://images.unsplash.com/photo-1486218119243-13883505764c?auto=format&fit=crop&w=1200&q=80",
  },
];
