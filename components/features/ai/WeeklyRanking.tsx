import { View, Text, Pressable } from "react-native";
import { Image } from "expo-image";
import { router } from "expo-router";
import { Trophy, ThumbsUp } from "@/lib/icons";
import { CAT_CONFIG } from "@/constants/categories";
import type { ThemeTokens } from "@/constants/theme";
import type { Post } from "@/types";
import { timeAgo } from "@/lib/adapters";
import { WEIGHT, SPACE, RADIUS, getScaledFontSize } from "@/lib/styles";
import { useFontSizeStore } from "@/stores/fontSizeStore";
import CatPill from "@/components/ui/CatPill";

interface WeeklyRankingProps {
  posts: Post[];
  t: ThemeTokens;
}

/** ランキング順位の色 */
const RANK_COLORS = ["#FFD700", "#C0C0C0", "#CD7F32", undefined, undefined];

/** 週間人気ランキング */
export default function WeeklyRanking({ posts, t }: WeeklyRankingProps) {
  const { scale } = useFontSizeStore();
  const fs = getScaledFontSize(scale);

  if (posts.length === 0) return null;

  return (
    <View style={{ marginBottom: SPACE.xl }}>
      <View style={{ flexDirection: "row", alignItems: "center", gap: SPACE.xs, marginBottom: SPACE.md }}>
        <Trophy size={15} color="#FFD700" />
        <Text style={{ fontSize: fs.base, fontWeight: WEIGHT.bold, color: t.text }}>今週の人気投稿</Text>
        <Text style={{ fontSize: fs.xs, color: t.muted, marginLeft: "auto" }}>Top {posts.length}</Text>
      </View>

      {posts.map((post, i) => {
        const rankColor = RANK_COLORS[i];
        return (
          <View key={post.id}>
            <Pressable
              onPress={() => router.push(`/feed/${post.id}` as any)}
              accessibilityLabel={`${i + 1}位: ${post.title}、いいね${post.likes_count}件`}
              accessibilityRole="button"
              style={({ pressed }) => ({
                flexDirection: "row",
                alignItems: "center",
                gap: SPACE.md,
                paddingVertical: SPACE.md,
                paddingHorizontal: SPACE.sm,
                borderBottomWidth: i < posts.length - 1 ? 1 : 0,
                borderBottomColor: t.border,
                opacity: pressed ? 0.7 : 1,
              })}
            >
              {/* 順位 */}
              <View style={{ width: 28, height: 28, borderRadius: 14, backgroundColor: rankColor ? rankColor + "20" : t.surface2, alignItems: "center", justifyContent: "center" }}>
                <Text style={{ fontSize: fs.sm, fontWeight: WEIGHT.extrabold, color: rankColor ?? t.muted }}>
                  {i + 1}
                </Text>
              </View>

              {/* 画像 */}
              {post.image_url ? (
                <Image source={{ uri: post.image_url }} style={{ width: 44, height: 44, borderRadius: RADIUS.sm }} contentFit="cover" />
              ) : (
                <View style={{ width: 44, height: 44, borderRadius: RADIUS.sm, backgroundColor: (CAT_CONFIG[post.category]?.color ?? t.accent) + "15", alignItems: "center", justifyContent: "center" }}>
                  <CatPill cat={post.category} small />
                </View>
              )}

              {/* 内容 */}
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: fs.sm, fontWeight: WEIGHT.bold, color: t.text }} numberOfLines={1}>
                  {post.title}
                </Text>
                <Text style={{ fontSize: fs.xxs, color: t.muted, marginTop: 2 }}>
                  {post.author?.display_name ?? "匿名"} • {timeAgo(post.created_at)}
                </Text>
              </View>

              {/* いいね数 */}
              <View style={{ flexDirection: "row", alignItems: "center", gap: 3 }}>
                <ThumbsUp size={14} color={t.accent} fill={t.accent} />
                <Text style={{ fontSize: fs.sm, fontWeight: WEIGHT.bold, color: t.red }}>{post.likes_count}</Text>
              </View>
            </Pressable>
          </View>
        );
      })}
    </View>
  );
}
