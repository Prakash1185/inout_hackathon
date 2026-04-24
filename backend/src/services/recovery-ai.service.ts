import { GoogleGenAI } from "@google/genai";

import { env } from "../config/env";

export type RecoveryArea = "knee" | "shoulder" | "back" | "neck";
export type RecoveryRisk = "Low" | "Medium" | "High";
export type RecoveryInputMode = "upload" | "scan" | "describe";

export interface RecoveryInputPayload {
  mode: RecoveryInputMode;
  fileName?: string;
  fileUri?: string;
  fileType?: string;
  area?: RecoveryArea;
  painLevel?: number;
  symptoms?: {
    swelling: boolean;
    stiffness: boolean;
    sharpPain: boolean;
  };
  notes?: string;
  imageBase64?: string;
}

export interface RecoveryRecommendationItem {
  exerciseId: string;
  title: string;
  duration: string;
  description: string;
  postureHint: string;
}

export interface RecoveryRecommendationResult {
  conditionSummary: string;
  riskLevel: RecoveryRisk;
  aiSuggestion: string;
  disclaimer: string;
  progress: number;
  xpReward: number;
  recoveryPoints: number;
  recommendedExerciseIds: string[];
  recommendedExercises: RecoveryRecommendationItem[];
  source: "gemini" | "fallback";
}

const allowedExerciseIds: Record<RecoveryArea, string[]> = {
  knee: [
    "knee-straight-leg-raise",
    "knee-wall-sit",
    "knee-hamstring-stretch",
    "knee-cycle",
  ],
  shoulder: [
    "shoulder-circle",
    "shoulder-wall-slide",
    "shoulder-isometric",
    "shoulder-band-pull",
  ],
  back: ["back-cat-cow", "back-bridge", "back-knee-hug", "back-posture-reset"],
  neck: [
    "neck-chin-tuck",
    "neck-side-flex",
    "neck-scapular",
    "neck-upper-trap",
  ],
};

const exerciseReference: Record<
  string,
  { title: string; duration: string; description: string; postureHint: string }
> = {
  "knee-straight-leg-raise": {
    title: "Straight Leg Raise",
    duration: "10 reps × 3 sets",
    description: "Builds knee stability without excessive load.",
    postureHint: "Good posture. Keep the lower back neutral.",
  },
  "knee-wall-sit": {
    title: "Wall Sit",
    duration: "30 sec × 3 sets",
    description: "Improves quad support and controlled knee endurance.",
    postureHint: "Adjust your knee angle slightly for comfort.",
  },
  "knee-hamstring-stretch": {
    title: "Hamstring Stretch",
    duration: "20 sec × 3 sets",
    description: "Helps reduce tension around the back of the knee.",
    postureHint: "Good alignment. Avoid forcing the stretch.",
  },
  "knee-cycle": {
    title: "Light Cycling",
    duration: "5 min",
    description: "Low-impact motion to encourage circulation.",
    postureHint: "Keep the knee tracking forward.",
  },
  "shoulder-circle": {
    title: "Shoulder Circles",
    duration: "12 reps × 2 sets",
    description: "Gentle mobility work for the shoulder joint.",
    postureHint: "Keep the ribcage calm and avoid shrugging.",
  },
  "shoulder-wall-slide": {
    title: "Wall Slide",
    duration: "10 reps × 3 sets",
    description: "Supports overhead range without abrupt strain.",
    postureHint: "Keep the wrists soft and shoulders down.",
  },
  "shoulder-isometric": {
    title: "Isometric Hold",
    duration: "15 sec × 3 sets",
    description: "Builds support around the shoulder without movement load.",
    postureHint: "Do not over-rotate the torso.",
  },
  "shoulder-band-pull": {
    title: "Band Pull-Apart",
    duration: "12 reps × 3 sets",
    description: "Targets upper back and shoulder control.",
    postureHint: "Keep the shoulders level.",
  },
  "back-cat-cow": {
    title: "Cat-Cow Stretch",
    duration: "8 reps × 3 sets",
    description: "A gentle spine mobility reset.",
    postureHint: "Good posture. Keep motion smooth.",
  },
  "back-bridge": {
    title: "Glute Bridge",
    duration: "12 reps × 3 sets",
    description: "Supports lower-back comfort by activating glutes.",
    postureHint: "Keep the neck relaxed on the mat.",
  },
  "back-knee-hug": {
    title: "Knee-to-Chest",
    duration: "20 sec × 3 sets",
    description: "Releases lower-back tightness.",
    postureHint: "Avoid lifting the shoulders.",
  },
  "back-posture-reset": {
    title: "Posture Reset",
    duration: "5 min",
    description: "Simple standing alignment drill.",
    postureHint: "Stack ribs over pelvis.",
  },
  "neck-chin-tuck": {
    title: "Chin Tuck",
    duration: "10 reps × 3 sets",
    description: "Supports neck posture and deep neck flexors.",
    postureHint: "Neck long, shoulders soft.",
  },
  "neck-side-flex": {
    title: "Side Neck Stretch",
    duration: "15 sec × 3 sets",
    description: "Gentle release for neck tension.",
    postureHint: "Avoid pulling with the hand.",
  },
  "neck-scapular": {
    title: "Scapular Squeeze",
    duration: "12 reps × 3 sets",
    description: "Reduces neck load by improving shoulder blade control.",
    postureHint: "Keep chin level.",
  },
  "neck-upper-trap": {
    title: "Upper Trap Release",
    duration: "20 sec × 2 sets",
    description: "Softens tension in the top of the shoulders and neck.",
    postureHint: "Stay relaxed and do not force range.",
  },
};

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function safeArea(value?: string): RecoveryArea {
  if (value === "shoulder" || value === "back" || value === "neck") {
    return value;
  }

  return "knee";
}

