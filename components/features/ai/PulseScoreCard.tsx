import { View, Text } from "react-native";
import { Radio } from "@/lib/icons";
import type { ThemeTokens } from "@/constants/theme";
import { FONT_SIZE, WEIGHT, RADIUS, SPACE } from "@/lib/styles";

interface PulseScoreCardProps {
  t: ThemeTokens;
  isDark: boolean;
}

/** Pulseスコア表示カード */
export default function PulseScoreCard({ t, isDark }: PulseScoreCardProps) {
  return (
    <View
      style={{ flexDirection: "row", alignItems: "center", gap: SPACE.md, borderRadius: RADIUS.xl, padding: SPACE.md + 2, marginBottom: SPACE.xxl, backgroundColor: isDark ? "rgba(0,212,161,0.06)" : "rgba(0,212,161,0.08)", borderWidth: 1, borderColor: t.accent + "22" }}
    >
      <View style={{ width: 42, height: 42, borderRadius: RADIUS.lg, alignItems: "center", justifyContent: "center", backgroundColor: t.accent + "22" }}>
        <Radio size={20} color={t.accent} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={{ fontSize: FONT_SIZE.md, fontWeight: WEIGHT.bold, color: t.text }}>Pulse スコア: 82 / 100</Text>
        <Text style={{ fontSize: FONT_SIZE.xs, color: t.sub }}>周辺エリアの盛り上がり度</Text>
      </View>
      <View style={{ borderRadius: RADIUS.sm, paddingHorizontal: SPACE.sm + 2, paddingVertical: SPACE.xs, backgroundColor: t.accent }}>
        <Text style={{ fontSize: FONT_SIZE.xxs, fontWeight: WEIGHT.extrabold, color: "#000" }}>HOT</Text>
      </View>
    </View>
  );
}
