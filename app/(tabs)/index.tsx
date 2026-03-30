import { SectionList, View, Text, RefreshControl, Pressable } from "react-native";
import { useMemo, useEffect, useRef, useState } from "react";
import PostPreviewSheet from "@/components/ui/PostPreviewSheet";
import { useIsFocused } from "@react-navigation/native";
import { useQueryClient } from "@tanstack/react-query";
import { MapPin, RefreshCw, Clock, Radio, PenLine } from "@/lib/icons";
import { router } from "expo-router";
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
import { PostCardSkeleton } from "@/components/ui/Skeleton";
import DatePicker from "@/components/features/feed/DatePicker";
import FeedView from "@/components/features/feed/FeedView";
import { REFETCH_THRESHOLD_M } from "@/constants/location";

type ViewMode = "nearby" | "feed";

interface NearbySection {
  title: string;
  color: string;
  data: Post[];
}

const getDateLabel = (offset: number): string => {
  if (offset === 0) return "今日";
  if (offset === 1) return "明日";
  const d = new Date();
  d.setDate(d.getDate() + offset);
  return `${d.getMonth() + 1}/${d.getDate()}`;
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
  const { lat, lng, isLoading: locationLoading, granted, isWatching, placeName } = useLocation({
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

  const [previewPost, setPreviewPost] = useState<Post | null>(null);

  const nearbyPosts = serverPosts ?? [];

  const lastQueryCoords = useRef({ lat: 0, lng: 0 });
  useEffect(() => {
    if (lat === 0 && lng === 0) return;
    const d = haversineDistance(lat, lng, lastQueryCoords.current.lat, lastQueryCoords.current.lng);
    if (d >= REFETCH_THRESHOLD_M || lastQueryCoords.current.lat === 0) {
      lastQueryCoords.current = { lat, lng };
      qc.invalidateQueries({ queryKey: ["posts", "nearby"] });
    }
  }, [lat, lng, qc]);

  const activePosts = useMemo(() => {
    const active = nearbyPosts.filter((p) => !isExpired(p.deadline));
    const expired = nearbyPosts.filter((p) => {
      if (!isExpired(p.deadline)) return false;
      const expiredMs = Date.now() - new Date(p.deadline!).getTime();
      return expiredMs <= 24 * 60 * 60 * 1000;
    });
    return [...active, ...expired];
  }, [nearbyPosts]);

  const sections: NearbySection[] = useMemo(() => {
    const byScore = (a: Post, b: Post) =>
      calcMatchScore(b.distance_m ?? 0, b.deadline) - calcMatchScore(a.distance_m ?? 0, a.deadline);
    const close = activePosts.filter((p) => (p.distance_m ?? 0) <= 300).sort(byScore);
    const mid = activePosts.filter((p) => (p.distance_m ?? 0) > 300 && (p.distance_m ?? 0) <= 600).sort(byScore);
    const far = activePosts.filter((p) => (p.distance_m ?? 0) > 600).sort(byScore);
    const result: NearbySection[] = [];
    result.push({ title: "すぐ近く（300m以内）", color: "#00D4A1", data: close });
    if (mid.length > 0) result.push({ title: "徒歩圏内（600m以内）", color: "#F5A623", data: mid });
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
    const active = datePosts.filter((p) => !isExpired(p.deadline));
    const expired = datePosts.filter((p) => isExpired(p.deadline));
    return [...active, ...expired];
  }, [datePosts]);

  // ── 位置情報未許可時（ちかくモード） ──
  if (viewMode === "nearby" && !locationLoading && !granted) {
    return (
      <View style={s.screen}>
        <ModeSwitch mode={viewMode} onChangeMode={setViewMode} t={t} fs={fs} />
        <ScanHeader t={t} isDark={isDark} postCount={0} placeName={placeName} />
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
        <ScanHeader t={t} isDark={isDark} postCount={0} isWatching={isWatching} placeName={placeName} />
        <View style={{ padding: SPACE.md, gap: SPACE.sm }}>
          <PostCardSkeleton t={t} />
          <PostCardSkeleton t={t} />
          <PostCardSkeleton t={t} />
        </View>
      </View>
    );
  }

  // ── フィードモード ──
  if (viewMode === "feed") {
    return (
      <View style={s.screen}>
        <ModeSwitch mode={viewMode} onChangeMode={setViewMode} t={t} fs={fs} />
        <DatePicker t={t} selectedDate={selDate} onSelectDate={setSelDate} getPostCount={(offset) => offset === selDate ? datePosts.length : 0} />

        <FeedView
          posts={feedFiltered}
          dateLabel={getDateLabel(selDate)}
          selCat={selCat}
          onSelectCat={setSelCat}
          onSelectDate={setSelDate}
          onLongPressPost={setPreviewPost}
          t={t}
          fs={fs}
          isDark={isDark}
          isFetching={feedFetching}
          isLoading={feedQueryLoading}
          isFetchingNextPage={isFetchingNextPage}
          hasNextPage={hasNextPage}
          fetchNextPage={fetchNextPage}
          refetch={feedRefetch}
        />

        <PostPreviewSheet post={previewPost} visible={!!previewPost} onClose={() => setPreviewPost(null)} t={t} isDark={isDark} />
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
        placeName={placeName}
      />

      {/* アクションボタン行 */}
      <View style={{ flexDirection: "row", gap: SPACE.sm, marginHorizontal: SPACE.xl, marginTop: SPACE.sm }}>
        <Pressable
          onPress={() => router.push("/street-history")}
          style={({ pressed }) => ({
            flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center",
            gap: SPACE.sm, paddingVertical: SPACE.sm, borderRadius: RADIUS.lg,
            backgroundColor: t.surface, borderWidth: 1, borderColor: t.border, opacity: pressed ? 0.7 : 1,
          })}
        >
          <Clock size={14} color={t.accent} />
          <Text style={{ fontSize: fs.sm, fontWeight: WEIGHT.semibold, color: t.accent }}>記憶を見る</Text>
        </Pressable>
        <Pressable
          onPress={() => nearbyRefetch()}
          style={({ pressed }) => ({
            flexDirection: "row", alignItems: "center", justifyContent: "center",
            gap: SPACE.xs, paddingVertical: SPACE.sm, paddingHorizontal: SPACE.lg,
            borderRadius: RADIUS.lg, backgroundColor: nearbyFetching ? t.accent + "20" : t.surface,
            borderWidth: 1, borderColor: nearbyFetching ? t.accent + "40" : t.border, opacity: pressed ? 0.7 : 1,
          })}
        >
          <RefreshCw size={14} color={t.accent} />
          <Text style={{ fontSize: fs.sm, fontWeight: WEIGHT.semibold, color: t.accent }}>
            {nearbyFetching ? "更新中" : "更新"}
          </Text>
        </Pressable>
      </View>

      <SectionList
        ref={listRef}
        sections={sections}
        keyExtractor={(item) => item.id}
        renderItem={({ item, index, section }) => {
          const isFeatured = section === sections[0] && index === 0 && !isExpired(item.deadline);
          return <NearbyPostItem post={item} t={t} featured={isFeatured} expired={isExpired(item.deadline)} isDark={isDark} onLongPress={() => setPreviewPost(item)} />;
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
          <RefreshControl refreshing={nearbyFetching} onRefresh={() => nearbyRefetch()} tintColor={t.accent} colors={[t.accent]} progressBackgroundColor={t.surface} />
        }
      />

      <PostPreviewSheet post={previewPost} visible={!!previewPost} onClose={() => setPreviewPost(null)} t={t} isDark={isDark} />
    </View>
  );
}