function safeRisk(value?: string): RecoveryRisk {
  if (value === "Low" || value === "Medium" || value === "High") {
    return value;
  }

  return "Low";
}

function buildFallbackRecommendation(
  input: RecoveryInputPayload,
): RecoveryRecommendationResult {
  const area = safeArea(input.area);
  const painLevel = clamp(Number(input.painLevel ?? 4), 1, 10);
  const riskLevel: RecoveryRisk =
    painLevel >= 7 || input.symptoms?.sharpPain
      ? "High"
      : painLevel >= 4 || input.symptoms?.swelling || input.symptoms?.stiffness
        ? "Medium"
        : "Low";

  const exerciseIds = allowedExerciseIds[area].slice(
    0,
    riskLevel === "High" ? 2 : 3,
  );

  return {
    conditionSummary:
      area === "knee"
        ? "Mild Knee Strain Detected"
        : area === "shoulder"
          ? "Shoulder Mobility Restriction Detected"
          : area === "back"
            ? "Lower Back Tightness Detected"
            : "Neck Tension Detected",
    riskLevel,
    aiSuggestion:
      "Based on your symptoms, recovery is possible with guided movement and controlled loading.",
    disclaimer:
      "Not a medical diagnosis. If pain worsens, seek professional care.",
    progress: Math.max(10, 30 - painLevel * 2),
    xpReward: 50,
    recoveryPoints: 15,
    recommendedExerciseIds: exerciseIds,
    recommendedExercises: exerciseIds.map((exerciseId) => ({
      exerciseId,
      ...exerciseReference[exerciseId],
    })),
    source: "fallback",
  };
}

function buildPrompt(input: RecoveryInputPayload): string {
  const area = safeArea(input.area);
  return [
    "You are a conservative physiotherapy assistant for minor injuries.",
    "Return ONLY valid JSON with this exact shape:",
    '{"conditionSummary": string, "riskLevel": "Low"|"Medium"|"High", "aiSuggestion": string, "disclaimer": string, "progress": number, "xpReward": number, "recoveryPoints": number, "recommendedExerciseIds": string[] }',
    "Use only the exercise IDs from this allowed list:",
    `${allowedExerciseIds[area].join(", ")}`,
    "Rules:",
    "- Keep conditionSummary short and specific.",
    "- Keep aiSuggestion simple, reassuring, and not overly medical.",
    "- disclaimer must mention not a medical diagnosis.",
    "- progress should be 0-100.",
    "- xpReward should be a whole number between 30 and 80.",
    "- recoveryPoints should be a whole number between 10 and 30.",
    `- Area: ${area}`,
    `- Pain level: ${input.painLevel ?? 4}`,
    `- Symptoms: ${JSON.stringify(input.symptoms ?? {})}`,
    `- Notes: ${input.notes?.trim() || "None"}`,
    `- File type: ${input.fileType || "None"}`,
    `- File name: ${input.fileName || "None"}`,
    `- Mode: ${input.mode}`,
    "If the input suggests severe injury, still keep suggestions safe and conservative.",
    "No markdown or code fences.",
  ].join("\n");
}

