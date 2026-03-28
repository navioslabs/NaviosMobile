import { View, Text, Pressable } from "react-native";
import { Shield, Calendar, Users } from "@/lib/icons";
import type { ThemeTokens } from "@/constants/theme";
import { WEIGHT, SPACE, RADIUS, getScaledFontSize } from "@/lib/styles";
import { useFontSizeStore } from "@/stores/fontSizeStore";

interface QuickActionsProps {
  t: ThemeTokens;
  isDark: boolean;
  onSelect?: (query: string) => void;
}

/** クイックアクショングリッド */
export default function QuickActions({ t, isDark, onSelect }: QuickActionsProps) {
  const { scale } = useFontSizeStore();
  const fs = getScaledFontSize(scale);

  const actions = [
    { icon: Shield, label: "ライフライン情報", query: "ライフライン", dc: t.accent, bg: isDark ? "#0D2B1E" : "#F5FAF8" },
    { icon: Calendar, label: "今日のイベント", query: "イベント", dc: "#F5A623", bg: isDark ? "#2D1F0A" : "#FEFAF3" },
    { icon: Users, label: "助けを求めてる人", query: "手伝い", dc: t.red, bg: isDark ? "#2D0A12" : "#FEF5F6" },
  ];

  return (
    <View style={{ marginBottom: SPACE.xl }}>
      <Text style={{ fontSize: fs.xs, fontWeight: WEIGHT.semibold, marginBottom: SPACE.sm, letterSpacing: 0.5, color: t.muted }}>
        クイックアクション
      </Text>
      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: SPACE.sm }}>
        {actions.map((a) => {
          const Icon = a.icon;
          return (
            <Pressable
              key={a.label}
              onPress={() => onSelect?.(a.query)}
              style={({ pressed }) => ({
                width: "48%" as const,
                flexDirection: "row" as const,
                alignItems: "center" as const,
                gap: SPACE.sm + 2,
                borderRadius: RADIUS.md,
                paddingVertical: SPACE.sm + 2,
                paddingHorizontal: SPACE.md,
                backgroundColor: a.bg,
                borderWidth: 1,
                borderColor: a.dc + "12",
                opacity: pressed ? 0.7 : 1,
              })}
            >
              <View style={{ width: 30, height: 30, borderRadius: SPACE.sm, alignItems: "center", justifyContent: "center", backgroundColor: a.dc + "15" }}>
                <Icon size={15} color={a.dc} />
              </View>
              <Text style={{ fontSize: fs.sm, fontWeight: WEIGHT.semibold, color: t.text, flex: 1 }} numberOfLines={1}>{a.label}</Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}
