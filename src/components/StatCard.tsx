import { Text, View } from "react-native";

interface StatCardProps {
  label: string;
  value: string;
  accent?: "green" | "orange";
}

export function StatCard({ label, value, accent = "green" }: StatCardProps) {
  const accentClass = accent === "green" ? "text-[#38ff9c]" : "text-[#ff8a33]";

  return (
    <View className="min-w-[100px] flex-1 rounded-2xl border border-[#222a31] bg-[#12171b] px-3 py-3">
      <Text className="text-xs uppercase tracking-widest text-[#7c8a97]">
        {label}
      </Text>
      <Text className={`mt-2 text-xl font-bold ${accentClass}`}>{value}</Text>
    </View>
  );
}