function parseGeminiJson(text: string): Record<string, unknown> {
  const trimmed = text.trim();
  const blockMatch = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const candidate = blockMatch?.[1]?.trim() ?? trimmed;
  return JSON.parse(candidate) as Record<string, unknown>;
}

function normalizeRecommendation(
  raw: Record<string, unknown>,
  input: RecoveryInputPayload,
): RecoveryRecommendationResult {
  const area = safeArea(input.area);
  const fallback = buildFallbackRecommendation(input);
  const requestedIds = Array.isArray(raw.recommendedExerciseIds)
    ? raw.recommendedExerciseIds
        .filter((value): value is string => typeof value === "string")
        .filter((value) => allowedExerciseIds[area].includes(value))
    : [];

  const exerciseIds = requestedIds.length
    ? requestedIds.slice(0, 4)
    : fallback.recommendedExerciseIds;

  const conditionSummary =
    typeof raw.conditionSummary === "string" && raw.conditionSummary.trim()
      ? raw.conditionSummary.trim()
      : fallback.conditionSummary;

  return {
    conditionSummary,
    riskLevel:
      safeRisk(raw.riskLevel as string | undefined) ?? fallback.riskLevel,
    aiSuggestion:
      typeof raw.aiSuggestion === "string" && raw.aiSuggestion.trim()
        ? raw.aiSuggestion.trim()
        : fallback.aiSuggestion,
    disclaimer:
      typeof raw.disclaimer === "string" && raw.disclaimer.trim()
        ? raw.disclaimer.trim()
        : fallback.disclaimer,
    progress: clamp(Number(raw.progress ?? fallback.progress), 0, 100),
    xpReward: clamp(
      Math.round(Number(raw.xpReward ?? fallback.xpReward)),
      30,
      80,
    ),
    recoveryPoints: clamp(
      Math.round(Number(raw.recoveryPoints ?? fallback.recoveryPoints)),
      10,
      30,
    ),
    recommendedExerciseIds: exerciseIds,
    recommendedExercises: exerciseIds.map((exerciseId) => ({
      exerciseId,
      ...exerciseReference[exerciseId],
    })),
    source: "gemini",
  };
}

export async function analyzeRecoveryCondition(
  input: RecoveryInputPayload,
): Promise<RecoveryRecommendationResult> {
  if (!env.GEMINI_API_KEY) {
    return buildFallbackRecommendation(input);
  }

  const model = env.GEMINI_MODEL || "gemini-2.5-flash-lite";
  const ai = new GoogleGenAI({ apiKey: env.GEMINI_API_KEY });
  const prompt = buildPrompt(input);
  const parts = [{ text: prompt }];

  if (input.imageBase64 && input.fileType?.startsWith("image/")) {
    parts.push({
      inlineData: {
        mimeType: input.fileType,
        data: input.imageBase64,
      },
    } as never);
  }

  try {
    const response = await ai.models.generateContent({
      model,
      contents: [{ role: "user", parts }],
      config: {
        temperature: 0.25,
        responseMimeType: "application/json",
        maxOutputTokens: 800,
      },
    });

    const text = (response.text ?? "").trim();
    if (!text) {
      return buildFallbackRecommendation(input);
    }

    const parsed = parseGeminiJson(text);
    return normalizeRecommendation(parsed, input);
  } catch (error) {
    console.error("[Recovery AI] Gemini failed, using fallback:", error);
    return buildFallbackRecommendation(input);
  }
}
