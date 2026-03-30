import { memo, useCallback } from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import Animated, { SlideInLeft, useSharedValue, useAnimatedStyle, withSequence, withSpring } from "react-native-reanimated";
import * as Haptics from "expo-haptics";
import { Image } from "expo-image";
import { router } from "expo-router";
import { MapPin, MessageCircle, Heart, Navigation, User } from "@/lib/icons";
import type { ThemeTokens } from "@/constants/theme";
import type { Talk } from "@/types";
import { timeAgo } from "@/lib/adapters";
import { WEIGHT, SPACE, RADIUS, getScaledFontSize } from "@/lib/styles";
import { useFontSizeStore } from "@/stores/fontSizeStore";
import { useToggleLike, useIsLiked } from "@/hooks/useLikes";
import { useGuestGuard } from "@/hooks/useGuestGuard";
import { useUserTopBadge } from "@/hooks/useBadges";
import { HALL_OF_FAME_THRESHOLD } from "@/constants/ghost";
import GhostCountdown from "./GhostCountdown";
import HallOfFameBadge from "./HallOfFameBadge";
import BadgePill from "@/components/features/badges/BadgePill";
import HashtagText from "@/components/ui/HashtagText";

interface TalkItemProps {
  talk: Talk;
  t: ThemeTokens;
}

