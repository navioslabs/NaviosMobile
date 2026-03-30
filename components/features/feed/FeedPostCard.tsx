import { memo, useCallback, useRef } from "react";
import { View, Text, Pressable, StyleSheet, Animated } from "react-native";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import * as Haptics from "expo-haptics";
import { Navigation, Flame, Clock, Heart, MessageSquare, User } from "@/lib/icons";
import { CAT_CONFIG } from "@/constants/categories";
import type { ThemeTokens } from "@/constants/theme";
import type { Post } from "@/types";
import { distLabel } from "@/lib/utils";
import { timeAgo, crowdLabel, calcMatchScore, calcTimeLeft } from "@/lib/adapters";
import { WEIGHT, SPACE, RADIUS, getScaledFontSize } from "@/lib/styles";
import { useFontSizeStore } from "@/stores/fontSizeStore";
import UrgencyBar from "@/components/ui/UrgencyBar";
import CrowdTag from "@/components/ui/CrowdTag";
import FeaturedGlow from "@/components/ui/FeaturedGlow";
import CatPill from "@/components/ui/CatPill";
import CatPlaceholder from "@/components/ui/CatPlaceholder";
import HashtagText from "@/components/ui/HashtagText";
import CardHeader from "./CardHeader";
import CardActions from "./CardActions";

/** カテゴリ別のグラデーション色 */
const CAT_GRADIENTS: Record<string, [string, string, string]> = {
  lifeline: ["rgba(0,212,161,0.15)", "rgba(0,0,0,0.12)", "rgba(0,0,0,0.88)"],
  event: ["rgba(245,166,35,0.18)", "rgba(0,0,0,0.12)", "rgba(0,0,0,0.88)"],
  help: ["rgba(240,66,92,0.18)", "rgba(0,0,0,0.12)", "rgba(0,0,0,0.88)"],
};

interface FeedPostCardProps {
  post: Post;
  t: ThemeTokens;
  isDark: boolean;
  featured?: boolean;
  expired?: boolean;
  onLongPress?: () => void;
}

