import { SectionList, View, Text, RefreshControl } from "react-native";
import { useMemo } from "react";
import { useNearbyPosts } from "@/hooks/usePosts";
import { useLocation } from "@/hooks/useLocation";
import type { Post } from "@/types";
import { useAppStyles } from "@/hooks/useAppStyles";
import { SPACE } from "@/lib/styles";
import ScanHeader from "@/components/features/nearby/ScanHeader";
import NearbyPostItem from "@/components/features/nearby/NearbyPostItem";
import DistanceSectionHeader from "@/components/features/nearby/DistanceSectionHeader";
import StateView from "@/components/ui/StateView";

interface NearbySection {
  title: string;
  color: string;
  data: Post[];
}

/** NearBy画面 */
export default function NearByScreen() {
  const { s, t, fs, isDark } = useAppStyles();
  const { lat, lng, isLoading: locationLoading, error: locationError } = useLocation();
  const { data: serverPosts, isLoading: queryLoading, refetch } = useNearbyPosts(lat, lng);

  const isLoading = locationLoading || queryLoading;

  const nearbyPosts: Post[] = serverPosts ?? [];

  const sections: NearbySection[] = useMemo(() => {
    const sorted = [...nearbyPosts].sort((a, b) => (a.distance_m ?? 0) - (b.distance_m ?? 0));
    const close = sorted.filter((p) => (p.distance_m ?? 0) <= 200);
    const mid = sorted.filter((p) => (p.distance_m ?? 0) > 200 && (p.distance_m ?? 0) <= 500);
    const far = sorted.filter((p) => (p.distance_m ?? 0) > 500);

    const result: NearbySection[] = [];
    result.push({ title: "すぐ近く（200m以内）", color: "#00D4A1", data: close });
    if (mid.length > 0) result.push({ title: "徒歩圏内（500m以内）", color: "#F5A623", data: mid });
    if (far.length > 0) result.push({ title: "その他", color: "#8887A0", data: far });
    return result;
  }, [nearbyPosts]);

  if (isLoading) {
    return (
      <View style={s.screen}>
        <ScanHeader t={t} isDark={isDark} postCount={0} />
        <StateView t={t} type="loading" />
      </View>
    );
  }

  return (
    <View style={s.screen}>
      <ScanHeader t={t} isDark={isDark} postCount={nearbyPosts.length} />
      <SectionList
        sections={sections}
        keyExtractor={(item, index) => `${item.title}-${index}`}
        renderItem={({ item, index, section }) => {
          const isFeatured = section === sections[0] && index === 0;
          return <NearbyPostItem post={item} t={t} featured={isFeatured} isDark={isDark} index={index} />;
        }}
        renderSectionHeader={({ section }) => (
          <DistanceSectionHeader title={section.title} count={section.data.length} color={section.color} t={t} />
        )}
        renderSectionFooter={({ section }) =>
          section.data.length === 0 ? (
            <View style={{ paddingVertical: SPACE.xl, paddingHorizontal: SPACE.xl, alignItems: "center" }}>
              <Text style={{ fontSize: fs.base, color: t.sub, textAlign: "center" }}>
                200m以内にイベントはありません{"\n"}少し足を伸ばしてみましょう
              </Text>
            </View>
          ) : null
        }
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
        stickySectionHeadersEnabled={false}
        refreshControl={
          <RefreshControl
            refreshing={queryLoading}
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
