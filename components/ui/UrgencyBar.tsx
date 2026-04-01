import { View, Text } from "react-native";
import { Timer } from "@/lib/icons";
import type { CategoryId } from "@/constants/categories";

interface UrgencyBarProps {
  timeLeft: number;
  subColor: string;
  category?: CategoryId;
}

/** 残り時間の表示テキスト（カテゴリに応じた接頭辞付き） */
function formatTimeLeft(min: number, category?: CategoryId): string {
  const prefix = category === "event" ? "開催まで" : "掲載終了まで";
  if (min <= 0) return "掲載終了";
  if (min < 60) return `${prefix}あと${Math.ceil(min)}分`;
  if (min < 1440) return `${prefix}あと${Math.floor(min / 60)}時間`;
  return `${prefix}あと${Math.floor(min / 1440)}日`;
}

/** 残り時間の緊急度表示 */
export default function UrgencyBar({ timeLeft, subColor, category }: UrgencyBarProps) {
  // deadline なしの投稿は表示しない
  if (timeLeft >= 9999) return null;

  const expired = timeLeft <= 0;
  const urgent = timeLeft > 0 && timeLeft <= 30;
  const warn = timeLeft > 0 && timeLeft <= 60;
  const color = expired ? "#8887A0" : urgent ? "#F0425C" : warn ? "#F5A623" : subColor;

  return (
    <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
      <Timer size={12} color={color} />
      <Text style={{ fontSize: 12, fontWeight: urgent || expired ? "700" : "600", color }}>
        {formatTimeLeft(timeLeft, category)}
      </Text>
      {urgent && <View style={{ width: 5, height: 5, borderRadius: 2.5, backgroundColor: "#F0425C" }} />}
    </View>
  );
}
