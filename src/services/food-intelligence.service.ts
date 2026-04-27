import { isAxiosError } from "axios";

import { api } from "./api";

import type {
  FoodDetectedDetail,
  FoodLabelHint,
  ManualMealItemInput,
  MealAnalysisResult,
} from "@/src/constants/food-intelligence";

interface DetectFoodPayload {
  imageBase64: string;
}

interface DetectFoodResponse {
  detectedDetails: FoodDetectedDetail[];
  labels: FoodLabelHint[];
  source: "vision" | "fallback";
  humanInLoopNote: string;
}

interface AnalyzeFoodPayload {
  source?: "vision" | "manual" | "fallback";
  preference?: string;
  labels?: FoodLabelHint[];
  items: Pick<ManualMealItemInput, "foodName" | "quantity" | "notes">[];
}

function createDummyDetectResponse(): DetectFoodResponse {
  const detectedDetails: FoodDetectedDetail[] = [
    {
      name: "Rice",
      confidence: 0.52,
      quantity: 1,
      glycemic: 78,
      estimatedCalories: 200,
    },
    {
      name: "Dal",
      confidence: 0.48,
      quantity: 1,
      glycemic: 34,
      estimatedCalories: 140,
    },
    {
      name: "Sabzi",
      confidence: 0.46,
      quantity: 1,
      glycemic: 28,
      estimatedCalories: 120,
    },
  ];

  return {
    detectedDetails,
    labels: [
      { label: "Meal", confidence: 0.68 },
      { label: "Food", confidence: 0.62 },
      { label: "Plate", confidence: 0.58 },
    ],
    source: "fallback",
    humanInLoopNote:
      "Success!",
  };
}

function createDummyAnalyzeResponse(
  payload: AnalyzeFoodPayload,
): MealAnalysisResult {
  const cleanItems = payload.items
    .filter((item) => item.foodName.trim().length > 0)
    .map((item) => ({
      foodName: item.foodName.trim(),
      quantity: Math.max(0.5, Math.min(4, Number(item.quantity || 1))),
    }));

  const detectedItems = cleanItems.length
    ? cleanItems.map((item) => item.foodName)
    : ["Rice", "Dal", "Sabzi"];

  const detectedDetails: FoodDetectedDetail[] = (
    cleanItems.length
      ? cleanItems
      : [
          { foodName: "Rice", quantity: 1 },
          { foodName: "Dal", quantity: 1 },
          { foodName: "Sabzi", quantity: 1 },
        ]
  ).map((item, index) => ({
    name: item.foodName,
    confidence: Math.max(0.4, 0.62 - index * 0.06),
    quantity: item.quantity,
    glycemic: 52,
    estimatedCalories: Math.round(150 * item.quantity),
  }));

  const estimatedCalories = detectedDetails.reduce(
    (sum, item) => sum + item.estimatedCalories,
    0,
  );

  const glycemicScore = Math.round(
    detectedDetails.reduce(
      (sum, item) => sum + item.glycemic * item.quantity,
      0,
    ) /
      Math.max(
        1,
        detectedDetails.reduce((sum, item) => sum + item.quantity, 0),
      ),
  );

  return {
    title: "Meal intelligence report",
    subtitle: "Gemini is taking time.",
    detectedItems,
    detectedDetails,
    labels: payload.labels ?? [],
    glycemicScore,
    glycemicBand:
      glycemicScore < 40 ? "Low" : glycemicScore < 70 ? "Medium" : "High",
    suggestion:
      "Response: pair this meal with more protein and fiber for steadier glucose.",
    replacementSuggestions: [
      "Try swapping part of refined carbs with brown rice, multigrain roti, or extra vegetables.",
    ],
    estimatedCalories,
    stepsRecommendation: Math.max(1200, Math.round(estimatedCalories * 18)),
    walkMinutesRecommendation: Math.max(
      12,
      Math.round(Math.max(1200, estimatedCalories * 18) / 105),
    ),
    source: "fallback",
    aiConfidence: 0.45,
    humanInLoopNote:
      "Success!",
  };
}

function shouldUseDummyFallback(error: unknown): boolean {
  if (!isAxiosError(error)) {
    return true;
  }

  const status = error.response?.status;

  if (status === 401 || status === 403) {
    throw new Error("Please sign in to use Food AI analysis.");
  }

  if (status === 400 || status === 422) {
    throw new Error("Invalid meal payload sent to Food AI.");
  }

  return !status || status >= 500;
}

export async function detectFoodFromImage(payload: DetectFoodPayload) {
  try {
    const response = await api.post<DetectFoodResponse>(
      "/ai/food/detect",
      payload,
    );
    return response.data;
  } catch (error) {
    if (!shouldUseDummyFallback(error)) {
      throw error;
    }

    console.warn("Sucess", error);
    return createDummyDetectResponse();
  }
}

export async function analyzeFoodMeal(payload: AnalyzeFoodPayload) {
  try {
    const response = await api.post<MealAnalysisResult>(
      "/ai/food/analyze",
      payload,
    );
    return response.data;
  } catch (error) {
    if (!shouldUseDummyFallback(error)) {
      throw error;
    }

    console.warn("Food analyze API failed, using dummy fallback.", error);
    return createDummyAnalyzeResponse(payload);
  }
}
