import { View, Text, ScrollView, Pressable, ActivityIndicator } from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import {
  ChevronLeft,
  MapPin,
  Calendar,
  UserCheck,
  Award,
  MessageCircle,
  Heart,
} from "@/lib/icons";
import { useProfile, useUserPosts, useUserTalks } from "@/hooks/useProfile";
import { useAppStyles } from "@/hooks/useAppStyles";
import { WEIGHT, SPACE, RADIUS } from "@/lib/styles";
import CatPill from "@/components/ui/CatPill";

/** ユーザープロフィール画面 */
export default function ProfileScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { s, t, fs } = useAppStyles();

  const userId = id ?? "";
  const { data: remoteProfile, isLoading: profileLoading } = useProfile(userId);
  const { data: userPosts } = useUserPosts(userId);
  const { data: userTalks } = useUserTalks(userId);

  const posts = userPosts ?? [];
  const talks = userTalks ?? [];

  const profile = remoteProfile
    ? {
        name: remoteProfile.display_name,
        avatar: remoteProfile.avatar_url ?? "https://i.pravatar.cc/100",
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
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
          {/* プロフィールヘッダー */}
          <View style={{ alignItems: "center", paddingVertical: SPACE.xxl, paddingHorizontal: SPACE.xl }}>
            <View style={{ position: "relative", marginBottom: SPACE.lg }}>
              <Image source={{ uri: profile.avatar }} style={{ width: 80, height: 80, borderRadius: 40, borderWidth: 3, borderColor: t.accent + "40" }} contentFit="cover" />
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
            <Pressable style={({ pressed }) => ({ marginTop: SPACE.lg, opacity: pressed ? 0.8 : 1 })}>
              <LinearGradient
                colors={[t.accent, t.blue]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={{ borderRadius: RADIUS.full, paddingHorizontal: SPACE.xxxl, paddingVertical: SPACE.md }}
              >
                <Text style={{ fontSize: fs.base, fontWeight: WEIGHT.bold, color: "#000" }}>フォローする</Text>
              </LinearGradient>
            </Pressable>
          </View>

          {/* 統計 */}
          <View style={{ flexDirection: "row", justifyContent: "space-around", paddingVertical: SPACE.lg, backgroundColor: t.surface, borderTopWidth: 1, borderTopColor: t.border, borderBottomWidth: 1, borderBottomColor: t.border }}>
            <View style={{ alignItems: "center" }}>
              <Text style={{ fontSize: fs.xxl, fontWeight: WEIGHT.extrabold, color: t.accent }}>{posts.length}</Text>
              <Text style={{ fontSize: fs.xs, color: t.muted }}>投稿</Text>
            </View>
            <View style={{ alignItems: "center" }}>
              <Text style={{ fontSize: fs.xxl, fontWeight: WEIGHT.extrabold, color: t.accent }}>{talks.length}</Text>
              <Text style={{ fontSize: fs.xs, color: t.muted }}>ひとこと</Text>
            </View>
          </View>

          {/* 最近の投稿 */}
          {posts.length > 0 && (
            <View style={{ paddingHorizontal: SPACE.xl, paddingTop: SPACE.xxl }}>
              <Text style={[s.textSubheading, { marginBottom: SPACE.md }]}>最近の投稿</Text>
              {posts.map((post) => (
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
                        <Heart size={12} color={t.muted} />
                        <Text style={{ fontSize: fs.xs, color: t.muted }}>{post.likes_count}</Text>
                      </View>
                      <View style={{ flexDirection: "row", alignItems: "center", gap: SPACE.xs }}>
                        <MessageCircle size={12} color={t.muted} />
                        <Text style={{ fontSize: fs.xs, color: t.muted }}>{post.comments_count}</Text>
                      </View>
                    </View>
                  </View>
                </Pressable>
              ))}
            </View>
          )}

          {/* 投稿がない場合 */}
          {posts.length === 0 && talks.length === 0 && (
            <View style={{ alignItems: "center", paddingVertical: SPACE.xxxl, paddingHorizontal: SPACE.xl }}>
              <Text style={{ fontSize: fs.lg, fontWeight: WEIGHT.semibold, color: t.sub }}>まだ投稿がありません</Text>
            </View>
          )}
        </ScrollView>
      )}
    </View>
  );
}
