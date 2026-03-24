import { FlatList, View } from "react-native";
import { useCallback } from "react";
import { makeTokens } from "@/constants/theme";
import { useThemeStore } from "@/stores/themeStore";
import { NEARBY_POSTS } from "@/data/mockData";
import type { NearbyPost } from "@/types";
import ScanHeader from "@/components/features/nearby/ScanHeader";
import NearbyPostItem from "@/components/features/nearby/NearbyPostItem";

/** NearBy画面 */
export default function NearByScreen() {
  const { isDark } = useThemeStore();
  const t = makeTokens(isDark);

  const sorted = [...NEARBY_POSTS].sort((a, b) => a.distance - b.distance);

  const renderItem = useCallback(
    ({ item }: { item: NearbyPost }) => <NearbyPostItem post={item} t={t} />,
    [t]
  );

  return (
    <View className="flex-1" style={{ backgroundColor: t.bg }}>
      <ScanHeader t={t} isDark={isDark} postCount={sorted.length} />
      <FlatList
        data={sorted}
        renderItem={renderItem}
        keyExtractor={(item) => item.id.toString()}
        showsVerticalScrollIndicator={false}
        contentContainerClassName="px-3 pb-[100px]"
      />
    </View>
  );
}
