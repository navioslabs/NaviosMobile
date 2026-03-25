import { View, Text, StyleSheet } from "react-native";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { Navigation } from "@/lib/icons";
import type { ThemeTokens } from "@/constants/theme";
import type { FeedPost } from "@/types";
import { distLabel } from "@/lib/utils";
import { FONT_SIZE, WEIGHT, SPACE, RADIUS } from "@/lib/styles";
import UrgencyBar from "@/components/ui/UrgencyBar";
import CrowdTag from "@/components/ui/CrowdTag";
import CardHeader from "./CardHeader";
import CardActions from "./CardActions";

interface FeedPostCardProps {
  post: FeedPost;
  t: ThemeTokens;
  isDark: boolean;
}

/** フィード投稿カード */
export default function FeedPostCard({ post, t, isDark }: FeedPostCardProps) {
  return (
    <View style={{ marginHorizontal: SPACE.lg, marginBottom: SPACE.lg, borderRadius: 26, overflow: "hidden", shadowColor: isDark ? "#000" : "rgba(0,0,0,0.06)", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.3, shadowRadius: SPACE.md, elevation: 4 }}>
      <View style={{ aspectRatio: 3 / 4 }}>
        <Image source={{ uri: post.image }} style={StyleSheet.absoluteFill} contentFit="cover" />
        <LinearGradient
          colors={["rgba(0,0,0,0.3)", "rgba(0,0,0,0.15)", "rgba(0,0,0,0.85)"]}
          locations={[0, 0.35, 1]}
          style={StyleSheet.absoluteFill}
        />

        <CardHeader post={post} t={t} />

        {/* Distance badge */}
        <View style={{ position: "absolute", right: SPACE.lg, top: "50%", transform: [{ translateY: -14 }], flexDirection: "row", alignItems: "center", gap: SPACE.xs, backgroundColor: "rgba(0,0,0,0.5)", borderRadius: RADIUS.full, paddingHorizontal: SPACE.md, paddingVertical: 6 }}>
          <Navigation size={13} color={t.accent} />
          <Text style={{ fontSize: FONT_SIZE.sm, fontWeight: WEIGHT.bold, color: "#fff" }}>{distLabel(post.distance)}</Text>
        </View>

        {/* Bottom: caption + status + actions */}
        <View style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: SPACE.lg }}>
          <Text style={{ fontSize: FONT_SIZE.lg + 1, fontWeight: WEIGHT.bold, color: "#fff", lineHeight: 24 }}>{post.caption}</Text>
          <View style={{ flexDirection: "row", alignItems: "center", gap: SPACE.sm, marginTop: SPACE.sm }}>
            <UrgencyBar timeLeft={post.timeLeft} subColor={t.sub} />
            {post.crowd ? <CrowdTag crowd={post.crowd} /> : null}
          </View>
          <CardActions likes={post.likes} t={t} />
        </View>
      </View>
    </View>
  );
}
