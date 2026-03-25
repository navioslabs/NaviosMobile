import { useCallback } from "react";
import { View, Pressable } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";
import { useQueryClient } from "@tanstack/react-query";
import { Bell, User } from "@/lib/icons";
import type { ThemeTokens } from "@/constants/theme";
import { useFontSizeStore } from "@/stores/fontSizeStore";
import { useThemeStore } from "@/stores/themeStore";
import { createStyles, getScaledFontSize, SPACE } from "@/lib/styles";
import NaviosLogo from "@/components/ui/NaviosLogo";

interface HeaderProps {
  t: ThemeTokens;
}

/** アプリ共通ヘッダー */
export default function Header({ t }: HeaderProps) {
  const insets = useSafeAreaInsets();
  const { isDark } = useThemeStore();
  const { scale } = useFontSizeStore();
  const qc = useQueryClient();
  const s = createStyles(t, scale);
  const fs = getScaledFontSize(scale);

  /** ロゴ押下 → ちかくタブに戻る + Nearby データ再取得 */
  const handleLogoPress = useCallback(() => {
    router.replace("/(tabs)");
    qc.invalidateQueries({ queryKey: ["posts", "nearby"] });
  }, [qc]);

  return (
    <View style={[s.rowBetween, { paddingHorizontal: SPACE.xl, paddingBottom: SPACE.md, paddingTop: insets.top + SPACE.sm, backgroundColor: t.surface, borderBottomWidth: 1, borderBottomColor: t.border }]}>
      <Pressable onPress={handleLogoPress} style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}>
        <NaviosLogo size={44} textColor={t.accent} isDark={isDark} />
      </Pressable>

      <View style={[s.row, { gap: SPACE.sm }]}>
        <Pressable style={({ pressed }) => [s.iconButton, { opacity: pressed ? 0.7 : 1 }]}>
          <Bell size={16} color={t.sub} />
        </Pressable>
        <Pressable
          onPress={() => router.push("/profile/edit")}
          style={({ pressed }) => [s.iconButton, { opacity: pressed ? 0.7 : 1 }]}
        >
          <User size={16} color={t.sub} />
        </Pressable>
      </View>
    </View>
  );
}
