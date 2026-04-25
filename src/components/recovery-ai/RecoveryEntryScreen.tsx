import { Ionicons } from "@expo/vector-icons";
import Slider from "@react-native-community/slider";
import * as DocumentPicker from "expo-document-picker";
import * as FileSystem from "expo-file-system";
import { Image } from "expo-image";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Pressable, ScrollView, Text, TextInput, View } from "react-native";
import { toast } from "sonner-native";

import { NeonButton } from "@/src/components/NeonButton";
import { ExerciseCard } from "@/src/components/recovery-ai/ExerciseCard";
import {
    buildRecoveryRecommendation,
    getRecoveryExerciseById,
    recoveryAreas,
    type RecoveryArea,
    type RecoveryExercise,
    type RecoveryInputPayload,
    type RecoveryRecommendation,
    type RecoveryRisk,
} from "@/src/constants/recovery-ai";
import { analyzeRecoveryCondition } from "@/src/services/recovery-ai.service";
import { useAppTheme } from "@/src/store/ui-store";

export type RecoveryStep =
  | "entry"
  | "upload"
  | "scan"
  | "describe"
  | "loading"
  | "result"
  | "player"
  | "complete";

interface UploadedFileState {
  name: string;
  uri: string;
  mimeType?: string;
}

const MAX_ATTACHMENT_BYTES = 4 * 1024 * 1024;

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function softCardStyle(theme: ReturnType<typeof useAppTheme>["theme"]) {
  return {
    borderColor: theme.border,
    backgroundColor: theme.surface,
    shadowColor: "#000000",
    shadowOpacity: 0.05,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 5 },
    elevation: 2,
  } as const;
}

function mapRiskTone(level: RecoveryRisk): string {
  if (level === "High") {
    return "rgba(239,68,68,0.14)";
  }
  if (level === "Medium") {
    return "rgba(245,158,11,0.14)";
  }
  return "rgba(139,92,246,0.14)";
}

function normalizeRecommendation(
  input: RecoveryInputPayload,
  response: Awaited<ReturnType<typeof analyzeRecoveryCondition>>,
): RecoveryRecommendation {
  const fallback = buildRecoveryRecommendation(input);
  const exerciseIds =
    response.recommendedExerciseIds.length > 0
      ? response.recommendedExerciseIds
      : fallback.exercises.map((exercise) => exercise.id);

  const exercises = exerciseIds
    .map((exerciseId) => getRecoveryExerciseById(exerciseId))
    .filter((exercise): exercise is RecoveryExercise => Boolean(exercise));

  return {
    conditionSummary: response.conditionSummary || fallback.conditionSummary,
    riskLevel: response.riskLevel || fallback.riskLevel,
    riskAccent: mapRiskTone(response.riskLevel || fallback.riskLevel),
    aiSuggestion: response.aiSuggestion || fallback.aiSuggestion,
    disclaimer: response.disclaimer || fallback.disclaimer,
    progress: response.progress ?? fallback.progress,
    xpReward: response.xpReward ?? fallback.xpReward,
    recoveryPoints: response.recoveryPoints ?? fallback.recoveryPoints,
    exercises: exercises.length ? exercises : fallback.exercises,
  };
}

async function readBase64IfSupportedAttachment(
  uri: string,
  mimeType?: string,
  size?: number,
) {
  const supportsInlineData =
    mimeType?.startsWith("image/") || mimeType === "application/pdf";

  if (!supportsInlineData) {
    return undefined;
  }

  if (size && size > MAX_ATTACHMENT_BYTES) {
    return undefined;
  }

  try {
    return await FileSystem.readAsStringAsync(uri, {
      encoding: "base64",
    });
  } catch {
    return undefined;
  }
}

function IconChip({
  label,
  active,
  onPress,
  theme,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
  theme: ReturnType<typeof useAppTheme>["theme"];
}) {
  return (
    <Pressable
      onPress={onPress}
      className="rounded-full border px-4 py-2"
      style={({ pressed }) => ({
        borderColor: active ? theme.text : theme.border,
        backgroundColor: active ? theme.surfaceMuted : theme.surface,
        transform: [{ scale: pressed ? 0.98 : 1 }],
      })}
    >
      <Text className="text-xs font-medium" style={{ color: theme.text }}>
        {label}
      </Text>
    </Pressable>
  );
}

