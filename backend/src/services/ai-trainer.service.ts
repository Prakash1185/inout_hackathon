import { GoogleGenAI } from "@google/genai";

import { env } from "../config/env";

const iconOptions = [
  "barbell-outline",
  "body-outline",
  "fitness-outline",
  "walk-outline",
  "flame-outline",
  "speedometer-outline",
  "shield-checkmark-outline",
] as const;

const targetOptions = [
  "Full Body",
  "Chest",
  "Back",
  "Legs",
  "Core",
  "Shoulders",
  "Arms",
] as const;

type TrainerIconName = (typeof iconOptions)[number];
type MuscleTarget = (typeof targetOptions)[number];

const MIN_PLAN_ITEMS = 5;
const MAX_PLAN_ITEMS = 6;

export interface TrainerPlanInput {
  targetMuscle: MuscleTarget;
  minutes: number;
  repetitions: number;
  extraContext?: string;
  userLevel?: number;
}

export interface TrainerPlanItem {
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
  difficulty: "Beginner" | "Intermediate";
}

export interface TrainerPlanResult {
  plan: TrainerPlanItem[];
  summary: string;
  source: "gemini" | "fallback";
}

interface ExerciseTemplate {
  exerciseId: string;
  title: string;
  primaryTarget: MuscleTarget;
  sets: number;
  reps: number;
  restSec: number;
  icon: TrainerIconName;
  difficulty: "Beginner" | "Intermediate";
  coachNote: string;
}

function buildPlanSummary(
  input: TrainerPlanInput,
  source: "gemini" | "fallback",
): string {
  const context = normalizeExtraContext(input.extraContext);
  const base =
    source === "gemini"
      ? "Personalized AI plan generated successfully."
      : "Fallback plan generated from your workout context.";

  if (!context) {
    return base;
  }

  return `${base} Context used: ${context}.`;
}

const exerciseTemplates: ExerciseTemplate[] = [
  {
    exerciseId: "ex-full-01",
    title: "Bodyweight Power Circuit",
    primaryTarget: "Full Body",
    sets: 4,
    reps: 10,
    restSec: 45,
    icon: "walk-outline",
    difficulty: "Intermediate",
    coachNote: "Keep breathing steady and land softly on each rep.",
  },
  {
    exerciseId: "ex-chest-01",
    title: "Tempo Push-Up Ladder",
    primaryTarget: "Chest",
    sets: 3,
    reps: 10,
    restSec: 40,
    icon: "barbell-outline",
    difficulty: "Beginner",
    coachNote: "Control the eccentric phase for chest activation.",
  },
  {
    exerciseId: "ex-back-01",
    title: "Backline Towel Rows",
    primaryTarget: "Back",
    sets: 3,
    reps: 12,
    restSec: 45,
    icon: "body-outline",
    difficulty: "Intermediate",
    coachNote: "Keep shoulders down and pull elbows close to ribs.",
  },
  {
    exerciseId: "ex-legs-01",
    title: "Split Squat Pulse",
    primaryTarget: "Legs",
    sets: 3,
    reps: 10,
    restSec: 50,
    icon: "fitness-outline",
    difficulty: "Intermediate",
    coachNote: "Drive through front heel and keep knee stable.",
  },
  {
    exerciseId: "ex-core-01",
    title: "Hollow Hold March",
    primaryTarget: "Core",
    sets: 4,
    reps: 12,
    restSec: 35,
    icon: "shield-checkmark-outline",
    difficulty: "Beginner",
    coachNote: "Keep lower back pressed into floor throughout the set.",
  },
  {
    exerciseId: "ex-shoulders-01",
    title: "Pike Shoulder Press",
    primaryTarget: "Shoulders",
    sets: 3,
    reps: 8,
    restSec: 55,
    icon: "speedometer-outline",
    difficulty: "Intermediate",
    coachNote: "Maintain a neutral neck and controlled press tempo.",
  },
  {
    exerciseId: "ex-arms-01",
    title: "Triceps + Biceps Density",
    primaryTarget: "Arms",
    sets: 3,
    reps: 14,
    restSec: 30,
    icon: "flame-outline",
    difficulty: "Beginner",
    coachNote: "Avoid momentum and keep strict elbow alignment.",
  },
];

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function toPrimaryTarget(value: unknown, fallback: MuscleTarget): MuscleTarget {
  if (
    typeof value === "string" &&
    targetOptions.includes(value as MuscleTarget)
  ) {
    return value as MuscleTarget;
  }
  return fallback;
}

function toTrainerIcon(
  value: unknown,
  fallback: TrainerIconName,
): TrainerIconName {
  if (
    typeof value === "string" &&
    iconOptions.includes(value as TrainerIconName)
  ) {
    return value as TrainerIconName;
  }
  return fallback;
}

