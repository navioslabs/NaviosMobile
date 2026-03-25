import { useState } from "react";
import { View, Text, ScrollView, Pressable, StyleSheet } from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import {
  ChevronLeft,
  Share,
  Navigation,
  Clock,
  UserCheck,
  Bookmark,
  Check,
  Timer,
} from "@/lib/icons";
import { makeTokens } from "@/constants/theme";
import { CAT_CONFIG } from "@/constants/categories";
import { useThemeStore } from "@/stores/themeStore";
import { FEED_POSTS } from "@/data/mockData";
import { distLabel } from "@/lib/utils";
import { createStyles, FONT_SIZE, WEIGHT, SPACE, RADIUS } from "@/lib/styles";
import CatPill from "@/components/ui/CatPill";

/** 徒歩時間の概算（80m/分） */
const walkTime = (d: number) => `徒歩${Math.max(1, Math.round(d / 80))}分`;

/** 締め切り表示テキスト */
const deadlineLabel = (timeLeft: number) => {
  if (timeLeft <= 60) return `本日 ${new Date(Date.now() + timeLeft * 60000).getHours()}:${String(new Date(Date.now() + timeLeft * 60000).getMinutes()).padStart(2, "0")} まで`;
  if (timeLeft <= 1440) return `本日中`;
  return `残り${Math.ceil(timeLeft / 60)}時間`;
};

/** モック持ち物データ（カテゴリ別） */
const REQUIRED_ITEMS: Record<string, string[]> = {
  admin: ["身分証明書", "振込口座情報の控え", "印鑑"],
  stock: [],
  event: ["動きやすい服装", "飲み物"],
  help: ["軍手", "作業しやすい服装"],
};

