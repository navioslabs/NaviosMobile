import { View, Text } from "react-native";
import { Award } from "@/lib/icons";
import type { ThemeTokens } from "@/constants/theme";
import type { UserBadge } from "@/types";
import { WEIGHT, SPACE } from "@/lib/styles";
import { getScaledFontSize } from "@/lib/styles";
import { useFontSizeStore } from "@/stores/fontSizeStore";
import BadgePill from "./BadgePill";

interface BadgeSectionProps {
  badges: UserBadge[];
  t: ThemeTokens;
}

/** プロフィール画面用バッジセクション */
export default function BadgeSection({ badges, t }: BadgeSectionProps) {
  const { scale } = useFontSizeStore();
  const fs = getScaledFontSize(scale);

  if (badges.length === 0) return null;

  return (
    <View style={{ paddingHorizontal: SPACE.xl, paddingVertical: SPACE.lg }}>
      <View style={{ flexDirection: "row", alignItems: "center", gap: SPACE.sm, marginBottom: SPACE.md }}>
        <Award size={16} color={t.accent} />
        <Text style={{ fontSize: fs.base, fontWeight: WEIGHT.bold, color: t.text }}>
          獲得バッジ
        </Text>
      </View>
      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: SPACE.sm }}>
        {badges.map((badge) => (
          <BadgePill
            key={badge.id}
            badgeType={badge.badge_type}
            areaName={badge.area_name}
            t={t}
          />
        ))}
      </View>
    </View>
  );
}
