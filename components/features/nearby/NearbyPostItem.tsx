import { View, Text } from "react-native";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { Clock, Navigation } from "@/lib/icons";
import type { ThemeTokens } from "@/constants/theme";
import type { NearbyPost } from "@/types";
import { distLabel } from "@/lib/utils";
import { FONT_SIZE, WEIGHT, SPACE, RADIUS } from "@/lib/styles";
import CatPill from "@/components/ui/CatPill";
import MatchBadge from "@/components/ui/MatchBadge";

interface NearbyPostItemProps {
  post: NearbyPost;
  t: ThemeTokens;
  featured?: boolean;
}

/** 近隣投稿リストアイテム */
export default function NearbyPostItem({ post, t, featured }: NearbyPostItemProps) {
  const isClose = post.distance <= 200;

  if (featured) {
    return (
      <View style={{ marginHorizontal: SPACE.lg, marginVertical: SPACE.sm, borderRadius: RADIUS.xxl, overflow: "hidden", borderWidth: 1.5, borderColor: t.accent + "40", shadowColor: t.accent, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 12, elevation: 6 }}>
        <View style={{ position: "relative", height: 180 }}>
          <Image source={{ uri: post.image }} style={{ width: "100%", height: "100%" }} contentFit="cover" />
          <LinearGradient
            colors={["transparent", "rgba(0,0,0,0.7)"]}
            style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 100 }}
          />
          <View style={{ position: "absolute", top: SPACE.sm, right: SPACE.sm }}>
            <MatchBadge score={post.matchScore} />
          </View>
          <View style={{ position: "absolute", top: SPACE.sm, left: SPACE.sm, flexDirection: "row", alignItems: "center", gap: SPACE.xs, backgroundColor: t.accent, borderRadius: RADIUS.full, paddingHorizontal: SPACE.sm + 2, paddingVertical: SPACE.xs }}>
            <Navigation size={12} color="#000" />
            <Text style={{ fontSize: FONT_SIZE.sm, fontWeight: WEIGHT.extrabold, color: "#000" }}>
              {distLabel(post.distance)}
            </Text>
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
            <View style={{ borderRadius: RADIUS.full, paddingHorizontal: SPACE.sm, paddingVertical: 2, backgroundColor: t.accent + "20" }}>
              <Text style={{ fontSize: FONT_SIZE.xxs, fontWeight: WEIGHT.bold, color: t.accent }}>最も近い</Text>
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
      </View>
    );
  }

  // 通常アイテム — left accent bar for continuity
  const accentColor = isClose ? t.accent : post.distance <= 500 ? "#F5A623" : t.border;

  return (
    <View style={{ flexDirection: "row", marginHorizontal: SPACE.md, marginBottom: SPACE.sm, borderRadius: RADIUS.md, backgroundColor: t.surface, borderWidth: 1, borderColor: t.border, overflow: "hidden" }}>
      {/* Left accent bar */}
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
    </View>
  );
}
