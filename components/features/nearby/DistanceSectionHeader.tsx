import { View, Text } from "react-native";
import type { ThemeTokens } from "@/constants/theme";
import { FONT_SIZE, WEIGHT, SPACE } from "@/lib/styles";

interface DistanceSectionHeaderProps {
  title: string;
  count: number;
  color: string;
  t: ThemeTokens;
}

/** 距離セクションヘッダー（背景色付き） */
export default function DistanceSectionHeader({ title, count, color, t }: DistanceSectionHeaderProps) {
  return (
    <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: SPACE.lg, paddingTop: SPACE.xl, paddingBottom: SPACE.sm, marginTop: SPACE.sm, backgroundColor: color + "08", borderTopWidth: 1, borderTopColor: color + "15" }}>
      <View style={{ flexDirection: "row", alignItems: "center", gap: SPACE.sm }}>
        <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: color }} />
        <Text style={{ fontSize: FONT_SIZE.sm, fontWeight: WEIGHT.bold, color: t.sub }}>{title}</Text>
      </View>
      <Text style={{ fontSize: FONT_SIZE.xxs, fontWeight: WEIGHT.semibold, color: t.muted }}>{count}件</Text>
    </View>
  );
}
