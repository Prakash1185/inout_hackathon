export interface Coordinate {
  latitude: number;
  longitude: number;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  xp: number;
  level: number;
  streak: number;
  badges: string[];
  createdAt: string;
  nextLevelXp?: number;
}

export interface EventSummary {
  id: string;
  name: string;
  location: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
}

export interface ActivityItem {
  id: string;
  userId: string;
  coordinates: Coordinate[];
  distance: number;
  areaCaptured: number;
  xpEarned: number;
  eventId: string;
  createdAt: string;
}

export interface LeaderboardEntry {
  rank: number;
  userId: string;
  name: string;
  xp?: number;
  level?: number;
  streak?: number;
  badges?: string[];
  totalAreaCaptured?: number;
  totalDistance?: number;
  totalXp?: number;
}

export interface LeaderboardResponse {
  type: "global" | "event";
  eventId?: string;
  rankings: LeaderboardEntry[];
}

export interface AuthResponse {
  token: string;
  user: UserProfile;
}