/** 投稿詳細画面 */
export default function FeedDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { isDark } = useThemeStore();
  const t = makeTokens(isDark);
  const s = createStyles(t);

  const post = FEED_POSTS.find((p) => p.id === Number(id));
  const [isSaved, setIsSaved] = useState(false);

  if (!post) {
    return (
      <View style={[s.screen, { alignItems: "center", justifyContent: "center" }]}>
        <Text style={s.textSubheading}>投稿が見つかりません</Text>
        <Pressable onPress={() => router.back()} style={{ marginTop: SPACE.lg }}>
          <Text style={{ color: t.accent, fontSize: FONT_SIZE.base, fontWeight: WEIGHT.bold }}>戻る</Text>
        </Pressable>
      </View>
    );
  }

  const catConfig = CAT_CONFIG[post.category];
  const items = REQUIRED_ITEMS[post.category] || [];
  const isUrgent = post.timeLeft <= 60;

  return (
    <View style={s.screen}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* ═══ ヒーロー画像 ═══ */}
        <View style={{ position: "relative", height: 260 }}>
          <Image source={{ uri: post.image }} style={StyleSheet.absoluteFill} contentFit="cover" />
          <LinearGradient
            colors={["rgba(0,0,0,0.45)", "rgba(0,0,0,0.1)", "rgba(0,0,0,0.75)"]}
            locations={[0, 0.4, 1]}
            style={StyleSheet.absoluteFill}
          />

          {/* 戻るボタン（左上） */}
          <Pressable
            onPress={() => router.back()}
            style={({ pressed }) => ({
              position: "absolute",
              top: 52,
              left: SPACE.lg,
              width: 38,
              height: 38,
              borderRadius: 19,
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: "rgba(0,0,0,0.35)",
              opacity: pressed ? 0.7 : 1,
            })}
          >
            <ChevronLeft size={22} color="#fff" />
          </Pressable>

          {/* カテゴリピル（画像上、不透明背景で視認性確保） */}
          <View style={{ position: "absolute", top: 56, left: SPACE.lg + 46, flexDirection: "row", gap: SPACE.sm }}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 4, borderRadius: RADIUS.full, paddingHorizontal: 10, paddingVertical: 5, backgroundColor: catConfig.color, shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.3, shadowRadius: 4, elevation: 3 }}>
              <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: "#fff" }} />
              <Text style={{ fontSize: FONT_SIZE.xxs, fontWeight: WEIGHT.extrabold, color: "#fff" }}>{catConfig.label}</Text>
            </View>
            {isUrgent && (
              <View style={{ flexDirection: "row", alignItems: "center", gap: 4, borderRadius: RADIUS.full, paddingHorizontal: 10, paddingVertical: 5, backgroundColor: t.red, shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.3, shadowRadius: 4, elevation: 3 }}>
                <Timer size={12} color="#fff" />
                <Text style={{ fontSize: FONT_SIZE.xxs, fontWeight: WEIGHT.extrabold, color: "#fff" }}>急ぎ</Text>
              </View>
            )}
          </View>

          {/* 共有 + 保存ボタン（右上） */}
          <View style={{ position: "absolute", top: 52, right: SPACE.lg, flexDirection: "row", gap: SPACE.sm }}>
            <Pressable
              style={({ pressed }) => ({
                width: 38,
                height: 38,
                borderRadius: 12,
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: t.surface,
                borderWidth: 1,
                borderColor: t.border,
                opacity: pressed ? 0.7 : 1,
              })}
            >
              <Share size={17} color={t.sub} />
            </Pressable>
            <Pressable
              onPress={() => setIsSaved(!isSaved)}
              style={({ pressed }) => ({
                width: 38,
                height: 38,
                borderRadius: 12,
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: t.surface,
                borderWidth: 1,
                borderColor: t.border,
                opacity: pressed ? 0.7 : 1,
              })}
            >
              <Bookmark size={17} fill={isSaved ? t.text : "none"} color={t.sub} />
            </Pressable>
          </View>

        </View>

        {/* ═══ コンテンツ ═══ */}
        <View style={{ padding: SPACE.xl }}>
          {/* タイトル + 距離バッジ（横並び） */}
          <View style={{ flexDirection: "row", alignItems: "flex-start", gap: SPACE.md, marginBottom: SPACE.xl }}>
            <Text style={{ flex: 1, fontSize: FONT_SIZE.xxl, fontWeight: WEIGHT.extrabold, color: t.text, lineHeight: 30 }}>
              {post.caption}
            </Text>
            <View style={{ alignItems: "center", backgroundColor: isDark ? t.surface2 : "#F0EFEB", borderRadius: RADIUS.lg, paddingHorizontal: SPACE.md, paddingVertical: SPACE.sm + 2, borderWidth: 1, borderColor: t.border, minWidth: 60 }}>
              <Text style={{ fontSize: FONT_SIZE.xl, fontWeight: WEIGHT.extrabold, color: t.text }}>{distLabel(post.distance)}</Text>
              <Text style={{ fontSize: FONT_SIZE.xxs, color: t.muted }}>{walkTime(post.distance)}</Text>
            </View>
          </View>

          {/* ═══ 発信者情報 ═══ */}
          <Pressable
            onPress={() => router.push(`/profile/${post.id}` as any)}
            style={({ pressed }) => ({
              flexDirection: "row",
              alignItems: "center",
              gap: SPACE.md,
              marginBottom: SPACE.xxl,
              opacity: pressed ? 0.7 : 1,
            })}
          >
            <Image source={{ uri: post.user.avatar }} style={{ width: 44, height: 44, borderRadius: 22, borderWidth: 1.5, borderColor: t.border }} contentFit="cover" />
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: FONT_SIZE.xs, color: t.muted, marginBottom: 2 }}>発信者</Text>
              <View style={{ flexDirection: "row", alignItems: "center", gap: SPACE.xs }}>
                <Text style={{ fontSize: FONT_SIZE.base, fontWeight: WEIGHT.bold, color: t.text }}>{post.user.name}</Text>
                {post.user.verified && (
                  <View style={{ width: 16, height: 16, borderRadius: 8, backgroundColor: t.blue, alignItems: "center", justifyContent: "center" }}>
                    <UserCheck size={9} color="#fff" />
                  </View>
                )}
              </View>
            </View>
            <View style={{ flexDirection: "row", alignItems: "center", gap: SPACE.xs }}>
              <Clock size={13} color={t.muted} />
              <Text style={{ fontSize: FONT_SIZE.sm, color: t.muted }}>{post.time}</Text>
            </View>
          </Pressable>

          {/* ═══ 概要 ═══ */}
          <Text style={{ fontSize: FONT_SIZE.xs, fontWeight: WEIGHT.semibold, color: t.muted, marginBottom: SPACE.sm, letterSpacing: 0.5 }}>概要</Text>
          <Text style={{ fontSize: FONT_SIZE.base, color: t.text, lineHeight: 24, marginBottom: SPACE.xxl }}>
            {post.caption}
          </Text>

          {/* ═══ 締め切りカード ═══ */}
          <View style={{
            borderRadius: RADIUS.xl,
            padding: SPACE.lg,
            marginBottom: SPACE.lg,
            backgroundColor: isDark ? "#1A1A2E" : "#F5F0E8",
            borderWidth: 1,
            borderColor: t.amber + "30",
          }}>
            <Text style={{ fontSize: FONT_SIZE.xs, fontWeight: WEIGHT.semibold, color: t.amber, marginBottom: SPACE.xs }}>締め切り</Text>
            <View style={{ flexDirection: "row", alignItems: "center", gap: SPACE.sm }}>
              <Clock size={20} color={t.amber} />
              <Text style={{ fontSize: FONT_SIZE.xl, fontWeight: WEIGHT.extrabold, color: t.text }}>
                {deadlineLabel(post.timeLeft)}
              </Text>
            </View>
          </View>

          {/* ═══ 必要な持ち物カード ═══ */}
          {items.length > 0 && (
            <View style={{
              borderRadius: RADIUS.xl,
              padding: SPACE.lg,
              marginBottom: SPACE.lg,
              backgroundColor: isDark ? "#0E0E18" : "#F8F8F6",
              borderWidth: 1,
              borderColor: t.border,
            }}>
              <View style={{ flexDirection: "row", alignItems: "center", gap: SPACE.sm, marginBottom: SPACE.md }}>
                <Check size={16} color={t.accent} />
                <Text style={{ fontSize: FONT_SIZE.sm, fontWeight: WEIGHT.bold, color: t.accent }}>必要な持ち物</Text>
              </View>
              {items.map((item) => (
                <View key={item} style={{ flexDirection: "row", alignItems: "center", gap: SPACE.md, marginBottom: SPACE.md }}>
                  <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: t.accent }} />
                  <Text style={{ fontSize: FONT_SIZE.base, fontWeight: WEIGHT.semibold, color: t.text }}>{item}</Text>
                </View>
              ))}
            </View>
          )}
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}
