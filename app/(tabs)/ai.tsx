import { useState, useMemo, useEffect, useRef, useCallback } from "react";
import { View, Text, TextInput, Pressable, ScrollView, ActivityIndicator, RefreshControl } from "react-native";
import Animated, { FadeIn, FadeOut, FadeInUp } from "react-native-reanimated";
import { LinearGradient } from "expo-linear-gradient";
import { router, useLocalSearchParams } from "expo-router";
import { Sparkles, Search, Zap, MessageCircle, MessageSquare, Trophy, Heart, Inbox } from "@/lib/icons";
import { useAppStyles } from "@/hooks/useAppStyles";
import { useThemeStore } from "@/stores/themeStore";
import { WEIGHT, SPACE, RADIUS } from "@/lib/styles";
import { useSearchPosts, usePosts } from "@/hooks/usePosts";
import { useSearchTalks } from "@/hooks/useTalks";
import { timeAgo } from "@/lib/adapters";
import type { Talk } from "@/types";
import PulseEventCard from "@/components/features/ai/PulseEventCard";
import SuggestionChips from "@/components/features/ai/SuggestionChips";
import TrendingSection from "@/components/features/ai/TrendingSection";
import QuickActions from "@/components/features/ai/QuickActions";
import WeeklyRanking from "@/components/features/ai/WeeklyRanking";
import StateView from "@/components/ui/StateView";
import { useSearchHistory } from "@/hooks/useSearchHistory";

