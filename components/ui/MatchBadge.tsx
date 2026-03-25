import { View, Text } from "react-native";
import { Zap } from "@/lib/icons";

interface MatchBadgeProps {
  score: number;
}

/** マッチスコアバッジ */
export default function MatchBadge({ score }: MatchBadgeProps) {
  const color = score >= 80 ? "#00D4A1" : score >= 60 ? "#F5A623" : "#8887A0";
  return (
    <View style={{ flexDirection: "row", alignItems: "center", gap: 3, backgroundColor: "rgba(0,0,0,0.55)", borderRadius: 9999, paddingHorizontal: 8, paddingVertical: 3 }}>
      <Zap size={10} color={color} />
      <Text style={{ fontSize: 11, fontWeight: "700", color }}>{score}%</Text>
    </View>
  );
}
