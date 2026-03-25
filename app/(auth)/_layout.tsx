import { Stack } from "expo-router";
import { useAppStyles } from "@/hooks/useAppStyles";

/** 認証画面用レイアウト */
export default function AuthLayout() {
  const { t } = useAppStyles();

  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: t.surface },
        headerTintColor: t.text,
        headerTitleStyle: { fontWeight: "700" },
      }}
    >
      <Stack.Screen name="login" options={{ title: "ログイン" }} />
      <Stack.Screen name="signup" options={{ title: "アカウント作成" }} />
    </Stack>
  );
}
