import type { ReactNode } from "react";
import { SafeAreaView } from "react-native-safe-area-context";

import { useAppTheme } from "@/src/store/ui-store";

interface ScreenProps {
  children: ReactNode;
}

export function Screen({ children }: ScreenProps) {
  const { theme } = useAppTheme();

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.background }}>
      {children}
    </SafeAreaView>
  );
}
