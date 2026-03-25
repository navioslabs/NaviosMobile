import { DarkTheme, DefaultTheme, ThemeProvider } from "@react-navigation/native";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import "react-native-reanimated";
import { makeTokens } from "@/constants/theme";
import { useThemeStore } from "@/stores/themeStore";
import AuthProvider from "@/components/providers/AuthProvider";
import OfflineBanner from "@/components/ui/OfflineBanner";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5分
      gcTime: 1000 * 60 * 30,   // 30分でGC
      retry: 2,
      refetchOnWindowFocus: false,
    },
  },
});

export const unstable_settings = {
  anchor: "(tabs)",
};

/** ルートレイアウト */
export default function RootLayout() {
  const { isDark } = useThemeStore();
  const t = makeTokens(isDark);

  return (
    <QueryClientProvider client={queryClient}>
    <AuthProvider>
    <ThemeProvider value={isDark ? DarkTheme : DefaultTheme}>
      <OfflineBanner />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: t.surface },
          headerTintColor: t.text,
          headerTitleStyle: { fontWeight: "700" },
        }}
      >
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        <Stack.Screen
          name="post"
          options={{ presentation: "modal", title: "新規投稿" }}
        />
        <Stack.Screen
          name="talk-post"
          options={{ presentation: "modal", title: "トークする" }}
        />
        <Stack.Screen
          name="feed/[id]"
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="talk-detail/[id]"
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="profile/[id]"
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="profile/edit"
          options={{ headerShown: false }}
        />
      </Stack>
      <StatusBar style={isDark ? "light" : "dark"} />
    </ThemeProvider>
    </AuthProvider>
    </QueryClientProvider>
  );
}
