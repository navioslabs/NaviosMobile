import { memo } from "react";
import { View, Text, Pressable } from "react-native";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { Clock, Navigation, Flame } from "@/lib/icons";
import type { ThemeTokens } from "@/constants/theme";
import type { Post } from "@/types";
import { timeAgo, calcMatchScore } from "@/lib/adapters";
import { distLabel } from "@/lib/utils";
import { WEIGHT, SPACE, RADIUS, getScaledFontSize } from "@/lib/styles";
import { useFontSizeStore } from "@/stores/fontSizeStore";
import CatPill from "@/components/ui/CatPill";
import CatPlaceholder from "@/components/ui/CatPlaceholder";
import MatchBadge from "@/components/ui/MatchBadge";
import FeaturedGlow from "@/components/ui/FeaturedGlow";

/** 徒歩時間の概算（80m/分） */
const walkTime = (d: number) => `徒歩${Math.max(1, Math.round(d / 80))}分`;

interface NearbyPostItemProps {
  post: Post;
  t: ThemeTokens;
  featured?: boolean;
  expired?: boolean;
  isDark?: boolean;
  index?: number;
  onLongPress?: () => void;
}

/** 近隣投稿リストアイテム */
/** スタッガー遅延（最大400msでキャップ） */
const staggerDelay = (i: number) => Math.min(i * 60, 400);

