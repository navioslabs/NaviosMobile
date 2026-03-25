import { View, Text, Pressable } from "react-native";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { Clock, Navigation, Flame } from "@/lib/icons";
import type { ThemeTokens } from "@/constants/theme";
import type { NearbyPost } from "@/types";
import { distLabel } from "@/lib/utils";
import { FONT_SIZE, WEIGHT, SPACE, RADIUS } from "@/lib/styles";
import CatPill from "@/components/ui/CatPill";
import MatchBadge from "@/components/ui/MatchBadge";
import FeaturedGlow from "@/components/ui/FeaturedGlow";

/** 徒歩時間の概算（80m/分） */
const walkTime = (d: number) => `徒歩${Math.max(1, Math.round(d / 80))}分`;

interface NearbyPostItemProps {
  post: NearbyPost;
  t: ThemeTokens;
  featured?: boolean;
  isDark?: boolean;
}

/** 近隣投稿リストアイテム */
export default function NearbyPostItem({ post, t, featured, isDark = true }: NearbyPostItemProps) {
  const isClose = post.distance <= 200;

  if (featured) {
    const featuredCard = (
      <Pressable
        onPress={() => router.push(`/feed/${post.id}` as any)}
        style={({ pressed }) => ({
          borderRadius: RADIUS.xxl,
          overflow: "hidden" as const,
          opacity: pressed ? 0.95 : 1,
        })}
      >
        <View style={{ position: "relative", height: 180 }}>
          <Image source={{ uri: post.image }} style={{ width: "100%", height: "100%" }} contentFit="cover" />
          <LinearGradient
            colors={["transparent", "rgba(0,0,0,0.7)"]}
            style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 100 }}
          />
          <View style={{ position: "absolute", top: SPACE.sm, right: SPACE.sm }}>
            <MatchBadge score={post.matchScore} />
          </View>
          {/* 注目バッジ */}
          <View style={{ position: "absolute", top: SPACE.sm, left: SPACE.sm, flexDirection: "row", alignItems: "center", gap: 4, backgroundColor: "rgba(240,66,92,0.9)", borderRadius: RADIUS.full, paddingHorizontal: SPACE.sm + 2, paddingVertical: SPACE.xs }}>
            <Flame size={12} color="#fff" />
            <Text style={{ fontSize: FONT_SIZE.xxs, fontWeight: WEIGHT.extrabold, color: "#fff" }}>注目</Text>
          </View>
          <View style={{ position: "absolute", bottom: SPACE.sm + 2, left: SPACE.md, right: SPACE.md }}>
            <Text style={{ fontSize: FONT_SIZE.xl, fontWeight: WEIGHT.extrabold, color: "#fff" }} numberOfLines={1}>
              {post.title}
            </Text>
          </View>
        </View>
        <View style={{ padding: SPACE.md, backgroundColor: t.surface, gap: SPACE.sm }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: SPACE.sm }}>
            <CatPill cat={post.category} />
            <View style={{ flexDirection: "row", alignItems: "center", gap: SPACE.xs, borderRadius: RADIUS.full, paddingHorizontal: SPACE.sm, paddingVertical: 2, backgroundColor: t.accent + "20" }}>
              <Navigation size={10} color={t.accent} />
              <Text style={{ fontSize: FONT_SIZE.xxs, fontWeight: WEIGHT.bold, color: t.accent }}>{distLabel(post.distance)} • 最も近い</Text>
            </View>
          </View>
          <Text style={{ fontSize: FONT_SIZE.base, color: t.sub, lineHeight: 20 }}>{post.content}</Text>
          <View style={{ flexDirection: "row", alignItems: "center", gap: SPACE.xs }}>
            <Text style={{ fontSize: FONT_SIZE.sm, color: t.muted }}>{post.author}</Text>
            <Text style={{ fontSize: FONT_SIZE.sm, color: t.muted }}>•</Text>
            <Clock size={10} color={t.muted} />
            <Text style={{ fontSize: FONT_SIZE.sm, color: t.muted }}>{post.time}</Text>
          </View>
        </View>
      </Pressable>
    );

    return (
      <View style={{ marginHorizontal: SPACE.lg, marginVertical: SPACE.sm }}>
        <FeaturedGlow borderRadius={RADIUS.xxl} accentColor={t.accent} blueColor={t.blue} isDark={isDark}>
          {featuredCard}
        </FeaturedGlow>
      </View>
    );
  }

  // 通常アイテム
  const accentColor = isClose ? t.accent : post.distance <= 500 ? "#F5A623" : t.border;

  return (
    <Pressable
      onPress={() => router.push(`/feed/${post.id}` as any)}
      style={({ pressed }) => ({
        flexDirection: "row" as const,
        marginHorizontal: SPACE.md,
        marginBottom: SPACE.sm,
        borderRadius: RADIUS.md,
        backgroundColor: t.surface,
        borderWidth: 1,
        borderColor: t.border,
        overflow: "hidden" as const,
        opacity: pressed ? 0.9 : 1,
      })}
    >
      <View style={{ width: 3, backgroundColor: accentColor }} />

      <View style={{ flex: 1, flexDirection: "row", gap: SPACE.md, padding: SPACE.md }}>
        <View style={{ position: "relative" }}>
          <Image source={{ uri: post.image }} style={{ width: 68, height: 68, borderRadius: RADIUS.sm }} contentFit="cover" />
          <View style={{ position: "absolute", top: -4, right: -4 }}>
            <MatchBadge score={post.matchScore} />
          </View>
        </View>

        <View style={{ flex: 1 }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: SPACE.sm, marginBottom: SPACE.xs }}>
            <Text style={{ fontSize: FONT_SIZE.sm, fontWeight: WEIGHT.extrabold, color: isClose ? t.accent : t.muted }}>
              {distLabel(post.distance)}
            </Text>
            <Text style={{ fontSize: FONT_SIZE.xxs, color: t.muted }}>({walkTime(post.distance)})</Text>
            <CatPill cat={post.category} small />
          </View>

          <Text style={{ fontSize: FONT_SIZE.lg, fontWeight: WEIGHT.bold, color: t.text, marginBottom: 2 }} numberOfLines={1}>
            {post.title}
          </Text>

          <View style={{ flexDirection: "row", alignItems: "center", gap: SPACE.xs }}>
            <Text style={{ fontSize: FONT_SIZE.xs, color: t.muted }}>{post.author}</Text>
            <Text style={{ fontSize: FONT_SIZE.xs, color: t.muted }}>•</Text>
            <Clock size={10} color={t.muted} />
            <Text style={{ fontSize: FONT_SIZE.xs, color: t.muted }}>{post.time}</Text>
          </View>
        </View>
      </View>
    </Pressable>
  );
}
