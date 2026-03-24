import { View, Text, StyleSheet } from "react-native";
import { Radio } from "@/lib/icons";
import type { ThemeTokens } from "@/constants/theme";

interface PulseScoreCardProps {
  t: ThemeTokens;
  isDark: boolean;
}

/** Pulseスコア表示カード */
export default function PulseScoreCard({ t, isDark }: PulseScoreCardProps) {
  return (
    <View style={[styles.card, { backgroundColor: isDark ? "rgba(0,212,161,0.06)" : "rgba(0,212,161,0.08)", borderColor: t.accent + "22" }]}>
      <View style={[styles.icon, { backgroundColor: t.accent + "22" }]}>
        <Radio size={20} color={t.accent} />
      </View>
      <View style={styles.content}>
        <Text style={[styles.title, { color: t.text }]}>Pulse スコア: 82 / 100</Text>
        <Text style={[styles.sub, { color: t.sub }]}>周辺エリアの盛り上がり度</Text>
      </View>
      <View style={[styles.badge, { backgroundColor: t.accent }]}>
        <Text style={styles.badgeText}>HOT</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { borderWidth: 1, borderRadius: 16, padding: 14, flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 22 },
  icon: { width: 42, height: 42, borderRadius: 14, alignItems: "center", justifyContent: "center" },
  content: { flex: 1 },
  title: { fontSize: 13, fontWeight: "700" },
  sub: { fontSize: 11 },
  badge: { borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4 },
  badgeText: { color: "#000", fontSize: 10, fontWeight: "800" },
});
