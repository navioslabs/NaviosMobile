import { FlatList, View, Text, RefreshControl } from "react-native";
import { useCallback, useEffect } from "react";
import Animated, { useSharedValue, useAnimatedStyle, withRepeat, withSequence, withTiming, Easing } from "react-native-reanimated";
import { useIsFocused } from "@react-navigation/native";
import { Radio } from "@/lib/icons";
import { useTalks } from "@/hooks/useTalks";
import { useBadgeStore } from "@/stores/badgeStore";
import type { Talk } from "@/types";
import { useAppStyles } from "@/hooks/useAppStyles";
import { WEIGHT, SPACE, RADIUS } from "@/lib/styles";
import TalkItem from "@/components/features/talk/TalkItem";
import StateView from "@/components/ui/StateView";

/** タイムライン画面 */
export default function TalkScreen() {
  const { s, t, fs } = useAppStyles();
  const isFocused = useIsFocused();
  const clearTalkUnread = useBadgeStore((s) => s.clearTalkUnread);

  const { data: serverTalks, isLoading: queryLoading, isFetching, refetch } = useTalks();
  const talks: Talk[] = (serverTalks ?? []).filter((t) => t?.id);

  // タブフォーカス時に未読をクリア
  useEffect(() => {
    if (isFocused) clearTalkUnread();
  }, [isFocused, clearTalkUnread]);

  const renderItem = useCallback(
    ({ item }: { item: Talk }) => <TalkItem talk={item} t={t} />,
    [t]
  );

  const ListHeader = (
    <View style={{ paddingHorizontal: SPACE.xl, paddingTop: SPACE.lg, paddingBottom: SPACE.md, borderBottomWidth: 1, borderBottomColor: t.border }}>
      <View style={{ flexDirection: "row", alignItems: "center", gap: SPACE.sm }}>
        <Text style={s.textScreenTitle}>タイムライン</Text>
        <LiveBadge t={t} />
      </View>
      <Text style={{ fontSize: fs.sm, color: t.sub, marginTop: SPACE.xs }}>
        近くの人のリアルタイムな声 • {talks.length}件
      </Text>
    </View>
  );

  return (
    <View style={s.screen}>
      {talks.length === 0 && !queryLoading ? (
        <>
          {ListHeader}
          <StateView t={t} type="empty" message="まだ投稿がありません。最初のひとことを投稿してみましょう" />
        </>
      ) : (
        <FlatList
          data={talks}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={ListHeader}
          contentContainerStyle={{ paddingBottom: 100 }}
          refreshControl={
            <RefreshControl
              refreshing={isFetching}
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

/** LIVE 脈動バッジ */
function LiveBadge({ t }: { t: any }) {
  const pulse = useSharedValue(1);

  useEffect(() => {
    pulse.value = withRepeat(
      withSequence(
        withTiming(1.06, { duration: 800, easing: Easing.inOut(Easing.ease) }),
        withTiming(1.0, { duration: 800, easing: Easing.inOut(Easing.ease) }),
      ),
      -1,
      true,
    );
  }, []);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulse.value }],
  }));

  return (
    <Animated.View style={[animStyle, {
      flexDirection: "row",
      alignItems: "center",
      gap: 3,
      borderRadius: RADIUS.sm,
      paddingHorizontal: SPACE.sm,
      paddingVertical: 3,
      backgroundColor: t.accent,
    }]}>
      <Radio size={10} color="#000" />
      <Text style={{ fontSize: 10, fontWeight: WEIGHT.extrabold, color: "#000" }}>LIVE</Text>
    </Animated.View>
  );
}
