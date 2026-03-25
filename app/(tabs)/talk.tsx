import { FlatList, View, Text, TextInput, Pressable } from "react-native";
import { useCallback, useState } from "react";
import { router } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { MapPin, Send, User } from "@/lib/icons";
import { makeTokens } from "@/constants/theme";
import { useThemeStore } from "@/stores/themeStore";
import { CHAT_ROOMS } from "@/data/mockData";
import type { ChatRoom } from "@/types";
import { createStyles, FONT_SIZE, WEIGHT, SPACE, RADIUS } from "@/lib/styles";
import TalkItem from "@/components/features/talk/TalkItem";
import StateView from "@/components/ui/StateView";

/** ひとこと画面 */
export default function TalkScreen() {
  const { isDark } = useThemeStore();
  const t = makeTokens(isDark);
  const s = createStyles(t);
  const [quickMsg, setQuickMsg] = useState("");

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
        <Text style={{ flex: 1, fontSize: FONT_SIZE.base, color: t.muted }}>
          今どんな様子？
        </Text>

        {/* 位置情報 */}
        <View style={{ flexDirection: "row", alignItems: "center", gap: 3 }}>
          <MapPin size={12} color={t.accent} />
          <Text style={{ fontSize: FONT_SIZE.xxs, color: t.accent }}>越谷市</Text>
        </View>
      </Pressable>
    </View>
  );

  const ListHeader = (
    <>
      <View style={{ paddingHorizontal: SPACE.xl, paddingTop: SPACE.lg, paddingBottom: SPACE.sm }}>
        <Text style={s.textScreenTitle}>ひとこと</Text>
        <Text style={s.textLabel}>ご近所のリアルタイム情報</Text>
      </View>
      {QuickInput}
    </>
  );

  return (
    <View style={s.screen}>
      {CHAT_ROOMS.length === 0 ? (
        <>
          {ListHeader}
          <StateView t={t} type="empty" message="最初のひとことを投稿してみましょう" />
        </>
      ) : (
        <FlatList
          data={CHAT_ROOMS}
          renderItem={renderItem}
          keyExtractor={(item) => item.id.toString()}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={ListHeader}
          contentContainerStyle={{ paddingBottom: 100 }}
        />
      )}
    </View>
  );
}
