import { useState } from "react";
import { View, Text, TextInput, Pressable, ScrollView, StyleSheet } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Sparkles, Search, Mic, Zap, MapPin } from "@/lib/icons";
import { makeTokens } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { FEED_POSTS } from "@/data/mockData";
import PulseScoreCard from "@/components/features/ai/PulseScoreCard";
import QuickActions from "@/components/features/ai/QuickActions";
import PulseEventCard from "@/components/features/ai/PulseEventCard";

/** AI画面 */
export default function AiScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const t = makeTokens(isDark);
  const [query, setQuery] = useState("");

  const pulseEvents = [...FEED_POSTS].sort((a, b) => a.timeLeft - b.timeLeft).slice(0, 4);

  return (
    <ScrollView style={[styles.container, { backgroundColor: t.bg }]} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
      {/* Logo */}
      <View style={styles.logoSection}>
        <LinearGradient colors={[t.accent, t.blue]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.logoBox}>
          <Sparkles size={26} color="#fff" />
        </LinearGradient>
        <Text style={[styles.logoText, { color: t.text }]}>Navios AI</Text>
        <Text style={[styles.logoSub, { color: t.sub }]}>あなたの地域を、もっとスマートに</Text>
      </View>

      {/* Search */}
      <View style={[styles.searchBox, { backgroundColor: t.surface, borderColor: t.border }]}>
        <Search size={17} color={t.sub} />
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder="何をお探しですか？"
          placeholderTextColor={t.sub}
          style={[styles.searchInput, { color: t.text }]}
        />
        <Pressable>
          <LinearGradient colors={[t.accent, t.blue]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.micBtn}>
            <Mic size={15} color="#fff" />
          </LinearGradient>
        </Pressable>
      </View>

      <PulseScoreCard t={t} isDark={isDark} />
      <QuickActions t={t} isDark={isDark} />

      {/* Pulse Feed */}
      <View style={styles.pulseSection}>
        <View style={styles.pulseHeader}>
          <View style={styles.pulseTitle}>
            <Zap size={14} color={t.accent} />
            <Text style={[styles.pulseTitleText, { color: t.text }]}>今すぐ行くべき順</Text>
          </View>
          <Text style={[styles.realtime, { color: t.accent }]}>リアルタイム</Text>
        </View>
        <View style={styles.pulseList}>
          {pulseEvents.map((ev) => (
            <PulseEventCard key={ev.id} event={ev} t={t} />
          ))}
        </View>
      </View>

      {/* Auto check-in */}
      <View style={[styles.checkinCard, { backgroundColor: isDark ? "#0F1A14" : "#EAF9F4", borderColor: t.accent + "28" }]}>
        <View style={[styles.checkinIcon, { backgroundColor: t.accent + "20" }]}>
          <MapPin size={20} color={t.accent} />
        </View>
        <View style={styles.checkinContent}>
          <Text style={[styles.checkinTitle, { color: t.text }]}>AIオートチェックイン</Text>
          <Text style={[styles.checkinSub, { color: t.sub }]}>現地に近づいたら自動で通知</Text>
        </View>
        <Pressable style={[styles.checkinBtn, { backgroundColor: t.accent }]}>
          <Text style={styles.checkinBtnText}>ON</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { padding: 20, paddingBottom: 100 },
  logoSection: { alignItems: "center", marginBottom: 24 },
  logoBox: { width: 56, height: 56, borderRadius: 18, alignItems: "center", justifyContent: "center", marginBottom: 12 },
  logoText: { fontSize: 24, fontWeight: "800", letterSpacing: -0.5 },
  logoSub: { fontSize: 12, marginTop: 3 },
  searchBox: { flexDirection: "row", alignItems: "center", borderRadius: 16, borderWidth: 1, padding: 12, gap: 10, marginBottom: 24 },
  searchInput: { flex: 1, fontSize: 14 },
  micBtn: { width: 36, height: 36, borderRadius: 18, alignItems: "center", justifyContent: "center" },
  pulseSection: { marginBottom: 20 },
  pulseHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 10 },
  pulseTitle: { flexDirection: "row", alignItems: "center", gap: 5 },
  pulseTitleText: { fontSize: 13, fontWeight: "700" },
  realtime: { fontSize: 10, fontWeight: "600" },
  pulseList: { gap: 10 },
  checkinCard: { borderWidth: 1, borderRadius: 16, padding: 14, flexDirection: "row", alignItems: "center", gap: 12 },
  checkinIcon: { width: 40, height: 40, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  checkinContent: { flex: 1 },
  checkinTitle: { fontSize: 12, fontWeight: "700" },
  checkinSub: { fontSize: 11, lineHeight: 15 },
  checkinBtn: { borderRadius: 99, paddingHorizontal: 12, paddingVertical: 6 },
  checkinBtnText: { fontSize: 11, fontWeight: "700", color: "#000" },
});
