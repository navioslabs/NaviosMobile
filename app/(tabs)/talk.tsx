import { FlatList, View, Text } from "react-native";
import { useCallback } from "react";
import { makeTokens } from "@/constants/theme";
import { useThemeStore } from "@/stores/themeStore";
import { CHAT_ROOMS } from "@/data/mockData";
import type { ChatRoom } from "@/types";
import TalkItem from "@/components/features/talk/TalkItem";

/** Talk画面 */
export default function TalkScreen() {
  const { isDark } = useThemeStore();
  const t = makeTokens(isDark);

  const renderItem = useCallback(
    ({ item }: { item: ChatRoom }) => <TalkItem chat={item} t={t} />,
    [t]
  );

  return (
    <View className="flex-1" style={{ backgroundColor: t.bg }}>
      <View className="px-5 pt-3.5 pb-2.5">
        <Text className="text-xl font-extrabold" style={{ color: t.text }}>Talk</Text>
        <Text className="text-xs" style={{ color: t.sub }}>近くのつぶやきをキャッチ</Text>
      </View>
      <FlatList
        data={CHAT_ROOMS}
        renderItem={renderItem}
        keyExtractor={(item) => item.id.toString()}
        showsVerticalScrollIndicator={false}
        contentContainerClassName="pb-[90px]"
      />
    </View>
  );
}
