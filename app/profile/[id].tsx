import { useState } from "react";
import { View, Text, ScrollView, Pressable, ActivityIndicator, RefreshControl } from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { Image } from "expo-image";
import {
  ChevronLeft,
  MapPin,
  Calendar,
  UserCheck,
  Award,
  MessageCircle,
  ThumbsUp,
  PenLine,
  User,
} from "@/lib/icons";
import { useProfile, useUserPosts, useUserTalks } from "@/hooks/useProfile";
import { useUserBadges } from "@/hooks/useBadges";
import { useIsFollowing, useToggleFollow, useFollowCounts } from "@/hooks/useFollow";
import { useAuth } from "@/hooks/useAuth";
import { timeAgo } from "@/lib/adapters";
import { useAppStyles } from "@/hooks/useAppStyles";
import { WEIGHT, SPACE, RADIUS } from "@/lib/styles";
import CatPill from "@/components/ui/CatPill";
import BadgeSection from "@/components/features/badges/BadgeSection";

/** ユーザープロフィール画面 */
type ProfileTab = "posts" | "talks";

export default function ProfileScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { s, t, fs } = useAppStyles();
  const [activeTab, setActiveTab] = useState<ProfileTab>("posts");

  const { user } = useAuth();
  const userId = id ?? "";
  const isOwnProfile = user?.id === userId;
  const { data: remoteProfile, isLoading: profileLoading, isFetching: profileFetching, refetch: refetchProfile } = useProfile(userId);
  const { data: userPosts } = useUserPosts(userId);
  const { data: userTalks } = useUserTalks(userId);
  const { data: badges } = useUserBadges(userId);
  const { data: isFollowing } = useIsFollowing(isOwnProfile ? undefined : userId);
  const { data: followCounts } = useFollowCounts(userId);
  const { mutate: toggleFollow, isPending: followPending } = useToggleFollow();

  const posts = userPosts ?? [];
  const talks = userTalks ?? [];

  const profile = remoteProfile
    ? {
        name: remoteProfile.display_name,
        avatar: remoteProfile.avatar_url ?? null,
        bio: remoteProfile.bio ?? "",
        verified: remoteProfile.is_verified,
        location: remoteProfile.location_text ?? "",
        joinDate: new Date(remoteProfile.created_at).toLocaleDateString("ja-JP", { year: "numeric", month: "long" }),
      }
    : null;

  return (
    <View style={s.screen}>
      {/* ヘッダー */}
      <View style={{ flexDirection: "row", alignItems: "center", gap: SPACE.md, paddingHorizontal: SPACE.lg, paddingTop: 52, paddingBottom: SPACE.md, backgroundColor: t.surface, borderBottomWidth: 1, borderBottomColor: t.border }}>
        <Pressable
          onPress={() => router.back()}
          style={({ pressed }) => ({ width: 40, height: 40, borderRadius: 20, alignItems: "center", justifyContent: "center", opacity: pressed ? 0.7 : 1 })}
        >
          <ChevronLeft size={24} color={t.text} />
        </Pressable>
        <Text style={s.textHeading} numberOfLines={1}>{profile?.name ?? "プロフィール"}</Text>
      </View>

      {profileLoading && (
        <View style={{ padding: SPACE.xxl, alignItems: "center" }}>
          <ActivityIndicator size="large" color={t.accent} />
        </View>
      )}

      {!profileLoading && !profile && (
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
          <Text style={s.textSubheading}>ユーザーが見つかりません</Text>
          <Pressable onPress={() => router.back()} style={{ marginTop: SPACE.lg }}>
            <Text style={{ color: t.accent, fontSize: fs.base, fontWeight: WEIGHT.bold }}>戻る</Text>
          </Pressable>
        </View>
      )}

      {profile && (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 100 }}
          refreshControl={
            <RefreshControl
              refreshing={profileFetching && !profileLoading}
              onRefresh={() => refetchProfile()}
              tintColor={t.accent}
              colors={[t.accent]}
              progressBackgroundColor={t.surface}
            />
          }
        >
          {/* プロフィールヘッダー */}
          <View style={{ alignItems: "center", paddingVertical: SPACE.xxl, paddingHorizontal: SPACE.xl }}>
            <View style={{ position: "relative", marginBottom: SPACE.lg }}>
              {profile.avatar ? (
                <Image source={{ uri: profile.avatar }} style={{ width: 80, height: 80, borderRadius: 40, borderWidth: 3, borderColor: t.accent + "40" }} contentFit="cover" />
              ) : (
                <View style={{ width: 80, height: 80, borderRadius: 40, borderWidth: 3, borderColor: t.accent + "40", backgroundColor: t.border, alignItems: "center", justifyContent: "center" }}>
                  <User size={36} color={t.muted} />
                </View>
              )}
              {profile.verified && (
                <View style={{ position: "absolute", bottom: 0, right: 0, width: 24, height: 24, borderRadius: 12, backgroundColor: t.blue, alignItems: "center", justifyContent: "center", borderWidth: 2, borderColor: t.surface }}>
                  <UserCheck size={12} color="#fff" />
                </View>
              )}
            </View>

            <Text style={{ fontSize: fs.xxl, fontWeight: WEIGHT.extrabold, color: t.text }}>{profile.name}</Text>
            {profile.bio ? (
              <Text style={{ fontSize: fs.base, color: t.sub, textAlign: "center", lineHeight: 22, marginTop: SPACE.sm, marginHorizontal: SPACE.xl }}>
                {profile.bio}
              </Text>
            ) : null}

            {/* メタ情報 */}
            <View style={{ flexDirection: "row", alignItems: "center", gap: SPACE.lg, marginTop: SPACE.md }}>
              {profile.location ? (
                <View style={{ flexDirection: "row", alignItems: "center", gap: SPACE.xs }}>
                  <MapPin size={14} color={t.muted} />
                  <Text style={{ fontSize: fs.sm, color: t.muted }}>{profile.location}</Text>
                </View>
              ) : null}
              <View style={{ flexDirection: "row", alignItems: "center", gap: SPACE.xs }}>
                <Calendar size={14} color={t.muted} />
                <Text style={{ fontSize: fs.sm, color: t.muted }}>{profile.joinDate}から</Text>
              </View>
            </View>

            {/* フォローボタン */}
            {!isOwnProfile && user && (
              <Pressable
                onPress={() => toggleFollow(userId)}
                disabled={followPending}
                style={({ pressed }) => ({
                  marginTop: SPACE.md,
                  paddingHorizontal: SPACE.xxl,
                  paddingVertical: SPACE.sm,
                  borderRadius: RADIUS.xxl,
                  backgroundColor: isFollowing ? t.surface : t.accent,
                  borderWidth: 1,
                  borderColor: isFollowing ? t.border : t.accent,
                  opacity: pressed || followPending ? 0.7 : 1,
                })}
              >
                <Text style={{ fontSize: fs.base, fontWeight: WEIGHT.bold, color: isFollowing ? t.text : "#fff" }}>
                  {isFollowing ? "フォロー中" : "フォローする"}
                </Text>
              </Pressable>
            )}
          </View>

          {/* 統計 */}
          <View style={{ flexDirection: "row", justifyContent: "space-around", paddingVertical: SPACE.lg, backgroundColor: t.surface, borderTopWidth: 1, borderTopColor: t.border, borderBottomWidth: 1, borderBottomColor: t.border }}>
            <Pressable onPress={() => router.push(`/follow-list/${userId}?tab=followers` as any)} style={{ alignItems: "center" }}>
              <Text style={{ fontSize: fs.xxl, fontWeight: WEIGHT.extrabold, color: t.accent }}>{followCounts?.followers_count ?? 0}</Text>
              <Text style={{ fontSize: fs.xs, color: t.muted }}>フォロワー</Text>
            </Pressable>
            <Pressable onPress={() => router.push(`/follow-list/${userId}?tab=following` as any)} style={{ alignItems: "center" }}>
              <Text style={{ fontSize: fs.xxl, fontWeight: WEIGHT.extrabold, color: t.accent }}>{followCounts?.following_count ?? 0}</Text>
              <Text style={{ fontSize: fs.xs, color: t.muted }}>フォロー中</Text>
            </Pressable>
            <View style={{ alignItems: "center" }}>
              <Text style={{ fontSize: fs.xxl, fontWeight: WEIGHT.extrabold, color: t.accent }}>{posts.length}</Text>
              <Text style={{ fontSize: fs.xs, color: t.muted }}>投稿</Text>
            </View>
            <View style={{ alignItems: "center" }}>
              <Text style={{ fontSize: fs.xxl, fontWeight: WEIGHT.extrabold, color: t.accent }}>{talks.length}</Text>
              <Text style={{ fontSize: fs.xs, color: t.muted }}>ひとこと</Text>
            </View>
          </View>

          {/* バッジ */}
          {badges && badges.length > 0 && (
            <BadgeSection badges={badges} t={t} />
          )}

          {/* タブ切替 */}
          <View style={{ flexDirection: "row", borderBottomWidth: 1, borderBottomColor: t.border }}>
            {([
              { id: "posts" as ProfileTab, label: "投稿", icon: PenLine, count: posts.length },
              { id: "talks" as ProfileTab, label: "トーク", icon: MessageCircle, count: talks.length },
            ]).map((tab) => {
              const active = activeTab === tab.id;
              const Icon = tab.icon;
              return (
                <Pressable
                  key={tab.id}
                  onPress={() => setActiveTab(tab.id)}
                  style={{
                    flex: 1,
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: SPACE.xs,
                    paddingVertical: SPACE.md,
                    borderBottomWidth: 2,
                    borderBottomColor: active ? t.accent : "transparent",
                    backgroundColor: active ? t.accent + "15" : "transparent",
                  }}
                >
                  <Icon size={16} color={active ? t.accent : t.muted} />
                  <Text style={{ fontSize: fs.sm, fontWeight: active ? "700" : WEIGHT.bold, color: active ? t.accent : t.muted }}>
                    {tab.label} {tab.count}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          {/* 投稿タブ */}
          {activeTab === "posts" && (
            <View style={{ paddingHorizontal: SPACE.xl, paddingTop: SPACE.lg }}>
              {posts.length > 0 ? posts.map((post) => (
                <Pressable
                  key={post.id}
                  onPress={() => router.push(`/feed/${post.id}` as any)}
                  style={({ pressed }) => ({
                    flexDirection: "row",
                    gap: SPACE.md,
                    padding: SPACE.md,
                    marginBottom: SPACE.sm,
                    borderRadius: RADIUS.md,
                    backgroundColor: t.surface,
                    borderWidth: 1,
                    borderColor: t.border,
                    opacity: pressed ? 0.7 : 1,
                  })}
                >
                  {post.image_url && <Image source={{ uri: post.image_url }} style={{ width: 60, height: 60, borderRadius: RADIUS.sm }} contentFit="cover" />}
                  <View style={{ flex: 1, justifyContent: "center" }}>
                    <View style={{ flexDirection: "row", alignItems: "center", gap: SPACE.sm, marginBottom: SPACE.xs }}>
                      <CatPill cat={post.category} small />
                      <Text style={{ fontSize: fs.xs, color: t.muted }}>
                        {new Date(post.created_at).toLocaleDateString("ja-JP")}
                      </Text>
                    </View>
                    <Text style={{ fontSize: fs.base, fontWeight: WEIGHT.semibold, color: t.text }} numberOfLines={2}>
                      {post.title}
                    </Text>
                    <View style={{ flexDirection: "row", alignItems: "center", gap: SPACE.lg, marginTop: SPACE.xs }}>
                      <View style={{ flexDirection: "row", alignItems: "center", gap: SPACE.xs }}>
                        <ThumbsUp size={12} color={t.muted} />
                        <Text style={{ fontSize: fs.xs, color: t.muted }}>{post.likes_count}</Text>
                      </View>
                      <View style={{ flexDirection: "row", alignItems: "center", gap: SPACE.xs }}>
                        <MessageCircle size={12} color={t.muted} />
                        <Text style={{ fontSize: fs.xs, color: t.muted }}>{post.comments_count}</Text>
                      </View>
                    </View>
                  </View>
                </Pressable>
              )) : (
                <View style={{ alignItems: "center", paddingVertical: SPACE.xxxl }}>
                  <Text style={{ fontSize: fs.sm, color: t.muted }}>まだ投稿がありません</Text>
                </View>
              )}
            </View>
          )}

          {/* トークタブ */}
          {activeTab === "talks" && (
            <View style={{ paddingHorizontal: SPACE.xl, paddingTop: SPACE.lg }}>
              {talks.length > 0 ? talks.map((talk) => (
                <Pressable
                  key={talk.id}
                  onPress={() => router.push(`/talk-detail/${talk.id}` as any)}
                  style={({ pressed }) => ({
                    padding: SPACE.md,
                    marginBottom: SPACE.sm,
                    borderRadius: RADIUS.md,
                    backgroundColor: t.surface,
                    borderWidth: 1,
                    borderColor: t.border,
                    opacity: pressed ? 0.7 : 1,
                  })}
                >
                  <Text style={{ fontSize: fs.base, color: t.text, lineHeight: 20 }} numberOfLines={3}>
                    {talk.message}
                  </Text>
                  <View style={{ flexDirection: "row", alignItems: "center", gap: SPACE.lg, marginTop: SPACE.sm }}>
                    <Text style={{ fontSize: fs.xxs, color: t.muted }}>{timeAgo(talk.created_at)}</Text>
                    <View style={{ flexDirection: "row", alignItems: "center", gap: SPACE.xs }}>
                      <ThumbsUp size={12} color={t.muted} />
                      <Text style={{ fontSize: fs.xxs, color: t.muted }}>{talk.likes_count}</Text>
                    </View>
                    <View style={{ flexDirection: "row", alignItems: "center", gap: SPACE.xs }}>
                      <MessageCircle size={12} color={t.muted} />
                      <Text style={{ fontSize: fs.xxs, color: t.muted }}>{talk.replies_count}</Text>
                    </View>
                  </View>
                </Pressable>
              )) : (
                <View style={{ alignItems: "center", paddingVertical: SPACE.xxxl }}>
                  <Text style={{ fontSize: fs.sm, color: t.muted }}>まだトークがありません</Text>
                </View>
              )}
            </View>
          )}
        </ScrollView>
      )}
    </View>
  );
}
