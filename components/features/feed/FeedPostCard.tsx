import { memo } from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { Navigation, Flame } from "@/lib/icons";
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
import CardHeader from "./CardHeader";
import CardActions from "./CardActions";

/** カテゴリ別のグラデーション色 */
const CAT_GRADIENTS: Record<string, [string, string, string]> = {
  stock: ["rgba(0,212,161,0.15)", "rgba(0,0,0,0.12)", "rgba(0,0,0,0.88)"],
  event: ["rgba(245,166,35,0.18)", "rgba(0,0,0,0.12)", "rgba(0,0,0,0.88)"],
  help: ["rgba(240,66,92,0.18)", "rgba(0,0,0,0.12)", "rgba(0,0,0,0.88)"],
  admin: ["rgba(139,111,192,0.18)", "rgba(0,0,0,0.12)", "rgba(0,0,0,0.88)"],
};

interface FeedPostCardProps {
  post: Post;
  t: ThemeTokens;
  isDark: boolean;
  featured?: boolean;
}

/** フィード投稿カード（カテゴリ別デザイン） */
function FeedPostCard({ post, t, isDark, featured }: FeedPostCardProps) {
  const { scale } = useFontSizeStore();
  const fs = getScaledFontSize(scale);
  const catColor = CAT_CONFIG[post.category]?.color || t.accent;
  const gradColors = CAT_GRADIENTS[post.category] || CAT_GRADIENTS.stock;

  const card = (
    <Pressable
      onPress={() => router.push(`/feed/${post.id}` as any)}
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
      <View style={{ aspectRatio: 3 / 4 }}>
        <Image source={{ uri: post.image_url ?? "" }} style={StyleSheet.absoluteFill} contentFit="cover" />
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
          <CardActions likes={post.likes_count} t={t} />
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
    <View style={{ marginHorizontal: SPACE.lg, marginBottom: SPACE.lg }}>
      {card}
    </View>
  );
}

export default memo(FeedPostCard);
