import { isAxiosError } from "axios";

import { api } from "./api";

import {
    buildRecoveryRecommendation,
    type RecoveryInputPayload
} from "@/src/constants/recovery-ai";

interface RecoveryAnalysisResponse {
  conditionSummary: string;
  riskLevel: "Low" | "Medium" | "High";
  aiSuggestion: string;
  disclaimer: string;
  progress: number;
  xpReward: number;
  recoveryPoints: number;
  recommendedExerciseIds: string[];
  source: "gemini" | "fallback";
}

function shouldFallback(error: unknown): boolean {
  if (!isAxiosError(error)) {
    return true;
  }

  const status = error.response?.status;
  if (status === 401 || status === 403) {
    throw new Error("Please sign in to use Recovery AI.");
  }

  return !status || status >= 500;
}

export async function analyzeRecoveryCondition(
  payload: RecoveryInputPayload,
): Promise<RecoveryAnalysisResponse> {
  try {
    const response = await api.post<RecoveryAnalysisResponse>(
      "/ai/recovery/analyze",
      payload,
    );
    return response.data;
  } catch (error) {
    if (!shouldFallback(error)) {
      throw error;
    }

    const fallback = buildRecoveryRecommendation(payload);
    return {
      conditionSummary: fallback.conditionSummary,
      riskLevel: fallback.riskLevel,
      aiSuggestion: fallback.aiSuggestion,
      disclaimer: fallback.disclaimer,
      progress: fallback.progress,
      xpReward: fallback.xpReward,
      recoveryPoints: fallback.recoveryPoints,
      recommendedExerciseIds: fallback.exercises.map((exercise) => exercise.id),
      source: "fallback",
    };
  }
}
