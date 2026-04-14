import type { UserDocument } from "../models/User";

const XP_PER_KM = 35;
const XP_PER_100_SQ_METERS = 6;

export function computeXp(distanceKm: number, areaSqMeters: number): number {
  const distanceXp = distanceKm * XP_PER_KM;
  const areaXp = (areaSqMeters / 100) * XP_PER_100_SQ_METERS;
  return Math.max(0, Math.round(distanceXp + areaXp));
}

export function computeLevelFromXp(xp: number): number {
  return Math.max(1, Math.floor(Math.sqrt(xp / 100)) + 1);
}

export function nextLevelXpThreshold(level: number): number {
  return Math.pow(level, 2) * 100;
}

export function updateDailyStreak(
  user: Pick<UserDocument, "streak" | "lastActivityDate">,
): number {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  if (!user.lastActivityDate) {
    return 1;
  }

  const last = new Date(user.lastActivityDate);
  const lastDay = new Date(last.getFullYear(), last.getMonth(), last.getDate());
  const diffDays = Math.round(
    (today.getTime() - lastDay.getTime()) / (1000 * 60 * 60 * 24),
  );

  if (diffDays <= 0) {
    return user.streak;
  }

  if (diffDays === 1) {
    return user.streak + 1;
  }

  return 1;
}
