import { SectionList, View, Text, RefreshControl, Pressable } from "react-native";
import { useMemo, useEffect, useRef, useState, useCallback } from "react";
import Animated, { FadeInDown, FadeOutUp, useSharedValue, useAnimatedStyle, withSequence, withTiming } from "react-native-reanimated";
import { useIsFocused } from "@react-navigation/native";
import { useQueryClient } from "@tanstack/react-query";
import { MapPin, ArrowLeft } from "@/lib/icons";
import { useNearbyPosts } from "@/hooks/usePosts";
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

interface NearbySection {
  title: string;
  color: string;
  data: Post[];
}

const REFETCH_THRESHOLD_M = 100;

/** NearBy画面 */
export default function NearByScreen() {
  const { s, t, fs, isDark } = useAppStyles();
  const isFocused = useIsFocused();
  const qc = useQueryClient();
  const listRef = useRef<SectionList<Post>>(null);

  const { lat, lng, isLoading: locationLoading, granted, isWatching } = useLocation({
    watch: isFocused,
  });

  const {
    data: serverPosts,
    isLoading: queryLoading,
    isFetching,
    refetch,
    dataUpdatedAt,
  } = useNearbyPosts(lat, lng);

  const isLoading = locationLoading || queryLoading;

  // ── 表示データの管理（新着バナー用） ──
  const [displayPosts, setDisplayPosts] = useState<Post[]>([]);
  const [pendingPosts, setPendingPosts] = useState<Post[] | null>(null);
  const [showNewBanner, setShowNewBanner] = useState(false);

  // スコアバーパルス用
  const scoreBarPulse = useSharedValue(1);
  const scoreBarStyle = useAnimatedStyle(() => ({
    transform: [{ scaleX: scoreBarPulse.value }],
  }));

  // 初回ロード時はそのまま表示
  const isInitialLoad = useRef(true);

  useEffect(() => {
    if (!serverPosts) return;

    if (isInitialLoad.current) {
      // 初回: そのまま表示
      setDisplayPosts(serverPosts);
      isInitialLoad.current = false;
      return;
    }

    // 2回目以降: 差分があるか確認
    const currentIds = new Set(displayPosts.map((p) => p.id));
    const newIds = serverPosts.map((p) => p.id);
    const hasNew = newIds.some((id) => !currentIds.has(id));
    const countChanged = serverPosts.length !== displayPosts.length;

    if (hasNew || countChanged) {
      // 新データがある → バナーを表示、まだ反映しない
      setPendingPosts(serverPosts);
      setShowNewBanner(true);
      // スコアバーをパルス（D）
      scoreBarPulse.value = withSequence(
        withTiming(1.15, { duration: 200 }),
        withTiming(1.0, { duration: 300 }),
      );
    } else {
      // 距離の更新のみ（新規投稿なし）→ 静かに反映
      setDisplayPosts(serverPosts);
    }
  }, [serverPosts]);

  /** バナータップ: 最新データを反映 + 先頭スクロール */
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

  // ── 100m 閾値で自動再取得 ──
  const lastQueryCoords = useRef({ lat: 0, lng: 0 });

  useEffect(() => {
    if (lat === 0 && lng === 0) return;
    const d = haversineDistance(lat, lng, lastQueryCoords.current.lat, lastQueryCoords.current.lng);
    if (d >= REFETCH_THRESHOLD_M || lastQueryCoords.current.lat === 0) {
      lastQueryCoords.current = { lat, lng };
      qc.invalidateQueries({ queryKey: ["posts", "nearby"] });
    }
  }, [lat, lng, qc]);

  // ── 期限切れ除外 + セクション分け ──
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

  // ── 位置情報未許可時 ──
  if (!locationLoading && !granted) {
    return (
      <View style={s.screen}>
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

  // ── ローディング ──
  if (isLoading) {
    return (
      <View style={s.screen}>
        <ScanHeader t={t} isDark={isDark} postCount={0} isWatching={isWatching} />
        <StateView t={t} type="loading" />
      </View>
    );
  }

  return (
    <View style={s.screen}>
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

      {/* 新着バナー（E） */}
      {showNewBanner && (
        <Animated.View entering={FadeInDown.duration(300).springify()} exiting={FadeOutUp.duration(200)}>
          <Pressable
            onPress={applyPendingPosts}
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
          return <NearbyPostItem post={item} t={t} featured={isFeatured} isDark={isDark} />;
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
            refreshing={isFetching && !showNewBanner}
            onRefresh={() => {
              applyPendingPosts();
              refetch();
            }}
            tintColor={t.accent}
            colors={[t.accent]}
            progressBackgroundColor={t.surface}
          />
        }
      />
    </View>
  );
}
