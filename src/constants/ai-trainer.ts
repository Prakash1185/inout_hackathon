import type { UserProfile } from "@/shared/types";

export type MuscleTarget =
  | "Full Body"
  | "Chest"
  | "Back"
  | "Legs"
  | "Core"
  | "Shoulders"
  | "Arms";

export type TrainerIconName =
  | "barbell-outline"
  | "body-outline"
  | "fitness-outline"
  | "walk-outline"
  | "flame-outline"
  | "speedometer-outline"
  | "shield-checkmark-outline";

export interface ExerciseTemplate {
  id: string;
  title: string;
  primaryTarget: MuscleTarget;
  targets: MuscleTarget[];
  difficulty: "Beginner" | "Intermediate";
  defaultSets: number;
  defaultReps: number;
  restSec: number;
  equipment: string;
  tempo: string;
  xpBase: number;
  icon: TrainerIconName;
  description: string;
  instructions: string[];
}

export interface GeneratedExercise {
  planId: string;
  exerciseId: string;
  title: string;
  primaryTarget: MuscleTarget;
  sets: number;
  reps: number;
  restSec: number;
  durationSec: number;
  xpReward: number;
  coachNote: string;
  icon: TrainerIconName;
  difficulty: ExerciseTemplate["difficulty"];
}

export interface TrainerFormInput {
  targetMuscle: MuscleTarget;
  minutes: number;
  repetitions: number;
  extraContext: string;
}

export const exerciseLibrary: ExerciseTemplate[] = [
  {
    id: "ex-push-lean",
    title: "Tempo Push-Up Ladder",
    primaryTarget: "Chest",
    targets: ["Chest", "Shoulders", "Arms"],
    difficulty: "Beginner",
    defaultSets: 3,
    defaultReps: 10,
    restSec: 40,
    equipment: "Bodyweight",
    tempo: "3-1-1",
    xpBase: 28,
    icon: "barbell-outline",
    description:
      "Controlled push-up pattern that improves chest activation and shoulder stability.",
    instructions: [
      "Set hands slightly wider than shoulder width.",
      "Lower for 3 counts, hold at bottom for 1 count.",
      "Press up with smooth speed and lock out softly.",
      "Keep ribs tucked and core tight throughout.",
    ],
  },
  {
    id: "ex-row-pack",
    title: "Backline Towel Rows",
    primaryTarget: "Back",
    targets: ["Back", "Arms", "Core"],
    difficulty: "Intermediate",
    defaultSets: 3,
    defaultReps: 12,
    restSec: 45,
    equipment: "Towel + stable anchor",
    tempo: "2-1-2",
    xpBase: 32,
    icon: "body-outline",
    description:
      "Horizontal pull variation to build lats and upper-back endurance with minimal equipment.",
    instructions: [
      "Secure towel around a stable anchor point.",
      "Lean back with body straight and heels grounded.",
      "Pull elbows close to ribs and squeeze shoulder blades.",
      "Lower under control without shrugging shoulders.",
    ],
  },
  {
    id: "ex-leg-burn",
    title: "Split Squat Pulse",
    primaryTarget: "Legs",
    targets: ["Legs", "Core"],
    difficulty: "Intermediate",
    defaultSets: 3,
    defaultReps: 10,
    restSec: 50,
    equipment: "Bodyweight or dumbbells",
    tempo: "2-1-1",
    xpBase: 34,
    icon: "fitness-outline",
    description:
      "Single-leg control drill for quads and glutes with balance-focused posture.",
    instructions: [
      "Stand in split stance with front foot planted.",
      "Drop straight down until front thigh nears parallel.",
      "Pulse 2 small reps near the bottom.",
      "Drive through front heel to return to start.",
    ],
  },
  {
    id: "ex-core-lock",
    title: "Hollow Hold March",
    primaryTarget: "Core",
    targets: ["Core", "Full Body"],
    difficulty: "Beginner",
    defaultSets: 4,
    defaultReps: 12,
    restSec: 35,
    equipment: "Bodyweight",
    tempo: "steady",
    xpBase: 26,
    icon: "shield-checkmark-outline",
    description:
      "Core stability sequence to reinforce anti-extension strength and breathing control.",
    instructions: [
      "Lie on back and press lower back into floor.",
      "Lift shoulders and legs into hollow position.",
      "Alternate marching knees in while keeping trunk still.",
      "Exhale slowly each rep to maintain brace.",
    ],
  },
  {
    id: "ex-shoulder-flow",
    title: "Pike Shoulder Press",
    primaryTarget: "Shoulders",
    targets: ["Shoulders", "Arms", "Core"],
    difficulty: "Intermediate",
    defaultSets: 3,
    defaultReps: 8,
    restSec: 55,
    equipment: "Bodyweight",
    tempo: "2-0-2",
    xpBase: 36,
    icon: "speedometer-outline",
    description:
      "Vertical press pattern to build overhead strength and shoulder control.",
    instructions: [
      "Start in pike with hips high and heels lifted.",
      "Lower head between hands with elbows tracking back.",
      "Press floor away to return to pike.",
      "Keep neck neutral and avoid collapsing shoulders.",
    ],
  },
  {
    id: "ex-arm-finish",
    title: "Triceps + Biceps Density",
    primaryTarget: "Arms",
    targets: ["Arms", "Shoulders"],
    difficulty: "Beginner",
    defaultSets: 3,
    defaultReps: 14,
    restSec: 30,
    equipment: "Light dumbbells or resistance band",
    tempo: "1-0-2",
    xpBase: 24,
    icon: "flame-outline",
    description:
      "High-quality arm finisher with density focus and strict form.",
    instructions: [
      "Alternate band curls and overhead triceps extensions.",
      "Keep elbows still and full range on each rep.",
      "Reduce momentum and use controlled eccentric phase.",
      "Shake out arms between sets and reset posture.",
    ],
  },
  {
    id: "ex-full-sprint",
    title: "Bodyweight Power Circuit",
    primaryTarget: "Full Body",
    targets: ["Full Body", "Legs", "Core", "Shoulders"],
    difficulty: "Intermediate",
    defaultSets: 4,
    defaultReps: 10,
    restSec: 45,
    equipment: "Bodyweight",
    tempo: "explosive",
    xpBase: 40,
    icon: "walk-outline",
    description:
      "Athletic blend of squat thrusts, lunges, and plank transitions.",
    instructions: [
      "Move with intent but keep clean movement quality.",
      "Land softly and keep knees tracking over toes.",
      "Use the final rep of each set to control breathing.",
      "Maintain a steady pace, not all-out sprinting.",
    ],
  },
];

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

