import { Text, View } from "react-native";

interface StatCardProps {
  label: string;
  value: string;
  accent?: "green" | "orange" | "blue";
}

export function StatCard({ label, value, accent = "green" }: StatCardProps) {
  const accentClass =
    accent === "green"
      ? "text-[#00FF9D]"
      : accent === "orange"
        ? "text-[#FF7A00]"
        : "text-[#38B6FF]";

  return (
    <View className="min-w-[100px] flex-1 rounded-2xl border border-[#1F2937] bg-[#121821] px-3 py-3">
      <Text className="text-xs uppercase tracking-widest text-[#6B7280]">
        {label}
      </Text>
      <Text className={`mt-2 text-xl font-bold ${accentClass}`}>{value}</Text>
    </View>
  );
}
