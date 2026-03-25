import { FlatList, View, Text, TextInput, Pressable, RefreshControl } from "react-native";
import { useCallback, useState } from "react";
import { router } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { MapPin, Send, User } from "@/lib/icons";
import { CHAT_ROOMS } from "@/data/mockData";
import type { ChatRoom } from "@/types";
import { useAppStyles } from "@/hooks/useAppStyles";
import { WEIGHT, SPACE, RADIUS } from "@/lib/styles";
import TalkItem from "@/components/features/talk/TalkItem";
import StateView from "@/components/ui/StateView";

/** ひとこと画面 */
export default function TalkScreen() {
  const { s, t, fs } = useAppStyles();
  const [quickMsg, setQuickMsg] = useState("");
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1200);
  }, []);

  const renderItem = useCallback(
    ({ item }: { item: ChatRoom }) => <TalkItem chat={item} t={t} />,
    [t]
  );

  /** 常駐入力欄 */
  const QuickInput = (
    <View style={{ marginHorizontal: SPACE.xl, marginBottom: SPACE.md }}>
      <Pressable
        onPress={() => router.push("/talk-post")}
        style={{
          flexDirection: "row",
          alignItems: "center",
          gap: SPACE.sm + 2,
          padding: SPACE.md,
          borderRadius: RADIUS.xxl,
          backgroundColor: t.surface,
          borderWidth: 1,
          borderColor: t.border,
        }}
      >
        {/* アバター */}
        <LinearGradient
          colors={[t.accent, t.blue]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{ width: 34, height: 34, borderRadius: 17, alignItems: "center", justifyContent: "center" }}
        >
          <User size={16} color="#fff" />
        </LinearGradient>

        {/* プレースホルダー入力エリア */}
        <Text style={{ flex: 1, fontSize: fs.base, color: t.muted }}>
          今どんな感じ？つぶやいてみよう
        </Text>

        {/* 位置情報 */}
        <View style={{ flexDirection: "row", alignItems: "center", gap: 3 }}>
          <MapPin size={12} color={t.accent} />
          <Text style={{ fontSize: fs.xxs, color: t.accent }}>越谷市</Text>
        </View>
      </Pressable>
    </View>
  );

  const ListHeader = (
    <>
      <View style={{ paddingHorizontal: SPACE.xl, paddingTop: SPACE.lg, paddingBottom: SPACE.sm }}>
        <Text style={s.textScreenTitle}>トーク</Text>
        <Text style={s.textLabel}>ご近所のリアルタイムな声</Text>
      </View>
      {QuickInput}
    </>
  );

  return (
    <View style={s.screen}>
      {CHAT_ROOMS.length === 0 ? (
        <>
          {ListHeader}
          <StateView t={t} type="empty" message="最初のトークを投稿してみましょう" />
        </>
      ) : (
        <FlatList
          data={CHAT_ROOMS}
          renderItem={renderItem}
          keyExtractor={(item) => item.id.toString()}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={ListHeader}
          contentContainerStyle={{ paddingBottom: 100 }}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
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
