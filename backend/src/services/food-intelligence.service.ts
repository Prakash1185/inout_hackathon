import { GoogleGenAI } from "@google/genai";

import { env } from "../config/env";

export interface FoodDetectInput {
  imageBase64: string;
}

export interface FoodAnalyzeItemInput {
  foodName: string;
  quantity: number;
  notes?: string;
}

interface FoodCatalogItem {
  name: string;
  aliases: string[];
  glycemic: number;
  caloriesPerServing: number;
  replacement: string;
  reason: string;
}

export interface FoodDetectedDetail {
  name: string;
  confidence: number;
  quantity: number;
  glycemic: number;
  estimatedCalories: number;
}

export interface FoodLabelHint {
  label: string;
  confidence: number;
}

export interface FoodDetectResult {
  detectedDetails: FoodDetectedDetail[];
  labels: FoodLabelHint[];
  source: "vision" | "fallback";
  humanInLoopNote: string;
}

export interface FoodAnalysisResult {
  title: string;
  subtitle: string;
  detectedItems: string[];
  detectedDetails: FoodDetectedDetail[];
  labels: FoodLabelHint[];
  glycemicScore: number;
  glycemicBand: "Low" | "Medium" | "High";
  suggestion: string;
  replacementSuggestions: string[];
  estimatedCalories: number;
  stepsRecommendation: number;
  walkMinutesRecommendation: number;
  source: "vision" | "manual" | "fallback";
  aiConfidence: number;
  humanInLoopNote: string;
}

const foodCatalog: FoodCatalogItem[] = [
  {
    name: "Rice",
    aliases: ["rice", "biryani", "fried rice", "pulao"],
    glycemic: 78,
    caloriesPerServing: 200,
    replacement: "Brown Rice",
    reason: "Lowers rapid sugar spike while keeping the same meal style.",
  },
  {
    name: "Roti",
    aliases: ["roti", "chapati", "naan", "flatbread"],
    glycemic: 56,
    caloriesPerServing: 110,
    replacement: "Multigrain Roti",
    reason: "Adds fiber and improves glycemic response.",
  },
  {
    name: "Dal",
    aliases: ["dal", "lentil", "lentils", "sambar"],
    glycemic: 34,
    caloriesPerServing: 140,
    replacement: "Moong Dal",
    reason: "Often lighter and easier on digestion with good protein.",
  },
  {
    name: "Paneer",
    aliases: ["paneer", "cottage cheese"],
    glycemic: 18,
    caloriesPerServing: 210,
    replacement: "Grilled Paneer",
    reason: "Keeps protein high with less gravy fat.",
  },
  {
    name: "Sabzi",
    aliases: ["sabzi", "vegetable", "veggies", "curry"],
    glycemic: 28,
    caloriesPerServing: 120,
    replacement: "Leafy Sabzi",
    reason: "Higher fiber and better satiety for similar calories.",
  },
  {
    name: "Poha",
    aliases: ["poha", "flattened rice"],
    glycemic: 68,
    caloriesPerServing: 250,
    replacement: "Poha + Sprouts",
    reason: "Adds protein and slows glucose rise.",
  },
  {
    name: "Idli",
    aliases: ["idli"],
    glycemic: 63,
    caloriesPerServing: 140,
    replacement: "Idli + Sambar",
    reason: "Sambar adds protein and fiber for better balance.",
  },
  {
    name: "Curd",
    aliases: ["curd", "yogurt", "raita"],
    glycemic: 19,
    caloriesPerServing: 90,
    replacement: "Low-fat Curd",
    reason: "Similar benefit with lower calories.",
  },
  {
    name: "Brown Rice",
    aliases: ["brown rice"],
    glycemic: 52,
    caloriesPerServing: 190,
    replacement: "Brown Rice",
    reason: "Already a better grain choice.",
  },
];

const fallbackDetectedFoods = ["Rice", "Dal", "Sabzi", "Curd", "Roti"];

