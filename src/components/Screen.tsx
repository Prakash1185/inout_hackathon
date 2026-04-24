import { StatusBar } from "expo-status-bar";
import type { ReactNode } from "react";
import { SafeAreaView } from "react-native-safe-area-context";

import { useAppTheme } from "@/src/store/ui-store";

interface ScreenProps {
  children: ReactNode;
}

export function Screen({ children }: ScreenProps) {
  const { mode, theme } = useAppTheme();

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.background }}>
      <StatusBar style={mode === "light" ? "dark" : "light"} />
      {children}
    </SafeAreaView>
  );
}
