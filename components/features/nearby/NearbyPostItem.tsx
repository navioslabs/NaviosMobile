import { View, Text, StyleSheet } from "react-native";
import { Image } from "expo-image";
import { Clock } from "@/lib/icons";
import type { ThemeTokens } from "@/constants/theme";
import type { NearbyPost } from "@/types";
import { distLabel } from "@/lib/utils";
import CatPill from "@/components/ui/CatPill";
import MatchBadge from "@/components/ui/MatchBadge";

interface NearbyPostItemProps {
  post: NearbyPost;
  t: ThemeTokens;
}

/** 近隣投稿リストアイテム */
export default function NearbyPostItem({ post, t }: NearbyPostItemProps) {
  const isClose = post.distance <= 200;

  return (
    <View style={[styles.container, { borderBottomColor: t.border }]}>
      {/* Distance indicator */}
      <View style={styles.distCol}>
        <Text style={[styles.distText, { color: isClose ? t.accent : t.text }]}>
          {distLabel(post.distance)}
        </Text>
        <View style={[styles.distDot, { backgroundColor: isClose ? t.accent : t.accent }]} />
        <View style={[styles.distLine, { backgroundColor: t.border }]} />
      </View>

      {/* Image */}
      <Image source={{ uri: post.image }} style={styles.image} contentFit="cover" />

      {/* Content */}
      <View style={styles.content}>
        <View style={styles.badgeRow}>
          <CatPill cat={post.category} small />
          {isClose && (
            <View style={[styles.closeBadge, { backgroundColor: t.accent + "20" }]}>
              <Text style={[styles.closeText, { color: t.accent }]}>すぐ近く</Text>
            </View>
          )}
        </View>
        <Text style={[styles.title, { color: t.text }]}>{post.title}</Text>
        <Text style={[styles.desc, { color: t.sub }]} numberOfLines={1}>{post.content}</Text>
        <View style={styles.metaRow}>
          <Text style={[styles.metaText, { color: t.muted }]}>{post.author}</Text>
          <Text style={[styles.metaText, { color: t.muted }]}>•</Text>
          <Clock size={10} color={t.muted} />
          <Text style={[styles.metaText, { color: t.muted }]}>{post.time}</Text>
          <MatchBadge score={post.matchScore} />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flexDirection: "row", gap: 12, paddingVertical: 12, paddingHorizontal: 10, borderBottomWidth: 1 },
  distCol: { width: 48, alignItems: "center", gap: 4, paddingTop: 2 },
  distText: { fontSize: 13, fontWeight: "800" },
  distDot: { width: 8, height: 8, borderRadius: 4 },
  distLine: { flex: 1, width: 1.5, minHeight: 20 },
  image: { width: 72, height: 72, borderRadius: 14 },
  content: { flex: 1 },
  badgeRow: { flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 4 },
  closeBadge: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 99 },
  closeText: { fontSize: 9, fontWeight: "700" },
  title: { fontSize: 14, fontWeight: "700", lineHeight: 18, marginBottom: 3 },
  desc: { fontSize: 12, lineHeight: 16, marginBottom: 4 },
  metaRow: { flexDirection: "row", alignItems: "center", gap: 4 },
  metaText: { fontSize: 11 },
});
