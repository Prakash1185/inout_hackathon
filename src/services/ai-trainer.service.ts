import { api } from "./api";

import type {
    GeneratedExercise,
    MuscleTarget,
} from "@/src/constants/ai-trainer";

interface GenerateTrainerPlanPayload {
  targetMuscle: MuscleTarget;
  minutes: number;
  repetitions: number;
  extraContext?: string;
  userLevel?: number;
}

interface GenerateTrainerPlanResponse {
  plan: GeneratedExercise[];
  summary: string;
  source: "gemini" | "fallback";
}

export async function generateTrainerPlanFromAi(
  payload: GenerateTrainerPlanPayload,
): Promise<GenerateTrainerPlanResponse> {
  const response = await api.post<GenerateTrainerPlanResponse>(
    "/ai/trainer/plan",
    payload,
  );

  return response.data;
}

export async function analyzeTrainerPosture(payload: { imageBase64: string, exerciseTarget: string, exerciseTitle: string }) {
  const response = await api.post<{ critique: string; status: "Good" | "Needs Correction" }>(
    "/ai/trainer/posture",
    payload
  );
  return response.data;
}
