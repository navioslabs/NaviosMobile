import { View, Text } from "react-native";
import { Radio } from "@/lib/icons";
import type { ThemeTokens } from "@/constants/theme";

interface PulseScoreCardProps {
  t: ThemeTokens;
  isDark: boolean;
}

/** Pulseスコア表示カード */
export default function PulseScoreCard({ t, isDark }: PulseScoreCardProps) {
  return (
    <View
      className="flex-row items-center gap-3 rounded-2xl p-3.5 mb-[22px]"
      style={{ backgroundColor: isDark ? "rgba(0,212,161,0.06)" : "rgba(0,212,161,0.08)", borderWidth: 1, borderColor: t.accent + "22" }}
    >
      <View className="w-[42px] h-[42px] rounded-[14px] items-center justify-center" style={{ backgroundColor: t.accent + "22" }}>
        <Radio size={20} color={t.accent} />
      </View>
      <View className="flex-1">
        <Text className="text-[13px] font-bold" style={{ color: t.text }}>Pulse スコア: 82 / 100</Text>
        <Text className="text-[11px]" style={{ color: t.sub }}>周辺エリアの盛り上がり度</Text>
      </View>
      <View className="rounded-lg px-2.5 py-1 bg-accent">
        <Text className="text-[10px] font-extrabold text-black">HOT</Text>
      </View>
    </View>
  );
}
