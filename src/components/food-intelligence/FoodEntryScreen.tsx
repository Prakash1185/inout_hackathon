import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { useCallback, useMemo, useState } from "react";
import { Alert, ScrollView, Text, View } from "react-native";

import {
  analyzeImageMeal,
  analyzeManualMeal,
  type ManualMealItemInput,
  type MealAnalysisResult,
} from "@/src/constants/food-intelligence";
import { GlycemicScoreBar } from "@/src/components/food-intelligence/GlycemicScoreBar";
import { FoodResultCard } from "@/src/components/food-intelligence/FoodResultCard";
import { ImageUploader } from "@/src/components/food-intelligence/ImageUploader";
import { LoadingState } from "@/src/components/food-intelligence/LoadingState";
import { ManualFoodForm } from "@/src/components/food-intelligence/ManualFoodForm";
import { SuggestionCard } from "@/src/components/food-intelligence/SuggestionCard";
import { UploadCard } from "@/src/components/food-intelligence/UploadCard";
import { NeonButton } from "@/src/components/NeonButton";
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
  const { theme } = useAppTheme();
  const [step, setStep] = useState<FoodFlowStep>("entry");
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [result, setResult] = useState<MealAnalysisResult | null>(null);
  const [manualItems, setManualItems] = useState<ManualMealItemInput[]>([
    createEmptyManualItem(),
  ]);

  const canAnalyzeManual = useMemo(
    () => manualItems.some((item) => item.foodName.trim().length > 1),
    [manualItems],
  );

  const runAnalysisDelay = useCallback(
    (nextResult: MealAnalysisResult) => {
      setStep("loading");
      setTimeout(() => {
        setResult(nextResult);
        setStep("result");
      }, 1400);
    },
    [],
  );

  async function pickImage(from: "camera" | "gallery") {
    const permission =
      from === "camera"
        ? await ImagePicker.requestCameraPermissionsAsync()
        : await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) {
      Alert.alert(
        "Permission needed",
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
            mediaTypes: ["images"],
          })
        : await ImagePicker.launchImageLibraryAsync({
            allowsEditing: true,
            quality: 0.8,
            mediaTypes: ["images"],
          });

    if (resultPicker.canceled || !resultPicker.assets[0]?.uri) {
      return;
    }

    const nextUri = resultPicker.assets[0].uri;
    setImageUri(nextUri);
    runAnalysisDelay(analyzeImageMeal(nextUri));
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

  function resetFlow() {
    setStep("entry");
    setImageUri(null);
    setResult(null);
    setManualItems([createEmptyManualItem()]);
  }

  function analyzeManual() {
    if (!canAnalyzeManual) {
      Alert.alert("Add a meal", "Enter at least one food item to continue.");
      return;
    }

    runAnalysisDelay(analyzeManualMeal(manualItems));
  }

  return (
    <ScrollView
      className="flex-1"
      contentContainerStyle={{ padding: 16, paddingBottom: 36, gap: 18 }}
    >
      <View>
        <Text className="text-[28px] font-bold" style={{ color: theme.text }}>
          Food Intelligence
        </Text>
        <Text className="mt-2 text-sm leading-6" style={{ color: theme.textMuted }}>
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

          <NeonButton label="Analyze Meal" onPress={analyzeManual} />
          <NeonButton label="Back" onPress={resetFlow} variant="secondary" />
        </View>
      ) : null}

      {step === "loading" ? <LoadingState /> : null}

      {step === "result" && result ? (
        <View className="gap-4">
          <FoodResultCard result={result} />

          <View
            className="rounded-3xl border px-5 py-5"
            style={{ borderColor: theme.border, backgroundColor: theme.surface }}
          >
            <GlycemicScoreBar score={result.glycemicScore} />

            <View className="mt-5 flex-row items-center gap-3 rounded-2xl border px-4 py-4"
              style={{ borderColor: theme.border, backgroundColor: theme.surfaceMuted }}
            >
              <View
                className="h-10 w-10 items-center justify-center rounded-full border"
                style={{ borderColor: theme.border, backgroundColor: theme.surface }}
              >
                <Ionicons name="flash-outline" size={18} color={theme.text} />
              </View>
              <View>
                <Text className="text-xs" style={{ color: theme.textMuted }}>
                  AI Estimate
                </Text>
                <Text className="text-sm font-semibold" style={{ color: theme.text }}>
                  Approx. {result.estimatedCalories} kcal
                </Text>
              </View>
            </View>
          </View>

          <SuggestionCard suggestion={result.suggestion} />

          <View className="gap-3">
            <NeonButton
              label="Save Meal"
              onPress={() => {
                Alert.alert("Meal saved", "Your meal has been added to today’s log.");
              }}
            />
            <NeonButton
              label="Start Health Quest"
              onPress={() => {
                Alert.alert(
                  "Quest started",
                  "We created a small health quest from this meal insight.",
                );
              }}
              variant="secondary"
            />
            <NeonButton label="Analyze Another Meal" onPress={resetFlow} variant="secondary" />
          </View>
        </View>
      ) : null}
    </ScrollView>
  );
}
