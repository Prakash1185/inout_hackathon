import { Text, View } from "react-native";

import { useAppTheme } from "@/src/store/ui-store";

interface StatCardProps {
  label: string;
  value: string;
  accent?: "green" | "orange" | "blue";
}

export function StatCard({ label, value, accent = "green" }: StatCardProps) {
  const { theme } = useAppTheme();
  const accentColor = accent === "blue" ? theme.text : theme.accent;

  return (
    <View
      className="min-w-[100px] flex-1 rounded-2xl border px-3 py-3"
      style={{ borderColor: theme.border, backgroundColor: theme.surface }}
    >
      <Text
        className="text-xs uppercase tracking-widest"
        style={{ color: theme.textMuted }}
      >
        {label}
      </Text>
      <Text className="mt-2 text-xl font-bold" style={{ color: accentColor }}>
        {value}
      </Text>
    </View>
  );
}
