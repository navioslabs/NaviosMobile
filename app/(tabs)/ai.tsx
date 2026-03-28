import { useState, useMemo, useEffect, useRef } from "react";
import { View, Text, TextInput, Pressable, ScrollView, ActivityIndicator, RefreshControl } from "react-native";
import Animated, { FadeIn, FadeOut, FadeInUp } from "react-native-reanimated";
import { LinearGradient } from "expo-linear-gradient";
import { Sparkles, Search, Zap } from "@/lib/icons";
import { useAppStyles } from "@/hooks/useAppStyles";
import { WEIGHT, SPACE, RADIUS } from "@/lib/styles";
import { useSearchPosts, usePosts } from "@/hooks/usePosts";
import PulseEventCard from "@/components/features/ai/PulseEventCard";
import SuggestionChips from "@/components/features/ai/SuggestionChips";
import TrendingSection from "@/components/features/ai/TrendingSection";
import StateView from "@/components/ui/StateView";

/** AI画面（さがす） */
export default function AiScreen() {
  const { s, t, fs } = useAppStyles();
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  /** 入力時にdebounce（300ms）でクエリ反映 */
  const handleQueryChange = (text: string) => {
    setQuery(text);
    if (timerRef.current) clearTimeout(timerRef.current);
    if (text.trim().length > 0) {
      timerRef.current = setTimeout(() => setDebouncedQuery(text.trim()), 300);
    } else {
      setDebouncedQuery("");
    }
  };

  useEffect(() => {
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, []);

  /** サーバー検索（React Query） */
  const { data: serverResults, isLoading: searchLoading } = useSearchPosts(debouncedQuery);

  /** サーバーデータを直接使用 */
  const searchResults = useMemo(() => {
    if (!query.trim()) return null;
    if (serverResults && serverResults.length > 0) return serverResults;
    return [];
  }, [query, serverResults]);

  /** debounce中 or React Queryローディング中 */
  const isLoading = query.trim().length > 0 && (query.trim() !== debouncedQuery || searchLoading);

  /** おすすめフィード: deadline が近い順 */
  const { data: feedPosts, isFetching: feedFetching, refetch: refetchFeed } = usePosts({ limit: 20 });
  const pulseEvents = useMemo(() => {
    const posts = feedPosts ?? [];
    return [...posts]
      .sort((a, b) => {
        const aTime = a.deadline ? new Date(a.deadline).getTime() : Infinity;
        const bTime = b.deadline ? new Date(b.deadline).getTime() : Infinity;
        return aTime - bTime;
      })
      .slice(0, 4);
  }, [feedPosts]);

  /** 急上昇: 直近24時間以内でいいね数が多い順 */
  const trendingPosts = useMemo(() => {
    const posts = feedPosts ?? [];
    const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000;
    return [...posts]
      .filter((p) => new Date(p.created_at).getTime() > oneDayAgo && p.likes_count > 0)
      .sort((a, b) => b.likes_count - a.likes_count)
      .slice(0, 6);
  }, [feedPosts]);

  const isSearching = query.trim().length > 0;

  return (
    <ScrollView
      style={s.screen}
      contentContainerStyle={{ padding: SPACE.xl, paddingBottom: 100 }}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl
          refreshing={feedFetching}
          onRefresh={() => refetchFeed()}
          tintColor={t.accent}
          colors={[t.accent]}
          progressBackgroundColor={t.surface}
        />
      }
    >
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
          accessibilityLabel="検索キーワードを入力"
          style={{ flex: 1, fontSize: fs.lg, color: t.text }}
        />
        {isSearching && (
          <Animated.View entering={FadeIn.duration(200)} exiting={FadeOut.duration(150)} key="clear-btn">
            <Pressable
              onPress={() => { setQuery(""); setDebouncedQuery(""); }}
              accessibilityLabel="検索をクリア"
              accessibilityRole="button"
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
              <Text style={{ fontSize: fs.lg, color: t.sub }}>✕</Text>
            </Pressable>
          </Animated.View>
        )}
      </View>

      {/* 検索ヘルパー */}
      {!isSearching && (
        <Text style={{ fontSize: fs.xs, color: t.muted, marginBottom: SPACE.sm, paddingHorizontal: SPACE.xs }}>
          例: 空いてるカフェ / 近いイベント / 今日締切
        </Text>
      )}

      {/* 検索モード */}
      {isSearching ? (
        <View style={{ marginTop: SPACE.sm }}>
          {isLoading ? (
            <Animated.View entering={FadeIn.duration(250)} exiting={FadeOut.duration(150)} style={{ alignItems: "center", paddingVertical: SPACE.xxxl }}>
              <ActivityIndicator size="large" color={t.accent} />
              <Text style={{ fontSize: fs.base, color: t.sub, marginTop: SPACE.lg }}>検索中...</Text>
            </Animated.View>
          ) : searchResults && searchResults.length > 0 ? (
            <View>
              <Animated.Text entering={FadeIn.duration(300)} style={{ fontSize: fs.sm, fontWeight: WEIGHT.semibold, color: t.accent, marginBottom: SPACE.lg }}>
                「{query}」の検索結果 — {searchResults.length}件
              </Animated.Text>
              <View style={{ gap: SPACE.sm + 2 }}>
                {searchResults.map((ev, i) => (
                  <Animated.View key={ev.id} entering={FadeInUp.delay(Math.min(i * 60, 400)).duration(350)}>
                    <PulseEventCard event={ev} t={t} />
                  </Animated.View>
                ))}
              </View>
            </View>
          ) : (
            <View style={{ paddingVertical: SPACE.xxxl }}>
              <StateView t={t} type="empty" message="該当する投稿が見つかりませんでした" />
              <Text style={{ fontSize: fs.sm, color: t.muted, textAlign: "center", marginTop: SPACE.lg }}>
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
          {/* 通常モード */}
          {/* サジェストチップ */}
          <SuggestionChips t={t} onSelect={(q) => handleQueryChange(q)} />

          {/* 急上昇セクション */}
          <TrendingSection posts={trendingPosts} t={t} />

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
              {pulseEvents.map((ev, i) => (
                <Animated.View key={ev.id} entering={FadeInUp.delay(Math.min(i * 60, 400)).duration(350)}>
                  <PulseEventCard event={ev} t={t} />
                </Animated.View>
              ))}
            </View>
          </View>
        </>
      )}
    </ScrollView>
  );
}
