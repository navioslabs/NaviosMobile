import { View, Text } from "react-native";
import { Trophy } from "@/lib/icons";
import type { ThemeTokens } from "@/constants/theme";
import { WEIGHT, SPACE, RADIUS, getScaledFontSize } from "@/lib/styles";
import { useFontSizeStore } from "@/stores/fontSizeStore";

interface HallOfFameBadgeProps {
  t: ThemeTokens;
  compact?: boolean;
}

/** 殿堂入りバッジ */
export default function HallOfFameBadge({ t, compact }: HallOfFameBadgeProps) {
  const { scale } = useFontSizeStore();
  const fs = getScaledFontSize(scale);

  if (compact) {
    return (
      <View style={{
        flexDirection: "row",
        alignItems: "center",
        gap: 2,
        borderRadius: RADIUS.sm,
        paddingHorizontal: 4,
        paddingVertical: 1,
        backgroundColor: "#FFD700" + "25",
      }}>
        <Trophy size={10} color="#FFD700" />
      </View>
    );
  }

  return (
    <View style={{
      flexDirection: "row",
      alignItems: "center",
      gap: 4,
      borderRadius: RADIUS.full,
      paddingHorizontal: SPACE.sm,
      paddingVertical: 3,
      backgroundColor: "#FFD700" + "20",
      shadowColor: "#FFD700",
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.3,
      shadowRadius: 6,
      elevation: 2,
    }}>
      <Trophy size={12} color="#FFD700" />
      <Text style={{ fontSize: fs.xxs, fontWeight: WEIGHT.extrabold, color: "#FFD700" }}>
        殿堂入り
      </Text>
    </View>
  );
}