function NearbyPostItem({ post, t, featured, expired, isDark = true, index = 0, onLongPress }: NearbyPostItemProps) {
  const { scale } = useFontSizeStore();
  const fs = getScaledFontSize(scale);
  const distance = post.distance_m ?? 0;
  const matchScore = calcMatchScore(distance, post.deadline);
  const isClose = distance <= 200;

  if (featured) {
    const featuredCard = (
      <Pressable
        onPress={() => router.push(`/feed/${post.id}` as any)}
        onLongPress={onLongPress}
        delayLongPress={400}
        accessibilityLabel={`注目: ${post.title}、${distLabel(distance)}、マッチ度${matchScore}%`}
        accessibilityRole="button"
        style={({ pressed }) => ({
          borderRadius: RADIUS.xxl,
          overflow: "hidden" as const,
          opacity: pressed ? 0.95 : 1,
        })}
      >
        <View style={{ position: "relative", height: 180 }}>
          {post.image_url ? (
            <Image source={{ uri: post.image_url }} style={{ width: "100%", height: "100%" }} contentFit="cover" />
          ) : (
            <CatPlaceholder category={post.category} size="md" />
          )}
          <LinearGradient
            colors={["transparent", "rgba(0,0,0,0.7)"]}
            style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 100 }}
          />
          <View style={{ position: "absolute", top: SPACE.sm, right: SPACE.sm }}>
            <MatchBadge score={matchScore} />
          </View>
          {/* 注目 or 終了バッジ */}
          {expired ? (
            <View style={{ position: "absolute", top: SPACE.sm, left: SPACE.sm, flexDirection: "row", alignItems: "center", gap: 4, backgroundColor: "rgba(100,100,120,0.9)", borderRadius: RADIUS.full, paddingHorizontal: SPACE.sm + 2, paddingVertical: SPACE.xs }}>
              <Clock size={12} color="#fff" />
              <Text style={{ fontSize: fs.xxs, fontWeight: WEIGHT.extrabold, color: "#fff" }}>終了</Text>
            </View>
          ) : (
            <View style={{ position: "absolute", top: SPACE.sm, left: SPACE.sm, flexDirection: "row", alignItems: "center", gap: 4, backgroundColor: "rgba(240,66,92,0.9)", borderRadius: RADIUS.full, paddingHorizontal: SPACE.sm + 2, paddingVertical: SPACE.xs }}>
              <Flame size={12} color="#fff" />
              <Text style={{ fontSize: fs.xxs, fontWeight: WEIGHT.extrabold, color: "#fff" }}>注目</Text>
            </View>
          )}
          <View style={{ position: "absolute", bottom: SPACE.sm + 2, left: SPACE.md, right: SPACE.md }}>
            <Text style={{ fontSize: fs.xl, fontWeight: WEIGHT.extrabold, color: "#fff" }} numberOfLines={1}>
              {post.title}
            </Text>
          </View>
        </View>
        <View style={{ padding: SPACE.md, backgroundColor: t.surface, gap: SPACE.sm }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: SPACE.sm }}>
            <CatPill cat={post.category} />
            <View style={{ flexDirection: "row", alignItems: "center", gap: SPACE.xs, borderRadius: RADIUS.full, paddingHorizontal: SPACE.sm, paddingVertical: 2, backgroundColor: t.accent + "20" }}>
              <Navigation size={10} color={t.accent} />
              <Text style={{ fontSize: fs.xxs, fontWeight: WEIGHT.bold, color: t.accent }}>{distLabel(distance)} • 最も近い</Text>
            </View>
          </View>
          <Text style={{ fontSize: fs.base, color: t.sub, lineHeight: 20 }}>{post.content ?? ""}</Text>
          <View style={{ flexDirection: "row", alignItems: "center", gap: SPACE.xs }}>
            <Text style={{ fontSize: fs.sm, color: t.muted }}>{post.author?.display_name ?? "ユーザー"}</Text>
            <Text style={{ fontSize: fs.sm, color: t.muted }}>•</Text>
            <Clock size={10} color={t.muted} />
            <Text style={{ fontSize: fs.sm, color: t.muted }}>{timeAgo(post.created_at)}</Text>
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
  const accentColor = isClose ? t.accent : distance <= 500 ? "#F5A623" : t.border;

  return (
    <View>
    <Pressable
      onPress={() => router.push(`/feed/${post.id}` as any)}
      onLongPress={onLongPress}
      delayLongPress={400}
      accessibilityLabel={`${post.title}、${distLabel(distance)}、${walkTime(distance)}、マッチ度${matchScore}%${expired ? "、終了" : ""}`}
      accessibilityRole="button"
      style={({ pressed }) => ({
        flexDirection: "row" as const,
        marginHorizontal: SPACE.md,
        marginBottom: SPACE.sm,
        borderRadius: RADIUS.md,
        backgroundColor: t.surface,
        borderWidth: 1,
        borderColor: t.border,
        overflow: "hidden" as const,
        opacity: pressed ? 0.9 : expired ? 0.55 : 1,
      })}
    >
      <View style={{ width: 3, backgroundColor: expired ? t.muted : accentColor }} />

      <View style={{ flex: 1, flexDirection: "row", gap: SPACE.md, padding: SPACE.md }}>
        <View style={{ position: "relative" }}>
          {post.image_url ? (
            <Image source={{ uri: post.image_url }} style={{ width: 68, height: 68, borderRadius: RADIUS.sm }} contentFit="cover" />
          ) : (
            <View style={{ width: 68, height: 68, borderRadius: RADIUS.sm, overflow: "hidden" }}>
              <CatPlaceholder category={post.category} size="sm" />
            </View>
          )}
          <View style={{ position: "absolute", top: -4, right: -4 }}>
            <MatchBadge score={matchScore} />
          </View>
        </View>

        <View style={{ flex: 1 }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: SPACE.sm, marginBottom: SPACE.xs }}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 4, backgroundColor: accentColor + "20", borderRadius: RADIUS.full, paddingHorizontal: SPACE.sm + 2, paddingVertical: 3 }}>
              <Navigation size={11} color={accentColor} />
              <Text style={{ fontSize: fs.sm, fontWeight: WEIGHT.extrabold, color: accentColor }}>
                {distLabel(distance)}
              </Text>
            </View>
            <Text style={{ fontSize: fs.xxs, color: t.muted }}>{walkTime(distance)}</Text>
            <CatPill cat={post.category} small />
          </View>

          <View style={{ flexDirection: "row", alignItems: "center", gap: SPACE.sm, marginBottom: 2 }}>
            <Text style={{ fontSize: fs.lg, fontWeight: WEIGHT.bold, color: expired ? t.muted : t.text, flex: 1 }} numberOfLines={1}>
              {post.title}
            </Text>
            {expired && (
              <View style={{ flexDirection: "row", alignItems: "center", gap: 3, backgroundColor: t.red + "18", borderRadius: RADIUS.full, paddingHorizontal: SPACE.sm, paddingVertical: 2 }}>
                <Clock size={10} color={t.red} />
                <Text style={{ fontSize: fs.xxs, fontWeight: WEIGHT.extrabold, color: t.red }}>終了</Text>
              </View>
            )}
          </View>

          <View style={{ flexDirection: "row", alignItems: "center", gap: SPACE.xs }}>
            <Text style={{ fontSize: fs.xs, color: t.muted }}>{post.author?.display_name ?? "ユーザー"}</Text>
            <Text style={{ fontSize: fs.xs, color: t.muted }}>•</Text>
            <Clock size={10} color={t.muted} />
            <Text style={{ fontSize: fs.xs, color: t.muted }}>{timeAgo(post.created_at)}</Text>
          </View>
        </View>
      </View>
    </Pressable>
    </View>
  );
}

export default memo(NearbyPostItem);
