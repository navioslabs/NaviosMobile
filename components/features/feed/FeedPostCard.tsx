import { useState } from "react";
import { View, Text, Pressable, StyleSheet, Dimensions } from "react-native";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { Heart, MessageSquare, Share, Bookmark, Navigation } from "@/lib/icons";
import type { ThemeTokens } from "@/constants/theme";
import type { FeedPost } from "@/types";
import { CAT_CONFIG } from "@/constants/categories";
import { distLabel } from "@/lib/utils";
import CatPill from "@/components/ui/CatPill";
import UrgencyBar from "@/components/ui/UrgencyBar";
import CrowdTag from "@/components/ui/CrowdTag";

const CARD_WIDTH = Dimensions.get("window").width - 28;

interface FeedPostCardProps {
  post: FeedPost;
  t: ThemeTokens;
  isDark: boolean;
}

/** フィード投稿カード */
export default function FeedPostCard({ post, t, isDark }: FeedPostCardProps) {
  const [isLiked, setIsLiked] = useState(false);

  return (
    <View style={[styles.card, { shadowColor: isDark ? "#000" : "rgba(0,0,0,0.06)" }]}>
      <View style={styles.imageContainer}>
        <Image source={{ uri: post.image }} style={styles.image} contentFit="cover" />
        <LinearGradient
          colors={["rgba(0,0,0,0.3)", "rgba(0,0,0,0.15)", "rgba(0,0,0,0.85)"]}
          locations={[0, 0.35, 1]}
          style={StyleSheet.absoluteFill}
        />

        {/* Top-left: avatar + name + category */}
        <View style={styles.topLeft}>
          <View>
            <Image source={{ uri: post.user.avatar }} style={styles.avatar} />
            {post.user.verified && (
              <View style={styles.verifiedBadge}>
                <Text style={styles.verifiedText}>✓</Text>
              </View>
            )}
          </View>
          <View>
            <Text style={styles.userName}>{post.user.name}</Text>
            <View style={{ marginTop: 2 }}>
              <CatPill cat={post.category} small />
            </View>
          </View>
        </View>

        {/* Top-right: time */}
        <View style={styles.topRight}>
          <Text style={styles.timeText}>{post.time}</Text>
        </View>

        {/* Right-center: distance */}
        <View style={styles.distBadge}>
          <Navigation size={11} color={t.accent} />
          <Text style={styles.distText}>{distLabel(post.distance)}</Text>
        </View>

        {/* Bottom: caption + urgency + actions */}
        <View style={styles.bottom}>
          <Text style={styles.caption}>{post.caption}</Text>
          <View style={styles.metaRow}>
            <UrgencyBar timeLeft={post.timeLeft} subColor={t.sub} />
            {post.crowd ? <CrowdTag crowd={post.crowd} /> : null}
          </View>

          {/* Actions */}
          <View style={styles.actionsRow}>
            <Pressable onPress={() => setIsLiked(!isLiked)} style={styles.actionBtn}>
              <Heart size={18} fill={isLiked ? t.red : "none"} color={isLiked ? t.red : "rgba(255,255,255,.7)"} />
              <Text style={[styles.actionText, isLiked && { color: t.red }]}>
                {post.likes + (isLiked ? 1 : 0)}
              </Text>
            </Pressable>
            <Pressable style={styles.actionBtn}>
              <MessageSquare size={18} color="rgba(255,255,255,.7)" />
            </Pressable>
            <Pressable style={styles.actionBtn}>
              <Share size={18} color="rgba(255,255,255,.7)" />
            </Pressable>
            <Pressable style={[styles.actionBtn, { marginLeft: "auto" }]}>
              <Bookmark size={18} color="rgba(255,255,255,.7)" />
            </Pressable>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { marginHorizontal: 14, marginBottom: 14, borderRadius: 26, overflow: "hidden", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.3, shadowRadius: 12, elevation: 4 },
  imageContainer: { aspectRatio: 3 / 4 },
  image: { width: "100%", height: "100%" },
  topLeft: { position: "absolute", top: 14, left: 14, flexDirection: "row", alignItems: "center", gap: 8 },
  avatar: { width: 34, height: 34, borderRadius: 17, borderWidth: 2, borderColor: "rgba(255,255,255,0.5)" },
  verifiedBadge: { position: "absolute", bottom: -1, right: -1, width: 13, height: 13, borderRadius: 6.5, backgroundColor: "#4A9EFF", alignItems: "center", justifyContent: "center" },
  verifiedText: { color: "#fff", fontSize: 7, fontWeight: "800" },
  userName: { fontWeight: "700", fontSize: 12, color: "#fff" },
  topRight: { position: "absolute", top: 14, right: 14 },
  timeText: { fontSize: 11, color: "rgba(255,255,255,.6)" },
  distBadge: { position: "absolute", right: 14, top: "50%", flexDirection: "row", alignItems: "center", gap: 4, backgroundColor: "rgba(0,0,0,.5)", borderRadius: 99, paddingHorizontal: 10, paddingVertical: 5 },
  distText: { fontSize: 11, fontWeight: "700", color: "#fff" },
  bottom: { position: "absolute", bottom: 0, left: 0, right: 0, padding: 14 },
  caption: { fontSize: 15, fontWeight: "700", color: "#fff", lineHeight: 20 },
  metaRow: { flexDirection: "row", alignItems: "center", gap: 8, marginTop: 6 },
  actionsRow: { flexDirection: "row", alignItems: "center", gap: 16, marginTop: 10, paddingTop: 10, borderTopWidth: 1, borderTopColor: "rgba(255,255,255,0.12)" },
  actionBtn: { flexDirection: "row", alignItems: "center", gap: 4 },
  actionText: { fontSize: 12, fontWeight: "600", color: "rgba(255,255,255,.7)" },
});
