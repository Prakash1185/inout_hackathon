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

async function detectLabelsFromVision(
  imageBase64: string,
): Promise<Array<{ text: string; score: number }>> {
  if (!env.VISION_API_KEY) {
    return [];
  }

  const response = await fetch(
    `https://vision.googleapis.com/v1/images:annotate?key=${env.VISION_API_KEY}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        requests: [
          {
            image: { content: imageBase64 },
            features: [
              { type: "LABEL_DETECTION", maxResults: 16 },
              { type: "OBJECT_LOCALIZATION", maxResults: 10 },
            ],
          },
        ],
      }),
    },
  );

  if (!response.ok) {
    return [];
  }

  const payload = (await response.json()) as {
    responses?: Array<{
      labelAnnotations?: Array<{ description?: string; score?: number }>;
      localizedObjectAnnotations?: Array<{ name?: string; score?: number }>;
    }>;
  };

  const block = payload.responses?.[0];
  const labels = (block?.labelAnnotations ?? [])
    .map((entry) => ({
      text: entry.description ?? "",
      score: Number(entry.score ?? 0),
    }))
    .filter((entry) => entry.text.trim().length > 0);

  const objects = (block?.localizedObjectAnnotations ?? [])
    .map((entry) => ({
      text: entry.name ?? "",
      score: Number(entry.score ?? 0),
    }))
    .filter((entry) => entry.text.trim().length > 0);

  return [...labels, ...objects].sort((a, b) => b.score - a.score).slice(0, 20);
}

function mapLabelsToFoods(
  labels: Array<{ text: string; score: number }>,
): Array<{ name: string; confidence: number }> {
  const bucket = new Map<string, number>();

  for (const label of labels) {
    const normalizedLabel = label.text.trim().toLowerCase();
    const matchedItems = foodCatalog.filter((item) =>
      item.aliases.some(
        (alias) =>
          normalizedLabel.includes(alias) || alias.includes(normalizedLabel),
      ),
    );

    if (!matchedItems.length) {
      continue;
    }

    for (const matched of matchedItems) {
      const previous = bucket.get(matched.name) ?? 0;
      bucket.set(matched.name, Math.max(previous, label.score));
    }
  }

  return Array.from(bucket.entries())
    .map(([name, confidence]) => ({ name, confidence }))
    .sort((a, b) => b.confidence - a.confidence)
    .slice(0, 6);
}

function deriveFoodsFromLabelHeuristics(
  labels: Array<{ text: string; score: number }>,
): Array<{ name: string; confidence: number }> {
  const mapped = new Map<string, number>();

  for (const label of labels) {
    const text = label.text.trim().toLowerCase();

    if (/rice|grain|pilaf|biryani|pulao|fried rice/.test(text)) {
      mapped.set("Rice", Math.max(mapped.get("Rice") ?? 0, label.score));
    }
    if (/roti|chapati|naan|flatbread|bread/.test(text)) {
      mapped.set("Roti", Math.max(mapped.get("Roti") ?? 0, label.score));
    }
    if (/dal|lentil|sambar|stew|soup/.test(text)) {
      mapped.set("Dal", Math.max(mapped.get("Dal") ?? 0, label.score));
    }
    if (/paneer|cottage cheese|cheese/.test(text)) {
      mapped.set("Paneer", Math.max(mapped.get("Paneer") ?? 0, label.score));
    }
    if (/vegetable|veggie|curry|salad/.test(text)) {
      mapped.set("Sabzi", Math.max(mapped.get("Sabzi") ?? 0, label.score));
    }
    if (/curd|yogurt|raita/.test(text)) {
      mapped.set("Curd", Math.max(mapped.get("Curd") ?? 0, label.score));
    }
    if (/poha/.test(text)) {
      mapped.set("Poha", Math.max(mapped.get("Poha") ?? 0, label.score));
    }
    if (/idli/.test(text)) {
      mapped.set("Idli", Math.max(mapped.get("Idli") ?? 0, label.score));
    }
  }

  return Array.from(mapped.entries())
    .map(([name, confidence]) => ({
      name,
      confidence: clamp(confidence * 0.85, 0.35, 0.95),
    }))
    .sort((a, b) => b.confidence - a.confidence)
    .slice(0, 5);
}

export async function detectFoodsFromImage(
  input: FoodDetectInput,
): Promise<FoodDetectResult> {
  let labels: Array<{ text: string; score: number }> = [];

  try {
    labels = await detectLabelsFromVision(input.imageBase64);
  } catch {
    return createFallbackDetectResult();
  }

  const mappedFoods = mapLabelsToFoods(labels);

  if (!mappedFoods.length) {
    const heuristicFoods = deriveFoodsFromLabelHeuristics(labels);

    if (heuristicFoods.length) {
      return {
        detectedDetails: heuristicFoods.map((item) =>
          toDetectedDetail(item.name, item.confidence),
        ),
        labels: labels.slice(0, 8).map((item) => ({
          label: toTitleCase(item.text),
          confidence: clamp(item.score, 0, 1),
        })),
        source: "vision",
        humanInLoopNote:
          "Vision labels were interpreted heuristically; confirm portions for best accuracy.",
      };
    }

    return createFallbackDetectResult();
  }

  return {
    detectedDetails: mappedFoods.map((item) =>
      toDetectedDetail(item.name, item.confidence),
    ),
    labels: labels.slice(0, 8).map((item) => ({
      label: toTitleCase(item.text),
      confidence: clamp(item.score, 0, 1),
    })),
    source: "vision",
    humanInLoopNote:
      "Hybrid mode: image AI detects food items, user confirms portions using sliders.",
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