/** Talk タイムラインアイテム（吹き出し型） */
function TalkItem({ talk, t }: TalkItemProps) {
  const { scale } = useFontSizeStore();
  const fs = getScaledFontSize(scale);
  const { data: isLiked = false } = useIsLiked("talk", talk.id);
  const toggleLike = useToggleLike();
  const guard = useGuestGuard();
  const { data: topBadge } = useUserTopBadge(talk.author_id);
  const heartScale = useSharedValue(1);

  if (!talk?.id) return null;

  const handleLike = useCallback(() => {
    guard(() => {
      if (isLiked) {
        Haptics.selectionAsync();
      } else {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        heartScale.value = withSequence(
          withSpring(1.35, { damping: 8, stiffness: 400 }),
          withSpring(1, { damping: 10, stiffness: 200 }),
        );
      }
      toggleLike.mutate({ targetType: "talk", targetId: talk.id });
    }, "いいね");
  }, [isLiked, talk.id]);

  const isHallOfFame = !!talk.is_hall_of_fame;
  const likesRemaining = HALL_OF_FAME_THRESHOLD - talk.likes_count;
  const showHint = !isHallOfFame && likesRemaining > 0 && likesRemaining <= 5;

  // ゴースト: 残り時間に応じた透明度（24h → 0h で 1.0 → 0.4）
  const ghostOpacity = isHallOfFame ? 1 : (() => {
    const age = (Date.now() - new Date(talk.created_at).getTime()) / (1000 * 60 * 60);
    return Math.max(0.4, 1 - (age / 24) * 0.6);
  })();

  return (
    <Animated.View entering={SlideInLeft.duration(400).damping(18).stiffness(120)}>
      <Pressable
        onPress={() => router.push(`/talk-detail/${talk.id}` as any)}
        accessibilityLabel={`${talk.author?.display_name ?? "匿名"}のトーク: ${talk.message}`}
        accessibilityRole="button"
        style={({ pressed }) => ({
          paddingHorizontal: SPACE.lg,
          paddingVertical: SPACE.sm + 2,
          opacity: pressed ? 0.85 : ghostOpacity,
        })}
      >
        <View style={talkStyles.row}>
          {/* アバター（小さめ） */}
          <Pressable
            onPress={() => router.push(`/profile/${talk.author_id}` as any)}
            style={talkStyles.avatarWrap}
          >
            {talk.author?.avatar_url ? (
              <Image
                source={{ uri: talk.author.avatar_url }}
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 16,
                  borderWidth: isHallOfFame ? 2 : 0,
                  borderColor: isHallOfFame ? "#FFD700" : "transparent",
                }}
                contentFit="cover"
              />
            ) : (
              <View style={{
                width: 32,
                height: 32,
                borderRadius: 16,
                backgroundColor: t.border,
                alignItems: "center",
                justifyContent: "center",
                borderWidth: isHallOfFame ? 2 : 0,
                borderColor: isHallOfFame ? "#FFD700" : "transparent",
              }}>
                <User size={16} color={t.muted} />
              </View>
            )}
          </Pressable>

          {/* 吹き出しカード */}
          <View style={{ flex: 1 }}>
            {/* 名前 + バッジ行 */}
            <View style={talkStyles.nameRow}>
              <Text style={{ fontSize: fs.xs, fontWeight: WEIGHT.bold, color: t.text }}>
                {talk.author?.display_name ?? "匿名"}
              </Text>
              {talk.author?.is_verified && (
                <View style={{ width: 14, height: 14, borderRadius: 7, backgroundColor: t.blue, alignItems: "center", justifyContent: "center" }}>
                  <Text style={{ fontSize: 8, color: "#fff", fontWeight: WEIGHT.bold }}>✓</Text>
                </View>
              )}
              {topBadge && (
                <BadgePill badgeType={topBadge.badge_type as any} areaName={topBadge.area_name} t={t} compact />
              )}
            </View>

            {/* 吹き出し本体 */}
            <View style={{
              backgroundColor: isHallOfFame ? "#FFD700" + "10" : t.surface,
              borderRadius: RADIUS.xl,
              borderTopLeftRadius: SPACE.xs,
              borderWidth: isHallOfFame ? 1.5 : 1,
              borderColor: isHallOfFame ? "#FFD700" + "40" : t.border,
              padding: SPACE.md,
              ...(isHallOfFame ? {
                shadowColor: "#FFD700",
                shadowOffset: { width: 0, height: 0 },
                shadowOpacity: 0.15,
                shadowRadius: 12,
                elevation: 3,
              } : {}),
            }}>
              {/* メッセージ */}
              <HashtagText style={{ fontSize: fs.base, lineHeight: 22, color: t.text }} t={t}>
                {talk.message}
              </HashtagText>

              {/* 画像 */}
              {talk.image_url && (
                <View style={talkStyles.imageWrap}>
                  <Image source={{ uri: talk.image_url }} style={{ width: "100%", height: 160 }} contentFit="cover" />
                </View>
              )}

              {/* 殿堂入りヒント */}
              {showHint && (
                <Text style={{ fontSize: fs.xxs, color: "#FFD700", marginTop: SPACE.sm, fontWeight: WEIGHT.semibold }}>
                  あと{likesRemaining}いいねで殿堂入り
                </Text>
              )}
            </View>

            {/* メタ行: 距離 + ゴースト/殿堂 + アクション */}
            <View style={talkStyles.metaRow}>
              {/* 左: 位置 + ゴースト/殿堂 */}
              <View style={talkStyles.metaLeft}>
                {talk.location_text && (
                  <View style={talkStyles.locationRow}>
                    <MapPin size={10} color={t.accent} />
                    <Text style={{ fontSize: fs.xxs, fontWeight: WEIGHT.semibold, color: t.accent }}>{talk.location_text}</Text>
                  </View>
                )}
                {isHallOfFame ? (
                  <HallOfFameBadge t={t} compact />
                ) : (
                  <GhostCountdown createdAt={talk.created_at} t={t} />
                )}
              </View>

              {/* 右: アクション（いいね + 返信） */}
              <View style={talkStyles.actionGroup}>
                <Pressable
                  onPress={() => router.push(`/talk-detail/${talk.id}` as any)}
                  accessibilityLabel={`返信 ${talk.replies_count || 0}件`}
                  accessibilityRole="button"
                  hitSlop={8}
                  style={({ pressed }) => ({ flexDirection: "row" as const, alignItems: "center" as const, gap: 3, minHeight: 32, opacity: pressed ? 0.85 : 1, transform: [{ scale: pressed ? 0.9 : 1 }] })}
                >
                  <MessageCircle size={15} color={t.muted} />
                  {(talk.replies_count ?? 0) > 0 && (
                    <Text style={{ fontSize: fs.xxs, color: t.muted }}>{talk.replies_count}</Text>
                  )}
                </Pressable>

                <Pressable
                  onPress={handleLike}
                  accessibilityLabel={isLiked ? `いいね済み ${talk.likes_count}件` : `いいね ${talk.likes_count}件`}
                  accessibilityRole="button"
                  hitSlop={8}
                  style={({ pressed }) => ({ flexDirection: "row" as const, alignItems: "center" as const, gap: 3, minHeight: 32, opacity: pressed ? 0.85 : 1, transform: [{ scale: pressed ? 0.9 : 1 }] })}
                >
                  <Animated.View style={useAnimatedStyle(() => ({ transform: [{ scale: heartScale.value }] }))}>
                    <Heart size={15} fill={isLiked ? t.red : "none"} color={isLiked ? t.red : t.muted} />
                  </Animated.View>
                  {talk.likes_count > 0 && (
                    <Text style={{ fontSize: fs.xxs, color: isLiked ? t.red : t.muted }}>{talk.likes_count}</Text>
                  )}
                </Pressable>
              </View>
            </View>
          </View>
        </View>
      </Pressable>
    </Animated.View>
  );
}

const talkStyles = StyleSheet.create({
  row: { flexDirection: "row", gap: SPACE.sm },
  avatarWrap: { marginTop: 2 },
  nameRow: { flexDirection: "row", alignItems: "center", gap: 5, marginBottom: 3 },
  metaRow: { flexDirection: "row", alignItems: "center", marginTop: SPACE.xs, paddingHorizontal: SPACE.xs },
  metaLeft: { flex: 1, flexDirection: "row", alignItems: "center", gap: SPACE.sm },
  actionGroup: { flexDirection: "row", alignItems: "center", gap: SPACE.md },
  locationRow: { flexDirection: "row", alignItems: "center", gap: 3 },
  imageWrap: { marginTop: SPACE.sm, borderRadius: RADIUS.md, overflow: "hidden" },
});

export default memo(TalkItem);