function RecoveryDot({
  level,
  theme,
}: {
  level: RecoveryRisk;
  theme: ReturnType<typeof useAppTheme>["theme"];
}) {
  const color =
    level === "High"
      ? "#F87171"
      : level === "Medium"
        ? "#FBBF24"
        : theme.accent;

  return (
    <View
      className="h-2.5 w-2.5 rounded-full"
      style={{ backgroundColor: color }}
    />
  );
}

function HeaderCard({
  title,
  subtitle,
  theme,
}: {
  title: string;
  subtitle: string;
  theme: ReturnType<typeof useAppTheme>["theme"];
}) {
  return (
    <View
      className="rounded-[28px] border px-5 py-5"
      style={softCardStyle(theme)}
    >
      <Text className="text-[30px] font-semibold" style={{ color: theme.text }}>
        {title}
      </Text>
      <Text
        className="mt-2 text-sm leading-6"
        style={{ color: theme.textMuted }}
      >
        {subtitle}
      </Text>
    </View>
  );
}

function SectionLabel({
  children,
  theme,
}: {
  children: string;
  theme: ReturnType<typeof useAppTheme>["theme"];
}) {
  return (
    <Text
      className="text-xs font-semibold uppercase tracking-[0.12em]"
      style={{ color: theme.textMuted }}
    >
      {children}
    </Text>
  );
}

function LoadingPanel({
  theme,
}: {
  theme: ReturnType<typeof useAppTheme>["theme"];
}) {
  return (
    <View
      className="rounded-[28px] border px-5 py-8"
      style={softCardStyle(theme)}
    >
      <Text className="text-lg font-semibold" style={{ color: theme.text }}>
        Analyzing your condition...
      </Text>
      <Text
        className="mt-2 text-sm leading-6"
        style={{ color: theme.textMuted }}
      >
        Recovery AI is reviewing your input and preparing safe movement
        guidance.
      </Text>
    </View>
  );
}

function RecoveryCompletion({
  recommendation,
  onDone,
}: {
  recommendation: RecoveryRecommendation;
  onDone: () => void;
}) {
  const { theme } = useAppTheme();

  return (
    <View
      className="gap-4 rounded-[28px] border px-5 py-6"
      style={softCardStyle(theme)}
    >
      <Text className="text-2xl font-semibold" style={{ color: theme.text }}>
        Session Complete 🎉
      </Text>
      <Text className="text-sm leading-6" style={{ color: theme.textMuted }}>
        Your guided recovery session is complete.
      </Text>

      <View
        className="rounded-2xl border px-4 py-4"
        style={{
          borderColor: theme.border,
          backgroundColor: theme.surfaceMuted,
        }}
      >
        <Text
          className="text-xs font-semibold"
          style={{ color: theme.textMuted }}
        >
          XP gained
        </Text>
        <Text
          className="mt-1 text-2xl font-semibold"
          style={{ color: theme.text }}
        >
          +{recommendation.xpReward}
        </Text>
      </View>

      <View
        className="rounded-2xl border px-4 py-4"
        style={{
          borderColor: theme.border,
          backgroundColor: theme.surfaceMuted,
        }}
      >
        <Text
          className="text-xs font-semibold"
          style={{ color: theme.textMuted }}
        >
          Recovery progress
        </Text>
        <Text
          className="mt-1 text-2xl font-semibold"
          style={{ color: theme.text }}
        >
          +{recommendation.progress}%
        </Text>
      </View>

      <NeonButton label="Done" onPress={onDone} />
    </View>
  );
}