function estimateDurationSec(sets: number, restSec: number): number {
  return sets * (restSec + 35);
}

function normalizeExtraContext(value?: string): string {
  return (value ?? "").trim();
}

function withUserContextNote(note: string, extraContext?: string): string {
  const context = normalizeExtraContext(extraContext);
  if (!context) {
    return note.trim();
  }

  const safeNote = note.trim();
  const loweredContext = context.toLowerCase();
  if (safeNote.toLowerCase().includes(loweredContext)) {
    return safeNote;
  }

  return `${safeNote} Context: ${context}.`;
}

function applyContextToPlan(
  plan: TrainerPlanItem[],
  input: TrainerPlanInput,
): TrainerPlanItem[] {
  return plan.map((item) => ({
    ...item,
    coachNote: withUserContextNote(item.coachNote, input.extraContext),
  }));
}

function finalizePlanItems(plan: TrainerPlanItem[]): TrainerPlanItem[] {
  return plan.slice(0, MAX_PLAN_ITEMS).map((item, index) => ({
    ...item,
    planId: `plan-${index + 1}-${item.exerciseId}`,
  }));
}

function normalizePlanItems(
  rawPlan: unknown,
  input: TrainerPlanInput,
): TrainerPlanItem[] {
  if (!Array.isArray(rawPlan)) {
    return [];
  }

  return rawPlan
    .map((item, index) => {
      const row = (item ?? {}) as Record<string, unknown>;
      const sets = clamp(Number(row.sets ?? 3), 2, 5);
      const reps = clamp(Number(row.reps ?? input.repetitions), 6, 24);
      const restSec = clamp(Number(row.restSec ?? 45), 20, 90);
      const xpReward = clamp(Number(row.xpReward ?? sets * 10 + reps), 15, 95);

      const fallbackTemplate =
        exerciseTemplates.find(
          (template) => template.primaryTarget === input.targetMuscle,
        ) ?? exerciseTemplates[index % exerciseTemplates.length];

      return {
        planId: `plan-${index + 1}-${String(row.exerciseId ?? fallbackTemplate.exerciseId)}`,
        exerciseId: String(row.exerciseId ?? fallbackTemplate.exerciseId),
        title: String(row.title ?? fallbackTemplate.title),
        primaryTarget: toPrimaryTarget(
          row.primaryTarget,
          fallbackTemplate.primaryTarget,
        ),
        sets,
        reps,
        restSec,
        durationSec: clamp(
          Number(row.durationSec ?? estimateDurationSec(sets, restSec)),
          120,
          900,
        ),
        xpReward,
        coachNote: String(row.coachNote ?? fallbackTemplate.coachNote),
        icon: toTrainerIcon(row.icon, fallbackTemplate.icon),
        difficulty:
          row.difficulty === "Intermediate" ? "Intermediate" : "Beginner",
      } satisfies TrainerPlanItem;
    })
    .filter((item) => Boolean(item.title.trim()))
    .slice(0, MAX_PLAN_ITEMS);
}

function buildFallbackPlan(input: TrainerPlanInput): TrainerPlanItem[] {
  const targetPool =
    input.targetMuscle === "Full Body"
      ? exerciseTemplates
      : exerciseTemplates.filter(
          (template) =>
            template.primaryTarget === input.targetMuscle ||
            template.primaryTarget === "Full Body",
        );

  const planSize = clamp(
    Math.round(input.minutes / 8),
    MIN_PLAN_ITEMS,
    MAX_PLAN_ITEMS,
  );

  const plan = Array.from({ length: planSize }, (_, index) => {
    const template =
      targetPool[index % targetPool.length] ?? exerciseTemplates[0];
    const sets = clamp(template.sets + (input.minutes >= 40 ? 1 : 0), 2, 5);
    const reps = clamp(
      Math.round((template.reps + input.repetitions) / 2),
      6,
      24,
    );
    const restSec = template.restSec;
    const durationSec = estimateDurationSec(sets, restSec);
    const xpReward = clamp(20 + sets * 6 + Math.round(reps / 2), 18, 95);

    return {
      planId: `plan-${index + 1}-${template.exerciseId}`,
      exerciseId: template.exerciseId,
      title: template.title,
      primaryTarget: template.primaryTarget,
      sets,
      reps,
      restSec,
      durationSec,
      xpReward,
      coachNote: template.coachNote,
      icon: template.icon,
      difficulty: template.difficulty,
    };
  });

  return finalizePlanItems(plan);
}

