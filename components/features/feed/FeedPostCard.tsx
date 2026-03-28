import { memo } from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { Navigation, Flame, Clock, Heart, MessageSquare } from "@/lib/icons";
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

/** 画像なし投稿用コンパクトカード */
function CompactCard({ post, t, isDark, expired, onLongPress }: { post: Post; t: ThemeTokens; isDark: boolean; expired?: boolean; onLongPress?: () => void }) {
  const { scale } = useFontSizeStore();
  const fs = getScaledFontSize(scale);
  const catColor = CAT_CONFIG[post.category]?.color || t.accent;

  return (
    <View style={{ marginHorizontal: SPACE.lg, marginBottom: SPACE.sm, opacity: expired ? 0.5 : 1 }}>
      <Pressable
        onPress={() => router.push(`/feed/${post.id}` as any)}
        onLongPress={onLongPress}
        delayLongPress={400}
        accessibilityLabel={`${post.title}、${CAT_CONFIG[post.category]?.label}、${distLabel(post.distance_m ?? 0)}`}
        accessibilityRole="button"
        style={({ pressed }) => ({
          flexDirection: "row" as const,
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
          opacity: pressed ? 0.92 : 1,
          transform: [{ scale: pressed ? 0.99 : 1 }],
        })}
      >
        {/* カテゴリカラーのアクセントライン */}
        <View style={{ width: 4, backgroundColor: catColor }} />

        <View style={{ flex: 1, padding: SPACE.md, gap: SPACE.sm }}>
          {/* 上段: カテゴリ + 距離 + 時刻 */}
          <View style={{ flexDirection: "row", alignItems: "center", gap: SPACE.sm }}>
            <CatPill cat={post.category} small />
            <View style={{ flexDirection: "row", alignItems: "center", gap: 3 }}>
              <Navigation size={10} color={catColor} />
              <Text style={{ fontSize: fs.xxs, fontWeight: WEIGHT.bold, color: catColor }}>
                {distLabel(post.distance_m ?? 0)}
              </Text>
            </View>
            {expired ? (
              <View style={{ marginLeft: "auto", backgroundColor: "#8887A020", borderRadius: RADIUS.full, paddingHorizontal: 6, paddingVertical: 2 }}>
                <Text style={{ fontSize: fs.xxs, fontWeight: WEIGHT.bold, color: "#8887A0" }}>終了</Text>
              </View>
            ) : (
              <View style={{ flexDirection: "row", alignItems: "center", gap: 3, marginLeft: "auto" }}>
                <Clock size={10} color={t.muted} />
                <Text style={{ fontSize: fs.xxs, color: t.muted }}>{timeAgo(post.created_at)}</Text>
              </View>
            )}
          </View>

          {/* タイトル */}
          <Text style={{ fontSize: fs.lg, fontWeight: WEIGHT.bold, color: t.text, lineHeight: 22 }} numberOfLines={2}>
            {post.title}
          </Text>

          {/* 本文（あれば1行） */}
          {post.content ? (
            <Text style={{ fontSize: fs.sm, color: t.sub, lineHeight: 18 }} numberOfLines={1}>
              {post.content}
            </Text>
          ) : null}

          {/* 下段: 投稿者 + アクション */}
          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: SPACE.sm }}>
              <Image
                source={{ uri: post.author?.avatar_url ?? "https://i.pravatar.cc/100" }}
                style={{ width: 22, height: 22, borderRadius: 11 }}
              />
              <Text style={{ fontSize: fs.xs, fontWeight: WEIGHT.semibold, color: t.sub }}>
                {post.author?.display_name ?? "ユーザー"}
              </Text>
            </View>
            <View style={{ flexDirection: "row", alignItems: "center", gap: SPACE.md }}>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 3 }}>
                <Heart size={14} color={t.muted} />
                <Text style={{ fontSize: fs.xs, color: t.muted }}>{post.likes_count}</Text>
              </View>
              <MessageSquare size={14} color={t.muted} />
            </View>
          </View>
        </View>
      </Pressable>
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

  const card = (
    <Pressable
      onPress={() => router.push(`/feed/${post.id}` as any)}
      onLongPress={onLongPress}
      delayLongPress={400}
      accessibilityLabel={`${post.title}、${CAT_CONFIG[post.category]?.label}、${distLabel(post.distance_m ?? 0)}${featured ? "、注目" : ""}`}
      accessibilityRole="button"
      style={({ pressed }) => ({
        borderRadius: 26,
        overflow: "hidden" as const,
        shadowColor: featured ? t.accent : isDark ? "#000" : "rgba(0,0,0,0.06)",
        shadowOffset: { width: 0, height: featured ? 6 : 2 },
        shadowOpacity: featured ? 0.4 : 0.3,
        shadowRadius: featured ? 20 : SPACE.md,
        elevation: featured ? 8 : 4,
        opacity: pressed ? 0.95 : 1,
        transform: [{ scale: pressed ? 0.98 : 1 }],
      })}
    >
      <View style={{ aspectRatio: hasImage ? 3 / 4 : 16 / 9 }}>
        {hasImage ? (
          <>
            <Image source={{ uri: post.image_url! }} style={StyleSheet.absoluteFill} contentFit="cover" />
            {post.image_urls && post.image_urls.length > 1 && (
              <View style={{ position: "absolute", top: SPACE.sm, left: SPACE.sm, backgroundColor: "rgba(0,0,0,0.6)", borderRadius: RADIUS.sm, paddingHorizontal: 6, paddingVertical: 2 }}>
                <Text style={{ fontSize: fs.xxs, fontWeight: WEIGHT.bold, color: "#fff" }}>+{post.image_urls.length - 1}</Text>
              </View>
            )}
          </>
        ) : (
          <View style={[StyleSheet.absoluteFill, { backgroundColor: catColor + "15" }]} />
        )}
        {/* カテゴリ別グラデーションオーバーレイ */}
        <LinearGradient
          colors={gradColors}
          locations={[0, 0.35, 1]}
          style={StyleSheet.absoluteFill}
        />

        {/* カテゴリ別トップアクセントライン */}
        <View style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, backgroundColor: catColor }} />

        <CardHeader post={post} t={t} />

        {/* Featured badge */}
        {featured && (
          <View style={{ position: "absolute", top: SPACE.lg, right: SPACE.lg, flexDirection: "row", alignItems: "center", gap: 4, backgroundColor: "rgba(240,66,92,0.9)", borderRadius: RADIUS.full, paddingHorizontal: SPACE.sm + 2, paddingVertical: SPACE.xs }}>
            <Flame size={12} color="#fff" />
            <Text style={{ fontSize: fs.xxs, fontWeight: WEIGHT.extrabold, color: "#fff" }}>注目</Text>
          </View>
        )}

        {/* Distance badge */}
        <View style={{ position: "absolute", right: SPACE.lg, top: "50%", transform: [{ translateY: -14 }], flexDirection: "row", alignItems: "center", gap: SPACE.xs, backgroundColor: "rgba(0,0,0,0.5)", borderRadius: RADIUS.full, paddingHorizontal: SPACE.md, paddingVertical: 6 }}>
          <Navigation size={13} color={catColor} />
          <Text style={{ fontSize: fs.sm, fontWeight: WEIGHT.bold, color: "#fff" }}>{distLabel(post.distance_m ?? 0)}</Text>
        </View>

        {/* Bottom */}
        <View style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: SPACE.lg }}>
          {featured && (
            <View style={{ alignSelf: "flex-start", flexDirection: "row", alignItems: "center", gap: 4, backgroundColor: "rgba(0,0,0,0.5)", borderRadius: RADIUS.full, paddingHorizontal: SPACE.sm + 2, paddingVertical: 3, marginBottom: SPACE.xs }}>
              <Text style={{ fontSize: fs.xxs, fontWeight: WEIGHT.bold, color: t.accent }}>
                {calcMatchScore(post.distance_m ?? 0) >= 85 ? "近くで話題" : calcTimeLeft(post.deadline) <= 60 ? "締切が近い" : "おすすめ"}
              </Text>
            </View>
          )}
          <Text style={{ fontSize: fs.lg + 1, fontWeight: WEIGHT.bold, color: "#fff", lineHeight: 24 }}>{post.title + (post.content ? "\n" + post.content : "")}</Text>
          <View style={{ flexDirection: "row", alignItems: "center", gap: SPACE.sm, marginTop: SPACE.sm }}>
            <UrgencyBar timeLeft={calcTimeLeft(post.deadline)} subColor={t.sub} />
            {post.crowd ? <CrowdTag crowd={crowdLabel(post.crowd)} /> : null}
          </View>
          <CardActions likes={post.likes_count} t={t} targetType="post" targetId={post.id} />
        </View>

        {/* カテゴリ別ボトムアクセントライン */}
        <View style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 3, backgroundColor: catColor + "80" }} />
      </View>
    </Pressable>
  );

  if (featured) {
    return (
      <View style={{ marginHorizontal: SPACE.lg, marginBottom: SPACE.lg, marginTop: SPACE.sm, paddingTop: SPACE.sm }}>
        <FeaturedGlow borderRadius={26} accentColor={t.accent} blueColor={t.blue} isDark={isDark}>
          {card}
        </FeaturedGlow>
      </View>
    );
  }

  return (
    <View style={{ marginHorizontal: SPACE.lg, marginBottom: SPACE.lg, opacity: expired ? 0.5 : 1 }}>
      {card}
    </View>
  );
}

export default memo(FeedPostCard);
