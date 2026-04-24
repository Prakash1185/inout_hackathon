export type RecoveryArea = "knee" | "shoulder" | "back" | "neck";
export type RecoveryRisk = "Low" | "Medium" | "High";
export type RecoveryInputMode = "upload" | "scan" | "describe";

export interface RecoveryInputPayload {
  mode: RecoveryInputMode;
  fileName?: string;
  fileUri?: string;
  fileType?: string;
  area?: RecoveryArea;
  painLevel?: number;
  symptoms?: {
    swelling: boolean;
    stiffness: boolean;
    sharpPain: boolean;
  };
  notes?: string;
  imageUri?: string;
}

export interface RecoveryExercise {
  id: string;
  title: string;
  duration: string;
  description: string;
  instructions: string[];
  postureHint: string;
  image: any;
  sets: number;
  reps: string;
  area: RecoveryArea;
}

export interface RecoveryRecommendation {
  conditionSummary: string;
  riskLevel: RecoveryRisk;
  riskAccent: string;
  aiSuggestion: string;
  disclaimer: string;
  progress: number;
  xpReward: number;
  recoveryPoints: number;
  exercises: RecoveryExercise[];
}

export const recoveryAreas: { label: string; value: RecoveryArea }[] = [
  { label: "Knee", value: "knee" },
  { label: "Shoulder", value: "shoulder" },
  { label: "Back", value: "back" },
  { label: "Neck", value: "neck" },
];

