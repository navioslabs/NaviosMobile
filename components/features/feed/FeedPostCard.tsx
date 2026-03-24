import { useState } from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { Heart, MessageSquare, Navigation } from "@/lib/icons";
import type { ThemeTokens } from "@/constants/theme";
import type { FeedPost } from "@/types";
import { distLabel } from "@/lib/utils";
import CatPill from "@/components/ui/CatPill";
import UrgencyBar from "@/components/ui/UrgencyBar";
import CrowdTag from "@/components/ui/CrowdTag";

interface FeedPostCardProps {
  post: FeedPost;
  t: ThemeTokens;
  isDark: boolean;
}

/** フィード投稿カード */
export default function FeedPostCard({ post, t, isDark }: FeedPostCardProps) {
  const [isLiked, setIsLiked] = useState(false);

  return (
    <View style={{ marginHorizontal: 16, marginBottom: 16, borderRadius: 26, overflow: "hidden", shadowColor: isDark ? "#000" : "rgba(0,0,0,0.06)", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.3, shadowRadius: 12, elevation: 4 }}>
      <View style={{ aspectRatio: 3 / 4 }}>
        <Image source={{ uri: post.image }} style={StyleSheet.absoluteFill} contentFit="cover" />
        <LinearGradient
          colors={["rgba(0,0,0,0.3)", "rgba(0,0,0,0.15)", "rgba(0,0,0,0.85)"]}
          locations={[0, 0.35, 1]}
          style={StyleSheet.absoluteFill}
        />

        {/* Top-left: avatar + name + category */}
        <View style={{ position: "absolute", top: 16, left: 16, flexDirection: "row", alignItems: "center", gap: 10 }}>
          <View>
            <Image source={{ uri: post.user.avatar }} style={{ width: 40, height: 40, borderRadius: 20, borderWidth: 2, borderColor: "rgba(255,255,255,0.5)" }} />
            {post.user.verified && (
              <View style={{ position: "absolute", bottom: -1, right: -1, width: 16, height: 16, borderRadius: 8, backgroundColor: "#4A9EFF", alignItems: "center", justifyContent: "center" }}>
                <Text style={{ color: "#fff", fontSize: 8, fontWeight: "800" }}>✓</Text>
              </View>
            )}
          </View>
          <View>
            <Text style={{ fontWeight: "700", fontSize: 14, color: "#fff" }}>{post.user.name}</Text>
            <View style={{ marginTop: 2 }}>
              <CatPill cat={post.category} />
            </View>
          </View>
        </View>

        {/* Top-right: time */}
        <View style={{ position: "absolute", top: 16, right: 16 }}>
          <Text style={{ fontSize: 12, color: "rgba(255,255,255,0.6)" }}>{post.time}</Text>
        </View>

        {/* Right-center: distance */}
        <View style={{ position: "absolute", right: 16, top: "50%", transform: [{ translateY: -14 }], flexDirection: "row", alignItems: "center", gap: 4, backgroundColor: "rgba(0,0,0,0.5)", borderRadius: 9999, paddingHorizontal: 12, paddingVertical: 6 }}>
          <Navigation size={13} color={t.accent} />
          <Text style={{ fontSize: 12, fontWeight: "700", color: "#fff" }}>{distLabel(post.distance)}</Text>
        </View>

        {/* Bottom: caption + urgency + actions */}
        <View style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: 16 }}>
          <Text style={{ fontSize: 16, fontWeight: "700", color: "#fff", lineHeight: 24 }}>{post.caption}</Text>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginTop: 8 }}>
            <UrgencyBar timeLeft={post.timeLeft} subColor={t.sub} />
            {post.crowd ? <CrowdTag crowd={post.crowd} /> : null}
          </View>

          {/* Actions */}
          <View style={{ flexDirection: "row", alignItems: "center", gap: 20, marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: "rgba(255,255,255,0.12)" }}>
            <Pressable onPress={() => setIsLiked(!isLiked)} style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
              <Heart size={22} fill={isLiked ? t.red : "none"} color={isLiked ? t.red : "rgba(255,255,255,.7)"} />
              <Text style={{ fontSize: 14, fontWeight: "600", color: isLiked ? t.red : "rgba(255,255,255,.7)" }}>
                {post.likes + (isLiked ? 1 : 0)}
              </Text>
            </Pressable>
            <Pressable style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
              <MessageSquare size={22} color="rgba(255,255,255,.7)" />
            </Pressable>
          </View>
        </View>
      </View>
    </View>
  );
}
