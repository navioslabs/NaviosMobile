import { View, Text } from "react-native";
import { Radio, Eye } from "@/lib/icons";
import type { ThemeTokens } from "@/constants/theme";
import { FONT_SIZE, WEIGHT, SPACE, RADIUS } from "@/lib/styles";

interface ScanHeaderProps {
  t: ThemeTokens;
  isDark: boolean;
  postCount: number;
}

/** スキャンヘッダー（Pulseスコア統合版） */
export default function ScanHeader({ t, isDark, postCount }: ScanHeaderProps) {
  return (
    <View style={{ paddingVertical: SPACE.lg, paddingHorizontal: SPACE.xl, backgroundColor: isDark ? "rgba(0,212,161,0.05)" : "rgba(0,212,161,0.07)", borderBottomWidth: 1, borderBottomColor: t.border }}>
      <View style={{ flexDirection: "row", alignItems: "center", gap: SPACE.sm + 2 }}>
        <View style={{ width: 42, height: 42, borderRadius: RADIUS.lg, alignItems: "center", justifyContent: "center", backgroundColor: t.accent + "18" }}>
          <Radio size={20} color={t.accent} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: FONT_SIZE.lg, fontWeight: WEIGHT.bold, color: t.text }}>周辺をスキャン中</Text>
          <Text style={{ fontSize: FONT_SIZE.sm, marginTop: 2, color: t.sub }}>{postCount}件のイベントを検出 • 越谷市周辺</Text>
        </View>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 3, borderRadius: RADIUS.sm + 2, paddingHorizontal: SPACE.sm + 2, paddingVertical: 5, backgroundColor: t.accent }}>
          <Eye size={12} color="#000" />
          <Text style={{ fontSize: FONT_SIZE.sm, fontWeight: WEIGHT.extrabold, color: "#000" }}>LIVE</Text>
        </View>
      </View>

      {/* Pulseスコア統合 */}
      <View style={{ flexDirection: "row", alignItems: "center", gap: SPACE.sm, marginTop: SPACE.md, paddingTop: SPACE.sm, borderTopWidth: 1, borderTopColor: t.accent + "15" }}>
        <Text style={{ fontSize: FONT_SIZE.sm, fontWeight: WEIGHT.semibold, color: t.sub }}>盛り上がり度</Text>
        <Text style={{ fontSize: FONT_SIZE.base, fontWeight: WEIGHT.bold, color: t.text }}>82 / 100</Text>
        <View style={{ borderRadius: RADIUS.sm, paddingHorizontal: SPACE.sm, paddingVertical: 2, backgroundColor: t.accent, marginLeft: "auto" }}>
          <Text style={{ fontSize: FONT_SIZE.xxs, fontWeight: WEIGHT.extrabold, color: "#000" }}>HOT</Text>
        </View>
      </View>
    </View>
  );
}
