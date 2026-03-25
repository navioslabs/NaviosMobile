import { DarkTheme, DefaultTheme, ThemeProvider } from "@react-navigation/native";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import "react-native-reanimated";
import { makeTokens } from "@/constants/theme";
import { useThemeStore } from "@/stores/themeStore";

export const unstable_settings = {
  anchor: "(tabs)",
};

/** ルートレイアウト */
export default function RootLayout() {
  const { isDark } = useThemeStore();
  const t = makeTokens(isDark);

  return (
    <ThemeProvider value={isDark ? DarkTheme : DefaultTheme}>
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: t.surface },
          headerTintColor: t.text,
          headerTitleStyle: { fontWeight: "700" },
        }}
      >
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen
          name="post"
          options={{ presentation: "modal", title: "新規投稿" }}
        />
        <Stack.Screen
          name="talk-post"
          options={{ presentation: "modal", title: "つぶやく" }}
        />
      </Stack>
      <StatusBar style={isDark ? "light" : "dark"} />
    </ThemeProvider>
  );
}