export function getExerciseById(id: string) {
  return exerciseLibrary.find((item) => item.id === id);
}

export function buildTrainerPlan(input: TrainerFormInput): GeneratedExercise[] {
  const duration = clamp(input.minutes || 20, 10, 90);
  const baseReps = clamp(input.repetitions || 10, 6, 30);
  const preferredPool =
    input.targetMuscle === "Full Body"
      ? exerciseLibrary
      : exerciseLibrary.filter(
          (item) =>
            item.primaryTarget === input.targetMuscle ||
            item.targets.includes(input.targetMuscle),
        );

  const fallbackPool = [...exerciseLibrary];
  const sourcePool = preferredPool.length ? preferredPool : fallbackPool;

  const targetCount = clamp(Math.round(duration / 8), 3, 6);
  const selected: ExerciseTemplate[] = [];

  for (let i = 0; i < targetCount; i += 1) {
    const candidate =
      sourcePool[i % sourcePool.length] ??
      fallbackPool[i % fallbackPool.length];
    if (!selected.find((entry) => entry.id === candidate.id)) {
      selected.push(candidate);
    }
  }

  while (selected.length < targetCount) {
    const candidate = fallbackPool[selected.length % fallbackPool.length];
    if (!selected.find((entry) => entry.id === candidate.id)) {
      selected.push(candidate);
    } else {
      break;
    }
  }

  return selected.map((exercise, index) => {
    const sets = clamp(exercise.defaultSets + (duration >= 40 ? 1 : 0), 2, 5);

    const reps = clamp(
      Math.round((exercise.defaultReps + baseReps) / 2),
      6,
      24,
    );

    const durationSec = sets * (exercise.restSec + 35);
    const xpReward = exercise.xpBase + sets * 4 + Math.round(reps / 2);

    const notePrefix = input.extraContext.trim().length
      ? `Context: ${input.extraContext.trim()}. `
      : "";

    return {
      planId: `plan-${index + 1}-${exercise.id}`,
      exerciseId: exercise.id,
      title: exercise.title,
      primaryTarget: exercise.primaryTarget,
      sets,
      reps,
      restSec: exercise.restSec,
      durationSec,
      xpReward,
      icon: exercise.icon,
      difficulty: exercise.difficulty,
      coachNote:
        notePrefix +
        `Keep tempo ${exercise.tempo} and stay at RPE 7 for crisp form quality.`,
    };
  });
}

export function getLevelProgress(user: UserProfile | null) {
  if (!user) {
    return {
      currentXp: 0,
      level: 1,
      nextLevelXp: 300,
      progress: 0,
    };
  }

  const nextLevelXp =
    user.nextLevelXp ?? Math.max(user.xp + 200, user.level * 250);
  const safe = Math.max(nextLevelXp, 1);
  return {
    currentXp: user.xp,
    level: user.level,
    nextLevelXp,
    progress: Math.min(1, user.xp / safe),
  };
}