/** 画像なし投稿用カード（カテゴリアイコン+グラデーション背景） */
function CompactCard({ post, t, isDark, expired, onLongPress }: { post: Post; t: ThemeTokens; isDark: boolean; expired?: boolean; onLongPress?: () => void }) {
  const { scale } = useFontSizeStore();
  const fs = getScaledFontSize(scale);
  const catColor = CAT_CONFIG[post.category]?.color || t.accent;
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Animated.spring(scaleAnim, { toValue: 0.97, useNativeDriver: true, speed: 50, bounciness: 4 }).start();
  }, [scaleAnim]);

  const handlePressOut = useCallback(() => {
    Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true, speed: 40, bounciness: 6 }).start();
  }, [scaleAnim]);

  return (
    <View style={[cardStyles.compactWrapper, expired && { opacity: 0.5 }]}>
      <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
      <Pressable
        onPress={() => router.push(`/feed/${post.id}` as any)}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onLongPress={onLongPress}
        delayLongPress={400}
        accessibilityLabel={`${post.title}、${CAT_CONFIG[post.category]?.label}、${distLabel(post.distance_m ?? 0)}`}
        accessibilityRole="button"
        style={({ pressed }) => ({
          borderRadius: RADIUS.lg,
          overflow: "hidden" as const,
          backgroundColor: t.surface,
          borderWidth: 1,
          borderColor: t.border,
          shadowColor: isDark ? "#000" : "rgba(0,0,0,0.06)",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.2,
          shadowRadius: SPACE.sm,
          elevation: 2,
        })}
      >
        {/* カテゴリプレースホルダー（アイコン+グラデーション） */}
        <View style={cardStyles.imageHeader}>
          <CatPlaceholder category={post.category} size="md" />
          {/* 距離バッジ */}
          <View style={{ position: "absolute", right: SPACE.sm, top: SPACE.sm, flexDirection: "row", alignItems: "center", gap: 3, backgroundColor: "rgba(0,0,0,0.35)", borderRadius: RADIUS.full, paddingHorizontal: SPACE.sm, paddingVertical: 3 }}>
            <Navigation size={10} color="#fff" />
            <Text style={{ fontSize: fs.xxs, fontWeight: WEIGHT.bold, color: "#fff" }}>
              {distLabel(post.distance_m ?? 0)}
            </Text>
          </View>
          {expired && (
            <View style={{ position: "absolute", left: SPACE.sm, top: SPACE.sm, backgroundColor: "#8887A0CC", borderRadius: RADIUS.full, paddingHorizontal: 6, paddingVertical: 2 }}>
              <Text style={{ fontSize: fs.xxs, fontWeight: WEIGHT.bold, color: "#fff" }}>終了</Text>
            </View>
          )}
        </View>

        <View style={cardStyles.cardBody}>
          {/* カテゴリ + 時刻 */}
          <View style={cardStyles.metaRow}>
            <CatPill cat={post.category} small />
            <View style={{ flexDirection: "row", alignItems: "center", gap: 3, marginLeft: "auto" }}>
              <Clock size={10} color={t.muted} />
              <Text style={{ fontSize: fs.xxs, color: t.muted }}>{timeAgo(post.created_at)}</Text>
            </View>
          </View>

          {/* タイトル */}
          <Text style={{ fontSize: fs.lg, fontWeight: WEIGHT.bold, color: t.text, lineHeight: 22 }} numberOfLines={2}>
            {post.title}
          </Text>

          {/* 本文（あれば1行） */}
          {post.content ? (
            <HashtagText style={{ fontSize: fs.sm, color: t.sub, lineHeight: 18 }} numberOfLines={1} t={t}>
              {post.content}
            </HashtagText>
          ) : null}

          {/* 下段: 投稿者 + アクション */}
          <View style={cardStyles.actionRow}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: SPACE.sm }}>
              {post.author?.avatar_url ? (
                <Image
                  source={{ uri: post.author.avatar_url }}
                  style={{ width: 22, height: 22, borderRadius: 11 }}
                />
              ) : (
                <View style={{ width: 22, height: 22, borderRadius: 11, backgroundColor: t.border, alignItems: "center", justifyContent: "center" }}>
                  <User size={12} color={t.muted} />
                </View>
              )}
              <Text style={{ fontSize: fs.xs, fontWeight: WEIGHT.semibold, color: t.sub }}>
                {post.author?.display_name ?? "ユーザー"}
              </Text>
            </View>
            <View style={cardStyles.actionGroup}>
              <View style={cardStyles.iconText}>
                <Heart size={14} color={t.muted} />
                <Text style={{ fontSize: fs.xs, color: t.muted }}>{post.likes_count}</Text>
              </View>
              <View style={cardStyles.iconText}>
                <MessageSquare size={14} color={t.muted} />
                <Text style={{ fontSize: fs.xs, color: t.muted }}>{post.comments_count || ""}</Text>
              </View>
            </View>
          </View>
        </View>
      </Pressable>
      </Animated.View>
    </View>
  );
}

