import { FlatList, View, Text } from "react-native";
import { useCallback } from "react";
import { makeTokens } from "@/constants/theme";
import { useThemeStore } from "@/stores/themeStore";
import { CHAT_ROOMS } from "@/data/mockData";
import type { ChatRoom } from "@/types";
import { createStyles, SPACE } from "@/lib/styles";
import TalkItem from "@/components/features/talk/TalkItem";
import StateView from "@/components/ui/StateView";

/** Talk画面 */
export default function TalkScreen() {
  const { isDark } = useThemeStore();
  const t = makeTokens(isDark);
  const s = createStyles(t);

  const renderItem = useCallback(
    ({ item }: { item: ChatRoom }) => <TalkItem chat={item} t={t} />,
    [t]
  );

  return (
    <View style={s.screen}>
      <View style={{ paddingHorizontal: SPACE.xl, paddingTop: SPACE.lg, paddingBottom: SPACE.sm }}>
        <Text style={s.textScreenTitle}>ひとこと</Text>
        <Text style={s.textLabel}>ご近所のリアルタイム情報</Text>
      </View>
      {CHAT_ROOMS.length === 0 ? (
        <StateView t={t} type="empty" message="最初のひとことを投稿してみましょう" />
      ) : (
        <FlatList
          data={CHAT_ROOMS}
          renderItem={renderItem}
          keyExtractor={(item) => item.id.toString()}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 100 }}
        />
      )}
    </View>
  );
}
