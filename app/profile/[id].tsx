import { View, Text, ScrollView, Pressable } from "react-native";
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
import { makeTokens } from "@/constants/theme";
import { useThemeStore } from "@/stores/themeStore";
import { FEED_POSTS, CHAT_ROOMS } from "@/data/mockData";
import { createStyles, FONT_SIZE, WEIGHT, SPACE, RADIUS } from "@/lib/styles";
import CatPill from "@/components/ui/CatPill";

/** モックユーザープロフィール */
const MOCK_PROFILES: Record<number, { name: string; avatar: string; bio: string; verified: boolean; location: string; joinDate: string; checkins: number; badges: number; followers: number; following: number }> = {
  1: { name: "田中商店", avatar: "https://i.pravatar.cc/100?img=1", bio: "越谷市で40年の八百屋です。毎朝新鮮な野菜を仕入れています。", verified: true, location: "越谷市駅前", joinDate: "2024年4月", checkins: 234, badges: 12, followers: 156, following: 23 },
  2: { name: "健康ヨガクラブ", avatar: "https://i.pravatar.cc/100?img=5", bio: "毎朝中央公園でヨガ会を開催中！初心者大歓迎です。", verified: false, location: "中央公園", joinDate: "2024年6月", checkins: 89, badges: 5, followers: 67, following: 12 },
  3: { name: "ベーカリー佐藤", avatar: "https://i.pravatar.cc/100?img=3", bio: "手作りパンのお店。毎日焼きたてをお届けします。", verified: true, location: "商店街エリア", joinDate: "2024年3月", checkins: 312, badges: 15, followers: 289, following: 45 },
  4: { name: "山田さん", avatar: "https://i.pravatar.cc/100?img=8", bio: "家庭菜園が趣味です。お裾分けもしています！", verified: false, location: "住宅街エリア", joinDate: "2024年8月", checkins: 45, badges: 3, followers: 23, following: 34 },
  5: { name: "〇〇市役所", avatar: "https://i.pravatar.cc/100?img=12", bio: "〇〇市の公式アカウントです。行政情報をお届けします。", verified: true, location: "市役所", joinDate: "2024年1月", checkins: 567, badges: 20, followers: 1200, following: 5 },
};

