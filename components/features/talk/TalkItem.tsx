import { memo, useEffect, useRef } from "react";
import { View, Text, Pressable, Animated } from "react-native";
import { Image } from "expo-image";
import { router } from "expo-router";
import { MapPin, MessageCircle, ThumbsUp, Navigation, User } from "@/lib/icons";
import type { ThemeTokens } from "@/constants/theme";
import type { Talk } from "@/types";
import { timeAgo } from "@/lib/adapters";
import { WEIGHT, SPACE, RADIUS, getScaledFontSize } from "@/lib/styles";
import { useFontSizeStore } from "@/stores/fontSizeStore";
import { useToggleLike, useIsLiked } from "@/hooks/useLikes";
import { useGuestGuard } from "@/hooks/useGuestGuard";
import { useUserTopBadge } from "@/hooks/useBadges";
import { HALL_OF_FAME_THRESHOLD, GHOST_DURATION_MS } from "@/constants/ghost";
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

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;
  const likeScale = useRef(new Animated.Value(1)).current;
  const shakeAnim = useRef(new Animated.Value(0)).current;

  // 残り1時間以下かどうか
  const isExpiring = !talk.is_hall_of_fame && (Date.now() - new Date(talk.created_at).getTime()) > (GHOST_DURATION_MS - 3600000);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 350, useNativeDriver: true }),
      Animated.spring(slideAnim, { toValue: 0, damping: 18, stiffness: 120, useNativeDriver: true }),
    ]).start();
  }, []);

  /** 消えかけ投稿の左右微振動 */
  useEffect(() => {
    if (!isExpiring) return;
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(shakeAnim, { toValue: 1.5, duration: 80, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: -1.5, duration: 80, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: 1, duration: 60, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: 0, duration: 60, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: 0, duration: 3000, useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [isExpiring]);

  if (!talk?.id) return null;

  const handleLike = () => {
    guard(() => {
      Animated.sequence([
        Animated.spring(likeScale, { toValue: 1.5, useNativeDriver: true, speed: 50, bounciness: 12 }),
        Animated.spring(likeScale, { toValue: 1, useNativeDriver: true, speed: 50, bounciness: 8 }),
      ]).start();
      toggleLike.mutate({ targetType: "talk", targetId: talk.id });
    }, "いいね");
  };

  const isHallOfFame = !!talk.is_hall_of_fame;
  const likesRemaining = HALL_OF_FAME_THRESHOLD - talk.likes_count;
  const showHint = !isHallOfFame && likesRemaining > 0 && likesRemaining <= 5;

  // ゴースト: 残り時間に応じた透明度（24h → 0h で 1.0 → 0.4）
  const ghostOpacity = isHallOfFame ? 1 : (() => {
    const age = (Date.now() - new Date(talk.created_at).getTime()) / (1000 * 60 * 60);
    return Math.max(0.4, 1 - (age / 24) * 0.6);
  })();

  return (
    <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }, { translateX: shakeAnim }] }}>
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
        <View style={{ flexDirection: "row", gap: SPACE.sm }}>
          {/* アバター（小さめ） */}
          <Pressable
            onPress={() => router.push(`/profile/${talk.author_id}` as any)}
            style={{ marginTop: 2 }}
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
            <View style={{ flexDirection: "row", alignItems: "center", gap: 5, marginBottom: 3 }}>
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
                <View style={{ marginTop: SPACE.sm, borderRadius: RADIUS.md, overflow: "hidden" }}>
                  <Image source={{ uri: talk.image_url }} style={{ width: "100%", height: 160 }} contentFit="cover" />
                </View>
              )}

              {/* 殿堂ゲージ: 未殿堂入りで1いいね以上のとき表示 */}
              {!isHallOfFame && talk.likes_count > 0 && (
                <View style={{ flexDirection: "row", alignItems: "center", gap: 4, marginTop: SPACE.sm }}>
                  <View style={{ flexDirection: "row", gap: 3 }}>
                    {Array.from({ length: HALL_OF_FAME_THRESHOLD }).map((_, i) => (
                      <View
                        key={i}
                        style={{
                          width: 6,
                          height: 6,
                          borderRadius: 3,
                          backgroundColor: i < talk.likes_count ? "#FFD700" : t.border,
                        }}
                      />
                    ))}
                  </View>
                  <Text style={{ fontSize: fs.xxs, color: "#FFD700", fontWeight: WEIGHT.semibold }}>
                    {likesRemaining > 0 ? `あと${likesRemaining}` : "殿堂入り!"}
                  </Text>
                </View>
              )}

              {/* 消えかけヒント: 残り1時間以下 */}
              {isExpiring && (
                <Text style={{ fontSize: fs.xxs, color: t.red, marginTop: SPACE.xs, fontWeight: WEIGHT.semibold }}>
                  まもなく消えます — いいねで殿堂入りに残せます
                </Text>
              )}
            </View>

            {/* メタ行: 上段 位置+ゴースト/殿堂、下段 アクション */}
            <View style={{ marginTop: SPACE.xs, paddingHorizontal: SPACE.xs, gap: 2 }}>
              {/* 上段: 位置情報 + 残り時間 */}
              <View style={{ flexDirection: "row", alignItems: "center", flexWrap: "wrap", gap: SPACE.sm }}>
                {talk.location_text && (
                  <View style={{ flexDirection: "row", alignItems: "center", gap: 3 }}>
                    <MapPin size={10} color={t.accent} />
                    <Text style={{ fontSize: fs.xxs, fontWeight: WEIGHT.semibold, color: t.accent }} numberOfLines={1}>{talk.location_text}</Text>
                  </View>
                )}
                {isHallOfFame ? (
                  <HallOfFameBadge t={t} compact />
                ) : (
                  <GhostCountdown createdAt={talk.created_at} t={t} />
                )}
              </View>

              {/* 下段: アクション（返信 + いいね） */}
              <View style={{ flexDirection: "row", alignItems: "center", gap: SPACE.md }}>
                <Pressable
                  onPress={() => router.push(`/talk-detail/${talk.id}` as any)}
                  accessibilityLabel={`返信 ${talk.replies_count || 0}件`}
                  accessibilityRole="button"
                  hitSlop={8}
                  style={({ pressed }) => ({ flexDirection: "row" as const, alignItems: "center" as const, gap: 3, minHeight: 28, opacity: pressed ? 0.6 : 1 })}
                >
                  <MessageCircle size={14} color={t.muted} />
                  {(talk.replies_count ?? 0) > 0 && (
                    <Text style={{ fontSize: fs.xxs, color: t.muted }}>{talk.replies_count}</Text>
                  )}
                </Pressable>

                <Pressable
                  onPress={handleLike}
                  accessibilityLabel={isLiked ? `いいね済み ${talk.likes_count}件` : `いいね ${talk.likes_count}件`}
                  accessibilityRole="button"
                  hitSlop={8}
                  style={({ pressed }) => ({ flexDirection: "row" as const, alignItems: "center" as const, gap: 3, minHeight: 28, opacity: pressed ? 0.6 : 1 })}
                >
                  <Animated.View style={{ transform: [{ scale: likeScale }] }}>
                    <ThumbsUp size={14} fill={isLiked ? t.like : "none"} color={isLiked ? t.like : t.muted} />
                  </Animated.View>
                  {talk.likes_count > 0 && (
                    <Text style={{ fontSize: fs.xxs, color: isLiked ? t.like : t.muted }}>{talk.likes_count}</Text>
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

export default memo(TalkItem);
