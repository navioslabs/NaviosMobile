import { SectionList, View, Text, FlatList, RefreshControl, Pressable, ActivityIndicator } from "react-native";
import { useMemo, useEffect, useRef, useState, useCallback } from "react";
import PostPreviewSheet from "@/components/ui/PostPreviewSheet";
import Animated, { FadeInDown, FadeOutUp, useSharedValue, useAnimatedStyle, withSequence, withTiming } from "react-native-reanimated";
import { useIsFocused } from "@react-navigation/native";
import { useQueryClient } from "@tanstack/react-query";
import { MapPin, ArrowLeft, Clock, Radio, PenLine, Inbox } from "@/lib/icons";
import { router } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { useNearbyPosts, usePosts } from "@/hooks/usePosts";
import { useLocation } from "@/hooks/useLocation";
import { haversineDistance } from "@/lib/utils";
import { isExpired, calcMatchScore } from "@/lib/adapters";
import type { Post } from "@/types";
import { useAppStyles } from "@/hooks/useAppStyles";
import { SPACE, WEIGHT, RADIUS } from "@/lib/styles";
import ScanHeader from "@/components/features/nearby/ScanHeader";
import NearbyPostItem from "@/components/features/nearby/NearbyPostItem";
import DistanceSectionHeader from "@/components/features/nearby/DistanceSectionHeader";
import StateView from "@/components/ui/StateView";
import DatePicker from "@/components/features/feed/DatePicker";
import FeedSummary from "@/components/features/feed/FeedSummary";
import CategoryChips from "@/components/features/feed/CategoryChips";
import FeedPostCard from "@/components/features/feed/FeedPostCard";
import { REFETCH_THRESHOLD_M } from "@/constants/location";

type ViewMode = "nearby" | "feed";
type FilterType = "top" | "nearby" | "urgent" | null;

interface NearbySection {
  title: string;
  color: string;
  data: Post[];
}

const getDateLabel = (offset: number): string => {
  if (offset === 0) return "📍 今日 • 越谷市";
  if (offset === 1) return "📅 明日";
  const d = new Date();
  d.setDate(d.getDate() + offset);
  return `📅 ${d.getMonth() + 1}/${d.getDate()}`;
};

