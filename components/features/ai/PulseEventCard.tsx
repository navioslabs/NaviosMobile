import { View, Text, StyleSheet } from "react-native";
import { Image } from "expo-image";
import { Navigation, Flame } from "@/lib/icons";
import type { ThemeTokens } from "@/constants/theme";
import type { FeedPost } from "@/types";
import { CAT_CONFIG } from "@/constants/categories";
import { distLabel } from "@/lib/utils";
import CatPill from "@/components/ui/CatPill";
import MatchBadge from "@/components/ui/MatchBadge";
import UrgencyBar from "@/components/ui/UrgencyBar";
import CrowdTag from "@/components/ui/CrowdTag";
import GoButton from "@/components/ui/GoButton";
import HotStrip from "@/components/ui/HotStrip";

interface PulseEventCardProps {
  event: FeedPost;
  t: ThemeTokens;
}

/** AIパルスイベントカード */
export default function PulseEventCard({ event, t }: PulseEventCardProps) {
  const isHot = event.matchScore >= 85;

  return (
    <View style={[styles.card, { backgroundColor: t.surface, borderColor: isHot ? t.accent + "35" : t.border, borderWidth: isHot ? 1.5 : 1 }]}>
      {isHot && <HotStrip />}
      <View style={styles.inner}>
        <Image source={{ uri: event.image }} style={styles.image} contentFit="cover" />
        <View style={styles.content}>
          <View style={styles.badgeRow}>
            {isHot && (
              <View style={styles.hotBadge}>
                <Flame size={9} color="#fff" />
                <Text style={styles.hotText}>HOT</Text>
              </View>
            )}
            <CatPill cat={event.category} small />
          </View>
          <Text style={[styles.name, { color: t.text }]} numberOfLines={1}>
            {event.user.name}
          </Text>
          <View style={styles.metaRow}>
            <View style={styles.distRow}>
              <Navigation size={10} color={t.accent} />
              <Text style={[styles.distText, { color: t.accent }]}>{distLabel(event.distance)}</Text>
            </View>
            <UrgencyBar timeLeft={event.timeLeft} subColor={t.sub} />
            {event.crowd ? <CrowdTag crowd={event.crowd} /> : null}
          </View>
        </View>
        <View style={styles.rightCol}>
          <MatchBadge score={event.matchScore} />
          <GoButton small />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: 18, overflow: "hidden", position: "relative" },
  inner: { flexDirection: "row", gap: 12, padding: 14 },
  image: { width: 64, height: 64, borderRadius: 14 },
  content: { flex: 1 },
  badgeRow: { flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 4 },
  hotBadge: { flexDirection: "row", alignItems: "center", gap: 3, paddingHorizontal: 7, paddingVertical: 2, borderRadius: 99, backgroundColor: "#F0425C" },
  hotText: { color: "#fff", fontSize: 9, fontWeight: "700" },
  name: { fontSize: 14, fontWeight: "700", lineHeight: 18, marginBottom: 5 },
  metaRow: { flexDirection: "row", alignItems: "center", gap: 8, flexWrap: "wrap" },
  distRow: { flexDirection: "row", alignItems: "center", gap: 3 },
  distText: { fontSize: 11, fontWeight: "600" },
  rightCol: { alignItems: "flex-end", justifyContent: "space-between" },
});
