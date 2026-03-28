import { View, Text, FlatList, Pressable } from "react-native";
import { Image } from "expo-image";
import Animated, { FadeInUp } from "react-native-reanimated";
import { router } from "expo-router";
import { TrendingUp, Heart, Clock } from "@/lib/icons";
import { CAT_CONFIG } from "@/constants/categories";
import type { ThemeTokens } from "@/constants/theme";
import type { Post } from "@/types";
import { timeAgo } from "@/lib/adapters";
import { WEIGHT, SPACE, RADIUS, getScaledFontSize } from "@/lib/styles";
import { useFontSizeStore } from "@/stores/fontSizeStore";
import CatPill from "@/components/ui/CatPill";

interface TrendingSectionProps {
  posts: Post[];
  t: ThemeTokens;
}

/** 急上昇カード */
function TrendingCard({ post, t, index }: { post: Post; t: ThemeTokens; index: number }) {
  const { scale } = useFontSizeStore();
  const fs = getScaledFontSize(scale);
  const catColor = CAT_CONFIG[post.category]?.color ?? t.accent;

  return (
    <Animated.View entering={FadeInUp.delay(Math.min(index * 80, 320)).duration(350)}>
      <Pressable
        onPress={() => router.push(`/feed/${post.id}` as any)}
        accessibilityLabel={`${post.title}、いいね${post.likes_count}件`}
        accessibilityRole="button"
        style={({ pressed }) => ({
          width: 180,
          borderRadius: RADIUS.xl,
          backgroundColor: t.surface,
          borderWidth: 1,
          borderColor: t.border,
          overflow: "hidden",
          opacity: pressed ? 0.9 : 1,
          transform: [{ scale: pressed ? 0.97 : 1 }],
        })}
      >
        {post.image_url ? (
          <Image source={{ uri: post.image_url }} style={{ width: "100%", height: 100 }} contentFit="cover" />
        ) : (
          <View style={{ width: "100%", height: 100, backgroundColor: catColor + "15", alignItems: "center", justifyContent: "center" }}>
            <TrendingUp size={28} color={catColor + "40"} />
          </View>
        )}
        <View style={{ height: 2, backgroundColor: catColor }} />
        <View style={{ padding: SPACE.sm + 2 }}>
          <CatPill cat={post.category} small />
          <Text style={{ fontSize: fs.sm, fontWeight: WEIGHT.bold, color: t.text, marginTop: SPACE.xs, lineHeight: 18 }} numberOfLines={2}>
            {post.title}
          </Text>
          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: SPACE.sm }}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 3 }}>
              <Heart size={12} color={t.red} fill={t.red} />
              <Text style={{ fontSize: fs.xxs, fontWeight: WEIGHT.bold, color: t.red }}>{post.likes_count}</Text>
            </View>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 3 }}>
              <Clock size={10} color={t.muted} />
              <Text style={{ fontSize: fs.xxs, color: t.muted }}>{timeAgo(post.created_at)}</Text>
            </View>
          </View>
        </View>
      </Pressable>
    </Animated.View>
  );
}

/** 急上昇セクション（横スクロールカルーセル + 空状態対応） */
export default function TrendingSection({ posts, t }: TrendingSectionProps) {
  const { scale } = useFontSizeStore();
  const fs = getScaledFontSize(scale);

  return (
    <View style={{ marginBottom: SPACE.xl }}>
      <View style={{ flexDirection: "row", alignItems: "center", gap: SPACE.xs, marginBottom: SPACE.md }}>
        <TrendingUp size={15} color={t.red} />
        <Text style={{ fontSize: fs.base, fontWeight: WEIGHT.bold, color: t.text }}>急上昇</Text>
        <Text style={{ fontSize: fs.xs, color: t.muted, marginLeft: "auto" }}>直近で話題</Text>
      </View>

      {posts.length > 0 ? (
        <FlatList
          data={posts}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ gap: SPACE.md }}
          renderItem={({ item, index }) => <TrendingCard post={item} t={t} index={index} />}
        />
      ) : (
        <View style={{
          borderRadius: RADIUS.lg, padding: SPACE.lg,
          backgroundColor: t.surface, borderWidth: 1, borderColor: t.border,
          alignItems: "center",
        }}>
          <TrendingUp size={24} color={t.muted} />
          <Text style={{ fontSize: fs.sm, color: t.muted, marginTop: SPACE.sm, textAlign: "center" }}>
            まだ急上昇の投稿はありません
          </Text>
          <Text style={{ fontSize: fs.xs, color: t.muted, marginTop: SPACE.xs, textAlign: "center" }}>
            投稿にいいねを押すとここに表示されます
          </Text>
        </View>
      )}
    </View>
  );
}
