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
