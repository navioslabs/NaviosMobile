import { FlatList, View, StyleSheet } from "react-native";
import { useCallback } from "react";
import { makeTokens } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { NEARBY_POSTS } from "@/data/mockData";
import type { NearbyPost } from "@/types";
import ScanHeader from "@/components/features/nearby/ScanHeader";
import NearbyPostItem from "@/components/features/nearby/NearbyPostItem";

/** NearBy画面 */
export default function NearByScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const t = makeTokens(isDark);

  const sorted = [...NEARBY_POSTS].sort((a, b) => a.distance - b.distance);

  const renderItem = useCallback(
    ({ item }: { item: NearbyPost }) => <NearbyPostItem post={item} t={t} />,
    [t]
  );

  return (
    <View style={[styles.container, { backgroundColor: t.bg }]}>
      <ScanHeader t={t} isDark={isDark} postCount={sorted.length} />
      <FlatList
        data={sorted}
        renderItem={renderItem}
        keyExtractor={(item) => item.id.toString()}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.list}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  list: { paddingHorizontal: 12, paddingBottom: 100 },
});
