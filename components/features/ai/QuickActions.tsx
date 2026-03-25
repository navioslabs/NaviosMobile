import { View, Text, Pressable } from "react-native";
import { Package, Calendar, Users, Building2 } from "@/lib/icons";
import type { ThemeTokens } from "@/constants/theme";
import { FONT_SIZE, WEIGHT, SPACE, RADIUS } from "@/lib/styles";

interface QuickActionsProps {
  t: ThemeTokens;
  isDark: boolean;
}

/** クイックアクショングリッド（セカンダリ） */
export default function QuickActions({ t, isDark }: QuickActionsProps) {
  const actions = [
    { icon: Package, label: "今すぐ買える", dc: t.accent, bg: isDark ? "#0D2B1E" : "#F5FAF8" },
    { icon: Calendar, label: "今日のイベント", dc: "#F5A623", bg: isDark ? "#2D1F0A" : "#FEFAF3" },
    { icon: Users, label: "助けを求めてる人", dc: t.red, bg: isDark ? "#2D0A12" : "#FEF5F6" },
    { icon: Building2, label: "締切が近い手続き", dc: t.purple, bg: isDark ? "#1A0F2D" : "#F8F5FC" },
  ];

  return (
    <View style={{ marginBottom: SPACE.xl }}>
      <Text style={{ fontSize: FONT_SIZE.xs, fontWeight: WEIGHT.semibold, marginBottom: SPACE.sm, letterSpacing: 0.5, color: t.muted }}>
        クイックアクション
      </Text>
      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: SPACE.sm }}>
        {actions.map((a, i) => {
          const Icon = a.icon;
          return (
            <Pressable key={i} style={({ pressed }) => ({ width: "48%" as const, flexDirection: "row" as const, alignItems: "center" as const, gap: SPACE.sm + 2, borderRadius: RADIUS.md, paddingVertical: SPACE.sm + 2, paddingHorizontal: SPACE.md, backgroundColor: a.bg, borderWidth: 1, borderColor: a.dc + "12", opacity: pressed ? 0.7 : 1 })}>
              <View style={{ width: 30, height: 30, borderRadius: SPACE.sm, alignItems: "center", justifyContent: "center", backgroundColor: a.dc + "15" }}>
                <Icon size={15} color={a.dc} />
              </View>
              <Text style={{ fontSize: FONT_SIZE.sm, fontWeight: WEIGHT.semibold, color: t.text, flex: 1 }} numberOfLines={1}>{a.label}</Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}