/** フィード投稿カード（カテゴリ別デザイン） */
function FeedPostCard({ post, t, isDark, featured, expired, onLongPress }: FeedPostCardProps) {
  const hasImage = !!post.image_url;

  // 画像なし & Featured でない → コンパクトカード
  if (!hasImage && !featured) {
    return <CompactCard post={post} t={t} isDark={isDark} expired={expired} onLongPress={onLongPress} />;
  }

  const { scale } = useFontSizeStore();
  const fs = getScaledFontSize(scale);
  const catColor = CAT_CONFIG[post.category]?.color || t.accent;
  const gradColors = CAT_GRADIENTS[post.category] || CAT_GRADIENTS.lifeline;
  const multiCount = post.image_urls?.length ?? 0;
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Animated.spring(scaleAnim, { toValue: 0.97, useNativeDriver: true, speed: 50, bounciness: 4 }).start();
  }, [scaleAnim]);

  const handlePressOut = useCallback(() => {
    Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true, speed: 40, bounciness: 6 }).start();
  }, [scaleAnim]);

  const card = (
    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
    <Pressable
      onPress={() => router.push(`/feed/${post.id}` as any)}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onLongPress={onLongPress}
      delayLongPress={400}
      accessibilityLabel={`${post.title}、${CAT_CONFIG[post.category]?.label}、${distLabel(post.distance_m ?? 0)}${featured ? "、注目" : ""}`}
      accessibilityRole="button"
      style={{
        borderRadius: 26,
        overflow: "hidden" as const,
        shadowColor: featured ? t.accent : isDark ? "#000" : "rgba(0,0,0,0.06)",
        shadowOffset: { width: 0, height: featured ? 6 : 2 },
        shadowOpacity: featured ? 0.4 : 0.3,
        shadowRadius: featured ? 20 : SPACE.md,
        elevation: featured ? 8 : 4,
      }}
    >
      <View style={{ aspectRatio: multiCount >= 2 ? 4 / 3 : hasImage ? 3 / 4 : 16 / 9 }}>
        {multiCount >= 3 ? (
          /* 3枚: 左に大1枚 + 右に小2枚 */
          <View style={{ flex: 1, flexDirection: "row" }}>
            <Image source={{ uri: post.image_urls![0] }} style={{ flex: 2 }} contentFit="cover" />
            <View style={{ flex: 1, gap: 2, marginLeft: 2 }}>
              <Image source={{ uri: post.image_urls![1] }} style={{ flex: 1 }} contentFit="cover" />
              <Image source={{ uri: post.image_urls![2] }} style={{ flex: 1 }} contentFit="cover" />
            </View>
          </View>
        ) : multiCount === 2 ? (
          /* 2枚: 横2分割 */
          <View style={{ flex: 1, flexDirection: "row", gap: 2 }}>
            <Image source={{ uri: post.image_urls![0] }} style={{ flex: 1 }} contentFit="cover" />
            <Image source={{ uri: post.image_urls![1] }} style={{ flex: 1 }} contentFit="cover" />
          </View>
        ) : hasImage ? (
          <Image source={{ uri: post.image_url! }} style={StyleSheet.absoluteFill} contentFit="cover" />
        ) : (
          <CatPlaceholder category={post.category} size="lg" />
        )}
        {/* カテゴリ別グラデーションオーバーレイ */}
        <LinearGradient
          colors={gradColors}
          locations={[0, 0.35, 1]}
          style={StyleSheet.absoluteFill}
        />

        {/* カテゴリ別トップアクセントライン */}
        <View style={[cardStyles.accentLine, { backgroundColor: catColor }]} />

        <CardHeader post={post} t={t} />

        {/* Featured / 終了 badge */}
        {expired ? (
          <View style={{ position: "absolute", top: SPACE.lg, right: SPACE.lg, flexDirection: "row", alignItems: "center", gap: 4, backgroundColor: "rgba(100,100,120,0.9)", borderRadius: RADIUS.full, paddingHorizontal: SPACE.sm + 2, paddingVertical: SPACE.xs }}>
            <Clock size={12} color="#fff" />
            <Text style={{ fontSize: fs.xxs, fontWeight: WEIGHT.extrabold, color: "#fff" }}>終了</Text>
          </View>
        ) : featured ? (
          <View style={{ position: "absolute", top: SPACE.lg, right: SPACE.lg, flexDirection: "row", alignItems: "center", gap: 4, backgroundColor: "rgba(240,66,92,0.9)", borderRadius: RADIUS.full, paddingHorizontal: SPACE.sm + 2, paddingVertical: SPACE.xs }}>
            <Flame size={12} color="#fff" />
            <Text style={{ fontSize: fs.xxs, fontWeight: WEIGHT.extrabold, color: "#fff" }}>注目</Text>
          </View>
        ) : null}

        {/* Distance badge */}
        <View style={{ position: "absolute", right: SPACE.lg, top: "50%", transform: [{ translateY: -14 }], flexDirection: "row", alignItems: "center", gap: SPACE.xs, backgroundColor: "rgba(0,0,0,0.5)", borderRadius: RADIUS.full, paddingHorizontal: SPACE.md, paddingVertical: 6 }}>
          <Navigation size={13} color={catColor} />
          <Text style={{ fontSize: fs.sm, fontWeight: WEIGHT.bold, color: "#fff" }}>{distLabel(post.distance_m ?? 0)}</Text>
        </View>

        {/* Bottom */}
        <View style={cardStyles.bottomOverlay}>
          {featured && (
            <View style={{ alignSelf: "flex-start", flexDirection: "row", alignItems: "center", gap: 4, backgroundColor: "rgba(0,0,0,0.5)", borderRadius: RADIUS.full, paddingHorizontal: SPACE.sm + 2, paddingVertical: 3, marginBottom: SPACE.xs }}>
              <Text style={{ fontSize: fs.xxs, fontWeight: WEIGHT.bold, color: t.accent }}>
                {calcMatchScore(post.distance_m ?? 0) >= 85 ? "近くで話題" : calcTimeLeft(post.deadline) <= 60 ? "締切が近い" : "おすすめ"}
              </Text>
            </View>
          )}
          <HashtagText style={{ fontSize: fs.lg + 1, fontWeight: WEIGHT.bold, color: "#fff", lineHeight: 24 }} t={t}>{post.title + (post.content ? "\n" + post.content : "")}</HashtagText>
          <View style={{ flexDirection: "row", alignItems: "center", gap: SPACE.sm, marginTop: SPACE.sm }}>
            <UrgencyBar timeLeft={calcTimeLeft(post.deadline)} subColor={t.sub} />
            {post.crowd ? <CrowdTag crowd={crowdLabel(post.crowd)} /> : null}
          </View>
          <CardActions likes={post.likes_count} t={t} targetType="post" targetId={post.id} />
        </View>

        {/* カテゴリ別ボトムアクセントライン */}
        <View style={[cardStyles.accentLineBottom, { backgroundColor: catColor + "80" }]} />
      </View>
    </Pressable>
    </Animated.View>
  );

  if (featured) {
    return (
      <View style={cardStyles.featuredWrapper}>
        <FeaturedGlow borderRadius={26} accentColor={t.accent} blueColor={t.blue} isDark={isDark}>
          {card}
        </FeaturedGlow>
      </View>
    );
  }

  return (
    <View style={[cardStyles.fullWrapper, expired && { opacity: 0.5 }]}>
      {card}
    </View>
  );
}

const cardStyles = StyleSheet.create({
  compactWrapper: { marginHorizontal: SPACE.lg, marginBottom: SPACE.sm },
  fullWrapper: { marginHorizontal: SPACE.lg, marginBottom: SPACE.lg },
  featuredWrapper: { marginHorizontal: SPACE.lg, marginBottom: SPACE.lg, marginTop: SPACE.sm, paddingTop: SPACE.sm },
  imageHeader: { height: 100, borderTopLeftRadius: RADIUS.lg, borderTopRightRadius: RADIUS.lg, overflow: "hidden" },
  cardBody: { padding: SPACE.md, gap: SPACE.sm },
  metaRow: { flexDirection: "row", alignItems: "center", gap: SPACE.sm },
  accentLine: { position: "absolute", top: 0, left: 0, right: 0, height: 3 },
  accentLineBottom: { position: "absolute", bottom: 0, left: 0, right: 0, height: 3 },
  bottomOverlay: { position: "absolute", bottom: 0, left: 0, right: 0, padding: SPACE.lg },
  actionRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  actionGroup: { flexDirection: "row", alignItems: "center", gap: SPACE.md },
  iconText: { flexDirection: "row", alignItems: "center", gap: 3 },
});

export default memo(FeedPostCard);