/** ユーザープロフィール画面 */
export default function ProfileScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { isDark } = useThemeStore();
  const t = makeTokens(isDark);
  const s = createStyles(t);

  const profileId = Number(id);
  const profile = MOCK_PROFILES[profileId] || {
    name: "ユーザー",
    avatar: `https://i.pravatar.cc/100?img=${profileId}`,
    bio: "Naviosユーザー",
    verified: false,
    location: "越谷市",
    joinDate: "2024年",
    checkins: 0,
    badges: 0,
    followers: 0,
    following: 0,
  };

  /** このユーザーの投稿を取得 */
  const userPosts = FEED_POSTS.filter((p) => p.user.name === profile.name);
  const userTalks = CHAT_ROOMS.filter((c) => c.user === profile.name);

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
        <Text style={s.textHeading} numberOfLines={1}>{profile.name}</Text>
      </View>

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

          <Text style={{ fontSize: FONT_SIZE.xxl, fontWeight: WEIGHT.extrabold, color: t.text }}>{profile.name}</Text>
          <Text style={{ fontSize: FONT_SIZE.base, color: t.sub, textAlign: "center", lineHeight: 22, marginTop: SPACE.sm, marginHorizontal: SPACE.xl }}>
            {profile.bio}
          </Text>

          {/* メタ情報 */}
          <View style={{ flexDirection: "row", alignItems: "center", gap: SPACE.lg, marginTop: SPACE.md }}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: SPACE.xs }}>
              <MapPin size={14} color={t.muted} />
              <Text style={{ fontSize: FONT_SIZE.sm, color: t.muted }}>{profile.location}</Text>
            </View>
            <View style={{ flexDirection: "row", alignItems: "center", gap: SPACE.xs }}>
              <Calendar size={14} color={t.muted} />
              <Text style={{ fontSize: FONT_SIZE.sm, color: t.muted }}>{profile.joinDate}から</Text>
            </View>
          </View>

          {/* フォロー情報 */}
          <View style={{ flexDirection: "row", alignItems: "center", gap: SPACE.xl, marginTop: SPACE.lg }}>
            <View style={{ alignItems: "center" }}>
              <Text style={{ fontSize: FONT_SIZE.xl, fontWeight: WEIGHT.extrabold, color: t.text }}>{profile.followers}</Text>
              <Text style={{ fontSize: FONT_SIZE.xs, color: t.muted }}>フォロワー</Text>
            </View>
            <View style={{ width: 1, height: 24, backgroundColor: t.border }} />
            <View style={{ alignItems: "center" }}>
              <Text style={{ fontSize: FONT_SIZE.xl, fontWeight: WEIGHT.extrabold, color: t.text }}>{profile.following}</Text>
              <Text style={{ fontSize: FONT_SIZE.xs, color: t.muted }}>フォロー中</Text>
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
              <Text style={{ fontSize: FONT_SIZE.base, fontWeight: WEIGHT.bold, color: "#000" }}>フォローする</Text>
            </LinearGradient>
          </Pressable>
        </View>

        {/* 統計 */}
        <View style={{ flexDirection: "row", justifyContent: "space-around", paddingVertical: SPACE.lg, backgroundColor: t.surface, borderTopWidth: 1, borderTopColor: t.border, borderBottomWidth: 1, borderBottomColor: t.border }}>
          <View style={{ alignItems: "center" }}>
            <Text style={{ fontSize: FONT_SIZE.xxl, fontWeight: WEIGHT.extrabold, color: t.accent }}>{profile.checkins}</Text>
            <Text style={{ fontSize: FONT_SIZE.xs, color: t.muted }}>チェックイン</Text>
          </View>
          <View style={{ alignItems: "center" }}>
            <Text style={{ fontSize: FONT_SIZE.xxl, fontWeight: WEIGHT.extrabold, color: t.accent }}>{profile.badges}</Text>
            <Text style={{ fontSize: FONT_SIZE.xs, color: t.muted }}>バッジ</Text>
          </View>
          <View style={{ alignItems: "center" }}>
            <Text style={{ fontSize: FONT_SIZE.xxl, fontWeight: WEIGHT.extrabold, color: t.accent }}>{userPosts.length + userTalks.length}</Text>
            <Text style={{ fontSize: FONT_SIZE.xs, color: t.muted }}>投稿数</Text>
          </View>
        </View>

        {/* バッジセクション */}
        {profile.badges > 0 && (
          <View style={{ paddingHorizontal: SPACE.xl, paddingTop: SPACE.xl }}>
            <Text style={[s.textSubheading, { marginBottom: SPACE.md }]}>獲得バッジ</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: SPACE.md }}>
              {[
                { label: "初投稿", color: t.accent },
                { label: "常連", color: t.amber },
                { label: "人気者", color: t.red },
                ...(profile.badges > 3 ? [{ label: "地域の星", color: t.purple }] : []),
                ...(profile.badges > 5 ? [{ label: "ヘルパー", color: t.blue }] : []),
              ].map((badge) => (
                <View key={badge.label} style={{ alignItems: "center", gap: SPACE.xs }}>
                  <View style={{ width: 52, height: 52, borderRadius: 26, backgroundColor: badge.color + "20", alignItems: "center", justifyContent: "center", borderWidth: 1.5, borderColor: badge.color + "40" }}>
                    <Award size={22} color={badge.color} />
                  </View>
                  <Text style={{ fontSize: FONT_SIZE.xxs, fontWeight: WEIGHT.semibold, color: t.sub }}>{badge.label}</Text>
                </View>
              ))}
            </ScrollView>
          </View>
        )}

        {/* 最近の投稿 */}
        {userPosts.length > 0 && (
          <View style={{ paddingHorizontal: SPACE.xl, paddingTop: SPACE.xxl }}>
            <Text style={[s.textSubheading, { marginBottom: SPACE.md }]}>最近の投稿</Text>
            {userPosts.map((post) => (
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
                <Image source={{ uri: post.image }} style={{ width: 60, height: 60, borderRadius: RADIUS.sm }} contentFit="cover" />
                <View style={{ flex: 1, justifyContent: "center" }}>
                  <View style={{ flexDirection: "row", alignItems: "center", gap: SPACE.sm, marginBottom: SPACE.xs }}>
                    <CatPill cat={post.category} small />
                    <Text style={{ fontSize: FONT_SIZE.xs, color: t.muted }}>{post.time}</Text>
                  </View>
                  <Text style={{ fontSize: FONT_SIZE.base, fontWeight: WEIGHT.semibold, color: t.text }} numberOfLines={2}>
                    {post.caption}
                  </Text>
                  <View style={{ flexDirection: "row", alignItems: "center", gap: SPACE.lg, marginTop: SPACE.xs }}>
                    <View style={{ flexDirection: "row", alignItems: "center", gap: SPACE.xs }}>
                      <Heart size={12} color={t.muted} />
                      <Text style={{ fontSize: FONT_SIZE.xs, color: t.muted }}>{post.likes}</Text>
                    </View>
                    <View style={{ flexDirection: "row", alignItems: "center", gap: SPACE.xs }}>
                      <MessageCircle size={12} color={t.muted} />
                      <Text style={{ fontSize: FONT_SIZE.xs, color: t.muted }}>3</Text>
                    </View>
                  </View>
                </View>
              </Pressable>
            ))}
          </View>
        )}

        {/* 投稿がない場合 */}
        {userPosts.length === 0 && userTalks.length === 0 && (
          <View style={{ alignItems: "center", paddingVertical: SPACE.xxxl, paddingHorizontal: SPACE.xl }}>
            <Text style={{ fontSize: FONT_SIZE.lg, fontWeight: WEIGHT.semibold, color: t.sub }}>まだ投稿がありません</Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}
