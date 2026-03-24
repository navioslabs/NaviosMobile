import { View, Text } from "react-native";
import { Image } from "expo-image";
import { Clock } from "@/lib/icons";
import type { ThemeTokens } from "@/constants/theme";
import type { NearbyPost } from "@/types";
import { distLabel } from "@/lib/utils";
import CatPill from "@/components/ui/CatPill";
import MatchBadge from "@/components/ui/MatchBadge";

interface NearbyPostItemProps {
  post: NearbyPost;
  t: ThemeTokens;
}

/** 近隣投稿リストアイテム */
export default function NearbyPostItem({ post, t }: NearbyPostItemProps) {
  const isClose = post.distance <= 200;

  return (
    <View className="flex-row gap-3 py-3 px-2.5" style={{ borderBottomWidth: 1, borderBottomColor: t.border }}>
      {/* Distance indicator */}
      <View className="w-12 items-center gap-1 pt-0.5">
        <Text className="text-[13px] font-extrabold" style={{ color: isClose ? t.accent : t.text }}>
          {distLabel(post.distance)}
        </Text>
        <View className="w-2 h-2 rounded-full" style={{ backgroundColor: isClose ? t.accent : t.accent }} />
        <View className="flex-1 w-[1.5px] min-h-[20px]" style={{ backgroundColor: t.border }} />
      </View>

      {/* Image */}
      <Image source={{ uri: post.image }} className="w-[72px] h-[72px] rounded-[14px]" contentFit="cover" />

      {/* Content */}
      <View className="flex-1">
        <View className="flex-row items-center gap-1.5 mb-1">
          <CatPill cat={post.category} small />
          {isClose && (
            <View className="rounded-pill px-1.5 py-0.5" style={{ backgroundColor: t.accent + "20" }}>
              <Text className="text-[9px] font-bold" style={{ color: t.accent }}>すぐ近く</Text>
            </View>
          )}
        </View>
        <Text className="text-sm font-bold leading-[18px] mb-[3px]" style={{ color: t.text }}>{post.title}</Text>
        <Text className="text-xs leading-4 mb-1" numberOfLines={1} style={{ color: t.sub }}>{post.content}</Text>
        <View className="flex-row items-center gap-1">
          <Text className="text-[11px]" style={{ color: t.muted }}>{post.author}</Text>
          <Text className="text-[11px]" style={{ color: t.muted }}>•</Text>
          <Clock size={10} color={t.muted} />
          <Text className="text-[11px]" style={{ color: t.muted }}>{post.time}</Text>
          <MatchBadge score={post.matchScore} />
        </View>
      </View>
    </View>
  );
}
