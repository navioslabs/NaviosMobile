import { useState, useMemo, useEffect, useRef } from "react";
import { View, Text, TextInput, Pressable, ScrollView, ActivityIndicator } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Sparkles, Search, Mic, Zap } from "@/lib/icons";
import { makeTokens } from "@/constants/theme";
import { useThemeStore } from "@/stores/themeStore";
import { FEED_POSTS } from "@/data/mockData";
import { createStyles, FONT_SIZE, WEIGHT, SPACE, RADIUS } from "@/lib/styles";
import PulseEventCard from "@/components/features/ai/PulseEventCard";
import SuggestionChips from "@/components/features/ai/SuggestionChips";
import StateView from "@/components/ui/StateView";

/** AI画面（さがす） */
export default function AiScreen() {
  const { isDark } = useThemeStore();
  const t = makeTokens(isDark);
  const s = createStyles(t);
  const [query, setQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  /** 入力時にローディング演出（300ms debounce） */
  const handleQueryChange = (text: string) => {
    setQuery(text);
    if (text.trim().length > 0) {
      setIsLoading(true);
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => setIsLoading(false), 500);
    } else {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, []);

  const pulseEvents = useMemo(
    () => [...FEED_POSTS].sort((a, b) => a.timeLeft - b.timeLeft).slice(0, 4),
    [],
  );

  /** 検索結果: queryに部分一致するFEED_POSTSを返す */
  const searchResults = useMemo(() => {
    if (!query.trim()) return null;
    const q = query.trim().toLowerCase();
    return FEED_POSTS.filter(
      (p) =>
        p.caption.toLowerCase().includes(q) ||
        p.user.name.toLowerCase().includes(q) ||
        p.category.includes(q),
    );
  }, [query]);

  const isSearching = query.trim().length > 0;

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

      {/* 検索バー */}
      <View style={[s.card, { flexDirection: "row", alignItems: "center", gap: SPACE.sm + 2, marginBottom: SPACE.sm }]}>
        <Search size={18} color={t.sub} />
        <TextInput
          value={query}
          onChangeText={handleQueryChange}
          placeholder="何をお探しですか？"
          placeholderTextColor={t.sub}
          style={{ flex: 1, fontSize: FONT_SIZE.lg, color: t.text }}
        />
        {isSearching ? (
          <Pressable
            onPress={() => setQuery("")}
            style={({ pressed }) => ({
              width: 40,
              height: 40,
              borderRadius: 20,
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: t.surface2,
              opacity: pressed ? 0.7 : 1,
            })}
          >
            <Text style={{ fontSize: FONT_SIZE.lg, color: t.sub }}>✕</Text>
          </Pressable>
        ) : (
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
        )}
      </View>

      {/* 検索ヘルパー */}
      {!isSearching && (
        <Text style={{ fontSize: FONT_SIZE.xs, color: t.muted, marginBottom: SPACE.sm, paddingHorizontal: SPACE.xs }}>
          例: 空いてるカフェ / 近いイベント / 今日締切
        </Text>
      )}

      {/* ═══ 検索モード ═══ */}
      {isSearching ? (
        <View style={{ marginTop: SPACE.sm }}>
          {isLoading ? (
            <View style={{ alignItems: "center", paddingVertical: SPACE.xxxl }}>
              <ActivityIndicator size="large" color={t.accent} />
              <Text style={{ fontSize: FONT_SIZE.base, color: t.sub, marginTop: SPACE.lg }}>検索中...</Text>
            </View>
          ) : searchResults && searchResults.length > 0 ? (
            <View>
              <Text style={{ fontSize: FONT_SIZE.sm, fontWeight: WEIGHT.semibold, color: t.accent, marginBottom: SPACE.lg }}>
                「{query}」の検索結果 — {searchResults.length}件
              </Text>
              <View style={{ gap: SPACE.sm + 2 }}>
                {searchResults.map((ev) => (
                  <PulseEventCard key={ev.id} event={ev} t={t} />
                ))}
              </View>
            </View>
          ) : (
            <View style={{ paddingVertical: SPACE.xxxl }}>
              <StateView t={t} type="empty" message="該当する投稿が見つかりませんでした" />
              <Text style={{ fontSize: FONT_SIZE.sm, color: t.muted, textAlign: "center", marginTop: SPACE.lg }}>
                別のキーワードを試してみてください
              </Text>
              {/* 代替サジェスト */}
              <View style={{ marginTop: SPACE.xl }}>
                <SuggestionChips t={t} onSelect={(q) => handleQueryChange(q)} />
              </View>
            </View>
          )}
        </View>
      ) : (
        <>
          {/* ═══ 通常モード ═══ */}
          {/* サジェストチップ */}
          <SuggestionChips t={t} onSelect={(q) => handleQueryChange(q)} />

          {/* おすすめフィード */}
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
        </>
      )}
    </ScrollView>
  );
}