export const recoveryExerciseLibrary: Record<RecoveryArea, RecoveryExercise[]> =
  {
    knee: [
      {
        id: "knee-straight-leg-raise",
        title: "Straight Leg Raise",
        duration: "10 reps × 3 sets",
        description: "Builds knee stability without excessive load.",
        instructions: [
          "Lie flat, keep one leg bent and the other straight.",
          "Lift the straight leg slowly until it matches the opposite knee height.",
          "Lower with control and keep the knee locked gently.",
        ],
        postureHint: "Good posture. Keep the lower back neutral.",
        image: require("../../assets/exercise/leg-press.png"),
        sets: 3,
        reps: "10 reps",
        area: "knee",
      },
      {
        id: "knee-wall-sit",
        title: "Wall Sit",
        duration: "30 sec × 3 sets",
        description: "Improves quad support and controlled knee endurance.",
        instructions: [
          "Lean your back against a wall and slide down gently.",
          "Keep knees aligned above ankles, not beyond toes.",
          "Hold the position and breathe steadily.",
        ],
        postureHint: "Adjust your knee angle slightly for comfort.",
        image: require("../../assets/exercise/squat.png"),
        sets: 3,
        reps: "30 seconds",
        area: "knee",
      },
      {
        id: "knee-hamstring-stretch",
        title: "Hamstring Stretch",
        duration: "20 sec × 3 sets",
        description: "Helps reduce tension around the back of the knee.",
        instructions: [
          "Sit or lie down and extend one leg out.",
          "Reach gently toward the foot without bouncing.",
          "Hold the stretch and relax the shoulders.",
        ],
        postureHint: "Good alignment. Avoid forcing the stretch.",
        image: require("../../assets/exercise/plank.png"),
        sets: 3,
        reps: "20 seconds",
        area: "knee",
      },
      {
        id: "knee-cycle",
        title: "Light Cycling",
        duration: "5 min",
        description: "Low-impact motion to encourage circulation.",
        instructions: [
          "Move at a comfortable pace with light resistance.",
          "Avoid pain spikes and keep motion smooth.",
          "Stop if the knee feels unstable.",
        ],
        postureHint: "Keep the knee tracking forward.",
        image: require("../../assets/exercise/cycle.png"),
        sets: 1,
        reps: "5 minutes",
        area: "knee",
      },
    ],
    shoulder: [
      {
        id: "shoulder-circle",
        title: "Shoulder Circles",
        duration: "12 reps × 2 sets",
        description: "Gentle mobility work for the shoulder joint.",
        instructions: [
          "Stand tall and rotate your shoulders backward in smooth circles.",
          "Switch to forward circles after a few repetitions.",
          "Keep the neck relaxed.",
        ],
        postureHint: "Keep the ribcage calm and avoid shrugging.",
        image: require("../../assets/exercise/chest.png"),
        sets: 2,
        reps: "12 reps",
        area: "shoulder",
      },
      {
        id: "shoulder-wall-slide",
        title: "Wall Slide",
        duration: "10 reps × 3 sets",
        description: "Supports overhead range without abrupt strain.",
        instructions: [
          "Stand with your back and arms against the wall.",
          "Slide the arms upward slowly while keeping contact.",
          "Return with control.",
        ],
        postureHint: "Keep the wrists soft and shoulders down.",
        image: require("../../assets/exercise/chest_press.png"),
        sets: 3,
        reps: "10 reps",
        area: "shoulder",
      },
      {
        id: "shoulder-isometric",
        title: "Isometric Hold",
        duration: "15 sec × 3 sets",
        description:
          "Builds support around the shoulder without movement load.",
        instructions: [
          "Press your palm gently into a wall or stable surface.",
          "Hold without pain and keep breathing.",
          "Relax and repeat.",
        ],
        postureHint: "Do not over-rotate the torso.",
        image: require("../../assets/exercise/pullup.png"),
        sets: 3,
        reps: "15 seconds",
        area: "shoulder",
      },
      {
        id: "shoulder-band-pull",
        title: "Band Pull-Apart",
        duration: "12 reps × 3 sets",
        description: "Targets upper back and shoulder control.",
        instructions: [
          "Hold a band at chest height.",
          "Pull the band apart without jerking.",
          "Slowly return to start.",
        ],
        postureHint: "Keep the shoulders level.",
        image: require("../../assets/exercise/latpulldown.png"),
        sets: 3,
        reps: "12 reps",
        area: "shoulder",
      },
    ],
    back: [
      {
        id: "back-cat-cow",
        title: "Cat-Cow Stretch",
        duration: "8 reps × 3 sets",
        description: "A gentle spine mobility reset.",
        instructions: [
          "Start on hands and knees.",
          "Round the back upward, then arch gently.",
          "Move slowly with your breath.",
        ],
        postureHint: "Good posture. Keep motion smooth.",
        image: require("../../assets/exercise/plank.png"),
        sets: 3,
        reps: "8 reps",
        area: "back",
      },
      {
        id: "back-bridge",
        title: "Glute Bridge",
        duration: "12 reps × 3 sets",
        description: "Supports lower-back comfort by activating glutes.",
        instructions: [
          "Lie on your back with knees bent.",
          "Lift hips gently and squeeze the glutes.",
          "Lower slowly to the mat.",
        ],
        postureHint: "Keep the neck relaxed on the mat.",
        image: require("../../assets/exercise/leg-press.png"),
        sets: 3,
        reps: "12 reps",
        area: "back",
      },
      {
        id: "back-knee-hug",
        title: "Knee-to-Chest",
        duration: "20 sec × 3 sets",
        description: "Releases lower-back tightness.",
        instructions: [
          "Lie flat and pull one knee gently toward your chest.",
          "Keep the opposite leg relaxed.",
          "Switch sides after the hold.",
        ],
        postureHint: "Avoid lifting the shoulders.",
        image: require("../../assets/exercise/squat.png"),
        sets: 3,
        reps: "20 seconds",
        area: "back",
      },
      {
        id: "back-posture-reset",
        title: "Posture Reset",
        duration: "5 min",
        description: "Simple standing alignment drill.",
        instructions: [
          "Stand against a wall with the back of the head, shoulders, and hips aligned.",
          "Breathe and maintain the position.",
          "Use this as a daytime posture reminder.",
        ],
        postureHint: "Stack ribs over pelvis.",
        image: require("../../assets/exercise/treadmil.png"),
        sets: 1,
        reps: "5 minutes",
        area: "back",
      },
    ],
    neck: [
      {
        id: "neck-chin-tuck",
        title: "Chin Tuck",
        duration: "10 reps × 3 sets",
        description: "Supports neck posture and deep neck flexors.",
        instructions: [
          "Sit upright and gently draw the chin backward.",
          "Keep your eyes level and avoid tilting down.",
          "Hold briefly and release.",
        ],
        postureHint: "Neck long, shoulders soft.",
        image: require("../../assets/exercise/boxing.png"),
        sets: 3,
        reps: "10 reps",
        area: "neck",
      },
      {
        id: "neck-side-flex",
        title: "Side Neck Stretch",
        duration: "15 sec × 3 sets",
        description: "Gentle release for neck tension.",
        instructions: [
          "Tilt one ear toward the shoulder slowly.",
          "Let the opposite shoulder stay down.",
          "Hold and breathe calmly.",
        ],
        postureHint: "Avoid pulling with the hand.",
        image: require("../../assets/exercise/chest_press.png"),
        sets: 3,
        reps: "15 seconds",
        area: "neck",
      },
      {
        id: "neck-scapular",
        title: "Scapular Squeeze",
        duration: "12 reps × 3 sets",
        description: "Reduces neck load by improving shoulder blade control.",
        instructions: [
          "Sit or stand tall.",
          "Squeeze the shoulder blades together gently.",
          "Release slowly.",
        ],
        postureHint: "Keep chin level.",
        image: require("../../assets/exercise/biceps.png"),
        sets: 3,
        reps: "12 reps",
        area: "neck",
      },
      {
        id: "neck-upper-trap",
        title: "Upper Trap Release",
        duration: "20 sec × 2 sets",
        description: "Softens tension in the top of the shoulders and neck.",
        instructions: [
          "Lean your head gently to one side.",
          "Allow the opposite shoulder to drop naturally.",
          "Hold without pain.",
        ],
        postureHint: "Stay relaxed and do not force range.",
        image: require("../../assets/exercise/latpulldown.png"),
        sets: 2,
        reps: "20 seconds",
        area: "neck",
      },
    ],
  };

