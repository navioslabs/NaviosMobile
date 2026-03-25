import { View, Text, Pressable } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { Navigation, Bell, User } from "@/lib/icons";
import type { ThemeTokens } from "@/constants/theme";
import { createStyles, FONT_SIZE, WEIGHT, SPACE } from "@/lib/styles";

interface HeaderProps {
  t: ThemeTokens;
}

/** アプリ共通ヘッダー（Naviosロゴ + アクションボタン） */
export default function Header({ t }: HeaderProps) {
  const insets = useSafeAreaInsets();
  const s = createStyles(t);

  return (
    <View style={[s.rowBetween, { paddingHorizontal: SPACE.xl, paddingBottom: SPACE.md, paddingTop: insets.top + SPACE.sm, backgroundColor: t.surface, borderBottomWidth: 1, borderBottomColor: t.border }]}>
      <View style={[s.row, { gap: SPACE.sm }]}>
        <LinearGradient
          colors={[t.accent, t.blue]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{ width: 32, height: 32, borderRadius: 10, alignItems: "center", justifyContent: "center" }}
        >
          <Navigation size={15} color="#000" />
        </LinearGradient>
        <Text style={{ fontSize: FONT_SIZE.xxl, fontWeight: WEIGHT.extrabold, letterSpacing: -0.3, color: t.accent }}>Navios</Text>
      </View>

      <View style={[s.row, { gap: SPACE.sm }]}>
        <Pressable style={s.iconButton}>
          <Bell size={16} color={t.sub} />
        </Pressable>
        <Pressable style={s.iconButton}>
          <User size={16} color={t.sub} />
        </Pressable>
      </View>
    </View>
  );
}
