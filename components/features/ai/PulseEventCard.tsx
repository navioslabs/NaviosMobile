import { View, Text } from "react-native";
import { Image } from "expo-image";
import { Navigation, Flame } from "@/lib/icons";
import type { ThemeTokens } from "@/constants/theme";
import type { FeedPost } from "@/types";
import { distLabel } from "@/lib/utils";
import CatPill from "@/components/ui/CatPill";
import MatchBadge from "@/components/ui/MatchBadge";
import UrgencyBar from "@/components/ui/UrgencyBar";
import CrowdTag from "@/components/ui/CrowdTag";
import GoButton from "@/components/ui/GoButton";
import HotStrip from "@/components/ui/HotStrip";

interface PulseEventCardProps {
  event: FeedPost;
  t: ThemeTokens;
}

/** AIパルスイベントカード */
export default function PulseEventCard({ event, t }: PulseEventCardProps) {
  const isHot = event.matchScore >= 85;

  return (
    <View
      className="rounded-[18px] overflow-hidden relative"
      style={{ backgroundColor: t.surface, borderWidth: isHot ? 1.5 : 1, borderColor: isHot ? t.accent + "35" : t.border }}
    >
      {isHot && <HotStrip />}
      <View className="flex-row gap-3 p-3.5">
        <Image source={{ uri: event.image }} className="w-16 h-16 rounded-[14px]" contentFit="cover" />
        <View className="flex-1">
          <View className="flex-row items-center gap-1.5 mb-1">
            {isHot && (
              <View className="flex-row items-center gap-[3px] px-[7px] py-0.5 rounded-pill bg-danger">
                <Flame size={9} color="#fff" />
                <Text className="text-white text-[9px] font-bold">HOT</Text>
              </View>
            )}
            <CatPill cat={event.category} small />
          </View>
          <Text className="text-sm font-bold leading-[18px] mb-[5px]" numberOfLines={1} style={{ color: t.text }}>
            {event.user.name}
          </Text>
          <View className="flex-row items-center gap-2 flex-wrap">
            <View className="flex-row items-center gap-[3px]">
              <Navigation size={10} color={t.accent} />
              <Text className="text-[11px] font-semibold" style={{ color: t.accent }}>{distLabel(event.distance)}</Text>
            </View>
            <UrgencyBar timeLeft={event.timeLeft} subColor={t.sub} />
            {event.crowd ? <CrowdTag crowd={event.crowd} /> : null}
          </View>
        </View>
        <View className="items-end justify-between">
          <MatchBadge score={event.matchScore} />
          <GoButton small />
        </View>
      </View>
    </View>
  );
}
