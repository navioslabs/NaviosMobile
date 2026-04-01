import { FlatList, View, Text, RefreshControl, Pressable, Animated, Easing } from "react-native";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useIsFocused } from "@react-navigation/native";
import { Radio, MessageCircle, Trophy } from "@/lib/icons";
import { useTalks } from "@/hooks/useTalks";
import { useBadgeStore } from "@/stores/badgeStore";
import type { Talk } from "@/types";
import { useAppStyles } from "@/hooks/useAppStyles";
import { WEIGHT, SPACE, RADIUS } from "@/lib/styles";
import TalkItem from "@/components/features/talk/TalkItem";
import StateView from "@/components/ui/StateView";
import { TalkItemSkeleton } from "@/components/ui/Skeleton";

type TalkTab = "live" | "fame";

/** タイムライン画面 */
export default function TalkScreen() {
  const { s, t, fs } = useAppStyles();
  const isFocused = useIsFocused();
  const clearTalkUnread = useBadgeStore((s) => s.clearTalkUnread);

  const { data: serverTalks, isLoading: queryLoading, isFetching, refetch, dataUpdatedAt } = useTalks();
  const allTalks: Talk[] = (serverTalks ?? []).filter((t) => t?.id);

  const [activeTab, setActiveTab] = useState<TalkTab>("live");
  const tabIndicatorX = useRef(new Animated.Value(0)).current;

  /** タブ切替 */
  const switchTab = useCallback((tab: TalkTab) => {
    setActiveTab(tab);
    Animated.spring(tabIndicatorX, { toValue: tab === "live" ? 0 : 1, useNativeDriver: true, speed: 16, bounciness: 6 }).start();
  }, []);

  /** フィルタ済みデータ */
  const talks = useMemo(
    () => activeTab === "fame" ? allTalks.filter((t) => t.is_hall_of_fame) : allTalks,
    [allTalks, activeTab],
  );

  const flatListRef = useRef<FlatList<Talk>>(null);
  const [newCount, setNewCount] = useState(0);
  const bannerTranslateY = useRef(new Animated.Value(-60)).current;
  const prevDataCountRef = useRef(talks.length);
  const isScrolledRef = useRef(false);

  useEffect(() => {
    if (isFocused) clearTalkUnread();
  }, [isFocused, clearTalkUnread]);

  /** データ更新時、スクロール中なら新着バナー表示 */
  useEffect(() => {
    const diff = talks.length - prevDataCountRef.current;
    prevDataCountRef.current = talks.length;
    if (diff > 0 && isScrolledRef.current) {
      setNewCount((prev) => prev + diff);
      Animated.spring(bannerTranslateY, { toValue: 0, useNativeDriver: true, speed: 14, bounciness: 8 }).start();
    }
  }, [dataUpdatedAt]);

  /** バナータップ: トップへスクロール＆バナー非表示 */
  const handleBannerPress = useCallback(() => {
    flatListRef.current?.scrollToOffset({ offset: 0, animated: true });
    setNewCount(0);
    Animated.spring(bannerTranslateY, { toValue: -60, useNativeDriver: true, speed: 14 }).start();
  }, []);

  /** スクロール位置を監視 */
  const handleScroll = useCallback((e: any) => {
    isScrolledRef.current = e.nativeEvent.contentOffset.y > 100;
    if (!isScrolledRef.current && newCount > 0) {
      setNewCount(0);
      Animated.spring(bannerTranslateY, { toValue: -60, useNativeDriver: true, speed: 14 }).start();
    }
  }, [newCount]);

  const renderItem = useCallback(
    ({ item }: { item: Talk }) => <TalkItem talk={item} t={t} />,
    [t],
  );

  // 統計
  const hallOfFameCount = allTalks.filter((t) => t.is_hall_of_fame).length;
  const TAB_WIDTH = 100;

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
          <Text style={{ fontSize: fs.xxs, fontWeight: WEIGHT.bold, color: t.text }}>{allTalks.length}件</Text>
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

      {/* LIVE / 殿堂 タブ */}
      <View style={{ flexDirection: "row", marginTop: SPACE.md, borderBottomWidth: 1, borderBottomColor: t.border }}>
        <Pressable onPress={() => switchTab("live")} style={{ width: TAB_WIDTH, paddingVertical: SPACE.sm, alignItems: "center" }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
            <Radio size={12} color={activeTab === "live" ? t.accent : t.muted} />
            <Text style={{ fontSize: fs.sm, fontWeight: WEIGHT.bold, color: activeTab === "live" ? t.text : t.muted }}>LIVE</Text>
          </View>
        </Pressable>
        <Pressable onPress={() => switchTab("fame")} style={{ width: TAB_WIDTH, paddingVertical: SPACE.sm, alignItems: "center" }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
            <Trophy size={12} color={activeTab === "fame" ? "#FFD700" : t.muted} />
            <Text style={{ fontSize: fs.sm, fontWeight: WEIGHT.bold, color: activeTab === "fame" ? t.text : t.muted }}>殿堂</Text>
            {hallOfFameCount > 0 && (
              <View style={{ backgroundColor: "#FFD700" + "20", borderRadius: RADIUS.full, paddingHorizontal: 5, paddingVertical: 1 }}>
                <Text style={{ fontSize: 10, fontWeight: WEIGHT.bold, color: "#DAA520" }}>{hallOfFameCount}</Text>
              </View>
            )}
          </View>
        </Pressable>
        {/* アンダーラインインジケーター */}
        <Animated.View style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          width: TAB_WIDTH,
          height: 2,
          borderRadius: 1,
          backgroundColor: activeTab === "fame" ? "#FFD700" : t.accent,
          transform: [{ translateX: tabIndicatorX.interpolate({ inputRange: [0, 1], outputRange: [0, TAB_WIDTH] }) }],
        }} />
      </View>
    </View>
  );

  const EmptyState = (
    <View style={{ flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: SPACE.xl, paddingVertical: SPACE.xxxl * 2 }}>
      <View style={{ width: 64, height: 64, borderRadius: 32, backgroundColor: (activeTab === "fame" ? "#FFD700" : t.accent) + "15", alignItems: "center", justifyContent: "center", marginBottom: SPACE.lg }}>
        {activeTab === "fame" ? <Trophy size={28} color="#FFD700" /> : <MessageCircle size={28} color={t.accent} />}
      </View>
      <Text style={{ fontSize: fs.lg, fontWeight: WEIGHT.bold, color: t.text, marginBottom: SPACE.sm }}>
        {activeTab === "fame" ? "殿堂入りはまだありません" : "まだ声がありません"}
      </Text>
      <Text style={{ fontSize: fs.sm, color: t.sub, textAlign: "center", lineHeight: 20 }}>
        {activeTab === "fame" ? "10いいねを集めた投稿が\nここに残ります" : "この場所で最初のひとことを\n投稿してみましょう"}
      </Text>
    </View>
  );

  return (
    <View style={s.screen}>
      {queryLoading ? (
        <View>
          {ListHeader}
          <TalkItemSkeleton t={t} />
          <TalkItemSkeleton t={t} />
          <TalkItemSkeleton t={t} />
          <TalkItemSkeleton t={t} />
        </View>
      ) : talks.length === 0 ? (
        <>
          {ListHeader}
          {EmptyState}
        </>
      ) : (
        <FlatList
          ref={flatListRef}
          data={talks}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={ListHeader}
          contentContainerStyle={{ paddingBottom: 100 }}
          ItemSeparatorComponent={() => <View style={{ height: 1, backgroundColor: t.border, marginLeft: SPACE.lg + 32 + SPACE.sm, marginRight: SPACE.lg }} />}
          onScroll={handleScroll}
          scrollEventThrottle={200}
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

      {/* 新着投稿バナー */}
      {newCount > 0 && (
        <Animated.View style={{ position: "absolute", top: 8, left: 0, right: 0, alignItems: "center", transform: [{ translateY: bannerTranslateY }], zIndex: 10 }}>
          <Pressable
            onPress={handleBannerPress}
            style={({ pressed }) => ({
              flexDirection: "row",
              alignItems: "center",
              gap: 4,
              backgroundColor: t.accent,
              paddingHorizontal: SPACE.lg,
              paddingVertical: SPACE.sm,
              borderRadius: RADIUS.full,
              opacity: pressed ? 0.85 : 1,
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.15,
              shadowRadius: 4,
              elevation: 4,
            })}
          >
            <Text style={{ fontSize: 12, color: "#000", fontWeight: WEIGHT.extrabold }}>
              ↑ {newCount}件の新しい声
            </Text>
          </Pressable>
        </Animated.View>
      )}

    </View>
  );
}

/** LIVE 脈動バッジ */
function LiveBadge({ t }: { t: any }) {
  const pulse = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1.06, duration: 800, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 1.0, duration: 800, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
      ]),
    ).start();
  }, []);

  return (
    <Animated.View style={[{ transform: [{ scale: pulse }] }, {
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
