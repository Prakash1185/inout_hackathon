import { Ionicons } from "@expo/vector-icons";
import { useMutation } from "@tanstack/react-query";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { Pressable, ScrollView, Text, TextInput, View } from "react-native";
import { toast } from "sonner-native";

import { NeonButton } from "@/src/components/NeonButton";
import { Screen } from "@/src/components/Screen";
import {
    buildTrainerPlan,
    exerciseLibrary,
    getExerciseById,
    getLevelProgress,
    type GeneratedExercise,
    type MuscleTarget,
} from "@/src/constants/ai-trainer";
import { generateTrainerPlanFromAi } from "@/src/services/ai-trainer.service";
import { useAuthStore } from "@/src/store/auth-store";
import { useCustomPlansStore } from "@/src/store/custom-plans-store";
import { useAppTheme } from "@/src/store/ui-store";

const targetOptions: MuscleTarget[] = [
  "Full Body",
  "Chest",
  "Back",
  "Legs",
  "Core",
  "Shoulders",
  "Arms",
];

type TabMode = "AI_PLAN" | "CUSTOM_PLANS";

function toInt(value: string, fallback: number) {
  const cleaned = value.replace(/[^0-9]/g, "");
  const parsed = Number(cleaned);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    return fallback;
  }
  return parsed;
}

function getCardState(
  exercise: GeneratedExercise,
  currentExercise: GeneratedExercise | undefined,
  completedIds: string[],
) {
  if (completedIds.includes(exercise.planId)) {
    return "Completed";
  }
  if (currentExercise?.planId === exercise.planId) {
    return "Current";
  }
  return "Queued";
}

