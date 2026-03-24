import { FlatList, View, Text, StyleSheet } from "react-native";
import { useCallback } from "react";
import { makeTokens } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { CHAT_ROOMS } from "@/data/mockData";
import type { ChatRoom } from "@/types";
import TalkItem from "@/components/features/talk/TalkItem";

/** Talk画面 */
export default function TalkScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const t = makeTokens(isDark);

  const renderItem = useCallback(
    ({ item }: { item: ChatRoom }) => <TalkItem chat={item} t={t} />,
    [t]
  );

  return (
    <View style={[styles.container, { backgroundColor: t.bg }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: t.text }]}>Talk</Text>
        <Text style={[styles.sub, { color: t.sub }]}>近くのつぶやきをキャッチ</Text>
      </View>
      <FlatList
        data={CHAT_ROOMS}
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
  header: { paddingHorizontal: 20, paddingTop: 14, paddingBottom: 10 },
  title: { fontSize: 20, fontWeight: "800" },
  sub: { fontSize: 12 },
  list: { paddingBottom: 90 },
});
