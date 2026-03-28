import { memo } from "react";
import { View, Text, Pressable } from "react-native";
import Animated, { FadeInUp } from "react-native-reanimated";
import { Image } from "expo-image";
import { router } from "expo-router";
import { MapPin, MessageCircle, Heart, Share } from "@/lib/icons";
import type { ThemeTokens } from "@/constants/theme";
import type { Talk } from "@/types";
import { timeAgo } from "@/lib/adapters";
import { WEIGHT, SPACE, RADIUS, getScaledFontSize } from "@/lib/styles";
import { useFontSizeStore } from "@/stores/fontSizeStore";
import { useToggleLike, useIsLiked } from "@/hooks/useLikes";
import { useUserTopBadge } from "@/hooks/useBadges";
import { HALL_OF_FAME_THRESHOLD } from "@/constants/ghost";
import GhostCountdown from "./GhostCountdown";
import HallOfFameBadge from "./HallOfFameBadge";
import BadgePill from "@/components/features/badges/BadgePill";

interface TalkItemProps {
  talk: Talk;
  t: ThemeTokens;
}

/** Talk タイムラインアイテム（SNSフロー型） */
function TalkItem({ talk, t }: TalkItemProps) {
  const { scale } = useFontSizeStore();
  const fs = getScaledFontSize(scale);
  const { data: isLiked = false } = useIsLiked("talk", talk.id);
  const toggleLike = useToggleLike();
  const { data: topBadge } = useUserTopBadge(talk.author_id);

  if (!talk?.id) return null;

  const handleLike = () => {
    toggleLike.mutate({ targetType: "talk", targetId: talk.id });
  };

  const likesRemaining = HALL_OF_FAME_THRESHOLD - talk.likes_count;
  const showHint = !talk.is_hall_of_fame && likesRemaining > 0 && likesRemaining <= 5;

  return (
    <Animated.View entering={FadeInUp.duration(300).springify()}>
      <Pressable
        onPress={() => router.push(`/talk-detail/${talk.id}` as any)}
        style={({ pressed }) => ({
          paddingHorizontal: SPACE.xl,
          paddingVertical: SPACE.md,
          opacity: pressed ? 0.9 : 1,
          borderBottomWidth: 1,
          borderBottomColor: t.border,
          ...(talk.is_hall_of_fame ? {
            borderLeftWidth: 3,
            borderLeftColor: "#FFD700" + "60",
          } : {}),
        })}
      >
        {/* ヘッダー: アバター + 名前 + 時刻 + 位置 */}
        <View style={{ flexDirection: "row", alignItems: "center", gap: SPACE.sm }}>
          <Pressable onPress={() => router.push(`/profile/${talk.author_id}` as any)}>
            <Image
              source={{ uri: talk.author?.avatar_url ?? "https://i.pravatar.cc/100" }}
              style={{ width: 40, height: 40, borderRadius: 20 }}
              contentFit="cover"
            />
          </Pressable>
          <View style={{ flex: 1 }}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
              <Text style={{ fontSize: fs.sm, fontWeight: WEIGHT.bold, color: t.text }}>
                {talk.author?.display_name ?? "ユーザー"}
              </Text>
              {talk.author?.is_verified && (
                <View style={{ width: 14, height: 14, borderRadius: 7, backgroundColor: t.blue, alignItems: "center", justifyContent: "center" }}>
                  <Text style={{ fontSize: 8, color: "#fff", fontWeight: WEIGHT.bold }}>✓</Text>
                </View>
              )}
              {topBadge && (
                <BadgePill badgeType={topBadge.badge_type as any} areaName={topBadge.area_name} t={t} compact />
              )}
              <Text style={{ fontSize: fs.xxs, color: t.muted }}>{timeAgo(talk.created_at)}</Text>
            </View>
            <View style={{ flexDirection: "row", alignItems: "center", gap: SPACE.sm, marginTop: 2 }}>
              {talk.location_text ? (
                <View style={{ flexDirection: "row", alignItems: "center", gap: 3 }}>
                  <MapPin size={10} color={t.accent} />
                  <Text style={{ fontSize: fs.xxs, color: t.accent }}>{talk.location_text}</Text>
                </View>
              ) : null}
              {/* ゴースト/殿堂入り表示 */}
              {talk.is_hall_of_fame ? (
                <HallOfFameBadge t={t} compact />
              ) : (
                <GhostCountdown createdAt={talk.created_at} t={t} />
              )}
            </View>
          </View>
        </View>

        {/* 本文 */}
        <Text style={{ fontSize: fs.base, lineHeight: 22, color: t.text, marginTop: SPACE.sm, marginLeft: 40 + SPACE.sm }}>
          {talk.message}
        </Text>

        {/* 殿堂入りヒント */}
        {showHint && (
          <Text style={{ fontSize: fs.xxs, color: "#FFD700", marginTop: SPACE.xs, marginLeft: 40 + SPACE.sm, fontWeight: WEIGHT.semibold }}>
            あと{likesRemaining}いいねで殿堂入り
          </Text>
        )}

        {/* 画像 */}
        {talk.image_url && (
          <View style={{ marginTop: SPACE.sm, marginLeft: 40 + SPACE.sm, borderRadius: RADIUS.md, overflow: "hidden", borderWidth: 1, borderColor: t.border }}>
            <Image source={{ uri: talk.image_url }} style={{ width: "100%", height: 180 }} contentFit="cover" />
          </View>
        )}

        {/* アクション（44pt最小タップ領域を保証） */}
        <View style={{ flexDirection: "row", alignItems: "center", gap: SPACE.lg, marginTop: SPACE.xs, marginLeft: 40 + SPACE.sm }}>
          <Pressable
            onPress={() => router.push(`/talk-detail/${talk.id}` as any)}
            accessibilityLabel={`返信 ${talk.replies_count || 0}件`}
            accessibilityRole="button"
            hitSlop={8}
            style={({ pressed }) => ({ flexDirection: "row" as const, alignItems: "center" as const, gap: 5, minWidth: 44, minHeight: 44, justifyContent: "center" as const, opacity: pressed ? 0.6 : 1 })}
          >
            <MessageCircle size={18} color={t.muted} />
            <Text style={{ fontSize: fs.xs, color: t.muted }}>{talk.replies_count || ""}</Text>
          </Pressable>

          <Pressable
            onPress={handleLike}
            accessibilityLabel={isLiked ? `いいね済み ${talk.likes_count}件` : `いいね ${talk.likes_count}件`}
            accessibilityRole="button"
            hitSlop={8}
            style={({ pressed }) => ({ flexDirection: "row" as const, alignItems: "center" as const, gap: 5, minWidth: 44, minHeight: 44, justifyContent: "center" as const, opacity: pressed ? 0.6 : 1 })}
          >
            <Heart size={18} fill={isLiked ? t.red : "none"} color={isLiked ? t.red : t.muted} />
            <Text style={{ fontSize: fs.xs, color: isLiked ? t.red : t.muted }}>
              {talk.likes_count || ""}
            </Text>
          </Pressable>

          <Pressable
            accessibilityLabel="共有"
            accessibilityRole="button"
            hitSlop={8}
            style={({ pressed }) => ({ minWidth: 44, minHeight: 44, alignItems: "center" as const, justifyContent: "center" as const, opacity: pressed ? 0.6 : 1 })}
          >
            <Share size={18} color={t.muted} />
          </Pressable>
        </View>
      </Pressable>
    </Animated.View>
  );
}

export default memo(TalkItem);
