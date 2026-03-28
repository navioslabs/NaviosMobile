import { FlatList, View, Text, RefreshControl, Pressable } from "react-native";
import { useCallback, useEffect } from "react";
import Animated, { useSharedValue, useAnimatedStyle, withRepeat, withSequence, withTiming, Easing } from "react-native-reanimated";
import { useIsFocused } from "@react-navigation/native";
import { Radio, MapPin, MessageCircle } from "@/lib/icons";
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

  useEffect(() => {
    if (isFocused) clearTalkUnread();
  }, [isFocused, clearTalkUnread]);

  const renderItem = useCallback(
    ({ item }: { item: Talk }) => <TalkItem talk={item} t={t} />,
    [t],
  );

  // 統計
  const hallOfFameCount = talks.filter((t) => t.is_hall_of_fame).length;

  const ListHeader = (
    <View style={{ paddingHorizontal: SPACE.xl, paddingTop: SPACE.lg, paddingBottom: SPACE.md }}>
      {/* タイトル + LIVE */}
      <View style={{ flexDirection: "row", alignItems: "center", gap: SPACE.sm, marginBottom: SPACE.sm }}>
        <Text style={s.textScreenTitle}>この街の声</Text>
        <LiveBadge t={t} />
      </View>

      {/* 統計チップ */}
      <View style={{ flexDirection: "row", gap: SPACE.sm }}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 4, backgroundColor: t.surface, borderRadius: RADIUS.full, paddingHorizontal: SPACE.md, paddingVertical: SPACE.xs + 1, borderWidth: 1, borderColor: t.border }}>
          <MessageCircle size={12} color={t.accent} />
          <Text style={{ fontSize: fs.xxs, fontWeight: WEIGHT.bold, color: t.text }}>{talks.length}件</Text>
        </View>
        {hallOfFameCount > 0 && (
          <View style={{ flexDirection: "row", alignItems: "center", gap: 4, backgroundColor: "#FFD700" + "10", borderRadius: RADIUS.full, paddingHorizontal: SPACE.md, paddingVertical: SPACE.xs + 1, borderWidth: 1, borderColor: "#FFD700" + "30" }}>
            <Text style={{ fontSize: 10 }}>🏆</Text>
            <Text style={{ fontSize: fs.xxs, fontWeight: WEIGHT.bold, color: "#DAA520" }}>{hallOfFameCount}件の殿堂入り</Text>
          </View>
        )}
      </View>

      {/* ガイドテキスト */}
      <Text style={{ fontSize: fs.xs, color: t.muted, marginTop: SPACE.sm }}>
        24時間で消えるつぶやき。10いいねで殿堂入り。
      </Text>
    </View>
  );

  const EmptyState = (
    <View style={{ flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: SPACE.xl, paddingVertical: SPACE.xxxl * 2 }}>
      <View style={{ width: 64, height: 64, borderRadius: 32, backgroundColor: t.accent + "15", alignItems: "center", justifyContent: "center", marginBottom: SPACE.lg }}>
        <MessageCircle size={28} color={t.accent} />
      </View>
      <Text style={{ fontSize: fs.lg, fontWeight: WEIGHT.bold, color: t.text, marginBottom: SPACE.sm }}>
        まだ声がありません
      </Text>
      <Text style={{ fontSize: fs.sm, color: t.sub, textAlign: "center", lineHeight: 20 }}>
        この場所で最初のひとことを{"\n"}投稿してみましょう
      </Text>
    </View>
  );

  return (
    <View style={s.screen}>
      {talks.length === 0 && !queryLoading ? (
        <>
          {ListHeader}
          {EmptyState}
        </>
      ) : (
        <FlatList
          data={talks}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={ListHeader}
          contentContainerStyle={{ paddingBottom: 100 }}
          ItemSeparatorComponent={() => <View style={{ height: 1, backgroundColor: t.border, marginLeft: SPACE.lg + 32 + SPACE.sm, marginRight: SPACE.lg }} />}
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
