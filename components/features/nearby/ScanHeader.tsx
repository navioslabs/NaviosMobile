import { View, Text, Pressable } from "react-native";
import { Radio, Eye, Clock } from "@/lib/icons";
import type { ThemeTokens } from "@/constants/theme";
import { FONT_SIZE, WEIGHT, SPACE, RADIUS } from "@/lib/styles";

interface ScanHeaderProps {
  t: ThemeTokens;
  isDark: boolean;
  postCount: number;
}

/** スキャンヘッダー（Pulseスコア + 更新時刻） */
export default function ScanHeader({ t, isDark, postCount }: ScanHeaderProps) {
  const now = new Date();
  const timeStr = `${now.getHours()}:${String(now.getMinutes()).padStart(2, "0")}`;

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

      {/* Pulseスコア + 更新時刻 */}
      <View style={{ flexDirection: "row", alignItems: "center", gap: SPACE.sm, marginTop: SPACE.md, paddingTop: SPACE.sm, borderTopWidth: 1, borderTopColor: t.accent + "15" }}>
        <Text style={{ fontSize: FONT_SIZE.sm, fontWeight: WEIGHT.semibold, color: t.sub }}>盛り上がり度</Text>
        <Text style={{ fontSize: FONT_SIZE.base, fontWeight: WEIGHT.bold, color: t.text }}>82 / 100</Text>
        <View style={{ borderRadius: RADIUS.sm, paddingHorizontal: SPACE.sm, paddingVertical: 2, backgroundColor: t.accent }}>
          <Text style={{ fontSize: FONT_SIZE.xxs, fontWeight: WEIGHT.extrabold, color: "#000" }}>HOT</Text>
        </View>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 3, marginLeft: "auto" }}>
          <Clock size={11} color={t.muted} />
          <Text style={{ fontSize: FONT_SIZE.xxs, color: t.muted }}>{timeStr} 更新</Text>
        </View>
      </View>
    </View>
  );
}
