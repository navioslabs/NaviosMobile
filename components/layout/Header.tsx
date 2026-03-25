import { View, Text, Pressable } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";
import { Bell, User } from "@/lib/icons";
import type { ThemeTokens } from "@/constants/theme";
import { useFontSizeStore } from "@/stores/fontSizeStore";
import { createStyles, getScaledFontSize, WEIGHT, SPACE } from "@/lib/styles";

interface HeaderProps {
  t: ThemeTokens;
}

/** アプリ共通ヘッダー */
export default function Header({ t }: HeaderProps) {
  const insets = useSafeAreaInsets();
  const { scale } = useFontSizeStore();
  const s = createStyles(t, scale);
  const fs = getScaledFontSize(scale);

  return (
    <View style={[s.rowBetween, { paddingHorizontal: SPACE.xl, paddingBottom: SPACE.md, paddingTop: insets.top + SPACE.sm, backgroundColor: t.surface, borderBottomWidth: 1, borderBottomColor: t.border }]}>
      <Text style={{ fontSize: fs.xxl, fontWeight: WEIGHT.extrabold, letterSpacing: -0.5, color: t.accent }}>navios</Text>

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
