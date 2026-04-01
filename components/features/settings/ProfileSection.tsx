import { View, Text, Pressable, Animated, Easing } from "react-native";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { User, Edit3, PenLine, MessageCircle, ThumbsUp, MessageSquare } from "@/lib/icons";
import type { ThemeTokens } from "@/constants/theme";
import type { Profile } from "@/types";
import { useAuth } from "@/hooks/useAuth";
import { useUserPosts, useUserTalks } from "@/hooks/useProfile";
import { WEIGHT, SPACE, RADIUS, getScaledFontSize } from "@/lib/styles";
import { useFontSizeStore } from "@/stores/fontSizeStore";
import { useEffect, useRef } from "react";

interface ProfileSectionProps {
  t: ThemeTokens;
  isGuest: boolean;
  profile: Profile | null;
}

/** アバター周囲のグローアニメーション */
function AvatarGlow({ t, children }: { t: ThemeTokens; children: React.ReactNode }) {
  const glowOpacity = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(glowOpacity, { toValue: 0.7, duration: 2000, easing: Easing.inOut(Easing.ease), useNativeDriver: false }),
        Animated.timing(glowOpacity, { toValue: 0.3, duration: 2000, easing: Easing.inOut(Easing.ease), useNativeDriver: false }),
      ]),
    ).start();
  }, []);

  return (
    <Animated.View
      style={[
        {
          borderRadius: 36,
          shadowColor: t.accent,
          shadowOffset: { width: 0, height: 0 },
          shadowRadius: 14,
          elevation: 6,
        },
        { shadowOpacity: glowOpacity },
      ]}
    >
      {children}
    </Animated.View>
  );
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
      <View style={{ overflow: "hidden" }}>
        <LinearGradient
          colors={[t.accent + "15", t.blue + "10", t.surface]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{ padding: SPACE.xl, paddingTop: SPACE.xxxl, paddingBottom: SPACE.xxl, alignItems: "center" }}
        >
          <AvatarGlow t={t}>
            <LinearGradient
              colors={[t.accent, t.blue]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={{ width: 72, height: 72, borderRadius: 36, alignItems: "center", justifyContent: "center" }}
            >
              <User size={32} color="#fff" />
            </LinearGradient>
          </AvatarGlow>

          <Text style={{ fontSize: fs.xxl, fontWeight: WEIGHT.extrabold, color: t.text, marginTop: SPACE.lg, marginBottom: SPACE.sm }}>
            ゲストモード
          </Text>

          {/* ログインメリット */}
          <View style={{ width: "100%", gap: SPACE.sm, marginBottom: SPACE.xl }}>
            {[
              { icon: PenLine, text: "地域の情報を投稿できる", color: t.accent },
              { icon: ThumbsUp, text: "気になる投稿にGoodできる", color: t.like },
              { icon: MessageSquare, text: "コメントで交流できる", color: t.blue },
            ].map((item) => (
              <View key={item.text} style={{ flexDirection: "row", alignItems: "center", gap: SPACE.md, paddingHorizontal: SPACE.md }}>
                <View style={{ width: 32, height: 32, borderRadius: 16, backgroundColor: item.color + "15", alignItems: "center", justifyContent: "center" }}>
                  <item.icon size={14} color={item.color} />
                </View>
                <Text style={{ fontSize: fs.sm, color: t.sub, fontWeight: WEIGHT.semibold }}>{item.text}</Text>
              </View>
            ))}
          </View>

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
              style={{ paddingVertical: SPACE.md + 2, borderRadius: RADIUS.lg, alignItems: "center" }}
            >
              <Text style={{ fontSize: fs.lg, fontWeight: WEIGHT.bold, color: "#000" }}>ログイン</Text>
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
              borderWidth: 1,
              borderColor: t.border,
              alignItems: "center",
              marginTop: SPACE.sm,
              opacity: pressed ? 0.7 : 1,
            })}
          >
            <Text style={{ fontSize: fs.sm, fontWeight: WEIGHT.semibold, color: t.accent }}>新規登録はこちら</Text>
          </Pressable>
        </LinearGradient>
      </View>
    );
  }

  return (
    <View style={{ overflow: "hidden" }}>
      <LinearGradient
        colors={[t.accent + "12", t.surface]}
        start={{ x: 0, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={{ borderBottomWidth: 1, borderBottomColor: t.border }}
      >
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
            paddingTop: SPACE.xxl,
            opacity: pressed ? 0.8 : 1,
          })}
        >
          {/* アバター */}
          <AvatarGlow t={t}>
            {profile?.avatar_url ? (
              <Image
                source={{ uri: profile.avatar_url }}
                style={{ width: 64, height: 64, borderRadius: 32, borderWidth: 2.5, borderColor: t.accent + "40" }}
                contentFit="cover"
              />
            ) : (
              <LinearGradient
                colors={[t.accent, t.blue]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={{ width: 64, height: 64, borderRadius: 32, alignItems: "center", justifyContent: "center" }}
              >
                <User size={28} color="#fff" />
              </LinearGradient>
            )}
          </AvatarGlow>

          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: fs.xxl, fontWeight: WEIGHT.extrabold, color: t.text }}>
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

          <View style={{ width: 32, height: 32, borderRadius: 16, backgroundColor: t.surface2, alignItems: "center", justifyContent: "center" }}>
            <Edit3 size={14} color={t.sub} />
          </View>
        </Pressable>

        {/* 活動サマリー */}
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
      </LinearGradient>
    </View>
  );
}
