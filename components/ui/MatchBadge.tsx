import { View, Text } from "react-native";
import { Zap } from "@/lib/icons";

interface MatchBadgeProps {
  score: number;
}

/** マッチスコアバッジ */
export default function MatchBadge({ score }: MatchBadgeProps) {
  const color = score >= 80 ? "#00D4A1" : score >= 60 ? "#F5A623" : "#8887A0";
  return (
    <View className="flex-row items-center gap-[3px] rounded-pill bg-black/55 px-2 py-[3px]">
      <Zap size={10} color={color} />
      <Text className="text-[10px] font-bold" style={{ color }}>{score}%</Text>
    </View>
  );
}
