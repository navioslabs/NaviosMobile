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
    <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
      <Timer size={12} color={color} />
      <Text style={{ fontSize: 12, fontWeight: urgent ? "700" : "600", color }}>
        あと{timeLeft}分
      </Text>
      {urgent && <View style={{ width: 5, height: 5, borderRadius: 2.5, backgroundColor: "#F0425C" }} />}
    </View>
  );
}
