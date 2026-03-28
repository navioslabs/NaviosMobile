import { View, Text } from "react-native";
import { MapPin, Award, Crown } from "@/lib/icons";
import type { ThemeTokens } from "@/constants/theme";
import type { BadgeType } from "@/types";
import { WEIGHT, RADIUS, getScaledFontSize } from "@/lib/styles";
import { useFontSizeStore } from "@/stores/fontSizeStore";

interface BadgePillProps {
  badgeType: BadgeType;
  areaName: string;
  t: ThemeTokens;
  compact?: boolean;
}

const BADGE_CONFIG: Record<BadgeType, { label: string; icon: typeof MapPin; bg: string; color: string }> = {
  resident: { label: "の住人", icon: MapPin, bg: "rgba(150,150,150,0.2)", color: "#A0A0A0" },
  face: { label: "の顔", icon: Award, bg: "rgba(100,149,237,0.2)", color: "#6495ED" },
  legend: { label: "のレジェンド", icon: Crown, bg: "rgba(255,215,0,0.2)", color: "#FFD700" },
};

/** ローカルレジェンドバッジ */
export default function BadgePill({ badgeType, areaName, t, compact }: BadgePillProps) {
  const { scale } = useFontSizeStore();
  const fs = getScaledFontSize(scale);
  const config = BADGE_CONFIG[badgeType];
  const Icon = config.icon;

  if (compact) {
    return (
      <View style={{
        flexDirection: "row",
        alignItems: "center",
        gap: 2,
        borderRadius: RADIUS.sm,
        paddingHorizontal: 4,
        paddingVertical: 1,
        backgroundColor: config.bg,
      }}>
        <Icon size={9} color={config.color} />
        <Text style={{ fontSize: fs.xxs - 1, fontWeight: WEIGHT.bold, color: config.color }} numberOfLines={1}>
          {areaName}
        </Text>
      </View>
    );
  }

  return (
    <View style={{
      flexDirection: "row",
      alignItems: "center",
      gap: 5,
      borderRadius: RADIUS.full,
      paddingHorizontal: 10,
      paddingVertical: 5,
      backgroundColor: config.bg,
    }}>
      <Icon size={13} color={config.color} />
      <Text style={{ fontSize: fs.xs, fontWeight: WEIGHT.bold, color: config.color }}>
        {areaName}{config.label}
      </Text>
    </View>
  );
}
