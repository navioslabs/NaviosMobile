import { FlatList, View, Text, RefreshControl } from "react-native";
import { useCallback } from "react";
import { useTalks } from "@/hooks/useTalks";
import { useRealtimeTalks } from "@/hooks/useRealtimeTalks";
import type { Talk } from "@/types";
import { useAppStyles } from "@/hooks/useAppStyles";
import { SPACE } from "@/lib/styles";
import TalkItem from "@/components/features/talk/TalkItem";
import StateView from "@/components/ui/StateView";

/** ひとこと画面 */
export default function TalkScreen() {
  const { s, t } = useAppStyles();

  const { data: serverTalks, isLoading: queryLoading, refetch } = useTalks();
  useRealtimeTalks();
  const talks: Talk[] = (serverTalks ?? []).filter((t) => t?.id);

  const renderItem = useCallback(
    ({ item }: { item: Talk }) => <TalkItem talk={item} t={t} />,
    [t]
  );

  const ListHeader = (
    <View style={{ paddingHorizontal: SPACE.xl, paddingTop: SPACE.lg, paddingBottom: SPACE.sm }}>
      <Text style={s.textScreenTitle}>トーク</Text>
      <Text style={s.textLabel}>ご近所のリアルタイムな声</Text>
    </View>
  );

  return (
    <View style={s.screen}>
      {talks.length === 0 ? (
        <>
          {ListHeader}
          <StateView t={t} type="empty" message="最初のトークを投稿してみましょう" />
        </>
      ) : (
        <FlatList
          data={talks}
          renderItem={renderItem}
          keyExtractor={(item, index) => item.id ?? `talk-${index}`}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={ListHeader}
          contentContainerStyle={{ paddingBottom: 100 }}
          refreshControl={
            <RefreshControl
              refreshing={queryLoading}
              onRefresh={refetch}
              tintColor={t.accent}
              colors={[t.accent]}
              progressBackgroundColor={t.surface}
            />
          }
        />
      )}
    </View>
  );
}
