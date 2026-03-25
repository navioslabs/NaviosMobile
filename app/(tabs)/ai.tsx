import { useState } from "react";
import { View, Text, TextInput, Pressable, ScrollView } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Sparkles, Search, Mic, Zap, MapPin } from "@/lib/icons";
import { makeTokens } from "@/constants/theme";
import { useThemeStore } from "@/stores/themeStore";
import { FEED_POSTS } from "@/data/mockData";
import { createStyles, FONT_SIZE, WEIGHT, SPACE, RADIUS } from "@/lib/styles";
import QuickActions from "@/components/features/ai/QuickActions";
import PulseEventCard from "@/components/features/ai/PulseEventCard";
import SuggestionChips from "@/components/features/ai/SuggestionChips";

/** AI画面 */
export default function AiScreen() {
  const { isDark } = useThemeStore();
  const t = makeTokens(isDark);
  const s = createStyles(t);
  const [query, setQuery] = useState("");

  const pulseEvents = [...FEED_POSTS].sort((a, b) => a.timeLeft - b.timeLeft).slice(0, 4);

  return (
    <ScrollView style={s.screen} contentContainerStyle={{ padding: SPACE.xl, paddingBottom: 100 }} showsVerticalScrollIndicator={false}>
      {/* Logo — 縮小版 */}
      <View style={{ flexDirection: "row", alignItems: "center", gap: SPACE.md, marginBottom: SPACE.lg }}>
        <LinearGradient
          colors={[t.accent, t.blue]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{ width: 40, height: 40, borderRadius: 12, alignItems: "center", justifyContent: "center" }}
        >
          <Sparkles size={20} color="#fff" />
        </LinearGradient>
        <Text style={[s.textSectionTitle, { color: t.text }]}>Navios AI</Text>
      </View>

      {/* Primary Action: Search */}
      <View style={[s.card, { flexDirection: "row", alignItems: "center", gap: SPACE.sm + 2, marginBottom: SPACE.sm }]}>
        <Search size={18} color={t.sub} />
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder="何をお探しですか？"
          placeholderTextColor={t.sub}
          style={{ flex: 1, fontSize: FONT_SIZE.lg, color: t.text }}
        />
        <Pressable style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}>
          <LinearGradient
            colors={[t.accent, t.blue]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{ width: 40, height: 40, borderRadius: 20, alignItems: "center", justifyContent: "center" }}
          >
            <Mic size={16} color="#fff" />
          </LinearGradient>
        </Pressable>
      </View>

      {/* Search helper / query preview */}
      {query ? (
        <Text style={{ fontSize: FONT_SIZE.sm, color: t.accent, marginBottom: SPACE.sm, paddingHorizontal: SPACE.xs }}>
          「{query}」で検索...
        </Text>
      ) : (
        <Text style={{ fontSize: FONT_SIZE.xs, color: t.muted, marginBottom: SPACE.sm, paddingHorizontal: SPACE.xs }}>
          例: 空いてるカフェ / 近いイベント / 今日締切
        </Text>
      )}

      {/* Suggestion Chips */}
      <SuggestionChips t={t} onSelect={(q) => setQuery(q)} />

      {/* Pulse Feed */}
      <View style={{ marginBottom: SPACE.xl }}>
        <View style={[s.rowBetween, { marginBottom: SPACE.sm + 2 }]}>
          <View style={[s.row, { gap: 5 }]}>
            <Zap size={15} color={t.accent} />
            <Text style={s.textBodyBold}>今すぐ行くべき順</Text>
          </View>
          <Text style={[s.textCaption, { color: t.accent }]}>リアルタイム</Text>
        </View>
        <View style={{ gap: SPACE.sm + 2 }}>
          {pulseEvents.map((ev) => (
            <PulseEventCard key={ev.id} event={ev} t={t} />
          ))}
        </View>
      </View>

      {/* Quick Actions — subdued */}
      <QuickActions t={t} isDark={isDark} />

      {/* Auto check-in */}
      <View style={{ flexDirection: "row", alignItems: "center", gap: SPACE.md, borderRadius: RADIUS.xl, padding: SPACE.lg, backgroundColor: isDark ? "#0F1A14" : "#EAF9F4", borderWidth: 1, borderColor: t.accent + "28" }}>
        <View style={{ width: 44, height: 44, borderRadius: RADIUS.md, alignItems: "center", justifyContent: "center", backgroundColor: t.accent + "20" }}>
          <MapPin size={22} color={t.accent} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={[s.textLabel, { color: t.text, fontWeight: WEIGHT.bold }]}>AIオートチェックイン</Text>
          <Text style={[s.textMeta, { color: t.sub, lineHeight: 16 }]}>現地に近づいたら自動で通知</Text>
        </View>
        <Pressable style={({ pressed }) => ({ borderRadius: RADIUS.full, paddingHorizontal: SPACE.lg, paddingVertical: SPACE.sm, backgroundColor: t.accent, opacity: pressed ? 0.7 : 1 })}>
          <Text style={{ fontSize: FONT_SIZE.sm, fontWeight: WEIGHT.bold, color: "#000" }}>ON</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}
