import { useCallback } from "react";
import { View, Text, FlatList, Pressable, RefreshControl } from "react-native";
import { router } from "expo-router";
import { useQueryClient } from "@tanstack/react-query";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ChevronLeft, ThumbsUp, MessageSquare, MessageCircle, Crown, Bell } from "@/lib/icons";
import { useNotifications, useMarkAllAsRead, useUnreadCount } from "@/hooks/useNotifications";
import { useAppStyles } from "@/hooks/useAppStyles";
import { WEIGHT, SPACE, RADIUS } from "@/lib/styles";
import type { AppNotification } from "@/lib/notifications";

/** 通知タイプに応じたアイコン・色を返す */
function getNotificationMeta(type: AppNotification["type"], accent: string, red: string, amber: string, purple: string) {
  switch (type) {
    case "like":
      return { icon: ThumbsUp, color: accent, label: "Good" };
    case "comment":
      return { icon: MessageSquare, color: accent, label: "コメント" };
    case "reply":
      return { icon: MessageCircle, color: amber, label: "返信" };
    case "hall_of_fame":
      return { icon: Crown, color: amber, label: "殿堂入り" };
    default:
      return { icon: ThumbsUp, color: accent, label: "通知" };
  }
}

/** 相対時間表示 */
function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const min = Math.floor(diff / 60000);
  if (min < 1) return "たった今";
  if (min < 60) return `${min}分前`;
  const hour = Math.floor(min / 60);
  if (hour < 24) return `${hour}時間前`;
  const day = Math.floor(hour / 24);
  if (day < 7) return `${day}日前`;
  const d = new Date(dateStr);
  return `${d.getMonth() + 1}/${d.getDate()}`;
}

/** 通知アイテム */
function NotificationItem({ item, t, fs, onPress }: { item: AppNotification; t: any; fs: any; onPress: () => void }) {
  const meta = getNotificationMeta(item.type, t.accent, t.red, t.amber, t.purple);
  const Icon = meta.icon;

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => ({
        flexDirection: "row",
        alignItems: "flex-start",
        gap: SPACE.md,
        paddingVertical: SPACE.md,
        paddingHorizontal: SPACE.xl,
        backgroundColor: item.is_read ? "transparent" : t.accent + "08",
        opacity: pressed ? 0.7 : 1,
      })}
    >
      <View style={{
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: meta.color + "18",
        alignItems: "center",
        justifyContent: "center",
        marginTop: 2,
      }}>
        <Icon size={16} color={meta.color} />
      </View>

      <View style={{ flex: 1, gap: 2 }}>
        <Text style={{ fontSize: fs.base, fontWeight: item.is_read ? WEIGHT.normal : WEIGHT.bold, color: t.text, lineHeight: 20 }}>
          {item.title}
        </Text>
        {item.body ? (
          <Text style={{ fontSize: fs.sm, color: t.sub, lineHeight: 18 }} numberOfLines={2}>
            {item.body}
          </Text>
        ) : null}
        <Text style={{ fontSize: fs.xs, color: t.muted, marginTop: 2 }}>
          {timeAgo(item.created_at)}
        </Text>
      </View>

      {!item.is_read && (
        <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: t.accent, marginTop: SPACE.sm }} />
      )}
    </Pressable>
  );
}

/** 通知一覧画面 */
export default function NotificationsScreen() {
  const { s, t, fs } = useAppStyles();
  const insets = useSafeAreaInsets();
  const { data: notifications, isLoading, isFetching, refetch } = useNotifications();
  const { data: unreadCount = 0 } = useUnreadCount();
  const { mutate: markAllRead } = useMarkAllAsRead();
  const qc = useQueryClient();

  const handlePress = useCallback((item: AppNotification) => {
    if (item.target_type === "post") {
      qc.invalidateQueries({ queryKey: ["posts", "detail", item.target_id] });
      qc.invalidateQueries({ queryKey: ["comments", item.target_id] });
      router.push(`/feed/${item.target_id}` as any);
    } else if (item.target_type === "talk") {
      qc.invalidateQueries({ queryKey: ["talks", "detail", item.target_id] });
      router.push(`/talk-detail/${item.target_id}` as any);
    }
  }, [qc]);

  const renderItem = useCallback(
    ({ item }: { item: AppNotification }) => (
      <NotificationItem item={item} t={t} fs={fs} onPress={() => handlePress(item)} />
    ),
    [t, fs, handlePress],
  );

  return (
    <View style={[s.screen, { paddingTop: insets.top }]}>
      {/* ヘッダー */}
      <View style={{
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: SPACE.xl,
        paddingVertical: SPACE.md,
        borderBottomWidth: 1,
        borderBottomColor: t.border,
      }}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: SPACE.sm }}>
          <Pressable
            onPress={() => router.back()}
            style={({ pressed }) => [s.iconButton, { opacity: pressed ? 0.7 : 1 }]}
          >
            <ChevronLeft size={20} color={t.text} />
          </Pressable>
          <Text style={{ fontSize: fs.xl, fontWeight: WEIGHT.bold, color: t.text }}>通知</Text>
          {unreadCount > 0 && (
            <View style={{
              minWidth: 20,
              height: 20,
              borderRadius: 10,
              backgroundColor: t.accent,
              alignItems: "center",
              justifyContent: "center",
              paddingHorizontal: SPACE.xs,
            }}>
              <Text style={{ fontSize: fs.xxs, fontWeight: WEIGHT.extrabold, color: "#000" }}>
                {unreadCount}
              </Text>
            </View>
          )}
        </View>

        {unreadCount > 0 && (
          <Pressable
            onPress={() => markAllRead()}
            style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
          >
            <Text style={{ fontSize: fs.sm, fontWeight: WEIGHT.semibold, color: t.accent }}>
              すべて既読
            </Text>
          </Pressable>
        )}
      </View>

      {/* 通知リスト */}
      <FlatList
        data={notifications}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: insets.bottom + SPACE.xl }}
        ItemSeparatorComponent={() => (
          <View style={{ height: 1, backgroundColor: t.border, marginLeft: SPACE.xl + 36 + SPACE.md }} />
        )}
        ListEmptyComponent={
          isLoading ? null : (
            <View style={{ paddingVertical: 80, alignItems: "center", gap: SPACE.md }}>
              <Bell size={40} color={t.muted} />
              <Text style={{ fontSize: fs.lg, fontWeight: WEIGHT.bold, color: t.text }}>
                通知はまだありません
              </Text>
              <Text style={{ fontSize: fs.sm, color: t.sub, textAlign: "center" }}>
                いいねやコメントが届くと{"\n"}ここに表示されます
              </Text>
            </View>
          )
        }
        refreshControl={
          <RefreshControl
            refreshing={isFetching && !isLoading}
            onRefresh={() => refetch()}
            tintColor={t.accent}
            colors={[t.accent]}
            progressBackgroundColor={t.surface}
          />
        }
      />
    </View>
  );
}
