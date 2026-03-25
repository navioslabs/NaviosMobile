import { memo } from "react";
import { View, Text } from "react-native";
import { Image } from "expo-image";
import { Navigation, Flame } from "@/lib/icons";
import type { ThemeTokens } from "@/constants/theme";
import type { Post } from "@/types";
import { distLabel } from "@/lib/utils";
import { calcMatchScore, calcTimeLeft, crowdLabel } from "@/lib/adapters";
import { WEIGHT, SPACE, getScaledFontSize } from "@/lib/styles";
import { useFontSizeStore } from "@/stores/fontSizeStore";
import CatPill from "@/components/ui/CatPill";
import MatchBadge from "@/components/ui/MatchBadge";
import UrgencyBar from "@/components/ui/UrgencyBar";
import CrowdTag from "@/components/ui/CrowdTag";
import GoButton from "@/components/ui/GoButton";
import HotStrip from "@/components/ui/HotStrip";

interface PulseEventCardProps {
  event: Post;
  t: ThemeTokens;
}

/** AIパルスイベントカード */
function PulseEventCard({ event, t }: PulseEventCardProps) {
  const { scale } = useFontSizeStore();
  const fs = getScaledFontSize(scale);
  const matchScore = calcMatchScore(event.distance_m ?? 0);
  const isHot = matchScore >= 85;

  return (
    <View
      style={{ borderRadius: 18, overflow: "hidden", position: "relative", backgroundColor: t.surface, borderWidth: isHot ? 1.5 : 1, borderColor: isHot ? t.accent + "35" : t.border }}
    >
      {isHot && <HotStrip />}
      <View style={{ flexDirection: "row", gap: 12, padding: 14 }}>
        <Image source={{ uri: event.image_url ?? "" }} style={{ width: 64, height: 64, borderRadius: 14 }} contentFit="cover" />
        <View style={{ flex: 1 }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 4 }}>
            {isHot && (
              <View style={{ flexDirection: "row", alignItems: "center", gap: 3, paddingHorizontal: 7, paddingVertical: 2, borderRadius: 9999, backgroundColor: "#F0425C" }}>
                <Flame size={10} color="#fff" />
                <Text style={{ color: "#fff", fontSize: fs.xxs, fontWeight: WEIGHT.bold }}>HOT</Text>
              </View>
            )}
            <CatPill cat={event.category} small />
          </View>
          <Text style={{ fontSize: fs.base, fontWeight: WEIGHT.bold, lineHeight: 20, marginBottom: 5, color: t.text }} numberOfLines={1}>
            {event.author?.display_name ?? "ユーザー"}
          </Text>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 3 }}>
              <Navigation size={11} color={t.accent} />
              <Text style={{ fontSize: fs.xs, fontWeight: WEIGHT.semibold, color: t.accent }}>{distLabel(event.distance_m ?? 0)}</Text>
            </View>
            <UrgencyBar timeLeft={calcTimeLeft(event.deadline)} subColor={t.sub} />
            {event.crowd ? <CrowdTag crowd={crowdLabel(event.crowd)} /> : null}
          </View>
        </View>
        <View style={{ alignItems: "flex-end", justifyContent: "space-between" }}>
          <MatchBadge score={matchScore} />
          <GoButton small />
        </View>
      </View>
    </View>
  );
}

export default memo(PulseEventCard);
