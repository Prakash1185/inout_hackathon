import { Ionicons } from "@expo/vector-icons";
import Slider from "@react-native-community/slider";
import { Image } from "expo-image";
import * as ImagePicker from "expo-image-picker";
import * as Print from "expo-print";
import { useRouter } from "expo-router";
import * as Sharing from "expo-sharing";
import { useCallback, useMemo, useState } from "react";
import { Pressable, ScrollView, Text, TextInput, View } from "react-native";
import { toast } from "sonner-native";

import { FoodResultCard } from "@/src/components/food-intelligence/FoodResultCard";
import { GlycemicScoreBar } from "@/src/components/food-intelligence/GlycemicScoreBar";
import { ImageUploader } from "@/src/components/food-intelligence/ImageUploader";
import { LoadingState } from "@/src/components/food-intelligence/LoadingState";
import { ManualFoodForm } from "@/src/components/food-intelligence/ManualFoodForm";
import { SuggestionCard } from "@/src/components/food-intelligence/SuggestionCard";
import { UploadCard } from "@/src/components/food-intelligence/UploadCard";
import { NeonButton } from "@/src/components/NeonButton";
import {
    analyzeImageMeal,
    analyzeManualMeal,
    type FoodDetectedDetail,
    type FoodLabelHint,
    type ManualMealItemInput,
    type MealAnalysisResult,
} from "@/src/constants/food-intelligence";
import {
    analyzeFoodMeal,
    detectFoodFromImage,
} from "@/src/services/food-intelligence.service";
import { useAppTheme } from "@/src/store/ui-store";

type FoodFlowStep = "entry" | "scan" | "manual" | "loading" | "result";

function createEmptyManualItem(): ManualMealItemInput {
  return {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    foodName: "",
    quantity: 1,
    notes: "",
  };
}

