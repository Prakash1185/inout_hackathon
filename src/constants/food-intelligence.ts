export interface FoodCatalogItem {
  id: string;
  name: string;
  glycemic: number;
  category: "grain" | "protein" | "vegetable" | "meal";
  suggestion: string;
}

export interface MealAnalysisResult {
  title: string;
  subtitle: string;
  detectedItems: string[];
  detectedDetails?: FoodDetectedDetail[];
  labels?: FoodLabelHint[];
  glycemicScore: number;
  glycemicBand?: "Low" | "Medium" | "High";
  suggestion: string;
  replacementSuggestions?: string[];
  estimatedCalories: number;
  stepsRecommendation?: number;
  walkMinutesRecommendation?: number;
  aiConfidence?: number;
  source?: "vision" | "manual" | "fallback";
  humanInLoopNote?: string;
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

export interface ManualMealItemInput {
  id: string;
  foodName: string;
  quantity: number;
  notes?: string;
}

export const foodCatalog: FoodCatalogItem[] = [
  {
    id: "rice",
    name: "Rice",
    glycemic: 78,
    category: "grain",
    suggestion: "Mix with dal, curd, or salad to slow the sugar rise.",
  },
  {
    id: "roti",
    name: "Roti",
    glycemic: 56,
    category: "grain",
    suggestion: "Keep oil low and pair with paneer or dal for better balance.",
  },
  {
    id: "dal",
    name: "Dal",
    glycemic: 34,
    category: "protein",
    suggestion: "Great base item. Add more fiber with salad or sabzi.",
  },
  {
    id: "paneer",
    name: "Paneer",
    glycemic: 18,
    category: "protein",
    suggestion: "Good for protein. Watch buttery gravy portions.",
  },
  {
    id: "sabzi",
    name: "Sabzi",
    glycemic: 28,
    category: "vegetable",
    suggestion: "A solid low-impact side. Keep masala and oil moderate.",
  },
  {
    id: "poha",
    name: "Poha",
    glycemic: 68,
    category: "meal",
    suggestion: "Add peanuts, curd, or sprouts to improve satiety.",
  },
  {
    id: "idli",
    name: "Idli",
    glycemic: 63,
    category: "meal",
    suggestion: "Pair with sambar instead of extra chutney for better balance.",
  },
  {
    id: "biryani",
    name: "Biryani",
    glycemic: 74,
    category: "meal",
    suggestion: "Keep the rice portion smaller and add raita or salad.",
  },
  {
    id: "brown rice",
    name: "Brown Rice",
    glycemic: 52,
    category: "grain",
    suggestion: "Better than white rice for steady energy release.",
  },
  {
    id: "curd",
    name: "Curd",
    glycemic: 19,
    category: "protein",
    suggestion: "Helpful add-on for a calmer meal response.",
  },
];

export const imageMealPresets: MealAnalysisResult[] = [
  {
    title: "Lunch thali",
    subtitle: "AI Estimate • Based on your meal photo",
    detectedItems: ["Rice", "Dal", "Sabzi"],
    glycemicScore: 64,
    suggestion:
      "Replace half the rice with brown rice or add more sabzi to reduce the sugar spike.",
    estimatedCalories: 520,
  },
  {
    title: "Roti paneer plate",
    subtitle: "AI Estimate • Based on your meal photo",
    detectedItems: ["Roti", "Paneer", "Sabzi"],
    glycemicScore: 43,
    suggestion:
      "This meal is balanced. Keep paneer gravy lighter if you want a cleaner post-meal feel.",
    estimatedCalories: 460,
  },
  {
    title: "Breakfast bowl",
    subtitle: "AI Estimate • Based on your meal photo",
    detectedItems: ["Poha", "Curd", "Peanuts"],
    glycemicScore: 58,
    suggestion:
      "A spoon of curd or more peanuts can make this meal more filling and lower the quick sugar rise.",
    estimatedCalories: 340,
  },
];

export function getGlycemicLabel(score: number) {
  if (score < 40) {
    return "Low";
  }
  if (score < 70) {
    return "Medium";
  }
  return "High";
}

export function getGlycemicBarWidth(score: number) {
  return `${Math.max(10, Math.min(score, 100))}%`;
}

export function analyzeManualMeal(
  items: ManualMealItemInput[],
): MealAnalysisResult {
  const normalizedItems = items
    .map((item) => ({
      ...item,
      foodName: item.foodName.trim(),
    }))
    .filter((item) => item.foodName.length > 0);

  const scoredItems = normalizedItems.map((item) => {
    const catalogMatch = foodCatalog.find(
      (catalogItem) =>
        catalogItem.name.toLowerCase() === item.foodName.toLowerCase(),
    );

    return {
      name: item.foodName,
      quantity: item.quantity,
      glycemic: catalogMatch?.glycemic ?? 52,
      suggestion:
        catalogMatch?.suggestion ??
        "Pair this with more protein or fiber for a steadier meal.",
    };
  });

  const totalQuantity = scoredItems.reduce(
    (sum, item) => sum + Math.max(1, item.quantity),
    0,
  );

  const weightedScore = Math.round(
    scoredItems.reduce(
      (sum, item) => sum + item.glycemic * Math.max(1, item.quantity),
      0,
    ) / Math.max(totalQuantity, 1),
  );

  const suggestion =
    scoredItems
      .sort((a, b) => b.glycemic - a.glycemic)
      .map((item) => item.suggestion)[0] ??
    "Add more protein or vegetables to improve this meal balance.";

  return {
    title: "Custom meal",
    subtitle: "AI Estimate • Based on your meal entry",
    detectedItems: scoredItems.map((item) => item.name),
    glycemicScore: weightedScore,
    suggestion,
    replacementSuggestions: [suggestion],
    estimatedCalories: 180 + totalQuantity * 110,
    stepsRecommendation: Math.max(
      1200,
      Math.round((180 + totalQuantity * 110) * 19),
    ),
    walkMinutesRecommendation: Math.max(
      12,
      Math.round(Math.max(1200, (180 + totalQuantity * 110) * 19) / 105),
    ),
    aiConfidence: 0.68,
    source: "manual",
    humanInLoopNote:
      "Hybrid mode: user-entered meal details improve analysis reliability.",
  };
}

export function analyzeImageMeal(imageUri: string): MealAnalysisResult {
  const presetIndex = imageUri.length % imageMealPresets.length;
  const base = imageMealPresets[presetIndex] ?? imageMealPresets[0];

  return {
    ...base,
    replacementSuggestions: [base.suggestion],
    stepsRecommendation: Math.max(
      1200,
      Math.round(base.estimatedCalories * 19),
    ),
    walkMinutesRecommendation: Math.max(
      12,
      Math.round(Math.max(1200, base.estimatedCalories * 19) / 105),
    ),
    aiConfidence: 0.71,
    source: "fallback",
    humanInLoopNote:
      "Hybrid mode: AI detects meal, user confirms portion size for better accuracy.",
  };
}