function createFallbackDetectResult(): FoodDetectResult {
  return {
    detectedDetails: fallbackDetectedFoods.map((name, index) =>
      toDetectedDetail(name, 0.45 - index * 0.05),
    ),
    labels: [],
    source: "fallback",
    humanInLoopNote:
      "AI provides likely items; user confirms portion with slider for accuracy.",
  };
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function toTitleCase(value: string): string {
  return value
    .trim()
    .split(/\s+/)
    .map((chunk) =>
      chunk.length > 1
        ? `${chunk[0].toUpperCase()}${chunk.slice(1).toLowerCase()}`
        : chunk.toUpperCase(),
    )
    .join(" ");
}

function getCatalogMatch(value: string): FoodCatalogItem | undefined {
  const normalized = value.trim().toLowerCase();

  return foodCatalog.find(
    (item) =>
      item.name.toLowerCase() === normalized ||
      item.aliases.some((alias) => normalized.includes(alias)),
  );
}

function getBand(score: number): "Low" | "Medium" | "High" {
  if (score < 40) {
    return "Low";
  }
  if (score < 70) {
    return "Medium";
  }

  return "High";
}

function toDetectedDetail(
  name: string,
  confidence: number,
  quantity = 1,
): FoodDetectedDetail {
  const match = getCatalogMatch(name);

  return {
    name: match?.name ?? toTitleCase(name),
    confidence: clamp(confidence, 0, 1),
    quantity: clamp(quantity, 0.5, 4),
    glycemic: match?.glycemic ?? 52,
    estimatedCalories: Math.round(
      (match?.caloriesPerServing ?? 150) * quantity,
    ),
  };
}

export async function detectFoodsFromImage(
  input: FoodDetectInput,
): Promise<FoodDetectResult> {
  if (!env.GEMINI_API_KEY) {
    return createFallbackDetectResult();
  }

  const ai = new GoogleGenAI({ apiKey: env.GEMINI_API_KEY });
  const model = env.GEMINI_VISION_MODEL || "gemini-2.5-flash";

  const prompt = [
    "Analyze the provided image of a meal.",
    "Return a JSON object containing two things:",
    "1. 'items': an array of food items detected. Each should have 'name' (e.g. 'Rice', 'Dal', 'Pizza', 'Salad') and 'confidence' (Number between 0 and 1).",
    "2. 'labels': an array of general descriptive labels. Each should have 'label' and 'confidence' (Number between 0 and 1).",
    "Return ONLY valid JSON. Remove markdown backticks."
  ].join("\n");

  try {
     const response = await ai.models.generateContent({
        model,
        contents: [
            { role: "user", parts: [
                { text: prompt },
                { inlineData: { mimeType: "image/jpeg", data: input.imageBase64 } }
            ]}
        ],
        config: {
           temperature: 0.2,
           responseMimeType: "application/json",
           maxOutputTokens: 600
        }
     });

     const text = (response.text ?? "").trim();
     if (text) {
        const candidate = text.replace(/```(?:json)?\s*([\s\S]*?)```/ig, "$1").trim();
        const parsed = JSON.parse(candidate);

        const rawItems = Array.isArray(parsed.items) ? parsed.items : [];
        const rawLabels = Array.isArray(parsed.labels) ? parsed.labels : [];

        if (rawItems.length === 0) {
           return createFallbackDetectResult();
        }

        const detectedDetails = rawItems.map((item: any) => toDetectedDetail(item.name || "Unknown", Number(item.confidence) || 0.5));
        const labels = rawLabels.slice(0, 8).map((l: any) => ({ label: toTitleCase(l.label || "Food"), confidence: clamp(Number(l.confidence) || 0.5, 0, 1) }));

        return {
           detectedDetails,
           labels,
           source: "vision",
           humanInLoopNote: "Gemini Vision detects food items; user confirms portions using sliders."
        };
     }
  } catch (error) {
     const errorDetails = error instanceof Error ? error.message : String(error);
     console.error(`[Food AI Detect] Model ${model} failed:\n`, {
       message: errorDetails,
       fullError: error
     });
  }

  return createFallbackDetectResult();
}



export interface NutrientBreakdown {
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  sugar: number;
  vitamins: string[];
}

function getFallbackModelList(): string[] {
  const raw = env.GEMINI_FALLBACK_MODELS ?? "";
  return raw
    .split(",")
    .map((m) => m.trim())
    .filter((m) => m.length > 0);
}

async function getGeminiNutrientBreakdown(
  foodItems: Array<{ name: string; quantity: number }>,
): Promise<NutrientBreakdown | null> {
  if (!env.GEMINI_API_KEY) {
    return null;
  }

  const ai = new GoogleGenAI({ apiKey: env.GEMINI_API_KEY });
  const prompt = [
    "You are a nutrition expert. Analyze these food items and return ONLY valid JSON:",
    '{"protein": number (grams), "carbs": number (grams), "fat": number (grams), "fiber": number (grams), "sugar": number (grams), "vitamins": string[] (top 5 vitamins/minerals)}',
    "",
    "Food items:",
    ...foodItems.map((f) => `- ${f.name} (qty: ${f.quantity} servings)`),
    "",
    "Estimate total nutrients across all items combined.",
    "No markdown or code fences.",
  ].join("\n");

  const models = [
    env.GEMINI_MODEL || "gemini-2.5-flash-lite",
    ...getFallbackModelList(),
  ];

  // Deduplicate models
  const uniqueModels = [...new Set(models)];

  for (const model of uniqueModels) {
    try {
      const response = await ai.models.generateContent({
        model,
        contents: prompt,
        config: {
          temperature: 0.15,
          responseMimeType: "application/json",
          maxOutputTokens: 400,
        },
      });

      const text = (response.text ?? "").trim();
      if (!text) {
        continue;
      }

      const blockMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/i);
      const candidate = blockMatch?.[1]?.trim() ?? text;
      const parsed = JSON.parse(candidate) as Record<string, unknown>;

      return {
        protein: clamp(Math.round(Number(parsed.protein ?? 0)), 0, 500),
        carbs: clamp(Math.round(Number(parsed.carbs ?? 0)), 0, 800),
        fat: clamp(Math.round(Number(parsed.fat ?? 0)), 0, 400),
        fiber: clamp(Math.round(Number(parsed.fiber ?? 0)), 0, 100),
        sugar: clamp(Math.round(Number(parsed.sugar ?? 0)), 0, 200),
        vitamins: Array.isArray(parsed.vitamins)
          ? parsed.vitamins.filter((v): v is string => typeof v === "string").slice(0, 5)
          : [],
      };
    } catch (error) {
      const errorDetails = error instanceof Error ? error.message : String(error);
      console.error(`[Food AI] Model ${model} failed:\n`, {
        message: errorDetails,
        fullError: error
      });
    }
  }

  return null;
}

