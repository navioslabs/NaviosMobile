import { SectionList, View, Text, RefreshControl, Pressable } from "react-native";
import { useMemo, useEffect, useRef } from "react";
import { useIsFocused } from "@react-navigation/native";
import { useQueryClient } from "@tanstack/react-query";
import { MapPin } from "@/lib/icons";
import { useNearbyPosts } from "@/hooks/usePosts";
import { useLocation } from "@/hooks/useLocation";
import { haversineDistance } from "@/lib/utils";
import type { Post } from "@/types";
import { useAppStyles } from "@/hooks/useAppStyles";
import { SPACE, WEIGHT } from "@/lib/styles";
import ScanHeader from "@/components/features/nearby/ScanHeader";
import NearbyPostItem from "@/components/features/nearby/NearbyPostItem";
import DistanceSectionHeader from "@/components/features/nearby/DistanceSectionHeader";
import StateView from "@/components/ui/StateView";

interface NearbySection {
  title: string;
  color: string;
  data: Post[];
}

/** 100m 閾値で再取得をトリガーする距離 */
const REFETCH_THRESHOLD_M = 100;

/** NearBy画面 */
export default function NearByScreen() {
  const { s, t, fs, isDark } = useAppStyles();
  const isFocused = useIsFocused();
  const qc = useQueryClient();

  // タブがアクティブなときだけ watch モード
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
  const nearbyPosts: Post[] = serverPosts ?? [];

  // ── 100m 閾値で自動再取得 ──
  const lastQueryCoords = useRef({ lat: 0, lng: 0 });

  useEffect(() => {
    if (lat === 0 && lng === 0) return;
    const d = haversineDistance(
      lat,
      lng,
      lastQueryCoords.current.lat,
      lastQueryCoords.current.lng
    );
    if (d >= REFETCH_THRESHOLD_M || lastQueryCoords.current.lat === 0) {
      lastQueryCoords.current = { lat, lng };
      qc.invalidateQueries({ queryKey: ["posts", "nearby"] });
    }
  }, [lat, lng, qc]);

  // ── セクション分け ──
  const sections: NearbySection[] = useMemo(() => {
    const sorted = [...nearbyPosts].sort(
      (a, b) => (a.distance_m ?? 0) - (b.distance_m ?? 0)
    );
    const close = sorted.filter((p) => (p.distance_m ?? 0) <= 200);
    const mid = sorted.filter(
      (p) => (p.distance_m ?? 0) > 200 && (p.distance_m ?? 0) <= 500
    );
    const far = sorted.filter((p) => (p.distance_m ?? 0) > 500);

    const result: NearbySection[] = [];
    result.push({ title: "すぐ近く（200m以内）", color: "#00D4A1", data: close });
    if (mid.length > 0)
      result.push({ title: "徒歩圏内（500m以内）", color: "#F5A623", data: mid });
    if (far.length > 0)
      result.push({ title: "その他", color: "#8887A0", data: far });
    return result;
  }, [nearbyPosts]);

  // Pulse スコア用の集計
  const closeCount = sections[0]?.data.length ?? 0;
  const oneHourAgo = Date.now() - 3600000;
  const recentCount = nearbyPosts.filter(
    (p) => new Date(p.created_at).getTime() > oneHourAgo
  ).length;

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
        postCount={nearbyPosts.length}
        closeCount={closeCount}
        recentCount={recentCount}
        dataUpdatedAt={dataUpdatedAt}
        isWatching={isWatching}
      />
      <SectionList
        sections={sections}
        keyExtractor={(item) => item.id}
        renderItem={({ item, index, section }) => {
          const isFeatured = section === sections[0] && index === 0;
          return (
            <NearbyPostItem
              post={item}
              t={t}
              featured={isFeatured}
              isDark={isDark}
            />
          );
        }}
        renderSectionHeader={({ section }) => (
          <DistanceSectionHeader
            title={section.title}
            count={section.data.length}
            color={section.color}
            t={t}
          />
        )}
        renderSectionFooter={({ section }) =>
          section.data.length === 0 ? (
            <View
              style={{
                paddingVertical: SPACE.xl,
                paddingHorizontal: SPACE.xl,
                alignItems: "center",
              }}
            >
              <Text
                style={{
                  fontSize: fs.base,
                  color: t.sub,
                  textAlign: "center",
                }}
              >
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
            refreshing={isFetching}
            onRefresh={() => refetch()}
            tintColor={t.accent}
            colors={[t.accent]}
            progressBackgroundColor={t.surface}
          />
        }
      />
    </View>
  );
}