export default function AiTrainerScreen() {
  const router = useRouter();
  const { theme } = useAppTheme();
  const user = useAuthStore((state) => state.user);
  const setUser = useAuthStore((state) => state.setUser);
  
  const customPlans = useCustomPlansStore((state) => state.plans);
  const addCustomPlan = useCustomPlansStore((state) => state.addPlan);
  const removeCustomPlan = useCustomPlansStore((state) => state.removePlan);

  const [activeTab, setActiveTab] = useState<TabMode>("AI_PLAN");

  // AI Plan State
  const [targetMuscle, setTargetMuscle] = useState<MuscleTarget>("Full Body");
  const [minutesInput, setMinutesInput] = useState("28");
  const [repetitionsInput, setRepetitionsInput] = useState("12");
  const [extraContext, setExtraContext] = useState("");
  const [plan, setPlan] = useState<GeneratedExercise[]>([]);
  
  // Custom Plan creation state
  const [isCreatingCustom, setIsCreatingCustom] = useState(false);
  const [customPlanName, setCustomPlanName] = useState("");
  const [selectedMuscleFilter, setSelectedMuscleFilter] = useState<MuscleTarget>("Full Body");
  const [customPlanDraft, setCustomPlanDraft] = useState<GeneratedExercise[]>([]);

  // Execution state (Shared)
  const [isStarted, setIsStarted] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [completedIds, setCompletedIds] = useState<string[]>([]);
  const [sessionXp, setSessionXp] = useState(0);
  const [activePlanName, setActivePlanName] = useState("AI Recommended Plan");

  const planMutation = useMutation({
    mutationFn: generateTrainerPlanFromAi,
  });

  const levelState = getLevelProgress(user);

  useEffect(() => {
    setPlan(
      buildTrainerPlan({
        targetMuscle,
        minutes: toInt(minutesInput, 28),
        repetitions: toInt(repetitionsInput, 12),
        extraContext,
      }),
    );
  }, []);

  const currentExercise = plan[currentStep];
  const currentStepDone =
    currentExercise && completedIds.includes(currentExercise.planId);

  const totalPlanXp = useMemo(
    () => plan.reduce((sum, item) => sum + item.xpReward, 0),
    [plan],
  );
  const estimatedMinutes = useMemo(
    () =>
      Math.round(plan.reduce((sum, item) => sum + item.durationSec, 0) / 60),
    [plan],
  );
  const completionRatio =
    plan.length === 0 ? 0 : completedIds.length / Math.max(plan.length, 1);

  const buildLocalFallbackPlan = () =>
    buildTrainerPlan({
      targetMuscle,
      minutes: toInt(minutesInput, 28),
      repetitions: toInt(repetitionsInput, 12),
      extraContext,
    });

  const regeneratePlan = async () => {
    const fallback = buildLocalFallbackPlan();
    let next: GeneratedExercise[] = fallback;

    try {
      const generated = await planMutation.mutateAsync({
        targetMuscle,
        minutes: toInt(minutesInput, 28),
        repetitions: toInt(repetitionsInput, 12),
        extraContext,
        userLevel: user?.level,
      });

      if (generated.plan.length > 0) {
        next = generated.plan;
      }
    } catch {
      next = fallback;
    }

    setPlan(next);
    setActivePlanName("AI Recommended Plan");
    setCurrentStep(0);
    setCompletedIds([]);
    setSessionXp(0);
    setIsStarted(false);
  };

  const startPlan = () => {
    if (plan.length === 0) {
      regeneratePlan().catch(() => undefined);
      return;
    }
    setIsStarted(true);
  };

  const loadCustomPlan = (customPlan: typeof customPlans[0]) => {
    setPlan(customPlan.exercises);
    setActivePlanName(customPlan.name);
    setCurrentStep(0);
    setCompletedIds([]);
    setSessionXp(0);
    setIsStarted(false);
    setActiveTab("AI_PLAN"); // Switch over to run it
    toast.success(`Loaded plan: ${customPlan.name}`);
  }

  const handleSaveCustomPlan = () => {
    if (!customPlanName.trim()) {
      toast.error("Please enter a plan name");
      return;
    }
    if (customPlanDraft.length === 0) {
      toast.error("Please select at least one exercise");
      return;
    }
    addCustomPlan(customPlanName.trim(), customPlanDraft);
    setIsCreatingCustom(false);
    setCustomPlanName("");
    setCustomPlanDraft([]);
    toast.success("Custom plan saved");
  }

  const addToCustomDraft = (templateId: string) => {
    const template = getExerciseById(templateId);
    if (!template) return;
    
    const newEx: GeneratedExercise = {
      planId: `custom-${Date.now()}-${template.id}`,
      exerciseId: template.id,
      title: template.title,
      primaryTarget: template.primaryTarget,
      sets: template.defaultSets,
      reps: template.defaultReps,
      restSec: template.restSec,
      durationSec: template.defaultSets * (template.restSec + 35),
      xpReward: template.xpBase + template.defaultSets * 4,
      icon: template.icon,
      difficulty: template.difficulty,
      coachNote: `Added to custom plan. Keep tempo ${template.tempo}.`
    };
    setCustomPlanDraft(prev => [...prev, newEx]);
  }

  const completeCurrentStep = () => {
    if (!currentExercise || completedIds.includes(currentExercise.planId)) {
      return;
    }

    setCompletedIds((prev) => [...prev, currentExercise.planId]);
    setSessionXp((prev) => prev + currentExercise.xpReward);

    if (user) {
      let xp = user.xp + currentExercise.xpReward;
      let level = user.level;
      let nextLevelXp =
        user.nextLevelXp ?? Math.max(user.xp + 200, user.level * 250);

      while (xp >= nextLevelXp) {
        level += 1;
        nextLevelXp += 250;
      }

      setUser({
        ...user,
        xp,
        level,
        nextLevelXp,
      });
    }
  };

  const advanceStep = () => {
    if (currentStep >= plan.length - 1) {
      setIsStarted(false);
      return;
    }
    setCurrentStep((prev) => Math.min(prev + 1, plan.length - 1));
  };


  const renderExerciseList = () => {
     const pool = selectedMuscleFilter === "Full Body" 
       ? exerciseLibrary 
       : exerciseLibrary.filter(x => x.primaryTarget === selectedMuscleFilter || x.targets.includes(selectedMuscleFilter));

     return pool.map(template => (
       <Pressable
          key={template.id}
          className="rounded-2xl border p-3 flex-row items-center gap-3 mb-3 bg-card"
          style={{
            borderColor: theme.border,
            backgroundColor: theme.surfaceMuted,
          }}
          onPress={() => addToCustomDraft(template.id)}
       >
          <View className="h-12 w-12 rounded-xl justify-center items-center bg-background" style={{ backgroundColor: theme.surface }}>
             <Ionicons name={template.icon as any} size={20} color={theme.accent} />
          </View>
          <View className="flex-1">
             <Text className="font-semibold text-sm text-foreground" style={{color: theme.text}}>{template.title}</Text>
             <Text className="text-xs text-muted-foreground mt-1" style={{color: theme.textMuted}}>
               {template.primaryTarget} • {template.difficulty}
             </Text>
          </View>
          <Ionicons name="add-circle-outline" size={24} color={theme.accent} />
       </Pressable>
     ))
  }

  return (
    <Screen>
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ padding: 16, paddingBottom: 36 }}
      >
        {/* Header */}
        <View className="flex-row items-center justify-between">
          <Text className="text-[30px] font-bold" style={{ color: theme.text }}>
            AI Trainer
          </Text>
          <View
            className="rounded-full border px-3 py-1"
            style={{
              borderColor: theme.border,
              backgroundColor: theme.surface,
            }}
          >
            <Text
              className="text-xs font-semibold"
              style={{ color: theme.textMuted }}
            >
              Level {levelState.level}
            </Text>
          </View>
        </View>

        {/* Custom Tabs */}
        {!isStarted && (
          <View className="flex-row gap-3 mt-5 pb-2">
            <Pressable
              className="flex-1 rounded-2xl border items-center justify-center py-3"
              style={{
                borderColor: activeTab === "AI_PLAN" ? theme.accent : theme.border,
                backgroundColor: activeTab === "AI_PLAN" ? theme.surfaceMuted : theme.surface,
              }}
              onPress={() => setActiveTab("AI_PLAN")}
            >
               <Text className="text-sm font-semibold" style={{ color: activeTab === "AI_PLAN" ? theme.text : theme.textMuted }}>
                 Workout Mode
               </Text>
            </Pressable>
            <Pressable
              className="flex-1 rounded-2xl border items-center justify-center py-3"
              style={{
                borderColor: activeTab === "CUSTOM_PLANS" ? theme.accent : theme.border,
                backgroundColor: activeTab === "CUSTOM_PLANS" ? theme.surfaceMuted : theme.surface,
              }}
              onPress={() => {
                setActiveTab("CUSTOM_PLANS");
                setIsCreatingCustom(false);
              }}
            >
               <Text className="text-sm font-semibold" style={{ color: activeTab === "CUSTOM_PLANS" ? theme.text : theme.textMuted }}>
                 Custom Plans
               </Text>
            </Pressable>
          </View>
        )}

        {/* -------------------- CUSTOM PLANS TAB -------------------- */}
        {activeTab === "CUSTOM_PLANS" && !isStarted && (
          <View className="mt-4">
             {!isCreatingCustom ? (
               <View>
                 <View className="flex-row justify-between items-center mb-4">
                   <Text className="font-semibold text-base" style={{color: theme.text}}>Your Collections</Text>
                   <Pressable onPress={() => setIsCreatingCustom(true)}>
                     <Text className="text-sm font-semibold" style={{color: theme.accent}}>+ New Plan</Text>
                   </Pressable>
                 </View>
                 
                 {customPlans.length === 0 ? (
                   <View className="rounded-2xl border p-6 items-center" style={{ borderColor: theme.border, backgroundColor: theme.surface }}>
                      <Ionicons name="folder-open-outline" size={32} color={theme.textMuted} className="mb-2" />
                      <Text className="text-center text-sm" style={{color: theme.textMuted}}>You haven't created any custom plans yet.</Text>
                      <Pressable 
                        className="mt-4 px-4 py-2 rounded-xl"
                        style={{backgroundColor: theme.accent}}
                        onPress={() => setIsCreatingCustom(true)}
                      >
                         <Text className="text-white font-semibold text-xs text-center">Create First Plan</Text>
                      </Pressable>
                   </View>
                 ) : (
                   <View className="gap-3">
                     {customPlans.map((cp) => (
                       <View key={cp.id} className="rounded-2xl border p-4" style={{ borderColor: theme.border, backgroundColor: theme.surface }}>
                         <View className="flex-row justify-between items-center">
                           <Text className="font-bold text-lg" style={{color: theme.text}}>{cp.name}</Text>
                           <Pressable onPress={() => removeCustomPlan(cp.id)}>
                             <Ionicons name="trash-outline" size={18} color="#ef4444" />
                           </Pressable>
                         </View>
                         <Text className="text-xs mt-1" style={{color: theme.textMuted}}>
                           {cp.exercises.length} exercises • {cp.exercises.reduce((sum, e) => sum + e.sets, 0)} sets total
                         </Text>
                         <Pressable 
                            className="mt-4 py-2 rounded-xl border items-center"
                            style={{ borderColor: theme.accent, backgroundColor: theme.surfaceMuted }}
                            onPress={() => loadCustomPlan(cp)}
                         >
                           <Text className="text-xs font-semibold" style={{color: theme.text}}>Load & Run Plan</Text>
                         </Pressable>
                       </View>
                     ))}
                   </View>
                 )}
               </View>
             ) : (
               <View className="rounded-2xl border p-4" style={{borderColor: theme.border, backgroundColor: theme.surface}}>
                 <View className="flex-row items-center justify-between mb-4">
                   <Text className="text-base font-semibold" style={{color: theme.text}}>Create Custom Plan</Text>
                   <Pressable onPress={() => setIsCreatingCustom(false)}>
                     <Text className="text-xs font-muted" style={{color: theme.textMuted}}>Cancel</Text>
                   </Pressable>
                 </View>
                 
                 <Text className="text-xs font-semibold mb-2" style={{color: theme.textMuted}}>Plan Name</Text>
                 <TextInput
                   value={customPlanName}
                   onChangeText={setCustomPlanName}
                   className="rounded-xl border px-3 py-3 mb-4 text-base"
                   placeholder="e.g. Morning Burn, Leg Day..."
                   placeholderTextColor={theme.textMuted}
                   style={{ borderColor: theme.border, color: theme.text }}
                 />

                 <View className="rounded-2xl border p-3 mb-4 bg-muted" style={{ borderColor: theme.border, backgroundColor: theme.surfaceMuted }}>
                   <Text className="font-semibold text-xs mb-2" style={{color: theme.text}}>{customPlanDraft.length} Exercises Selected</Text>
                   {customPlanDraft.map((ex, idx) => (
                     <View key={ex.planId + idx} className="flex-row items-center mb-2">
                       <Text className="text-xs flex-1" style={{color: theme.text}}>• {ex.title}</Text>
                       <Pressable onPress={() => setCustomPlanDraft(prev => prev.filter((_, i) => i !== idx))}>
                          <Ionicons name="close-circle" size={16} color="#ef4444" />
                       </Pressable>
                     </View>
                   ))}
                   {customPlanDraft.length === 0 && (
                     <Text className="text-xs italic" style={{color: theme.textMuted}}>Empty. Add exercises from the library below.</Text>
                   )}
                 </View>

                 <NeonButton label="Save Custom Plan" onPress={handleSaveCustomPlan} disabled={customPlanDraft.length === 0} />

                 <View className="h-[1px] w-full my-5" style={{backgroundColor: theme.border}} />
                 
                 <Text className="text-base font-semibold mb-3" style={{color: theme.text}}>Exercise Library</Text>
                 <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row mb-4 max-h-[40px]">
                   {targetOptions.map(opt => (
                     <Pressable
                       key={opt}
                       className="rounded-full border px-3 py-1 mr-2 items-center justify-center"
                       style={{
                         borderColor: selectedMuscleFilter === opt ? theme.accent : theme.border,
                         backgroundColor: selectedMuscleFilter === opt ? theme.accent : theme.surfaceMuted,
                         height: 32
                       }}
                       onPress={() => setSelectedMuscleFilter(opt)}
                     >
                       <Text className="text-[11px] font-semibold" style={{color: selectedMuscleFilter === opt ? "#FFFFFF" : theme.textMuted}}>
                         {opt}
                       </Text>
                     </Pressable>
                   ))}
                 </ScrollView>

                 {renderExerciseList()}
               </View>
             )}
          </View>
        )}

        {/* -------------------- AI PLAN & RUNNER TAB -------------------- */}
        {activeTab === "AI_PLAN" && (
          <View>
            <Text className="mt-3 text-sm" style={{ color: theme.textMuted }}>
              Build a personalized plan from your context and train step-by-step.
            </Text>

            {!isStarted && (
              <View
                className="mt-4 rounded-2xl border p-4"
                style={{ borderColor: theme.border, backgroundColor: theme.surface }}
              >
                <Text
                  className="text-base font-semibold"
                  style={{ color: theme.text }}
                >
                  Context Form
                </Text>

                <Text
                  className="mt-3 text-xs font-semibold"
                  style={{ color: theme.textMuted }}
                >
                  Target Muscle
                </Text>
                <View className="mt-2 flex-row flex-wrap gap-2">
                  {targetOptions.map((option) => {
                    const active = option === targetMuscle;
                    return (
                      <Pressable
                        key={option}
                        className="rounded-full border px-3 py-2"
                        style={{
                          borderColor: active ? theme.accent : theme.border,
                          backgroundColor: active ? theme.accent : theme.surfaceMuted,
                        }}
                        onPress={() => setTargetMuscle(option)}
                      >
                        <Text
                          className="text-xs font-semibold"
                          style={{ color: active ? "#FFFFFF" : theme.textMuted }}
                        >
                          {option}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>

                <View className="mt-4 flex-row gap-3">
                  <View className="flex-1">
                    <Text
                      className="text-xs font-semibold"
                      style={{ color: theme.textMuted }}
                    >
                      Time (minutes)
                    </Text>
                    <TextInput
                      value={minutesInput}
                      onChangeText={setMinutesInput}
                      keyboardType="numeric"
                      className="mt-2 rounded-xl border px-3 py-2"
                      placeholder="e.g. 30"
                      placeholderTextColor={theme.textMuted}
                      style={{ borderColor: theme.border, color: theme.text }}
                    />
                  </View>

                  <View className="flex-1">
                    <Text
                      className="text-xs font-semibold"
                      style={{ color: theme.textMuted }}
                    >
                      Repetition Goal
                    </Text>
                    <TextInput
                      value={repetitionsInput}
                      onChangeText={setRepetitionsInput}
                      keyboardType="numeric"
                      className="mt-2 rounded-xl border px-3 py-2"
                      placeholder="e.g. 12"
                      placeholderTextColor={theme.textMuted}
                      style={{ borderColor: theme.border, color: theme.text }}
                    />
                  </View>
                </View>

                <Text
                  className="mt-4 text-xs font-semibold"
                  style={{ color: theme.textMuted }}
                >
                  Extra Context
                </Text>
                <TextInput
                  value={extraContext}
                  onChangeText={setExtraContext}
                  multiline
                  textAlignVertical="top"
                  className="mt-2 rounded-xl border px-3 py-3"
                  placeholder="Any injury notes, available equipment, preferred pace, or constraints"
                  placeholderTextColor={theme.textMuted}
                  style={{
                    borderColor: theme.border,
                    color: theme.text,
                    minHeight: 86,
                  }}
                />

                <View className="mt-4 flex-row gap-3">
                  <View className="flex-1">
                    <NeonButton
                      label={planMutation.isPending ? "Generating..." : "Generate AI Plan"}
                      onPress={() => regeneratePlan().catch(() => undefined)}
                      disabled={planMutation.isPending}
                    />
                  </View>
                </View>
              </View>
            )}

            <View
              className="mt-4 rounded-2xl border p-4"
              style={{ borderColor: theme.border, backgroundColor: theme.surface }}
            >
              <View className="flex-row items-center justify-between">
                <View>
                  <Text
                    className="text-base font-semibold"
                    style={{ color: theme.text }}
                  >
                    Mission Board
                  </Text>
                  <Text className="text-xs font-medium mt-1" style={{ color: theme.accent }}>
                    {activePlanName}
                  </Text>
                </View>
                <Text className="text-xs font-bold" style={{ color: theme.textMuted }}>
                  {completedIds.length}/{plan.length} done
                </Text>
              </View>

              <View className="mt-3 flex-row gap-2">
                <View
                  className="flex-1 rounded-xl border p-3"
                  style={{
                    borderColor: theme.border,
                    backgroundColor: theme.surfaceMuted,
                  }}
                >
                  <Text className="text-[11px]" style={{ color: theme.textMuted }}>
                    Session XP
                  </Text>
                  <Text
                    className="mt-1 text-lg font-bold"
                    style={{ color: theme.text }}
                  >
                    +{sessionXp}
                  </Text>
                </View>
                <View
                  className="flex-1 rounded-xl border p-3"
                  style={{
                    borderColor: theme.border,
                    backgroundColor: theme.surfaceMuted,
                  }}
                >
                  <Text className="text-[11px]" style={{ color: theme.textMuted }}>
                    Total Plan XP
                  </Text>
                  <Text
                    className="mt-1 text-lg font-bold"
                    style={{ color: theme.text }}
                  >
                    {totalPlanXp}
                  </Text>
                </View>
                <View
                  className="flex-1 rounded-xl border p-3"
                  style={{
                    borderColor: theme.border,
                    backgroundColor: theme.surfaceMuted,
                  }}
                >
                  <Text className="text-[11px]" style={{ color: theme.textMuted }}>
                    Est. Time
                  </Text>
                  <Text
                    className="mt-1 text-lg font-bold"
                    style={{ color: theme.text }}
                  >
                    {estimatedMinutes}m
                  </Text>
                </View>
              </View>

              <View className="mt-4">
                <View
                  className="h-2 overflow-hidden rounded-full"
                  style={{ backgroundColor: theme.surfaceMuted }}
                >
                  <View
                    className="h-2 rounded-full"
                    style={{
                      backgroundColor: theme.accent,
                      width: `${Math.max(4, Math.round(completionRatio * 100))}%`,
                    }}
                  />
                </View>
                
                {!isStarted && plan.length > 0 && (
                   <View className="mt-4">
                      <NeonButton 
                        label="Start Current Plan"
                        onPress={startPlan}
                        disabled={planMutation.isPending}
                        variant="primary"
                      />
                   </View>
                )}

                {isStarted && (
                   <Text className="mt-3 text-xs italic" style={{ color: theme.textMuted }}>
                    Plan is running... Keep pushing!
                   </Text>
                )}
              </View>
            </View>

            {isStarted && currentExercise ? (
              <View
                className="mt-4 rounded-2xl border p-4"
                style={{
                  borderColor: theme.accent,
                  backgroundColor: theme.surface,
                }}
              >
                <Text
                  className="text-sm font-semibold flex-row items-center"
                  style={{ color: theme.accent }}
                >
                  <Ionicons name="flash" size={14} /> LIVE STEP TRACKER
                </Text>
                <Text
                  className="mt-2 text-xl font-bold"
                  style={{ color: theme.text }}
                >
                  Step {currentStep + 1}: {currentExercise.title}
                </Text>
                <Text className="mt-1 text-sm font-medium" style={{ color: theme.textMuted }}>
                  {currentExercise.sets} sets x {currentExercise.reps} reps | Rest{" "}
                  {currentExercise.restSec}s
                </Text>

                <View className="mt-3 bg-card p-3 rounded-xl" style={{backgroundColor: theme.surfaceMuted}}>
                  <Text className="text-sm italic" style={{ color: theme.text }}>
                    "{currentExercise.coachNote}"
                  </Text>
                </View>

                <View className="mt-4 flex-row gap-3">
                  {!currentStepDone ? (
                    <View className="flex-1">
                      <NeonButton
                        label={`Complete Step (+${currentExercise.xpReward} XP)`}
                        onPress={completeCurrentStep}
                      />
                    </View>
                  ) : (
                    <View className="flex-1">
                      <NeonButton
                        label={
                          currentStep === plan.length - 1
                            ? "Finish Plan"
                            : "Next Exercise"
                        }
                        onPress={advanceStep}
                      />
                    </View>
                  )}
                </View>
              </View>
            ) : null}

            <View className="mt-5 gap-3">
              {plan.map((exercise) => {
                const state = getCardState(exercise, currentExercise, completedIds);
                const exerciseDetail = getExerciseById(exercise.exerciseId);

                return (
                  <Pressable
                    key={exercise.planId}
                    className="rounded-[28px] border px-3 py-3"
                    style={{
                      borderColor:
                        state === "Current" ? theme.accent : theme.border,
                      backgroundColor: theme.surface,
                      opacity: state === "Completed" ? 0.6 : 1,
                    }}
                    onPress={() =>
                      router.push({
                        pathname: "/(app)/trainer/[id]",
                        params: {
                          id: exercise.exerciseId,
                          sets: String(exercise.sets),
                          reps: String(exercise.reps),
                          restSec: String(exercise.restSec),
                          durationSec: String(exercise.durationSec),
                          xpReward: String(exercise.xpReward),
                          note: exercise.coachNote,
                        },
                      })
                    }
                  >
                    <View className="flex-row items-center gap-4">
                      {exerciseDetail?.image ? (
                        <Image
                          source={exerciseDetail.image}
                          contentFit="cover"
                          style={{
                            width: 96,
                            height: 96,
                            borderRadius: 22,
                            backgroundColor: theme.surfaceMuted,
                          }}
                        />
                      ) : (
                        <View
                          style={{
                            width: 96,
                            height: 96,
                            borderRadius: 22,
                            backgroundColor: theme.surfaceMuted,
                          }}
                        />
                      )}

                      <View className="flex-1">
                        <View className="flex-row items-start justify-between gap-3">
                          <Text
                            className="flex-1 text-base font-semibold"
                            style={{ color: theme.text }}
                            numberOfLines={2}
                          >
                            {exercise.title}
                          </Text>
                          <Text
                            className="rounded-full px-2 py-1 text-[10px] font-semibold"
                            style={{
                              color:
                                state === "Current" ? "#FFFFFF" : theme.textMuted,
                              backgroundColor:
                                state === "Current"
                                  ? theme.accent
                                  : theme.surfaceMuted,
                            }}
                          >
                            {state}
                          </Text>
                        </View>

                        <Text
                          className="mt-1 text-xs"
                          style={{ color: theme.textMuted }}
                        >
                          {exercise.primaryTarget} | {exercise.difficulty}
                        </Text>

                        {exerciseDetail?.description ? (
                          <Text
                            className="mt-2 text-xs leading-5"
                            style={{ color: theme.textMuted }}
                            numberOfLines={3}
                          >
                            {exerciseDetail.description}
                          </Text>
                        ) : null}

                        <View className="mt-2 flex-row items-center justify-between">
                          <Text
                            className="text-xs font-semibold"
                            style={{ color: theme.text }}
                          >
                            {exercise.sets} sets x {exercise.reps} reps
                          </Text>
                          <Text
                            className="text-xs font-semibold"
                            style={{ color: theme.accent }}
                          >
                            +{exercise.xpReward} XP
                          </Text>
                        </View>
                      </View>
                    </View>
                  </Pressable>
                );
              })}
            </View>
          </View>
        )}
      </ScrollView>
    </Screen>
  );
}