export async function analyzeMealItemsWithAI(
  items: FoodAnalyzeItemInput[],
  options?: {
    source?: "vision" | "manual" | "fallback";
    labels?: FoodLabelHint[];
    preference?: string;
  },
): Promise<FoodAnalysisResult & { nutrients?: NutrientBreakdown }> {
  const baseResult = analyzeMealItems(items, options);

  // Try to enrich with AI nutritional breakdown
  const foodItems = items.map((item) => ({
    name: item.foodName,
    quantity: item.quantity,
  }));

  const nutrients = await getGeminiNutrientBreakdown(foodItems);

  return {
    ...baseResult,
    nutrients: nutrients ?? {
      protein: Math.round(baseResult.estimatedCalories * 0.12 / 4),
      carbs: Math.round(baseResult.estimatedCalories * 0.55 / 4),
      fat: Math.round(baseResult.estimatedCalories * 0.30 / 9),
      fiber: Math.round(baseResult.estimatedCalories * 0.02),
      sugar: Math.round(baseResult.estimatedCalories * 0.08 / 4),
      vitamins: ["Vitamin A", "Vitamin C", "Iron", "Calcium"],
    },
  };
}

export function analyzeMealItems(
  items: FoodAnalyzeItemInput[],
  options?: {
    source?: "vision" | "manual" | "fallback";
    labels?: FoodLabelHint[];
    preference?: string;
  },
): FoodAnalysisResult {
  const cleanItems = items
    .map((item) => ({
      ...item,
      foodName: item.foodName.trim(),
      quantity: clamp(Number(item.quantity || 1), 0.5, 4),
    }))
    .filter((item) => item.foodName.length > 0)
    .slice(0, 10);

  const resolvedItems = cleanItems.map((item) => {
    const match = getCatalogMatch(item.foodName);
    const name = match?.name ?? toTitleCase(item.foodName);
    const glycemic = match?.glycemic ?? 52;
    const caloriesPerServing = match?.caloriesPerServing ?? 150;

    return {
      name,
      quantity: item.quantity,
      glycemic,
      calories: caloriesPerServing,
      replacement: match?.replacement ?? "More fiber-rich alternative",
      reason:
        match?.reason ??
        "Replace with a lower glycemic, higher fiber option to improve post-meal response.",
    };
  });

  const totalQuantity = resolvedItems.reduce(
    (sum, item) => sum + item.quantity,
    0,
  );
  const estimatedCalories = Math.round(
    resolvedItems.reduce((sum, item) => sum + item.calories * item.quantity, 0),
  );

  const glycemicScore = Math.round(
    resolvedItems.reduce(
      (sum, item) => sum + item.glycemic * item.quantity,
      0,
    ) / Math.max(totalQuantity, 1),
  );

  const highestGlycemicItem = [...resolvedItems].sort(
    (a, b) => b.glycemic - a.glycemic,
  )[0];

  const stepsRecommendation = Math.max(
    1200,
    Math.round(estimatedCalories * 19),
  );
  const walkMinutesRecommendation = Math.max(
    12,
    Math.round(stepsRecommendation / 105),
  );

  const replacementSuggestions = Array.from(
    new Map(
      resolvedItems
        .filter((item) => item.replacement)
        .map((item) => [
          item.name,
          `Swap ${item.name} with ${item.replacement} — ${item.reason}`,
        ]),
    ).values(),
  ).slice(0, 4);

  const preferenceText = options?.preference?.trim();
  const suggestionBase = highestGlycemicItem
    ? `Replace ${highestGlycemicItem.name} with ${highestGlycemicItem.replacement} to reduce sugar spike.`
    : "Balance this meal with more protein and fiber for steadier energy.";

  const suggestion = preferenceText
    ? `${suggestionBase} Preference considered: ${preferenceText}.`
    : suggestionBase;

  const avgConfidence = 0.74;

  return {
    title: "Meal intelligence report",
    subtitle: "AI Estimate • Based on your meal + portion confirmation",
    detectedItems: resolvedItems.map((item) => item.name),
    detectedDetails: resolvedItems.map((item) =>
      toDetectedDetail(item.name, avgConfidence, item.quantity),
    ),
    labels: options?.labels ?? [],
    glycemicScore,
    glycemicBand: getBand(glycemicScore),
    suggestion,
    replacementSuggestions,
    estimatedCalories,
    stepsRecommendation,
    walkMinutesRecommendation,
    source: options?.source ?? "manual",
    aiConfidence: avgConfidence,
    humanInLoopNote:
      "Hybrid model: AI detects foods, and user confirms quantities for better accuracy.",
  };
}