/** AI画面（さがす） */
export default function AiScreen() {
  const { q } = useLocalSearchParams<{ q?: string }>();
  const { s, t, fs } = useAppStyles();
  const { isDark } = useThemeStore();
  const { history, addHistory, clearHistory } = useSearchHistory();
  const [query, setQuery] = useState(q ?? "");
  const [debouncedQuery, setDebouncedQuery] = useState(q ?? "");
  const [searchTab, setSearchTab] = useState<"posts" | "talks">("posts");
  const [searchCategory, setSearchCategory] = useState<string | undefined>(undefined);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isDebouncing = useRef(false);

  /** 入力時にdebounce（300ms）でクエリ反映 */
  const handleQueryChange = useCallback((text: string) => {
    setQuery(text);
    if (timerRef.current) clearTimeout(timerRef.current);
    isDebouncing.current = text.trim().length > 0;
    if (text.trim().length > 0) {
      timerRef.current = setTimeout(() => {
        setDebouncedQuery(text.trim());
        isDebouncing.current = false;
      }, 300);
    } else {
      setDebouncedQuery("");
      isDebouncing.current = false;
    }
  }, []);

  /** キーボードの検索ボタンで即座に検索 */
  const handleSubmitEditing = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    isDebouncing.current = false;
    if (query.trim().length > 0) {
      setDebouncedQuery(query.trim());
      addHistory(query.trim());
    }
  }, [query, addHistory]);

  /** タグタップ等で q パラメータが変わった時に検索を反映 */
  useEffect(() => {
    if (q) {
      setQuery(q);
      setDebouncedQuery(q);
    }
  }, [q]);

  useEffect(() => {
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, []);

  /** サーバー検索 */
  const { data: postResults, isLoading: postsSearchLoading } = useSearchPosts(debouncedQuery, searchCategory);
  const { data: talkResults, isLoading: talksSearchLoading } = useSearchTalks(debouncedQuery);

  const isSearching = query.trim().length > 0;
  const searchLoading = searchTab === "posts" ? postsSearchLoading : talksSearchLoading;
  const isLoading = isSearching && (isDebouncing.current || searchLoading);

  const postCount = postResults?.length ?? 0;
  const talkCount = talkResults?.length ?? 0;

  /** おすすめフィード */
  const { data: feedData, isFetching: feedFetching, refetch: refetchFeed } = usePosts({ limit: 20 });
  const feedPosts = feedData?.flat ?? [];

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

  /** 週間ランキング: 過去7日間でいいね数上位5件 */
  const weeklyRanking = useMemo(() => {
    const posts = feedPosts;
    const oneWeekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
    return [...posts]
      .filter((p) => new Date(p.created_at).getTime() > oneWeekAgo && p.likes_count > 0)
      .sort((a, b) => b.likes_count - a.likes_count)
      .slice(0, 5);
  }, [feedPosts]);

  /** 急上昇 */
  const trendingPosts = useMemo(() => {
    const posts = feedPosts ?? [];
    const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000;
    return [...posts]
      .filter((p) => new Date(p.created_at).getTime() > oneDayAgo && p.likes_count > 0)
      .sort((a, b) => b.likes_count - a.likes_count)
      .slice(0, 6);
  }, [feedPosts]);

  /** 今日終了する投稿 */
  const endingToday = useMemo(() => {
    const posts = feedPosts ?? [];
    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);
    return posts
      .filter((p) => p.deadline && new Date(p.deadline).getTime() <= todayEnd.getTime() && new Date(p.deadline).getTime() > Date.now())
      .sort((a, b) => new Date(a.deadline!).getTime() - new Date(b.deadline!).getTime())
      .slice(0, 3);
  }, [feedPosts]);

  /** 動的サジェスト: 人気投稿タイトルからキーワード抽出 */
  const dynamicSuggestions = useMemo(() => {
    const posts = feedPosts ?? [];
    const titles = posts
      .sort((a, b) => b.likes_count - a.likes_count)
      .slice(0, 10)
      .map((p) => p.title);
    const unique = [...new Set(titles)].slice(0, 5);
    return unique.length >= 3 ? unique : undefined;
  }, [feedPosts]);

  return (
    <ScrollView
      style={s.screen}
      contentContainerStyle={{ padding: SPACE.xl, paddingBottom: 100 }}
      showsVerticalScrollIndicator={false}
      keyboardDismissMode="on-drag"
      refreshControl={
        <RefreshControl
          refreshing={feedFetching && !isSearching}
          onRefresh={() => refetchFeed()}
          tintColor={t.accent}
          colors={[t.accent]}
          progressBackgroundColor={t.surface}
        />
      }
    >
      {/* Logo */}
      <View style={{ flexDirection: "row", alignItems: "center", gap: SPACE.md, marginBottom: SPACE.lg }}>
        <LinearGradient
          colors={[t.accent, t.blue]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{ width: 40, height: 40, borderRadius: 12, alignItems: "center", justifyContent: "center" }}
        >
          <Sparkles size={20} color="#fff" />
        </LinearGradient>
        <Text style={[s.textSectionTitle, { color: t.text }]}>さがす</Text>
      </View>

      {/* 検索バー（S-7） */}
      <View style={[s.card, { flexDirection: "row", alignItems: "center", gap: SPACE.sm + 2, marginBottom: SPACE.sm }]}>
        {isDebouncing.current ? (
          <ActivityIndicator size={18} color={t.accent} />
        ) : (
          <Search size={18} color={t.sub} />
        )}
        <TextInput
          value={query}
          onChangeText={handleQueryChange}
          onSubmitEditing={handleSubmitEditing}
          placeholder="何をお探しですか？"
          placeholderTextColor={t.sub}
          returnKeyType="search"
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
                width: 40, height: 40, borderRadius: 20,
                alignItems: "center", justifyContent: "center",
                backgroundColor: t.surface2, opacity: pressed ? 0.7 : 1,
              })}
            >
              <Text style={{ fontSize: fs.lg, color: t.sub }}>✕</Text>
            </Pressable>
          </Animated.View>
        )}
      </View>

      {/* 検索モード */}
      {isSearching ? (
        <View style={{ marginTop: SPACE.sm }}>
          {/* 投稿/ひとこと タブ（S-1） */}
          <View style={{ flexDirection: "row", gap: SPACE.sm, marginBottom: SPACE.lg }}>
            <Pressable
              onPress={() => setSearchTab("posts")}
              style={({ pressed }) => ({
                flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center",
                gap: SPACE.xs, paddingVertical: SPACE.sm + 2, borderRadius: RADIUS.lg,
                backgroundColor: searchTab === "posts" ? t.accent + "20" : t.surface2,
                borderWidth: 1, borderColor: searchTab === "posts" ? t.accent + "40" : t.border,
                opacity: pressed ? 0.7 : 1,
              })}
            >
              <MessageCircle size={14} color={searchTab === "posts" ? t.accent : t.muted} />
              <Text style={{ fontSize: fs.sm, fontWeight: WEIGHT.bold, color: searchTab === "posts" ? t.accent : t.muted }}>
                投稿 {debouncedQuery ? postCount : ""}
              </Text>
            </Pressable>
            <Pressable
              onPress={() => setSearchTab("talks")}
              style={({ pressed }) => ({
                flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center",
                gap: SPACE.xs, paddingVertical: SPACE.sm + 2, borderRadius: RADIUS.lg,
                backgroundColor: searchTab === "talks" ? t.blue + "20" : t.surface2,
                borderWidth: 1, borderColor: searchTab === "talks" ? t.blue + "40" : t.border,
                opacity: pressed ? 0.7 : 1,
              })}
            >
              <MessageSquare size={14} color={searchTab === "talks" ? t.blue : t.muted} />
              <Text style={{ fontSize: fs.sm, fontWeight: WEIGHT.bold, color: searchTab === "talks" ? t.blue : t.muted }}>
                ひとこと {debouncedQuery ? talkCount : ""}
              </Text>
            </Pressable>
          </View>

          {/* カテゴリフィルタ（投稿タブ時のみ） */}
          {searchTab === "posts" && (
            <View style={{ flexDirection: "row", gap: SPACE.xs, marginBottom: SPACE.md }}>
              {[
                { id: undefined, label: "すべて" },
                { id: "lifeline", label: "ライフライン" },
                { id: "event", label: "イベント" },
                { id: "help", label: "近助" },
              ].map((c) => {
                const active = searchCategory === c.id;
                return (
                  <Pressable
                    key={c.label}
                    onPress={() => setSearchCategory(c.id)}
                    style={({ pressed }) => ({
                      paddingHorizontal: SPACE.md,
                      paddingVertical: SPACE.xs + 2,
                      borderRadius: RADIUS.full,
                      backgroundColor: active ? t.accent + "20" : t.surface2,
                      borderWidth: 1,
                      borderColor: active ? t.accent : t.border,
                      opacity: pressed ? 0.7 : 1,
                    })}
                  >
                    <Text style={{ fontSize: fs.xxs, fontWeight: WEIGHT.bold, color: active ? t.accent : t.sub }}>
                      {c.label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          )}

          {isLoading ? (
            <Animated.View entering={FadeIn.duration(250)} exiting={FadeOut.duration(150)} style={{ alignItems: "center", paddingVertical: SPACE.xxxl }}>
              <ActivityIndicator size="large" color={t.accent} />
              <Text style={{ fontSize: fs.base, color: t.sub, marginTop: SPACE.lg }}>検索中...</Text>
            </Animated.View>
          ) : searchTab === "posts" ? (
            /* 投稿検索結果 */
            postResults && postResults.length > 0 ? (
              <View>
                <Animated.Text entering={FadeIn.duration(300)} style={{ fontSize: fs.sm, fontWeight: WEIGHT.semibold, color: t.accent, marginBottom: SPACE.lg }}>
                  「{debouncedQuery}」の投稿 — {postCount}件
                </Animated.Text>
                <View style={{ gap: SPACE.sm + 2 }}>
                  {postResults.map((ev, i) => (
                    <Animated.View key={ev.id} entering={FadeInUp.delay(Math.min(i * 60, 400)).duration(350)}>
                      <PulseEventCard event={ev} t={t} />
                    </Animated.View>
                  ))}
                </View>
              </View>
            ) : (
              <EmptySearchView query={debouncedQuery} t={t} fs={fs} onSuggest={handleQueryChange} />
            )
          ) : (
            /* ひとこと検索結果 */
            talkResults && talkResults.length > 0 ? (
              <View>
                <Animated.Text entering={FadeIn.duration(300)} style={{ fontSize: fs.sm, fontWeight: WEIGHT.semibold, color: t.blue, marginBottom: SPACE.lg }}>
                  「{debouncedQuery}」のひとこと — {talkCount}件
                </Animated.Text>
                <View style={{ gap: SPACE.sm }}>
                  {talkResults.map((talk, i) => (
                    <Animated.View key={talk.id} entering={FadeInUp.delay(Math.min(i * 60, 400)).duration(350)}>
                      <TalkSearchCard talk={talk} t={t} fs={fs} />
                    </Animated.View>
                  ))}
                </View>
              </View>
            ) : (
              <EmptySearchView query={debouncedQuery} t={t} fs={fs} onSuggest={handleQueryChange} />
            )
          )}
        </View>
      ) : (
        <>
          {/* 通常モード */}

          {/* 検索履歴 */}
          {history.length > 0 && (
            <View style={{ marginBottom: SPACE.lg }}>
              <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: SPACE.sm }}>
                <Text style={{ fontSize: fs.sm, fontWeight: WEIGHT.semibold, color: t.sub }}>最近の検索</Text>
                <Pressable onPress={clearHistory} hitSlop={8}>
                  <Text style={{ fontSize: fs.xs, color: t.muted }}>クリア</Text>
                </Pressable>
              </View>
              <View style={{ flexDirection: "row", flexWrap: "wrap", gap: SPACE.sm }}>
                {history.map((h) => (
                  <Pressable
                    key={h}
                    onPress={() => handleQueryChange(h)}
                    style={({ pressed }) => ({
                      flexDirection: "row",
                      alignItems: "center",
                      gap: 4,
                      paddingHorizontal: SPACE.md,
                      paddingVertical: SPACE.sm,
                      borderRadius: RADIUS.full,
                      backgroundColor: t.surface2,
                      borderWidth: 1,
                      borderColor: t.border,
                      opacity: pressed ? 0.7 : 1,
                    })}
                  >
                    <Search size={12} color={t.muted} />
                    <Text style={{ fontSize: fs.sm, color: t.text }}>{h}</Text>
                  </Pressable>
                ))}
              </View>
            </View>
          )}

          {/* サジェストチップ（S-2: 動的） */}
          <SuggestionChips t={t} onSelect={handleQueryChange} suggestions={dynamicSuggestions} />

          {/* クイックアクション（S-3） */}
          <QuickActions t={t} isDark={isDark} onSelect={handleQueryChange} />

          {/* 急上昇セクション（S-8: 空状態対応） */}
          <TrendingSection posts={trendingPosts} t={t} />

          {/* 今日終了（S-5: 情報密度） */}
          {endingToday.length > 0 && (
            <View style={{ marginBottom: SPACE.xl }}>
              <View style={[s.rowBetween, { marginBottom: SPACE.sm + 2 }]}>
                <View style={[s.row, { gap: 5 }]}>
                  <Zap size={15} color={t.amber} />
                  <Text style={s.textBodyBold}>今日終了</Text>
                </View>
                <Text style={[s.textCaption, { color: t.amber }]}>お見逃しなく</Text>
              </View>
              <View style={{ gap: SPACE.sm + 2 }}>
                {endingToday.map((ev, i) => (
                  <Animated.View key={ev.id} entering={FadeInUp.delay(Math.min(i * 60, 300)).duration(350)}>
                    <PulseEventCard event={ev} t={t} />
                  </Animated.View>
                ))}
              </View>
            </View>
          )}

          {/* 週間ランキング */}
          <WeeklyRanking posts={weeklyRanking} t={t} />

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

/** ひとこと検索結果カード */
function TalkSearchCard({ talk, t, fs }: { talk: Talk; t: any; fs: any }) {
  return (
    <Pressable
      onPress={() => router.push(`/talk-detail/${talk.id}` as any)}
      style={({ pressed }) => ({
        flexDirection: "row", gap: SPACE.md, padding: SPACE.md,
        borderRadius: RADIUS.lg, backgroundColor: t.surface,
        borderWidth: 1, borderColor: t.border,
        opacity: pressed ? 0.7 : 1,
      })}
    >
      <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: t.blue + "15", alignItems: "center", justifyContent: "center" }}>
        <MessageSquare size={18} color={t.blue} />
      </View>
      <View style={{ flex: 1 }}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: SPACE.xs, marginBottom: SPACE.xs }}>
          <Text style={{ fontSize: fs.sm, fontWeight: WEIGHT.bold, color: t.text }} numberOfLines={1}>
            {talk.author?.display_name ?? "ユーザー"}
          </Text>
          {talk.is_hall_of_fame && (
            <View style={{ flexDirection: "row", alignItems: "center", gap: 2, borderRadius: RADIUS.sm, paddingHorizontal: 4, paddingVertical: 1, backgroundColor: "#FFD700" + "20" }}>
              <Trophy size={9} color="#FFD700" />
            </View>
          )}
          <Text style={{ fontSize: fs.xxs, color: t.muted }}>{timeAgo(talk.created_at)}</Text>
        </View>
        <Text style={{ fontSize: fs.base, color: t.text, lineHeight: 20 }} numberOfLines={2}>
          {talk.message}
        </Text>
        {talk.likes_count > 0 && (
          <View style={{ flexDirection: "row", alignItems: "center", gap: 3, marginTop: SPACE.xs }}>
            <Heart size={12} color={t.muted} />
            <Text style={{ fontSize: fs.xxs, color: t.muted }}>{talk.likes_count}</Text>
          </View>
        )}
      </View>
    </Pressable>
  );
}

/** 検索結果なし表示 */
function EmptySearchView({ query, t, fs, onSuggest }: { query: string; t: any; fs: any; onSuggest: (q: string) => void }) {
  return (
    <View style={{ paddingVertical: SPACE.xxxl, alignItems: "center" }}>
      <Inbox size={40} color={t.muted} />
      <Text style={{ fontSize: fs.base, fontWeight: WEIGHT.semibold, color: t.sub, marginTop: SPACE.md, textAlign: "center" }}>
        「{query}」に一致する投稿が見つかりませんでした
      </Text>
      <Text style={{ fontSize: fs.sm, color: t.muted, textAlign: "center", marginTop: SPACE.sm }}>
        別のキーワードを試してみてください
      </Text>
      <View style={{ marginTop: SPACE.xl }}>
        <SuggestionChips t={t} onSelect={onSuggest} />
      </View>
    </View>
  );
}
