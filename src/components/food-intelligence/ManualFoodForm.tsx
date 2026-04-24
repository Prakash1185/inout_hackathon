import { Ionicons } from "@expo/vector-icons";
import { Pressable, Text, TextInput, View } from "react-native";

import type { ManualMealItemInput } from "@/src/constants/food-intelligence";
import { useAppTheme } from "@/src/store/ui-store";

interface ManualFoodFormProps {
  items: ManualMealItemInput[];
  onChangeItem: (
    id: string,
    field: keyof ManualMealItemInput,
    value: string | number,
  ) => void;
  onAddItem: () => void;
}

export function ManualFoodForm({
  items,
  onChangeItem,
  onAddItem,
}: ManualFoodFormProps) {
  const { theme } = useAppTheme();

  return (
    <View className="gap-4">
      {items.map((item, index) => (
        <View
          key={item.id}
          className="rounded-3xl border px-4 py-4"
          style={{ borderColor: theme.border, backgroundColor: theme.surface }}
        >
          <Text className="text-xs font-semibold" style={{ color: theme.textMuted }}>
            Item {index + 1}
          </Text>

          <View className="mt-4 gap-3">
            <TextInput
              value={item.foodName}
              onChangeText={(value) => onChangeItem(item.id, "foodName", value)}
              placeholder="Food name"
              placeholderTextColor={theme.textMuted}
              className="rounded-2xl border px-4 py-3"
              style={{
                borderColor: theme.border,
                backgroundColor: theme.surfaceMuted,
                color: theme.text,
              }}
            />

            <View
              className="rounded-2xl border px-4 py-3"
              style={{
                borderColor: theme.border,
                backgroundColor: theme.surfaceMuted,
              }}
            >
              <Text className="text-xs font-semibold" style={{ color: theme.textMuted }}>
                Quantity
              </Text>

              <View className="mt-3 flex-row items-center justify-between">
                <Pressable
                  onPress={() =>
                    onChangeItem(item.id, "quantity", Math.max(1, item.quantity - 1))
                  }
                  className="h-10 w-10 items-center justify-center rounded-full border"
                  style={{
                    borderColor: theme.border,
                    backgroundColor: theme.surface,
                  }}
                >
                  <Ionicons name="remove" size={16} color={theme.text} />
                </Pressable>

                <Text className="text-base font-semibold" style={{ color: theme.text }}>
                  {item.quantity} serving{item.quantity > 1 ? "s" : ""}
                </Text>

                <Pressable
                  onPress={() => onChangeItem(item.id, "quantity", item.quantity + 1)}
                  className="h-10 w-10 items-center justify-center rounded-full border"
                  style={{
                    borderColor: theme.border,
                    backgroundColor: theme.surface,
                  }}
                >
                  <Ionicons name="add" size={16} color={theme.text} />
                </Pressable>
              </View>
            </View>

            <TextInput
              value={item.notes ?? ""}
              onChangeText={(value) => onChangeItem(item.id, "notes", value)}
              placeholder="Notes (optional)"
              placeholderTextColor={theme.textMuted}
              className="rounded-2xl border px-4 py-3"
              style={{
                borderColor: theme.border,
                backgroundColor: theme.surfaceMuted,
                color: theme.text,
                minHeight: 84,
                textAlignVertical: "top",
              }}
              multiline
            />
          </View>
        </View>
      ))}

      <Pressable
        onPress={onAddItem}
        className="flex-row items-center justify-center gap-2 rounded-2xl border px-4 py-4"
        style={{ borderColor: theme.border, backgroundColor: theme.surface }}
      >
        <Ionicons name="add-circle-outline" size={18} color={theme.text} />
        <Text className="text-sm font-semibold" style={{ color: theme.text }}>
          Add another item
        </Text>
      </Pressable>
    </View>
  );
}
