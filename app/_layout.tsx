import { useState } from "react";
import { DarkTheme, DefaultTheme, ThemeProvider } from "@react-navigation/native";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import * as SplashScreen from "expo-splash-screen";
import { makeTokens } from "@/constants/theme";
import { useThemeStore } from "@/stores/themeStore";
import AuthProvider from "@/components/providers/AuthProvider";
import OfflineBanner from "@/components/ui/OfflineBanner";
import OnboardingTour from "@/components/ui/OnboardingTour";
import GuestLoginSheet from "@/components/ui/GuestLoginSheet";
import Toast from "@/components/ui/Toast";
import SplashTransition from "@/components/ui/SplashTransition";
import ErrorBoundary from "@/components/ui/ErrorBoundary";
import { useRealtimeTalks } from "@/hooks/useRealtimeTalks";
import { useRealtimeNotifications } from "@/hooks/useNotifications";
import { useAuth } from "@/hooks/useAuth";
import { initSentry } from "@/lib/sentry";

initSentry();

// Expo のネイティブスプラッシュを自動で消さないようにする
SplashScreen.preventAutoHideAsync();

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

/** Realtime購読 + 画面ツリー（QueryClientProvider 内で使用） */
function AppContent() {
  const { isDark } = useThemeStore();
  const t = makeTokens(isDark);
  const { isLoading: authLoading } = useAuth();
  const [splashDone, setSplashDone] = useState(false);
  useRealtimeTalks();
  useRealtimeNotifications();

  return (
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
          options={{ presentation: "modal", title: "つぶやく" }}
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
        <Stack.Screen
          name="street-history"
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="notifications"
          options={{ headerShown: false }}
        />
      </Stack>
      <StatusBar style={isDark ? "light" : "dark"} />
      <OnboardingTour t={t} />
      <GuestLoginSheet />
      <Toast />
      {!splashDone && (
        <SplashTransition
          ready={!authLoading}
          onFinish={() => setSplashDone(true)}
        />
      )}
    </ThemeProvider>
  );
}

/** ルートレイアウト */
export default function RootLayout() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <AppContent />
        </AuthProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}