function RecoverySessionPlayer({
  recommendation,
  onComplete,
  onBack,
}: {
  recommendation: RecoveryRecommendation;
  onComplete: () => void;
  onBack: () => void;
}) {
  const { theme } = useAppTheme();
  const [sessionIndex, setSessionIndex] = useState(0);
  const [instructionIndex, setInstructionIndex] = useState(0);

  const currentExercise = recommendation.exercises[sessionIndex];
  const instructions = currentExercise.instructions;
  const currentInstruction =
    instructions[Math.min(instructionIndex, instructions.length - 1)] ??
    instructions[0];

  function handleNext() {
    if (instructionIndex < instructions.length - 1) {
      setInstructionIndex((value) => value + 1);
      return;
    }

    if (sessionIndex < recommendation.exercises.length - 1) {
      setSessionIndex((value) => value + 1);
      setInstructionIndex(0);
      return;
    }

    onComplete();
  }

  return (
    <View className="gap-4">
      <View
        className="rounded-[28px] border px-5 py-5"
        style={softCardStyle(theme)}
      >
        <Text
          className="text-xs font-semibold uppercase tracking-[0.12em]"
          style={{ color: theme.textMuted }}
        >
          Guided Session
        </Text>
        <Text
          className="mt-2 text-2xl font-semibold"
          style={{ color: theme.text }}
        >
          {currentExercise.title}
        </Text>
        <Text className="mt-1 text-sm" style={{ color: theme.textMuted }}>
          {currentExercise.duration}
        </Text>
      </View>

      <View
        className="overflow-hidden rounded-[28px] border"
        style={softCardStyle(theme)}
      >
        <Image
          source={currentExercise.image}
          className="h-72 w-full"
          contentFit="cover"
        />
        <View className="px-5 py-5">
          <View className="flex-row items-center justify-between gap-3">
            <View
              className="rounded-full border px-3 py-1.5"
              style={{
                borderColor: theme.border,
                backgroundColor: theme.surfaceMuted,
              }}
            >
              <Text
                className="text-[11px] font-semibold"
                style={{ color: theme.text }}
              >
                Step {sessionIndex + 1} of {recommendation.exercises.length}
              </Text>
            </View>
            <View
              className="rounded-full border px-3 py-1.5"
              style={{
                borderColor: theme.border,
                backgroundColor: theme.surfaceMuted,
              }}
            >
              <Text
                className="text-[11px] font-semibold"
                style={{ color: theme.text }}
              >
                {currentExercise.area}
              </Text>
            </View>
          </View>

          <Text
            className="mt-4 text-sm leading-6"
            style={{ color: theme.textMuted }}
          >
            {currentExercise.description}
          </Text>
        </View>
      </View>

      <View
        className="rounded-[28px] border px-5 py-5"
        style={softCardStyle(theme)}
      >
        <SectionLabel theme={theme}>Instruction</SectionLabel>
        <Text className="mt-2 text-sm leading-6" style={{ color: theme.text }}>
          {currentInstruction}
        </Text>

        <View
          className="mt-4 rounded-2xl border px-4 py-4"
          style={{
            borderColor: theme.border,
            backgroundColor: theme.surfaceMuted,
          }}
        >
          <Text
            className="text-xs font-medium"
            style={{ color: theme.textMuted }}
          >
            Posture feedback
          </Text>
          <Text
            className="mt-1 text-sm font-semibold"
            style={{ color: theme.text }}
          >
            {instructionIndex % 2 === 0
              ? "Good posture"
              : "Adjust your knee angle slightly"}
          </Text>
        </View>
      </View>

      <View
        className="rounded-[28px] border px-5 py-5"
        style={softCardStyle(theme)}
      >
        <SectionLabel theme={theme}>Timer / Rep Counter</SectionLabel>
        <Text
          className="mt-2 text-3xl font-semibold"
          style={{ color: theme.text }}
        >
          {currentExercise.reps}
        </Text>
        <Text className="mt-2 text-sm" style={{ color: theme.textMuted }}>
          Keep moving slowly and stop if pain increases.
        </Text>
      </View>

      <View className="gap-3">
        <NeonButton label="Next" onPress={handleNext} />
        <NeonButton label="Back" onPress={onBack} variant="secondary" />
      </View>
    </View>
  );
}

