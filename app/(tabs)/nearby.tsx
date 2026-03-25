import { SectionList, View, Text } from "react-native";
import { useMemo } from "react";
import { makeTokens } from "@/constants/theme";
import { useThemeStore } from "@/stores/themeStore";
import { NEARBY_POSTS } from "@/data/mockData";
import type { NearbyPost } from "@/types";
import { createStyles, FONT_SIZE, SPACE } from "@/lib/styles";
import ScanHeader from "@/components/features/nearby/ScanHeader";
import NearbyPostItem from "@/components/features/nearby/NearbyPostItem";
import DistanceSectionHeader from "@/components/features/nearby/DistanceSectionHeader";
import StateView from "@/components/ui/StateView";

interface NearbySection {
  title: string;
  color: string;
  data: NearbyPost[];
}

/** NearBy画面 */
export default function NearByScreen() {
  const { isDark } = useThemeStore();
  const t = makeTokens(isDark);
  const s = createStyles(t);

  const sections: NearbySection[] = useMemo(() => {
    const sorted = [...NEARBY_POSTS].sort((a, b) => a.distance - b.distance);
    const close = sorted.filter((p) => p.distance <= 200);
    const mid = sorted.filter((p) => p.distance > 200 && p.distance <= 500);
    const far = sorted.filter((p) => p.distance > 500);

    const result: NearbySection[] = [];
    result.push({ title: "すぐ近く（200m以内）", color: "#00D4A1", data: close });
    if (mid.length > 0) result.push({ title: "徒歩圏内（500m以内）", color: "#F5A623", data: mid });
    if (far.length > 0) result.push({ title: "その他", color: "#8887A0", data: far });
    return result;
  }, []);

  return (
    <View style={s.screen}>
      <ScanHeader t={t} isDark={isDark} postCount={NEARBY_POSTS.length} />
      <SectionList
        sections={sections}
        keyExtractor={(item) => item.id.toString()}
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
              <Text style={{ fontSize: FONT_SIZE.base, color: t.sub, textAlign: "center" }}>
                200m以内にイベントはありません{"\n"}少し足を伸ばしてみましょう
              </Text>
            </View>
          ) : null
        }
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
        stickySectionHeadersEnabled={false}
      />
    </View>
  );
}