export function FoodEntryScreen() {
  const router = useRouter();
  const { theme } = useAppTheme();
  const [step, setStep] = useState<FoodFlowStep>("entry");
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [labelHints, setLabelHints] = useState<FoodLabelHint[]>([]);
  const [detectedDetails, setDetectedDetails] = useState<FoodDetectedDetail[]>(
    [],
  );
  const [analysisSource, setAnalysisSource] = useState<
    "vision" | "manual" | "fallback"
  >("manual");
  const [mealPreference, setMealPreference] = useState("");
  const [result, setResult] = useState<MealAnalysisResult | null>(null);
  const [manualItems, setManualItems] = useState<ManualMealItemInput[]>([
    createEmptyManualItem(),
  ]);

  const canAnalyzeManual = useMemo(
    () => manualItems.some((item) => item.foodName.trim().length > 1),
    [manualItems],
  );

  const mapFallbackResultToDetected = useCallback(
    (fallbackResult: MealAnalysisResult): FoodDetectedDetail[] =>
      fallbackResult.detectedItems.map((name, index) => ({
        name,
        confidence: Math.max(0.36, 0.62 - index * 0.05),
        quantity: 1,
        glycemic: fallbackResult.glycemicScore,
        estimatedCalories: Math.round(
          fallbackResult.estimatedCalories /
            Math.max(1, fallbackResult.detectedItems.length),
        ),
      })),
    [],
  );

  function isHardAiError(error: unknown): error is Error {
    return (
      error instanceof Error &&
      (error.message.includes("Please sign in") ||
        error.message.includes("Invalid meal payload"))
    );
  }

  function handleTopBack() {
    if (step === "entry") {
      router.push("/(app)/(tabs)/home");
      return;
    }

    if (step === "result") {
      setStep(imageUri ? "scan" : "manual");
      return;
    }

    if (step === "loading") {
      return;
    }

    setStep("entry");
  }

  async function pickImage(from: "camera" | "gallery") {
    const permission =
      from === "camera"
        ? await ImagePicker.requestCameraPermissionsAsync()
        : await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) {
      toast.error(
        from === "camera"
          ? "Please allow camera access to scan your meal."
          : "Please allow gallery access to upload your meal photo.",
      );
      return;
    }

    const resultPicker =
      from === "camera"
        ? await ImagePicker.launchCameraAsync({
            allowsEditing: true,
            quality: 0.8,
            base64: true,
            mediaTypes: ["images"],
          })
        : await ImagePicker.launchImageLibraryAsync({
            allowsEditing: true,
            quality: 0.8,
            base64: true,
            mediaTypes: ["images"],
          });

    if (resultPicker.canceled || !resultPicker.assets[0]?.uri) {
      return;
    }

    const nextAsset = resultPicker.assets[0];
    const nextUri = nextAsset.uri;
    setImageUri(nextUri);
    setStep("loading");

    if (!nextAsset.base64) {
      const fallbackResult = analyzeImageMeal(nextUri);
      setDetectedDetails(mapFallbackResultToDetected(fallbackResult));
      setLabelHints([]);
      setAnalysisSource("fallback");
      setStep("scan");
      toast.info("Image loaded. Confirm portions and run analysis.");
      return;
    }

    try {
      const detection = await detectFoodFromImage({
        imageBase64: nextAsset.base64,
      });

      setDetectedDetails(detection.detectedDetails);
      setLabelHints(detection.labels);
      setAnalysisSource(detection.source);
      setStep("scan");
      if (detection.source === "fallback") {
        toast.info("AI unavailable. Using dummy fallback labels for now.");
      } else {
        toast.success(
          "AI labels ready. Confirm portions before final analysis.",
        );
      }
    } catch (error) {
      if (isHardAiError(error)) {
        setStep("scan");
        toast.error(error.message);
        return;
      }

      const fallbackResult = analyzeImageMeal(nextUri);
      setDetectedDetails(mapFallbackResultToDetected(fallbackResult));
      setLabelHints([]);
      setAnalysisSource("fallback");
      setStep("scan");
      toast.info("Using local fallback labels. Confirm portions to continue.");
    }
  }

  function updateManualItem(
    id: string,
    field: keyof ManualMealItemInput,
    value: string | number,
  ) {
    setManualItems((current) =>
      current.map((item) =>
        item.id === id ? { ...item, [field]: value } : item,
      ),
    );
  }

  function updateDetectedQuantity(foodName: string, quantity: number) {
    setDetectedDetails((current) =>
      current.map((item) =>
        item.name === foodName
          ? {
              ...item,
              quantity,
            }
          : item,
      ),
    );
  }

  async function analyzeFromDetected() {
    if (!detectedDetails.length) {
      toast.error(
        "No detected meal items found. Please upload a meal image first.",
      );
      return;
    }

    setStep("loading");

    try {
      const nextResult = await analyzeFoodMeal({
        source: analysisSource,
        preference: mealPreference.trim() || undefined,
        labels: labelHints,
        items: detectedDetails.map((item) => ({
          foodName: item.name,
          quantity: item.quantity,
        })),
      });

      setResult(nextResult);
      setStep("result");
      if (nextResult.source === "fallback") {
        toast.info("AI unavailable. Showing dummy fallback meal report.");
      } else {
        toast.success(
          "Meal analyzed. Hybrid confirmation improved the report quality.",
        );
      }
    } catch (error) {
      if (isHardAiError(error)) {
        setStep("scan");
        toast.error(error.message);
        return;
      }

      const fallbackResult = analyzeImageMeal(imageUri ?? "fallback");
      const message =
        error instanceof Error
          ? error.message
          : "AI meal analysis failed. Showing fallback meal insights.";
      setResult({
        ...fallbackResult,
        detectedDetails,
        labels: labelHints,
        source: "fallback",
      });
      setStep("result");
      toast.error(message);
    }
  }

  async function downloadPdfReport() {
    if (!result) {
      return;
    }

    const detailRows = (result.detectedDetails ?? []).length
      ? (result.detectedDetails ?? [])
          .map(
            (item) =>
              `<tr><td>${item.name}</td><td>${item.quantity.toFixed(
                1,
              )}</td><td>${item.estimatedCalories}</td><td>${item.glycemic}</td></tr>`,
          )
          .join("")
      : result.detectedItems
          .map(
            (item) =>
              `<tr><td>${item}</td><td>1.0</td><td>-</td><td>-</td></tr>`,
          )
          .join("");

    const labels = (result.labels ?? [])
      .map((item) => `${item.label} (${Math.round(item.confidence * 100)}%)`)
      .join(" • ");

    const replacements = (result.replacementSuggestions ?? [])
      .map((item) => `<li>${item}</li>`)
      .join("");

    const html = `
      <html>
        <head>
          <meta charset="utf-8" />
          <style>
            body { font-family: Arial, sans-serif; padding: 24px; color: #111; }
            h1 { margin: 0 0 4px; }
            p { margin: 0 0 12px; color: #333; }
            .card { border: 1px solid #d7d7d7; border-radius: 10px; padding: 12px; margin-top: 12px; }
            table { width: 100%; border-collapse: collapse; margin-top: 8px; }
            th, td { border: 1px solid #d9d9d9; padding: 8px; text-align: left; font-size: 12px; }
            th { background: #f5f5f5; }
          </style>
        </head>
        <body>
          <h1>Food IQ Report</h1>
          <p>${result.subtitle}</p>
          <div class="card">
            <strong>Glycemic Score:</strong> ${result.glycemicScore} (${result.glycemicBand ?? "N/A"})<br/>
            <strong>Estimated Calories:</strong> ${result.estimatedCalories} kcal<br/>
            <strong>Post-meal Walk:</strong> ${result.stepsRecommendation ?? 0} steps (~${result.walkMinutesRecommendation ?? 0} min)
          </div>
          <div class="card">
            <strong>AI Labels:</strong> ${labels || "Not available"}
          </div>
          <div class="card">
            <strong>Detected Foods & Portions</strong>
            <table>
              <thead>
                <tr>
                  <th>Food</th><th>Portion</th><th>Calories</th><th>Glycemic</th>
                </tr>
              </thead>
              <tbody>${detailRows}</tbody>
            </table>
          </div>
          <div class="card">
            <strong>Suggestion</strong>
            <p>${result.suggestion}</p>
            <strong>Replacement Ideas</strong>
            <ul>${replacements || "<li>Focus on higher-fiber alternatives.</li>"}</ul>
          </div>
        </body>
      </html>`;

    try {
      const report = await Print.printToFileAsync({ html });
      const canShare = await Sharing.isAvailableAsync();

      if (canShare) {
        await Sharing.shareAsync(report.uri, {
          mimeType: "application/pdf",
          dialogTitle: "Share Food IQ report",
        });
      }

      toast.success("PDF report generated successfully.");
    } catch {
      toast.error("Could not generate PDF report.");
    }
  }

  function resetFlow() {
    setStep("entry");
    setImageUri(null);
    setLabelHints([]);
    setDetectedDetails([]);
    setAnalysisSource("manual");
    setMealPreference("");
    setResult(null);
    setManualItems([createEmptyManualItem()]);
  }

  async function analyzeManual() {
    if (!canAnalyzeManual) {
      toast.error("Enter at least one food item to continue.");
      return;
    }

    setStep("loading");

    try {
      const nextResult = await analyzeFoodMeal({
        source: "manual",
        preference: mealPreference.trim() || undefined,
        items: manualItems
          .filter((item) => item.foodName.trim().length > 0)
          .map((item) => ({
            foodName: item.foodName,
            quantity: Number(item.quantity || 1),
            notes: item.notes,
          })),
      });

      setResult(nextResult);
      setStep("result");
      if (nextResult.source === "fallback") {
        toast.info("AI unavailable. Showing dummy fallback manual analysis.");
      } else {
        toast.success("Manual meal analyzed successfully.");
      }
    } catch (error) {
      if (isHardAiError(error)) {
        setStep("manual");
        toast.error(error.message);
        return;
      }

      const message =
        error instanceof Error
          ? error.message
          : "AI service unavailable. Showing fallback manual analysis.";
      setResult(analyzeManualMeal(manualItems));
      setStep("result");
      toast.error(message);
    }
  }

  return (
    <ScrollView
      className="flex-1"
      contentContainerStyle={{ padding: 16, paddingBottom: 36, gap: 18 }}
    >
      <View className="flex-row items-center justify-between">
        <Pressable
          onPress={handleTopBack}
          className="h-11 w-11 items-center justify-center rounded-full border"
          style={{ borderColor: theme.border, backgroundColor: theme.surface }}
        >
          <Ionicons name="arrow-back" size={18} color={theme.text} />
        </Pressable>
        <Text
          className="text-xs font-medium"
          style={{ color: theme.textMuted }}
        >
          Food IQ
        </Text>
      </View>

      <View>
        <Text className="text-[28px] font-bold" style={{ color: theme.text }}>
          Food Intelligence
        </Text>
        <Text
          className="mt-2 text-sm leading-6"
          style={{ color: theme.textMuted }}
        >
          Scan your meal or add it manually to get a quick glycemic estimate and
          smarter next-step suggestions.
        </Text>
      </View>

      {step === "entry" ? (
        <View className="gap-4">
          <UploadCard
            title="Scan your meal"
            description="Capture a photo or upload one from your gallery for a fast AI-style estimate."
            icon="camera-outline"
            onPress={() => setStep("scan")}
          />
          <UploadCard
            title="Add manually"
            description="Enter your meal items yourself and get the same analysis in a cleaner form flow."
            icon="create-outline"
            onPress={() => setStep("manual")}
          />
        </View>
      ) : null}

      {step === "scan" ? (
        <View className="gap-4">
          <ImageUploader
            imageUri={imageUri}
            onPickCamera={() => pickImage("camera").catch(() => undefined)}
            onPickGallery={() => pickImage("gallery").catch(() => undefined)}
          />

          {detectedDetails.length ? (
            <View
              className="rounded-3xl border px-4 py-4"
              style={{
                borderColor: theme.border,
                backgroundColor: theme.surface,
              }}
            >
              <Text
                className="text-sm font-semibold"
                style={{ color: theme.text }}
              >
                AI detected foods, confirm your portions
              </Text>
              <Text className="mt-1 text-xs" style={{ color: theme.textMuted }}>
                Hybrid accuracy: AI labels + your final quantity confirmation.
              </Text>

              <View className="mt-3 gap-3">
                {detectedDetails.map((item) => (
                  <View
                    key={item.name}
                    className="rounded-2xl border px-3 py-3"
                    style={{
                      borderColor: theme.border,
                      backgroundColor: theme.surfaceMuted,
                    }}
                  >
                    <View className="flex-row items-center justify-between">
                      <Text
                        className="text-sm font-semibold"
                        style={{ color: theme.text }}
                      >
                        {item.name}
                      </Text>
                      <Text
                        className="text-xs"
                        style={{ color: theme.textMuted }}
                      >
                        {Math.round(item.confidence * 100)}% confidence
                      </Text>
                    </View>

                    <Slider
                      value={item.quantity}
                      minimumValue={0.5}
                      maximumValue={4}
                      step={0.5}
                      minimumTrackTintColor={theme.accent}
                      maximumTrackTintColor={theme.border}
                      thumbTintColor={theme.text}
                      onValueChange={(value) =>
                        updateDetectedQuantity(
                          item.name,
                          Number(value.toFixed(1)),
                        )
                      }
                    />

                    <View className="flex-row items-center justify-between">
                      <Text
                        className="text-xs"
                        style={{ color: theme.textMuted }}
                      >
                        {item.quantity.toFixed(1)} servings
                      </Text>
                      <Text
                        className="text-xs"
                        style={{ color: theme.textMuted }}
                      >
                        ~{Math.round(item.estimatedCalories * item.quantity)}{" "}
                        kcal
                      </Text>
                    </View>
                  </View>
                ))}
              </View>
            </View>
          ) : null}

          {labelHints.length ? (
            <View
              className="rounded-3xl border px-4 py-4"
              style={{
                borderColor: theme.border,
                backgroundColor: theme.surface,
              }}
            >
              <Text
                className="text-sm font-semibold"
                style={{ color: theme.text }}
              >
                Uploaded image labels
              </Text>
              <View className="mt-3 flex-row flex-wrap gap-2">
                {labelHints.map((item) => (
                  <View
                    key={`${item.label}-${item.confidence}`}
                    className="rounded-full border px-3 py-2"
                    style={{
                      borderColor: theme.border,
                      backgroundColor: theme.surfaceMuted,
                    }}
                  >
                    <Text
                      className="text-xs font-medium"
                      style={{ color: theme.text }}
                    >
                      {item.label} {Math.round(item.confidence * 100)}%
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          ) : null}

          <View
            className="rounded-3xl border px-4 py-4"
            style={{
              borderColor: theme.border,
              backgroundColor: theme.surface,
            }}
          >
            <Text
              className="text-xs font-semibold"
              style={{ color: theme.textMuted }}
            >
              Optional preference
            </Text>
            <TextInput
              value={mealPreference}
              onChangeText={setMealPreference}
              placeholder="Example: suggest low-carb replacements"
              placeholderTextColor={theme.textMuted}
              className="mt-3 rounded-2xl border px-4 py-3"
              style={{
                borderColor: theme.border,
                backgroundColor: theme.surfaceMuted,
                color: theme.text,
              }}
            />
          </View>

          <NeonButton
            label="Analyze Meal"
            onPress={() => void analyzeFromDetected()}
          />

          <NeonButton label="Back" onPress={resetFlow} variant="secondary" />
        </View>
      ) : null}

      {step === "manual" ? (
        <View className="gap-4">
          <ManualFoodForm
            items={manualItems}
            onChangeItem={updateManualItem}
            onAddItem={() =>
              setManualItems((current) => [...current, createEmptyManualItem()])
            }
          />

          <View
            className="rounded-3xl border px-4 py-4"
            style={{
              borderColor: theme.border,
              backgroundColor: theme.surface,
            }}
          >
            <Text
              className="text-xs font-semibold"
              style={{ color: theme.textMuted }}
            >
              Optional preference
            </Text>
            <TextInput
              value={mealPreference}
              onChangeText={setMealPreference}
              placeholder="Example: suggest higher-protein swaps"
              placeholderTextColor={theme.textMuted}
              className="mt-3 rounded-2xl border px-4 py-3"
              style={{
                borderColor: theme.border,
                backgroundColor: theme.surfaceMuted,
                color: theme.text,
              }}
            />
          </View>

          <NeonButton
            label="Analyze Meal"
            onPress={() => void analyzeManual()}
          />
          <NeonButton label="Back" onPress={resetFlow} variant="secondary" />
        </View>
      ) : null}

      {step === "loading" ? <LoadingState /> : null}

      {step === "result" && result ? (
        <View className="gap-4">
          {imageUri ? (
            <View
              className="rounded-3xl border px-4 py-4"
              style={{
                borderColor: theme.border,
                backgroundColor: theme.surface,
              }}
            >
              <Text
                className="text-sm font-semibold"
                style={{ color: theme.text }}
              >
                Uploaded meal image
              </Text>
              <Image
                source={{ uri: imageUri }}
                className="mt-3 h-52 w-full rounded-2xl"
                contentFit="cover"
              />
              {(result.labels ?? []).length ? (
                <View className="mt-3 flex-row flex-wrap gap-2">
                  {(result.labels ?? []).map((item) => (
                    <View
                      key={`${item.label}-${item.confidence}`}
                      className="rounded-full border px-3 py-2"
                      style={{
                        borderColor: theme.border,
                        backgroundColor: theme.surfaceMuted,
                      }}
                    >
                      <Text
                        className="text-xs font-medium"
                        style={{ color: theme.text }}
                      >
                        {item.label} {Math.round(item.confidence * 100)}%
                      </Text>
                    </View>
                  ))}
                </View>
              ) : null}
            </View>
          ) : null}

          <FoodResultCard result={result} />

          <View
            className="rounded-3xl border px-5 py-5"
            style={{
              borderColor: theme.border,
              backgroundColor: theme.surface,
            }}
          >
            <GlycemicScoreBar score={result.glycemicScore} />

            <View
              className="mt-5 flex-row items-center gap-3 rounded-2xl border px-4 py-4"
              style={{
                borderColor: theme.border,
                backgroundColor: theme.surfaceMuted,
              }}
            >
              <View
                className="h-10 w-10 items-center justify-center rounded-full border"
                style={{
                  borderColor: theme.border,
                  backgroundColor: theme.surface,
                }}
              >
                <Ionicons name="flash-outline" size={18} color={theme.text} />
              </View>
              <View>
                <Text className="text-xs" style={{ color: theme.textMuted }}>
                  AI Estimate
                </Text>
                <Text
                  className="text-sm font-semibold"
                  style={{ color: theme.text }}
                >
                  Approx. {result.estimatedCalories} kcal
                </Text>
              </View>
            </View>

            <View
              className="mt-3 flex-row items-center gap-3 rounded-2xl border px-4 py-4"
              style={{
                borderColor: theme.border,
                backgroundColor: theme.surfaceMuted,
              }}
            >
              <View
                className="h-10 w-10 items-center justify-center rounded-full border"
                style={{
                  borderColor: theme.border,
                  backgroundColor: theme.surface,
                }}
              >
                <Ionicons name="walk-outline" size={18} color={theme.text} />
              </View>
              <View>
                <Text className="text-xs" style={{ color: theme.textMuted }}>
                  Post-meal walk recommendation
                </Text>
                <Text
                  className="text-sm font-semibold"
                  style={{ color: theme.text }}
                >
                  {result.stepsRecommendation ?? 0} steps (~
                  {result.walkMinutesRecommendation ?? 0} min)
                </Text>
              </View>
            </View>
          </View>

          <SuggestionCard suggestion={result.suggestion} />

          {(result.replacementSuggestions ?? []).length ? (
            <View
              className="rounded-3xl border px-4 py-4"
              style={{
                borderColor: theme.border,
                backgroundColor: theme.surface,
              }}
            >
              <Text
                className="text-sm font-semibold"
                style={{ color: theme.text }}
              >
                Smart replacements
              </Text>
              <View className="mt-3 gap-2">
                {(result.replacementSuggestions ?? []).map((item) => (
                  <View
                    key={item}
                    className="rounded-2xl border px-3 py-3"
                    style={{
                      borderColor: theme.border,
                      backgroundColor: theme.surfaceMuted,
                    }}
                  >
                    <Text
                      className="text-xs leading-5"
                      style={{ color: theme.text }}
                    >
                      {item}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          ) : null}

          {result.humanInLoopNote ? (
            <View
              className="rounded-3xl border px-4 py-4"
              style={{
                borderColor: theme.border,
                backgroundColor: theme.surface,
              }}
            >
              <Text className="text-xs" style={{ color: theme.textMuted }}>
                {result.humanInLoopNote}
              </Text>
            </View>
          ) : null}

          <View className="gap-3">
            <NeonButton
              label="Save Meal"
              onPress={() => {
                toast.success("Meal saved to your log.");
              }}
            />
            <NeonButton
              label="Download PDF Report"
              onPress={() => void downloadPdfReport()}
              variant="secondary"
            />
            <NeonButton
              label="Start Walking"
              onPress={() => {
                router.push("/(app)/(tabs)/start");
              }}
              variant="secondary"
            />
            <NeonButton
              label="Analyze Another Meal"
              onPress={resetFlow}
              variant="secondary"
            />
          </View>
        </View>
      ) : null}
    </ScrollView>
  );
}
