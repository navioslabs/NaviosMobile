import { View, Text, Pressable } from "react-native";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { User, Edit3, PenLine, MessageCircle } from "@/lib/icons";
import type { ThemeTokens } from "@/constants/theme";
import type { Profile } from "@/types";
import { useAuth } from "@/hooks/useAuth";
import { useUserPosts, useUserTalks } from "@/hooks/useProfile";
import { WEIGHT, SPACE, RADIUS, getScaledFontSize } from "@/lib/styles";
import { useFontSizeStore } from "@/stores/fontSizeStore";

interface ProfileSectionProps {
  t: ThemeTokens;
  isGuest: boolean;
  profile: Profile | null;
}

/** マイページ プロフィールセクション */
export default function ProfileSection({ t, isGuest, profile }: ProfileSectionProps) {
  const { scale } = useFontSizeStore();
  const fs = getScaledFontSize(scale);
  const { user } = useAuth();

  const userId = user?.id ?? "";
  const { data: posts } = useUserPosts(userId);
  const { data: talks } = useUserTalks(userId);
  const postCount = posts?.length ?? 0;
  const talkCount = talks?.length ?? 0;

  // ゲスト時はログインCTAを表示
  if (isGuest) {
    return (
      <View style={{ padding: SPACE.xl, paddingTop: SPACE.xxl, paddingBottom: SPACE.xxl, backgroundColor: t.surface, borderBottomWidth: 1, borderBottomColor: t.border, alignItems: "center" }}>
        <LinearGradient
          colors={[t.accent, t.blue]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{ width: 64, height: 64, borderRadius: 32, alignItems: "center", justifyContent: "center", marginBottom: SPACE.lg }}
        >
          <User size={28} color="#fff" />
        </LinearGradient>
        <Text style={{ fontSize: fs.xl, fontWeight: WEIGHT.extrabold, color: t.text, marginBottom: SPACE.xs }}>
          ゲストモード
        </Text>
        <Text style={{ fontSize: fs.sm, color: t.sub, textAlign: "center", lineHeight: 20, marginBottom: SPACE.xl }}>
          ログインすると投稿やいいねができます
        </Text>
        <Pressable
          onPress={() => router.push("/(auth)/login")}
          accessibilityLabel="ログイン"
          accessibilityRole="button"
          style={({ pressed }) => ({ width: "100%", opacity: pressed ? 0.85 : 1 })}
        >
          <LinearGradient
            colors={[t.accent, t.blue]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{ paddingVertical: SPACE.md, borderRadius: RADIUS.lg, alignItems: "center" }}
          >
            <Text style={{ fontSize: fs.base, fontWeight: WEIGHT.bold, color: "#000" }}>ログイン</Text>
          </LinearGradient>
        </Pressable>
        <Pressable
          onPress={() => router.push("/(auth)/signup")}
          accessibilityLabel="新規登録"
          accessibilityRole="button"
          style={({ pressed }) => ({
            width: "100%",
            paddingVertical: SPACE.md,
            borderRadius: RADIUS.lg,
            alignItems: "center",
            marginTop: SPACE.sm,
            opacity: pressed ? 0.7 : 1,
          })}
        >
          <Text style={{ fontSize: fs.sm, fontWeight: WEIGHT.semibold, color: t.accent }}>新規登録はこちら</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={{ backgroundColor: t.surface, borderBottomWidth: 1, borderBottomColor: t.border }}>
      {/* プロフィール情報 */}
      <Pressable
        onPress={() => router.push("/profile/edit")}
        accessibilityLabel="プロフィールを編集"
        accessibilityRole="button"
        style={({ pressed }) => ({
          flexDirection: "row",
          alignItems: "center",
          gap: SPACE.lg,
          padding: SPACE.xl,
          opacity: pressed ? 0.8 : 1,
        })}
      >
        {/* アバター */}
        {profile?.avatar_url ? (
          <Image
            source={{ uri: profile.avatar_url }}
            style={{ width: 60, height: 60, borderRadius: 30, borderWidth: 2, borderColor: t.accent + "30" }}
            contentFit="cover"
          />
        ) : (
          <LinearGradient
            colors={[t.accent, t.blue]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{ width: 60, height: 60, borderRadius: 30, alignItems: "center", justifyContent: "center" }}
          >
            <User size={26} color="#fff" />
          </LinearGradient>
        )}

        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: fs.xl, fontWeight: WEIGHT.extrabold, color: t.text }}>
            {profile?.display_name ?? "ユーザー"}
          </Text>
          {profile?.bio ? (
            <Text style={{ fontSize: fs.sm, color: t.sub, marginTop: 2 }} numberOfLines={1}>
              {profile.bio}
            </Text>
          ) : (
            <Text style={{ fontSize: fs.sm, color: t.muted, marginTop: 2 }}>
              自己紹介を追加しよう
            </Text>
          )}
        </View>

        <Edit3 size={16} color={t.muted} />
      </Pressable>

      {/* 活動サマリー + 自分の投稿を見る */}
      <View style={{ flexDirection: "row", paddingHorizontal: SPACE.xl, paddingBottom: SPACE.lg, gap: SPACE.sm }}>
        <Pressable
          onPress={() => router.push(`/profile/${userId}` as any)}
          accessibilityLabel={`投稿 ${postCount}件`}
          accessibilityRole="button"
          style={({ pressed }) => ({
            flex: 1,
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            gap: SPACE.sm,
            paddingVertical: SPACE.md,
            borderRadius: RADIUS.lg,
            backgroundColor: t.surface2,
            borderWidth: 1,
            borderColor: t.border,
            opacity: pressed ? 0.7 : 1,
          })}
        >
          <PenLine size={14} color={t.accent} />
          <Text style={{ fontSize: fs.sm, fontWeight: WEIGHT.bold, color: t.text }}>投稿</Text>
          <Text style={{ fontSize: fs.lg, fontWeight: WEIGHT.extrabold, color: t.accent }}>{postCount}</Text>
        </Pressable>

        <Pressable
          onPress={() => router.push(`/profile/${userId}` as any)}
          accessibilityLabel={`トーク ${talkCount}件`}
          accessibilityRole="button"
          style={({ pressed }) => ({
            flex: 1,
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            gap: SPACE.sm,
            paddingVertical: SPACE.md,
            borderRadius: RADIUS.lg,
            backgroundColor: t.surface2,
            borderWidth: 1,
            borderColor: t.border,
            opacity: pressed ? 0.7 : 1,
          })}
        >
          <MessageCircle size={14} color={t.blue} />
          <Text style={{ fontSize: fs.sm, fontWeight: WEIGHT.bold, color: t.text }}>トーク</Text>
          <Text style={{ fontSize: fs.lg, fontWeight: WEIGHT.extrabold, color: t.blue }}>{talkCount}</Text>
        </Pressable>
      </View>
    </View>
  );
}
