import { Link, Redirect } from "expo-router";
import { Text, View } from "react-native";

import { useAppTheme } from "@/src/store/ui-store";

export default function SignUpScreen() {
  const { theme } = useAppTheme();

  return (
    <View
      className="flex-1 items-center justify-center px-6"
      style={{ backgroundColor: theme.background }}
    >
      <Text
        className="text-center text-base"
        style={{ color: theme.textMuted }}
      >
        Signup is handled via Google on the login screen.
      </Text>
      <Text
        className="mt-3 text-center text-sm"
        style={{ color: theme.accent }}
      >
        <Link
          href="/(auth)/login"
          style={{ color: theme.accent, fontWeight: "700" }}
        >
          Go to login
        </Link>
      </Text>
      <Redirect href="/(auth)/login" />
    </View>
  );
}