/** モード切替タブ */
function ModeSwitch({ mode, onChangeMode, t, fs }: { mode: ViewMode; onChangeMode: (m: ViewMode) => void; t: any; fs: any }) {
  return (
    <View style={{ flexDirection: "row", marginHorizontal: SPACE.xl, marginVertical: SPACE.sm, backgroundColor: t.surface2, borderRadius: RADIUS.full, padding: 3 }}>
      {([
        { id: "nearby" as const, label: "ちかく", icon: Radio },
        { id: "feed" as const, label: "フィード", icon: PenLine },
      ]).map((tab) => {
        const active = mode === tab.id;
        const Icon = tab.icon;
        return (
          <Pressable
            key={tab.id}
            onPress={() => onChangeMode(tab.id)}
            style={{
              flex: 1,
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
              gap: SPACE.xs,
              paddingVertical: SPACE.sm,
              borderRadius: RADIUS.full,
              backgroundColor: active ? t.accent : "transparent",
            }}
          >
            <Icon size={14} color={active ? "#000" : t.sub} />
            <Text style={{ fontSize: fs.sm, fontWeight: WEIGHT.bold, color: active ? "#000" : t.sub }}>
              {tab.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

/** メイン画面（ちかく + フィード統合） */
export default function HomeScreen() {
  const { s, t, fs, isDark } = useAppStyles();
  const isFocused = useIsFocused();
  const qc = useQueryClient();
  const listRef = useRef<SectionList<Post>>(null);

  const [viewMode, setViewMode] = useState<ViewMode>("nearby");

  // ── ちかくモード用 ──
  const { lat, lng, isLoading: locationLoading, granted, isWatching } = useLocation({
    watch: isFocused,
  });

  const {
    data: serverPosts,
    isLoading: nearbyQueryLoading,
    isFetching: nearbyFetching,
    refetch: nearbyRefetch,
    dataUpdatedAt,
  } = useNearbyPosts(lat, lng);

  const nearbyLoading = locationLoading || nearbyQueryLoading;

  const [displayPosts, setDisplayPosts] = useState<Post[]>([]);
  const [pendingPosts, setPendingPosts] = useState<Post[] | null>(null);
  const [showNewBanner, setShowNewBanner] = useState(false);
  const [previewPost, setPreviewPost] = useState<Post | null>(null);

  const scoreBarPulse = useSharedValue(1);
  const scoreBarStyle = useAnimatedStyle(() => ({
    transform: [{ scaleX: scoreBarPulse.value }],
  }));

  const isInitialLoad = useRef(true);

  useEffect(() => {
    if (!serverPosts) return;
    if (isInitialLoad.current) {
      setDisplayPosts(serverPosts);
      isInitialLoad.current = false;
      return;
    }
    const currentIds = new Set(displayPosts.map((p) => p.id));
    const newIds = serverPosts.map((p) => p.id);
    const hasNew = newIds.some((id) => !currentIds.has(id));
    const countChanged = serverPosts.length !== displayPosts.length;
    if (hasNew || countChanged) {
      setPendingPosts(serverPosts);
      setShowNewBanner(true);
      requestAnimationFrame(() => {
        scoreBarPulse.value = withSequence(
          withTiming(1.15, { duration: 200 }),
          withTiming(1.0, { duration: 300 }),
        );
      });
    } else {
      setDisplayPosts(serverPosts);
    }
  }, [serverPosts]);

  const applyPendingPosts = useCallback(() => {
    if (pendingPosts) {
      setDisplayPosts(pendingPosts);
      setPendingPosts(null);
    }
    setShowNewBanner(false);
    try {
      listRef.current?.scrollToLocation({ sectionIndex: 0, itemIndex: 0, animated: true });
    } catch {
      // セクションが空の場合は無視
    }
  }, [pendingPosts]);

  const nearbyPosts = displayPosts;

  const lastQueryCoords = useRef({ lat: 0, lng: 0 });
  useEffect(() => {
    if (lat === 0 && lng === 0) return;
    const d = haversineDistance(lat, lng, lastQueryCoords.current.lat, lastQueryCoords.current.lng);
    if (d >= REFETCH_THRESHOLD_M || lastQueryCoords.current.lat === 0) {
      lastQueryCoords.current = { lat, lng };
      qc.invalidateQueries({ queryKey: ["posts", "nearby"] });
    }
  }, [lat, lng, qc]);

  const activePosts = useMemo(() => nearbyPosts.filter((p) => !isExpired(p.deadline)), [nearbyPosts]);

  const sections: NearbySection[] = useMemo(() => {
    const byScore = (a: Post, b: Post) =>
      calcMatchScore(b.distance_m ?? 0, b.deadline) - calcMatchScore(a.distance_m ?? 0, a.deadline);
    const close = activePosts.filter((p) => (p.distance_m ?? 0) <= 200).sort(byScore);
    const mid = activePosts.filter((p) => (p.distance_m ?? 0) > 200 && (p.distance_m ?? 0) <= 500).sort(byScore);
    const far = activePosts.filter((p) => (p.distance_m ?? 0) > 500).sort(byScore);
    const result: NearbySection[] = [];
    result.push({ title: "すぐ近く（200m以内）", color: "#00D4A1", data: close });
    if (mid.length > 0) result.push({ title: "徒歩圏内（500m以内）", color: "#F5A623", data: mid });
    if (far.length > 0) result.push({ title: "その他", color: "#8887A0", data: far });
    return result;
  }, [activePosts]);

  const closeCount = sections[0]?.data.length ?? 0;
  const oneHourAgo = Date.now() - 3600000;
  const recentCount = activePosts.filter((p) => new Date(p.created_at).getTime() > oneHourAgo).length;
  const urgentCount = activePosts.filter((p) => {
    if (!p.deadline) return false;
    const left = (new Date(p.deadline).getTime() - Date.now()) / 60000;
    return left > 0 && left <= 60;
  }).length;

  // ── フィードモード用 ──
  const [selDate, setSelDate] = useState(0);
  const [selCat, setSelCat] = useState("all");
  const [summaryFilter, setSummaryFilter] = useState<FilterType>(null);

  const dateRange = useMemo(() => {
    const now = new Date();
    if (selDate === 0) {
      const after = new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString();
      return { createdAfter: after };
    }
    if (selDate === 1) {
      const after = new Date(now.getTime() - 48 * 60 * 60 * 1000).toISOString();
      const before = new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString();
      return { createdAfter: after, createdBefore: before };
    }
    const after = new Date(now.getTime() - (selDate + 1) * 24 * 60 * 60 * 1000).toISOString();
    const before = new Date(now.getTime() - selDate * 24 * 60 * 60 * 1000).toISOString();
    return { createdAfter: after, createdBefore: before };
  }, [selDate]);

  const { data: feedData, isLoading: feedQueryLoading, isFetching: feedFetching, refetch: feedRefetch, fetchNextPage, hasNextPage, isFetchingNextPage } = usePosts({
    category: selCat === "all" ? undefined : selCat,
    ...dateRange,
  });

  const datePosts: Post[] = feedData?.flat ?? [];

  const feedFiltered = useMemo(() => {
    let posts = datePosts;
    if (summaryFilter === "top") {
      posts = [...posts].sort((a, b) => b.likes_count - a.likes_count);
    } else if (summaryFilter === "nearby") {
      posts = posts.filter((p) => (p.distance_m ?? Infinity) <= 200);
    } else if (summaryFilter === "urgent") {
      posts = [...posts]
        .filter((p) => !isExpired(p.deadline))
        .sort((a, b) => {
          const aTime = a.deadline ? new Date(a.deadline).getTime() : Infinity;
          const bTime = b.deadline ? new Date(b.deadline).getTime() : Infinity;
          return aTime - bTime;
        });
    }
    const active = posts.filter((p) => !isExpired(p.deadline));
    const expired = posts.filter((p) => isExpired(p.deadline));
    return [...active, ...expired];
  }, [datePosts, selCat, summaryFilter]);

  const getPostCount = useCallback((offset: number) => offset === selDate ? datePosts.length : 0, [selDate, datePosts]);

  const renderFeedItem = useCallback(
    ({ item, index }: { item: Post; index: number }) => (
      <FeedPostCard post={item} t={t} isDark={isDark} featured={index === 0 && !isExpired(item.deadline)} expired={isExpired(item.deadline)} onLongPress={() => setPreviewPost(item)} />
    ),
    [t, isDark],
  );

  // ── 位置情報未許可時（ちかくモード） ──
  if (viewMode === "nearby" && !locationLoading && !granted) {
    return (
      <View style={s.screen}>
        <ModeSwitch mode={viewMode} onChangeMode={setViewMode} t={t} fs={fs} />
        <ScanHeader t={t} isDark={isDark} postCount={0} />
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: SPACE.xl }}>
          <MapPin size={48} color={t.muted} />
          <Text style={{ fontSize: fs.lg, fontWeight: WEIGHT.bold, color: t.text, marginTop: SPACE.lg, textAlign: "center" }}>
            位置情報を許可すると{"\n"}近くの情報が表示されます
          </Text>
          <Text style={{ fontSize: fs.sm, color: t.sub, marginTop: SPACE.sm, textAlign: "center" }}>
            設定アプリから位置情報の許可をONにしてください
          </Text>
        </View>
      </View>
    );
  }

  // ── ちかくモード: ローディング ──
  if (viewMode === "nearby" && nearbyLoading) {
    return (
      <View style={s.screen}>
        <ModeSwitch mode={viewMode} onChangeMode={setViewMode} t={t} fs={fs} />
        <ScanHeader t={t} isDark={isDark} postCount={0} isWatching={isWatching} />
        <StateView t={t} type="loading" />
      </View>
    );
  }

  // ── フィードモード ──
  if (viewMode === "feed") {
    const FeedListHeader = (
      <>
        <FeedSummary
          t={t}
          posts={datePosts}
          dateLabel={getDateLabel(selDate)}
          totalCount={feedFiltered.length}
          activeFilter={summaryFilter}
          onFilterChange={setSummaryFilter}
        />
        <CategoryChips t={t} selected={selCat} onSelect={setSelCat} />
      </>
    );

    return (
      <View style={s.screen}>
        <ModeSwitch mode={viewMode} onChangeMode={setViewMode} t={t} fs={fs} />
        <DatePicker t={t} selectedDate={selDate} onSelectDate={setSelDate} getPostCount={getPostCount} />

        {feedFiltered.length === 0 ? (
          <View style={{ flex: 1 }}>
            {FeedListHeader}
            <View style={{ paddingVertical: 60, paddingHorizontal: SPACE.xl, alignItems: "center" }}>
              <Inbox size={40} color={t.muted} />
              <Text style={[s.textSubheading, { marginTop: SPACE.md, color: t.text }]}>この日の投稿はまだありません</Text>
              <Text style={[s.textLabel, { marginTop: SPACE.xs, color: t.sub }]}>他の日付を選ぶか、投稿してみましょう</Text>
              <View style={{ flexDirection: "row", gap: SPACE.md, marginTop: SPACE.xl }}>
                <Pressable
                  onPress={() => setSelDate(0)}
                  style={({ pressed }) => ({ paddingHorizontal: SPACE.xl, paddingVertical: SPACE.md, borderRadius: RADIUS.full, backgroundColor: t.surface2, borderWidth: 1, borderColor: t.border, opacity: pressed ? 0.7 : 1 })}
                >
                  <Text style={{ fontSize: fs.sm, fontWeight: WEIGHT.bold, color: t.text }}>今日を見る</Text>
                </Pressable>
                <Pressable
                  onPress={() => router.push("/post")}
                  style={({ pressed }) => ({ opacity: pressed ? 0.8 : 1 })}
                >
                  <LinearGradient
                    colors={[t.accent, t.blue]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={{ paddingHorizontal: SPACE.xl, paddingVertical: SPACE.md, borderRadius: RADIUS.full }}
                  >
                    <Text style={{ fontSize: fs.sm, fontWeight: WEIGHT.bold, color: "#000" }}>投稿する</Text>
                  </LinearGradient>
                </Pressable>
              </View>
            </View>
          </View>
        ) : (
          <FlatList
            data={feedFiltered}
            renderItem={renderFeedItem}
            keyExtractor={(item) => item.id.toString()}
            showsVerticalScrollIndicator={false}
            ListHeaderComponent={FeedListHeader}
            contentContainerStyle={{ paddingBottom: 90 }}
            onEndReached={() => {
              if (hasNextPage && !isFetchingNextPage) fetchNextPage();
            }}
            onEndReachedThreshold={0.5}
            ListFooterComponent={
              isFetchingNextPage ? (
                <View style={{ paddingVertical: SPACE.xl, alignItems: "center" }}>
                  <ActivityIndicator size="small" color={t.accent} />
                </View>
              ) : null
            }
            refreshControl={
              <RefreshControl
                refreshing={feedFetching && !feedQueryLoading && !isFetchingNextPage}
                onRefresh={() => feedRefetch()}
                tintColor={t.accent}
                colors={[t.accent]}
                progressBackgroundColor={t.surface}
              />
            }
          />
        )}

        <PostPreviewSheet
          post={previewPost}
          visible={!!previewPost}
          onClose={() => setPreviewPost(null)}
          t={t}
          isDark={isDark}
        />
      </View>
    );
  }

  // ── ちかくモード（デフォルト） ──
  return (
    <View style={s.screen}>
      <ModeSwitch mode={viewMode} onChangeMode={setViewMode} t={t} fs={fs} />
      <ScanHeader
        t={t}
        isDark={isDark}
        postCount={activePosts.length}
        closeCount={closeCount}
        recentCount={recentCount}
        urgentCount={urgentCount}
        dataUpdatedAt={dataUpdatedAt}
        isWatching={isWatching}
        scoreBarAnimStyle={scoreBarStyle}
      />

      {/* 街の記憶ボタン */}
      <Pressable
        onPress={() => router.push("/street-history")}
        style={({ pressed }) => ({
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "center",
          gap: SPACE.sm,
          marginHorizontal: SPACE.xl,
          marginTop: SPACE.sm,
          paddingVertical: SPACE.sm,
          borderRadius: RADIUS.lg,
          backgroundColor: t.surface,
          borderWidth: 1,
          borderColor: t.border,
          opacity: pressed ? 0.7 : 1,
        })}
      >
        <Clock size={14} color={t.accent} />
        <Text style={{ fontSize: fs.sm, fontWeight: WEIGHT.semibold, color: t.accent }}>この場所の記憶を見る</Text>
      </Pressable>

      {/* 新着バナー */}
      {showNewBanner && (
        <Animated.View entering={FadeInDown.duration(300).springify()} exiting={FadeOutUp.duration(200)}>
          <Pressable
            onPress={applyPendingPosts}
            accessibilityLabel="新しい投稿を表示する"
            accessibilityRole="button"
            style={({ pressed }) => ({
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
              gap: SPACE.sm,
              marginHorizontal: SPACE.xl,
              marginVertical: SPACE.sm,
              paddingVertical: SPACE.sm + 2,
              borderRadius: RADIUS.full,
              backgroundColor: t.accent,
              opacity: pressed ? 0.8 : 1,
              shadowColor: t.accent,
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.3,
              shadowRadius: 8,
              elevation: 4,
            })}
          >
            <ArrowLeft size={14} color="#000" style={{ transform: [{ rotate: "90deg" }] }} />
            <Text style={{ fontSize: fs.sm, fontWeight: WEIGHT.bold, color: "#000" }}>
              新しい投稿があります
            </Text>
          </Pressable>
        </Animated.View>
      )}

      <SectionList
        ref={listRef}
        sections={sections}
        keyExtractor={(item) => item.id}
        renderItem={({ item, index, section }) => {
          const isFeatured = section === sections[0] && index === 0;
          return <NearbyPostItem post={item} t={t} featured={isFeatured} isDark={isDark} onLongPress={() => setPreviewPost(item)} />;
        }}
        renderSectionHeader={({ section }) => (
          <DistanceSectionHeader title={section.title} count={section.data.length} color={section.color} t={t} />
        )}
        renderSectionFooter={({ section }) =>
          section.data.length === 0 ? (
            <View style={{ paddingVertical: SPACE.xl, paddingHorizontal: SPACE.xl, alignItems: "center" }}>
              <Text style={{ fontSize: fs.base, color: t.sub, textAlign: "center" }}>
                歩いているうちに{"\n"}近い投稿が見つかるかもしれません
              </Text>
            </View>
          ) : null
        }
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
        stickySectionHeadersEnabled={false}
        refreshControl={
          <RefreshControl
            refreshing={nearbyFetching && !showNewBanner}
            onRefresh={() => {
              applyPendingPosts();
              nearbyRefetch();
            }}
            tintColor={t.accent}
            colors={[t.accent]}
            progressBackgroundColor={t.surface}
          />
        }
      />

      <PostPreviewSheet
        post={previewPost}
        visible={!!previewPost}
        onClose={() => setPreviewPost(null)}
        t={t}
        isDark={isDark}
      />
    </View>
  );
}