export function getRecoveryExercises(area: RecoveryArea): RecoveryExercise[] {
  return recoveryExerciseLibrary[area];
}

export function getRecoveryExerciseById(
  exerciseId: string,
): RecoveryExercise | null {
  for (const exercises of Object.values(recoveryExerciseLibrary)) {
    const match = exercises.find((exercise) => exercise.id === exerciseId);
    if (match) {
      return match;
    }
  }

  return null;
}

export function buildRecoveryRecommendation(
  input: RecoveryInputPayload,
): RecoveryRecommendation {
  const area = input.area ?? "knee";
  const exercises = getRecoveryExercises(area).slice(
    0,
    area === "back" ? 4 : 3,
  );
  const painLevel = input.painLevel ?? 4;
  const hasSharpPain = Boolean(input.symptoms?.sharpPain);
  const hasSwelling = Boolean(input.symptoms?.swelling);
  const hasStiffness = Boolean(input.symptoms?.stiffness);

  let riskLevel: RecoveryRisk = "Low";
  if (painLevel >= 7 || hasSharpPain) {
    riskLevel = "High";
  } else if (painLevel >= 4 || hasSwelling || hasStiffness) {
    riskLevel = "Medium";
  }

  const conditionSummaryMap: Record<RecoveryArea, string> = {
    knee:
      riskLevel === "High"
        ? "Moderate Knee Strain Detected"
        : riskLevel === "Medium"
          ? "Mild Knee Strain Detected"
          : "Knee Irritation Detected",
    shoulder:
      riskLevel === "High"
        ? "Shoulder Overload Detected"
        : riskLevel === "Medium"
          ? "Shoulder Mobility Restriction Detected"
          : "Shoulder Irritation Detected",
    back:
      riskLevel === "High"
        ? "Lower Back Stress Detected"
        : riskLevel === "Medium"
          ? "Lower Back Tightness Detected"
          : "Back Mobility Restriction Detected",
    neck:
      riskLevel === "High"
        ? "Neck Strain Detected"
        : riskLevel === "Medium"
          ? "Neck Tension Detected"
          : "Neck Stiffness Detected",
  };

  const aiSuggestionMap: Record<RecoveryArea, string> = {
    knee: "Based on your symptoms, recovery is possible with guided movement and controlled loading.",
    shoulder:
      "Based on your symptoms, recovery is possible with gentle rotation and range restoration.",
    back: "Based on your symptoms, recovery is possible with posture correction and light mobility.",
    neck: "Based on your symptoms, recovery is possible with low-load mobility and posture resets.",
  };

  const riskAccent =
    riskLevel === "High"
      ? "rgba(239,68,68,0.16)"
      : riskLevel === "Medium"
        ? "rgba(245,158,11,0.16)"
        : "rgba(139,92,246,0.16)";

  return {
    conditionSummary: conditionSummaryMap[area],
    riskLevel,
    riskAccent,
    aiSuggestion: aiSuggestionMap[area],
    disclaimer:
      "Not a medical diagnosis. If pain worsens, seek professional care.",
    progress: Math.max(8, 28 - painLevel * 2),
    xpReward: area === "back" ? 60 : 50,
    recoveryPoints: area === "shoulder" ? 18 : 15,
    exercises,
  };
}