function ensureMinimumPlanItems(
  aiPlan: TrainerPlanItem[],
  input: TrainerPlanInput,
): TrainerPlanItem[] {
  if (aiPlan.length >= MIN_PLAN_ITEMS) {
    return finalizePlanItems(aiPlan);
  }

  const fallbackPlan = buildFallbackPlan(input);
  const usedExerciseIds = new Set(aiPlan.map((item) => item.exerciseId));
  const needed = MIN_PLAN_ITEMS - aiPlan.length;
  const fillers = fallbackPlan
    .filter((item) => !usedExerciseIds.has(item.exerciseId))
    .slice(0, needed);

  return finalizePlanItems([...aiPlan, ...fillers]);
}

function buildGeminiPrompt(input: TrainerPlanInput): string {
  return [
    "You are a certified fitness coach generating a concise, safe workout plan.",
    "Return ONLY valid JSON with this exact shape:",
    '{"plan": TrainerPlanItem[] }',
    "TrainerPlanItem fields: exerciseId, title, primaryTarget, sets, reps, restSec, durationSec, xpReward, coachNote, icon, difficulty.",
    `Allowed primaryTarget values: ${targetOptions.join(", ")}.`,
    `Allowed icon values: ${iconOptions.join(", ")}.`,
    'Allowed difficulty values: "Beginner" or "Intermediate".',
    "Generate exactly 5 items.",
    "Keep coachNote short (one sentence).",
    "CRITICAL: You MUST reflect Extra context inside every coachNote.",
    "Do not include markdown or code fences.",
    "Constraints:",
    `- Target muscle: ${input.targetMuscle}`,
    `- Session length (minutes): ${input.minutes}`,
    `- Repetition baseline: ${input.repetitions}`,
    `- User level: ${input.userLevel ?? 1}`,
    `- Extra context: ${input.extraContext?.trim() || "None"}`,
    "Safety: avoid high-impact recommendations if injury context is mentioned.",
    "Keep titles short and practical.",
  ].join("\n");
}

function getFallbackModelList(): string[] {
  const raw = env.GEMINI_FALLBACK_MODELS ?? "";
  return raw
    .split(",")
    .map((m) => m.trim())
    .filter((m) => m.length > 0);
}

async function callGeminiWithModel(
  ai: InstanceType<typeof GoogleGenAI>,
  model: string,
  input: TrainerPlanInput,
): Promise<TrainerPlanResult | null> {
  try {
    console.log(`[AI Trainer] Trying model: ${model}`);

    const responsePromise = ai.models.generateContent({
      model,
      contents: buildGeminiPrompt(input),
      config: {
        temperature: 0.2,
        responseMimeType: "application/json",
        maxOutputTokens: 650,
      },
    });

    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => {
        reject(new Error("Gemini request timed out"));
      }, 8_000);
    });

    const response = await Promise.race([responsePromise, timeoutPromise]);
    const text = (response.text ?? "").trim();

    if (!text) {
      console.warn(`[AI Trainer] Model ${model} returned empty response`);
      return null;
    }

    const parsed = JSON.parse(text) as Record<string, unknown>;
    const normalized = applyContextToPlan(
      ensureMinimumPlanItems(normalizePlanItems(parsed.plan, input), input),
      input,
    );

    if (normalized.length < MIN_PLAN_ITEMS) {
      console.warn(`[AI Trainer] Model ${model} returned unusable plan`);
      return null;
    }

    console.log(`[AI Trainer] Model ${model} succeeded with ${normalized.length} items`);

    return {
      plan: normalized,
      summary: buildPlanSummary(input, "gemini"),
      source: "gemini",
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.warn(`[AI Trainer] Model ${model} failed: ${message}`);
    return null;
  }
}

export async function generateTrainerPlan(
  input: TrainerPlanInput,
): Promise<TrainerPlanResult> {
  if (!env.GEMINI_API_KEY) {
    const fallbackPlan = applyContextToPlan(buildFallbackPlan(input), input);
    return {
      plan: fallbackPlan,
      summary: buildPlanSummary(input, "fallback"),
      source: "fallback",
    };
  }

  const ai = new GoogleGenAI({ apiKey: env.GEMINI_API_KEY });
  const primaryModel = env.GEMINI_MODEL || "gemini-2.5-flash-lite";

  // 1. Try primary model
  const primaryResult = await callGeminiWithModel(ai, primaryModel, input);
  if (primaryResult) {
    return primaryResult;
  }

  // 2. Try all fallback models in chain
  const fallbackModels = getFallbackModelList().filter(
    (m) => m !== primaryModel,
  );

  for (const fallbackModel of fallbackModels) {
    const fallbackResult = await callGeminiWithModel(ai, fallbackModel, input);
    if (fallbackResult) {
      return fallbackResult;
    }
  }

  // 3. Static fallback
  console.error("[AI Trainer] All Gemini models failed, using static fallback");
  const fallbackPlan = applyContextToPlan(buildFallbackPlan(input), input);

  return {
    plan: fallbackPlan,
    summary: buildPlanSummary(input, "fallback"),
    source: "fallback",
  };
}