export function RecoveryEntryScreen() {
  const router = useRouter();
  const { theme } = useAppTheme();
  const [step, setStep] = useState<RecoveryStep>("entry");
  const [payload, setPayload] = useState<RecoveryInputPayload>({
    mode: "describe",
    area: "knee",
    painLevel: 4,
    symptoms: {
      swelling: false,
      stiffness: true,
      sharpPain: false,
    },
    notes: "",
  });
  const [uploadedFile, setUploadedFile] = useState<UploadedFileState | null>(
    null,
  );
  const [uploadedPreviewUri, setUploadedPreviewUri] = useState<string | null>(
    null,
  );
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [imageBase64, setImageBase64] = useState<string | undefined>(undefined);
  const [recommendation, setRecommendation] =
    useState<RecoveryRecommendation | null>(null);
  const [selectedArea, setSelectedArea] = useState<RecoveryArea>("knee");
  const [areaPickerOpen, setAreaPickerOpen] = useState(false);

  function resetFlow() {
    setStep("entry");
    setPayload({
      mode: "describe",
      area: "knee",
      painLevel: 4,
      symptoms: { swelling: false, stiffness: true, sharpPain: false },
      notes: "",
    });
    setUploadedFile(null);
    setUploadedPreviewUri(null);
    setImageUri(null);
    setImageBase64(undefined);
    setRecommendation(null);
    setSelectedArea("knee");
    setAreaPickerOpen(false);
  }

  async function openUpload() {
    setPayload((current) => ({ ...current, mode: "upload" }));
    setStep("upload");
    const result = await DocumentPicker.getDocumentAsync({
      type: ["application/pdf", "image/*"],
      copyToCacheDirectory: true,
      multiple: false,
    });

    if (result.canceled || !result.assets?.[0]) {
      setStep("entry");
      return;
    }

    const asset = result.assets[0];
    const mimeType = asset.mimeType ?? undefined;
    const previewUri = mimeType?.startsWith("image/") ? asset.uri : null;
    const base64 = await readBase64IfSupportedAttachment(
      asset.uri,
      mimeType,
      asset.size,
    );

    setUploadedFile({
      name: asset.name ?? "injury-report",
      uri: asset.uri,
      mimeType,
    });
    setUploadedPreviewUri(previewUri);
    setImageBase64(base64);
    setPayload((current) => ({
      ...current,
      fileName: asset.name,
      fileUri: asset.uri,
      fileType: mimeType,
      imageBase64: base64,
    }));
    setStep("upload");
    toast.success("Report uploaded");
  }

  async function openScan() {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) {
      toast.error("Camera access is required to scan the affected area.");
      return;
    }

    setPayload((current) => ({ ...current, mode: "scan" }));
    setStep("scan");
    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      quality: 0.85,
      base64: true,
      mediaTypes: ["images"],
    });

    if (result.canceled || !result.assets[0]) {
      setStep("entry");
      return;
    }

    const asset = result.assets[0];
    const scanMimeType = asset.mimeType ?? "image/jpeg";
    setImageUri(asset.uri);
    setImageBase64(asset.base64 ?? undefined);
    setPayload((current) => ({
      ...current,
      fileName: "scan-capture.jpg",
      fileType: scanMimeType,
      imageUri: asset.uri,
      imageBase64: asset.base64 ?? undefined,
    }));
    setStep("scan");
    toast.success("Area captured");
  }

  async function analyzeCondition() {
    setStep("loading");

    try {
      const response = await analyzeRecoveryCondition({
        ...payload,
        area: selectedArea,
        imageBase64,
      });

      await sleep(1200);
      setRecommendation(
        normalizeRecommendation(
          { ...payload, area: selectedArea, imageBase64 },
          response,
        ),
      );
      setStep("result");

      if (response.source === "fallback") {
        toast.info("Gemini unavailable. Showing safe dummy guidance.");
      } else {
        toast.success("Recovery guidance ready.");
      }
    } catch (error) {
      const fallback = buildRecoveryRecommendation({
        ...payload,
        area: selectedArea,
        imageBase64,
      });
      setRecommendation(fallback);
      setStep("result");
      toast.error(
        error instanceof Error ? error.message : "Recovery AI failed.",
      );
    }
  }

  function proceedFromUpload() {
    if (!uploadedFile) {
      toast.error("Upload a PDF or image report first.");
      return;
    }
    setPayload((current) => ({ ...current, mode: "upload" }));
    void analyzeCondition();
  }

  function proceedFromScan() {
    if (!imageUri) {
      toast.error("Capture an injury image first.");
      return;
    }
    setPayload((current) => ({ ...current, mode: "scan", imageUri }));
    void analyzeCondition();
  }

  function proceedFromDescribe() {
    setPayload((current) => ({
      ...current,
      mode: "describe",
      area: selectedArea,
    }));
    void analyzeCondition();
  }

  return (
    <ScrollView
      className="flex-1"
      contentContainerStyle={{
        padding: 16,
        paddingTop: 12,
        paddingBottom: 32,
        gap: 18,
      }}
    >
      <View className="flex-row items-center justify-between">
        <Pressable
          onPress={() =>
            step === "entry" ? router.push("/(app)/(tabs)/home") : resetFlow()
          }
          className="h-11 w-11 items-center justify-center rounded-full border"
          style={{
            borderColor: theme.border,
            backgroundColor: theme.surface,
            shadowColor: "#000000",
            shadowOpacity: 0.04,
            shadowRadius: 10,
            shadowOffset: { width: 0, height: 3 },
            elevation: 1,
          }}
        >
          <Ionicons name="arrow-back" size={18} color={theme.text} />
        </Pressable>
        <Text
          className="text-xs font-medium"
          style={{ color: theme.textMuted }}
        >
          Recovery AI
        </Text>
        <View className="h-11 w-11" />
      </View>

      <HeaderCard
        title="Recover Smarter"
        subtitle="Smart guidance for minor knee, shoulder, back, and neck issues."
        theme={theme}
      />

      {step === "entry" ? (
        <View className="gap-3">
          <Text
            className="text-xs font-semibold uppercase tracking-[0.12em]"
            style={{ color: theme.textMuted }}
          >
            Choose input
          </Text>
          <View
            className="rounded-2xl border px-4 py-3"
            style={{
              borderColor: theme.border,
              backgroundColor: theme.surfaceMuted,
            }}
          >
            <Text className="text-xs leading-5" style={{ color: theme.textMuted }}>
              You can provide any combination of context — PDF report, image, or text description. None is required, just share what you have.
            </Text>
          </View>
          <View className="gap-3">
            <Pressable
              onPress={() => setStep("describe")}
              className="rounded-2xl border px-4 py-4"
              style={({ pressed }) => ({
                borderColor: theme.accent,
                backgroundColor: theme.surface,
                shadowColor: "#000000",
                shadowOpacity: 0.04,
                shadowRadius: 10,
                shadowOffset: { width: 0, height: 3 },
                elevation: 1,
                transform: [{ scale: pressed ? 0.98 : 1 }],
              })}
            >
              <View className="flex-row items-start gap-4">
                <View
                  className="h-14 w-14 items-center justify-center rounded-2xl"
                  style={{
                    backgroundColor: theme.accent,
                  }}
                >
                  <Ionicons
                    name="sparkles"
                    size={22}
                    color="#FFFFFF"
                  />
                </View>
                <View className="flex-1">
                  <Text
                    className="text-base font-semibold"
                    style={{ color: theme.text }}
                  >
                    Smart Recovery Input
                  </Text>
                  <Text
                    className="mt-1 text-sm leading-5"
                    style={{ color: theme.textMuted }}
                  >
                    Describe pain, upload report, or scan area — all optional, use what you have.
                  </Text>
                </View>
              </View>
            </Pressable>

            <Pressable
              onPress={openUpload}
              className="rounded-2xl border px-4 py-4"
              style={({ pressed }) => ({
                borderColor: theme.border,
                backgroundColor: theme.surface,
                shadowColor: "#000000",
                shadowOpacity: 0.04,
                shadowRadius: 10,
                shadowOffset: { width: 0, height: 3 },
                elevation: 1,
                transform: [{ scale: pressed ? 0.98 : 1 }],
              })}
            >
              <View className="flex-row items-start gap-4">
                <View
                  className="h-14 w-14 items-center justify-center rounded-2xl border"
                  style={{
                    borderColor: theme.border,
                    backgroundColor: theme.surfaceMuted,
                  }}
                >
                  <Ionicons
                    name="document-text-outline"
                    size={22}
                    color={theme.text}
                  />
                </View>
                <View className="flex-1">
                  <Text
                    className="text-base font-semibold"
                    style={{ color: theme.text }}
                  >
                    Quick Upload Report
                  </Text>
                  <Text
                    className="mt-1 text-sm leading-5"
                    style={{ color: theme.textMuted }}
                  >
                    Jump straight to PDF or image upload.
                  </Text>
                </View>
              </View>
            </Pressable>

            <Pressable
              onPress={openScan}
              className="rounded-2xl border px-4 py-4"
              style={({ pressed }) => ({
                borderColor: theme.border,
                backgroundColor: theme.surface,
                shadowColor: "#000000",
                shadowOpacity: 0.04,
                shadowRadius: 10,
                shadowOffset: { width: 0, height: 3 },
                elevation: 1,
                transform: [{ scale: pressed ? 0.98 : 1 }],
              })}
            >
              <View className="flex-row items-start gap-4">
                <View
                  className="h-14 w-14 items-center justify-center rounded-2xl border"
                  style={{
                    borderColor: theme.border,
                    backgroundColor: theme.surfaceMuted,
                  }}
                >
                  <Ionicons
                    name="camera-outline"
                    size={22}
                    color={theme.text}
                  />
                </View>
                <View className="flex-1">
                  <Text
                    className="text-base font-semibold"
                    style={{ color: theme.text }}
                  >
                    Quick Scan Area
                  </Text>
                  <Text
                    className="mt-1 text-sm leading-5"
                    style={{ color: theme.textMuted }}
                  >
                    Capture the affected area with your camera.
                  </Text>
                </View>
              </View>
            </Pressable>
          </View>
        </View>
      ) : null}

      {step === "upload" ? (
        <View className="gap-4">
          <View
            className="rounded-[28px] border px-5 py-5"
            style={softCardStyle(theme)}
          >
            <SectionLabel theme={theme}>Uploaded report</SectionLabel>
            {uploadedFile ? (
              <View
                className="mt-4 rounded-2xl border px-4 py-4"
                style={{
                  borderColor: theme.border,
                  backgroundColor: theme.surfaceMuted,
                }}
              >
                <Text
                  className="text-sm font-medium"
                  style={{ color: theme.text }}
                >
                  {uploadedFile.name}
                </Text>
                <Text
                  className="mt-1 text-xs"
                  style={{ color: theme.textMuted }}
                >
                  {uploadedFile.mimeType ?? "file"}
                </Text>
              </View>
            ) : null}
            {uploadedPreviewUri ? (
              <Image
                source={{ uri: uploadedPreviewUri }}
                className="mt-4 h-56 w-full rounded-2xl"
                contentFit="cover"
              />
            ) : null}
          </View>

          <NeonButton label="Analyze Condition" onPress={proceedFromUpload} />
          <NeonButton label="Back" onPress={resetFlow} variant="secondary" />
        </View>
      ) : null}

      {step === "scan" ? (
        <View className="gap-4">
          <View
            className="rounded-[28px] border px-5 py-5"
            style={softCardStyle(theme)}
          >
            <SectionLabel theme={theme}>Captured area</SectionLabel>
            {imageUri ? (
              <Image
                source={{ uri: imageUri }}
                className="mt-4 h-64 w-full rounded-2xl"
                contentFit="cover"
              />
            ) : (
              <View
                className="mt-4 h-64 items-center justify-center rounded-2xl border"
                style={{
                  borderColor: theme.border,
                  backgroundColor: theme.surfaceMuted,
                }}
              >
                <Text className="text-sm" style={{ color: theme.textMuted }}>
                  Capture a photo to continue
                </Text>
              </View>
            )}
          </View>

          <NeonButton
            label="Capture Again"
            onPress={openScan}
            variant="secondary"
          />
          <NeonButton label="Analyze Condition" onPress={proceedFromScan} />
          <NeonButton label="Back" onPress={resetFlow} variant="secondary" />
        </View>
      ) : null}

      {step === "describe" ? (
        <View className="gap-4">
          {/* Optional context attachments */}
          <View
            className="rounded-[28px] border px-5 py-5"
            style={softCardStyle(theme)}
          >
            <SectionLabel theme={theme}>Optional Attachments</SectionLabel>
            <Text
              className="mt-1 text-xs leading-5"
              style={{ color: theme.textMuted }}
            >
              Add a PDF report or image if you have one — or skip this entirely.
            </Text>

            <View className="mt-3 flex-row gap-3">
              <Pressable
                onPress={openUpload}
                className="flex-1 flex-row items-center gap-2 rounded-2xl border px-3 py-3"
                style={({ pressed }) => ({
                  borderColor: uploadedFile ? theme.accent : theme.border,
                  backgroundColor: uploadedFile
                    ? theme.surfaceMuted
                    : theme.surface,
                  transform: [{ scale: pressed ? 0.97 : 1 }],
                })}
              >
                <Ionicons
                  name={
                    uploadedFile
                      ? "checkmark-circle"
                      : "document-text-outline"
                  }
                  size={18}
                  color={uploadedFile ? theme.accent : theme.textMuted}
                />
                <Text
                  className="flex-1 text-xs font-medium"
                  style={{
                    color: uploadedFile ? theme.text : theme.textMuted,
                  }}
                  numberOfLines={1}
                >
                  {uploadedFile ? uploadedFile.name : "Upload PDF / Image"}
                </Text>
              </Pressable>

              <Pressable
                onPress={openScan}
                className="flex-1 flex-row items-center gap-2 rounded-2xl border px-3 py-3"
                style={({ pressed }) => ({
                  borderColor: imageUri ? theme.accent : theme.border,
                  backgroundColor: imageUri
                    ? theme.surfaceMuted
                    : theme.surface,
                  transform: [{ scale: pressed ? 0.97 : 1 }],
                })}
              >
                <Ionicons
                  name={imageUri ? "checkmark-circle" : "camera-outline"}
                  size={18}
                  color={imageUri ? theme.accent : theme.textMuted}
                />
                <Text
                  className="flex-1 text-xs font-medium"
                  style={{
                    color: imageUri ? theme.text : theme.textMuted,
                  }}
                  numberOfLines={1}
                >
                  {imageUri ? "Image captured" : "Scan Area"}
                </Text>
              </Pressable>
            </View>

            {/* Preview section */}
            {uploadedPreviewUri || imageUri ? (
              <View className="mt-3 flex-row gap-3">
                {uploadedPreviewUri ? (
                  <Image
                    source={{ uri: uploadedPreviewUri }}
                    className="h-28 flex-1 rounded-2xl"
                    contentFit="cover"
                  />
                ) : null}
                {imageUri ? (
                  <Image
                    source={{ uri: imageUri }}
                    className="h-28 flex-1 rounded-2xl"
                    contentFit="cover"
                  />
                ) : null}
              </View>
            ) : null}

            {uploadedFile && !uploadedPreviewUri ? (
              <View
                className="mt-3 rounded-xl border px-3 py-2"
                style={{
                  borderColor: theme.border,
                  backgroundColor: theme.surfaceMuted,
                }}
              >
                <Text
                  className="text-xs font-medium"
                  style={{ color: theme.text }}
                >
                  {uploadedFile.name}
                </Text>
                <Text
                  className="text-[10px]"
                  style={{ color: theme.textMuted }}
                >
                  {uploadedFile.mimeType ?? "file"}
                </Text>
              </View>
            ) : null}
          </View>

          <View
            className="rounded-[28px] border px-5 py-5"
            style={softCardStyle(theme)}
          >
            <SectionLabel theme={theme}>Area</SectionLabel>
            <Pressable
              onPress={() => setAreaPickerOpen((value) => !value)}
              className="mt-3 flex-row items-center justify-between rounded-2xl border px-4 py-4"
              style={{
                borderColor: theme.border,
                backgroundColor: theme.surfaceMuted,
              }}
            >
              <Text
                className="text-sm font-semibold"
                style={{ color: theme.text }}
              >
                {recoveryAreas.find((item) => item.value === selectedArea)
                  ?.label ?? "Knee"}
              </Text>
              <Ionicons
                name={areaPickerOpen ? "chevron-up" : "chevron-down"}
                size={16}
                color={theme.textMuted}
              />
            </Pressable>
            {areaPickerOpen ? (
              <View className="mt-3 flex-row flex-wrap gap-2">
                {recoveryAreas.map((item) => (
                  <IconChip
                    key={item.value}
                    label={item.label}
                    active={selectedArea === item.value}
                    onPress={() => setSelectedArea(item.value)}
                    theme={theme}
                  />
                ))}
              </View>
            ) : null}
          </View>

          <View
            className="rounded-[28px] border px-5 py-5"
            style={softCardStyle(theme)}
          >
            <SectionLabel theme={theme}>Pain level</SectionLabel>
            <Text
              className="mt-2 text-sm font-semibold"
              style={{ color: theme.text }}
            >
              {payload.painLevel ?? 4}/10
            </Text>
            <Slider
              value={payload.painLevel ?? 4}
              minimumValue={1}
              maximumValue={10}
              step={1}
              minimumTrackTintColor={theme.accent}
              maximumTrackTintColor={theme.border}
              thumbTintColor={theme.text}
              onValueChange={(value) =>
                setPayload((current) => ({ ...current, painLevel: value }))
              }
            />
          </View>

          <View
            className="rounded-[28px] border px-5 py-5"
            style={softCardStyle(theme)}
          >
            <SectionLabel theme={theme}>Symptoms</SectionLabel>
            <View className="mt-3 flex-row flex-wrap gap-2">
              {[
                ["swelling", "Swelling"],
                ["stiffness", "Stiffness"],
                ["sharpPain", "Sharp pain"],
              ].map(([key, label]) => {
                const symptomKey = key as keyof NonNullable<
                  RecoveryInputPayload["symptoms"]
                >;
                const active = Boolean(payload.symptoms?.[symptomKey]);
                return (
                  <IconChip
                    key={key}
                    label={label}
                    active={active}
                    onPress={() =>
                      setPayload((current) => ({
                        ...current,
                        symptoms: {
                          swelling:
                            symptomKey === "swelling"
                              ? !active
                              : Boolean(current.symptoms?.swelling),
                          stiffness:
                            symptomKey === "stiffness"
                              ? !active
                              : Boolean(current.symptoms?.stiffness),
                          sharpPain:
                            symptomKey === "sharpPain"
                              ? !active
                              : Boolean(current.symptoms?.sharpPain),
                        },
                      }))
                    }
                    theme={theme}
                  />
                );
              })}
            </View>
          </View>

          <View
            className="rounded-[28px] border px-5 py-5"
            style={softCardStyle(theme)}
          >
            <SectionLabel theme={theme}>Optional notes</SectionLabel>
            <TextInput
              value={payload.notes ?? ""}
              onChangeText={(value) =>
                setPayload((current) => ({ ...current, notes: value }))
              }
              placeholder="Example: pain while climbing stairs"
              placeholderTextColor={theme.textMuted}
              className="mt-3 rounded-2xl border px-4 py-3"
              multiline
              style={{
                borderColor: theme.border,
                backgroundColor: theme.surfaceMuted,
                color: theme.text,
                minHeight: 88,
                textAlignVertical: "top",
              }}
            />
          </View>

          <NeonButton label="Analyze Condition" onPress={proceedFromDescribe} />
          <NeonButton label="Back" onPress={resetFlow} variant="secondary" />
        </View>
      ) : null}

      {step === "loading" ? <LoadingPanel theme={theme} /> : null}

      {step === "result" && recommendation ? (
        <View className="gap-4">
          <View
            className="rounded-[28px] border px-5 py-5"
            style={softCardStyle(theme)}
          >
            <SectionLabel theme={theme}>Condition Summary</SectionLabel>
            <Text
              className="mt-2 text-2xl font-semibold"
              style={{ color: theme.text }}
            >
              {recommendation.conditionSummary}
            </Text>
            <Text
              className="mt-2 text-sm leading-6"
              style={{ color: theme.textMuted }}
            >
              {recommendation.aiSuggestion}
            </Text>
          </View>

          <View
            className="rounded-[28px] border px-5 py-5"
            style={softCardStyle(theme)}
          >
            <SectionLabel theme={theme}>Risk Level</SectionLabel>
            <View
              className="mt-3 flex-row items-center gap-2 rounded-full border px-4 py-2"
              style={{
                borderColor: theme.border,
                backgroundColor: recommendation.riskAccent,
              }}
            >
              <RecoveryDot level={recommendation.riskLevel} theme={theme} />
              <Text
                className="text-sm font-semibold"
                style={{ color: theme.text }}
              >
                {recommendation.riskLevel}
              </Text>
            </View>
            <Text className="mt-3 text-sm" style={{ color: theme.textMuted }}>
              Based on your symptoms
            </Text>
            <Text className="mt-1 text-xs" style={{ color: theme.textMuted }}>
              {recommendation.disclaimer}
            </Text>
          </View>

          <View
            className="rounded-[28px] border px-5 py-5"
            style={softCardStyle(theme)}
          >
            <SectionLabel theme={theme}>Recommended Exercises</SectionLabel>
            <View className="mt-4 gap-3">
              {recommendation.exercises.map((exercise) => (
                <ExerciseCard
                  key={exercise.id}
                  exercise={exercise}
                  onPress={() =>
                    router.push({
                      pathname: "/(app)/recovery/[exerciseId]",
                      params: { exerciseId: exercise.id },
                    })
                  }
                />
              ))}
            </View>
          </View>

          <View
            className="rounded-[28px] border px-5 py-5"
            style={softCardStyle(theme)}
          >
            <SectionLabel theme={theme}>AI Suggestion</SectionLabel>
            <Text
              className="mt-2 text-sm leading-6"
              style={{ color: theme.text }}
            >
              {recommendation.aiSuggestion}
            </Text>
            <View className="mt-4 flex-row items-center justify-between">
              <Text className="text-xs" style={{ color: theme.textMuted }}>
                XP +{recommendation.xpReward}
              </Text>
              <Text className="text-xs" style={{ color: theme.textMuted }}>
                Recovery +{recommendation.recoveryPoints}
              </Text>
            </View>
          </View>

          <NeonButton label="Start Session" onPress={() => setStep("player")} />
          <NeonButton
            label="Analyze Another"
            onPress={resetFlow}
            variant="secondary"
          />
        </View>
      ) : null}

      {step === "player" && recommendation ? (
        <RecoverySessionPlayer
          recommendation={recommendation}
          onComplete={() => setStep("complete")}
          onBack={() => setStep("result")}
        />
      ) : null}

      {step === "complete" && recommendation ? (
        <RecoveryCompletion
          recommendation={recommendation}
          onDone={resetFlow}
        />
      ) : null}
    </ScrollView>
  );
}
