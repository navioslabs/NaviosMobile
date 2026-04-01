import { useState } from "react";
import {
  View,
  Text,
  FlatList,
  Pressable,
  ActivityIndicator,
} from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { Image } from "expo-image";
import { ChevronLeft, User, UserCheck } from "@/lib/icons";
import { useFollowers, useFollowing } from "@/hooks/useFollow";
import { useAppStyles } from "@/hooks/useAppStyles";
import { WEIGHT, SPACE, RADIUS } from "@/lib/styles";
import type { Profile } from "@/types";

/** フォロワー・フォロー中一覧画面 */
type FollowTab = "followers" | "following";

export default function FollowListScreen() {
  const { id, tab } = useLocalSearchParams<{ id: string; tab?: string }>();
  const { s, t, fs } = useAppStyles();
  const [activeTab, setActiveTab] = useState<FollowTab>(
    tab === "following" ? "following" : "followers"
  );

  const userId = id ?? "";
  const { data: followers, isLoading: followersLoading } = useFollowers(userId);
  const { data: following, isLoading: followingLoading } = useFollowing(userId);

  const list = activeTab === "followers" ? followers : following;
  const isLoading = activeTab === "followers" ? followersLoading : followingLoading;

  const renderItem = ({ item }: { item: Profile }) => (
    <Pressable
      onPress={() => router.push(`/profile/${item.id}` as any)}
      style={({ pressed }) => ({
        flexDirection: "row",
        alignItems: "center",
        gap: SPACE.md,
        padding: SPACE.md,
        marginHorizontal: SPACE.lg,
        marginBottom: SPACE.sm,
        borderRadius: RADIUS.md,
        backgroundColor: t.surface,
        borderWidth: 1,
        borderColor: t.border,
        opacity: pressed ? 0.7 : 1,
      })}
    >
      {item.avatar_url ? (
        <Image
          source={{ uri: item.avatar_url }}
          style={{ width: 44, height: 44, borderRadius: 22 }}
          contentFit="cover"
        />
      ) : (
        <View
          style={{
            width: 44,
            height: 44,
            borderRadius: 22,
            backgroundColor: t.border,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <User size={20} color={t.muted} />
        </View>
      )}
      <View style={{ flex: 1 }}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: SPACE.xs }}>
          <Text
            style={{ fontSize: fs.base, fontWeight: WEIGHT.bold, color: t.text }}
            numberOfLines={1}
          >
            {item.display_name}
          </Text>
          {item.is_verified && <UserCheck size={14} color={t.blue} />}
        </View>
        {item.bio ? (
          <Text
            style={{ fontSize: fs.sm, color: t.muted, marginTop: 2 }}
            numberOfLines={1}
          >
            {item.bio}
          </Text>
        ) : null}
      </View>
    </Pressable>
  );

  return (
    <View style={s.screen}>
      {/* ヘッダー */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          gap: SPACE.md,
          paddingHorizontal: SPACE.lg,
          paddingTop: 52,
          paddingBottom: SPACE.md,
          backgroundColor: t.surface,
          borderBottomWidth: 1,
          borderBottomColor: t.border,
        }}
      >
        <Pressable
          onPress={() => router.back()}
          style={({ pressed }) => ({
            width: 40,
            height: 40,
            borderRadius: 20,
            alignItems: "center",
            justifyContent: "center",
            opacity: pressed ? 0.7 : 1,
          })}
        >
          <ChevronLeft size={24} color={t.text} />
        </Pressable>
        <Text style={s.textHeading} numberOfLines={1}>
          {activeTab === "followers" ? "フォロワー" : "フォロー中"}
        </Text>
      </View>

      {/* タブ切替 */}
      <View style={{ flexDirection: "row", borderBottomWidth: 1, borderBottomColor: t.border }}>
        {([
          { id: "followers" as FollowTab, label: "フォロワー", count: followers?.length ?? 0 },
          { id: "following" as FollowTab, label: "フォロー中", count: following?.length ?? 0 },
        ]).map((tabItem) => {
          const active = activeTab === tabItem.id;
          return (
            <Pressable
              key={tabItem.id}
              onPress={() => setActiveTab(tabItem.id)}
              style={{
                flex: 1,
                alignItems: "center",
                paddingVertical: SPACE.md,
                borderBottomWidth: 2,
                borderBottomColor: active ? t.accent : "transparent",
                backgroundColor: active ? t.accent + "15" : "transparent",
              }}
            >
              <Text
                style={{
                  fontSize: fs.sm,
                  fontWeight: active ? "700" : WEIGHT.bold,
                  color: active ? t.accent : t.muted,
                }}
              >
                {tabItem.label} {tabItem.count}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {/* 一覧 */}
      {isLoading ? (
        <View style={{ padding: SPACE.xxl, alignItems: "center" }}>
          <ActivityIndicator size="large" color={t.accent} />
        </View>
      ) : (
        <FlatList
          data={list ?? []}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={{ paddingTop: SPACE.md, paddingBottom: 100 }}
          ListEmptyComponent={
            <View style={{ alignItems: "center", paddingVertical: SPACE.xxl }}>
              <Text style={{ fontSize: fs.sm, color: t.muted }}>
                {activeTab === "followers"
                  ? "まだフォロワーがいません"
                  : "まだ誰もフォローしていません"}
              </Text>
            </View>
          }
        />
      )}
    </View>
  );
}
