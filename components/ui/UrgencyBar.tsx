import { View, Text } from "react-native";
import { Timer } from "@/lib/icons";

interface UrgencyBarProps {
  timeLeft: number;
  subColor: string;
}

/** 残り時間の緊急度表示 */
export default function UrgencyBar({ timeLeft, subColor }: UrgencyBarProps) {
  const urgent = timeLeft <= 30;
  const warn = timeLeft <= 60;
  const color = urgent ? "#F0425C" : warn ? "#F5A623" : subColor;

  return (
    <View className="flex-row items-center gap-1">
      <Timer size={12} color={color} />
      <Text className={`text-[11px] ${urgent ? "font-bold" : "font-semibold"}`} style={{ color }}>
        あと{timeLeft}分
      </Text>
      {urgent && <View className="w-[5px] h-[5px] rounded-full bg-danger" />}
    </View>
  );
}
