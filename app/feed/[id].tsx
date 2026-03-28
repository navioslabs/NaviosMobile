import { useState } from "react";
import { View, Text, ScrollView, Pressable, StyleSheet, ActivityIndicator, RefreshControl, Alert, Share as RNShare } from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import {
  ChevronLeft,
  Share,
  Navigation,
  Clock,
  UserCheck,
  Check,
  Timer,
  Ellipsis,
  Heart,
  Trash2,
} from "@/lib/icons";
import ReportModal from "@/components/ui/ReportModal";
import ProfilePopover from "@/components/ui/ProfilePopover";
import { CAT_CONFIG } from "@/constants/categories";
import { useThemeStore } from "@/stores/themeStore";
import { usePost, useDeletePost } from "@/hooks/usePosts";
import { useToggleLike, useIsLiked } from "@/hooks/useLikes";
import { useAuth } from "@/hooks/useAuth";
import { timeAgo, calcTimeLeft } from "@/lib/adapters";
import { distLabel } from "@/lib/utils";
import { getUserMessage } from "@/lib/appError";
import { useAppStyles } from "@/hooks/useAppStyles";
import { useGuestGuard } from "@/hooks/useGuestGuard";
import { useToastStore } from "@/stores/toastStore";
import { WEIGHT, SPACE, RADIUS } from "@/lib/styles";
import CatPill from "@/components/ui/CatPill";
import ImageGallery from "@/components/ui/ImageGallery";

/** 徒歩時間の概算（80m/分） */
const walkTime = (d: number) => `徒歩${Math.max(1, Math.round(d / 80))}分`;

/** 締め切り表示テキスト */
const deadlineLabel = (timeLeft: number) => {
  if (timeLeft <= 60) return `本日 ${new Date(Date.now() + timeLeft * 60000).getHours()}:${String(new Date(Date.now() + timeLeft * 60000).getMinutes()).padStart(2, "0")} まで`;
  if (timeLeft <= 1440) return `本日中`;
  return `残り${Math.ceil(timeLeft / 60)}時間`;
};

/** カテゴリ別ヒーローグラデーション */
const HERO_GRADIENTS: Record<string, [string, string, string]> = {
  lifeline: ["rgba(0,212,161,0.35)", "rgba(0,0,0,0.1)", "rgba(0,0,0,0.75)"],
  event: ["rgba(245,166,35,0.35)", "rgba(0,0,0,0.1)", "rgba(0,0,0,0.75)"],
  help: ["rgba(240,66,92,0.35)", "rgba(0,0,0,0.1)", "rgba(0,0,0,0.75)"],
};

/** モック持ち物データ（カテゴリ別） */
const REQUIRED_ITEMS: Record<string, string[]> = {
  lifeline: [],
  event: ["動きやすい服装", "飲み物"],
  help: ["軍手", "作業しやすい服装"],
};

/** 投稿詳細画面 */
export default function FeedDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { isDark } = useThemeStore();
  const { s, t, fs } = useAppStyles();
  const { user } = useAuth();

  const { data: post, isLoading, isFetching, refetch } = usePost(id!);
  const { data: isLiked = false } = useIsLiked("post", id);
  const toggleLike = useToggleLike();
  const deletePostMutation = useDeletePost();
  const [showReport, setShowReport] = useState(false);
  const [showProfile, setShowProfile] = useState(false);

  const guard = useGuestGuard();
  const toast = useToastStore((s) => s.show);
  const isOwner = !!user && !!post && user.id === post.author_id;

  const handleLike = () => {
    if (!id) return;
    guard(() => toggleLike.mutate({ targetType: "post", targetId: id }), "いいね");
  };

  const handleDelete = () => {
    Alert.alert("投稿を削除", "この投稿を削除しますか？この操作は取り消せません。", [
      { text: "キャンセル", style: "cancel" },
      {
        text: "削除",
        style: "destructive",
        onPress: async () => {
          try {
            await deletePostMutation.mutateAsync(id!);
            router.back();
          } catch (e: unknown) {
            toast(getUserMessage(e), "error");
          }
        },
      },
    ]);
  };

  if (isLoading) {
    return (
      <View style={[s.screen, { alignItems: "center", justifyContent: "center" }]}>
        <ActivityIndicator size="large" color={t.accent} />
      </View>
    );
  }

  if (!post) {
    return (
      <View style={[s.screen, { alignItems: "center", justifyContent: "center" }]}>
        <Text style={s.textSubheading}>投稿が見つかりません</Text>
        <Pressable onPress={() => router.back()} style={{ marginTop: SPACE.lg }}>
          <Text style={{ color: t.accent, fontSize: fs.base, fontWeight: WEIGHT.bold }}>戻る</Text>
        </Pressable>
      </View>
    );
  }

  const catConfig = CAT_CONFIG[post.category];
  const items = REQUIRED_ITEMS[post.category] || [];
  const timeLeft = calcTimeLeft(post.deadline);
  const isUrgent = timeLeft <= 60;

  return (
    <View style={s.screen}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isFetching}
            onRefresh={() => refetch()}
            tintColor={t.accent}
            colors={[t.accent]}
            progressBackgroundColor={t.surface}
          />
        }
      >
        {/* ═══ ヒーロー画像 ═══ */}
        <View style={{ position: "relative", height: 260 }}>
          {post.image_urls && post.image_urls.length > 0 ? (
            <ImageGallery urls={post.image_urls} height={260} t={t} />
          ) : (
            <Image source={{ uri: post.image_url ?? undefined }} style={StyleSheet.absoluteFill} contentFit="cover" />
          )}
          <LinearGradient
            colors={HERO_GRADIENTS[post.category] ?? HERO_GRADIENTS.lifeline}
            locations={[0, 0.4, 1]}
            style={StyleSheet.absoluteFill}
          />

          {/* 戻るボタン（左上） */}
          <Pressable
            onPress={() => router.back()}
            accessibilityLabel="戻る"
            accessibilityRole="button"
            style={({ pressed }) => ({
              position: "absolute",
              top: 52,
              left: SPACE.lg,
              width: 38,
              height: 38,
              borderRadius: 19,
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: catConfig.color + "60",
              opacity: pressed ? 0.7 : 1,
            })}
          >
            <ChevronLeft size={22} color="#fff" />
          </Pressable>

          {/* カテゴリピル（画像上、不透明背景で視認性確保） */}
          <View style={{ position: "absolute", top: 56, left: SPACE.lg + 46, flexDirection: "row", gap: SPACE.sm }}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 4, borderRadius: RADIUS.full, paddingHorizontal: 10, paddingVertical: 5, backgroundColor: catConfig.color, shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.3, shadowRadius: 4, elevation: 3 }}>
              <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: "#fff" }} />
              <Text style={{ fontSize: fs.xxs, fontWeight: WEIGHT.extrabold, color: "#fff" }}>{catConfig.label}</Text>
            </View>
            {isUrgent && (
              <View style={{ flexDirection: "row", alignItems: "center", gap: 4, borderRadius: RADIUS.full, paddingHorizontal: 10, paddingVertical: 5, backgroundColor: t.red, shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.3, shadowRadius: 4, elevation: 3 }}>
                <Timer size={12} color="#fff" />
                <Text style={{ fontSize: fs.xxs, fontWeight: WEIGHT.extrabold, color: "#fff" }}>急ぎ</Text>
              </View>
            )}
          </View>

          {/* 共有 + 保存 + メニューボタン（右上） */}
          <View style={{ position: "absolute", top: 52, right: SPACE.lg, flexDirection: "row", gap: SPACE.sm }}>
            <Pressable
              onPress={() => {
                RNShare.share({
                  message: `${post.title}${post.content ? "\n" + post.content : ""}\n\n📍 ${post.location_text ?? ""}${post.deadline ? "\n⏰ 締切: " + new Date(post.deadline).toLocaleString("ja-JP") : ""}`,
                });
              }}
              accessibilityLabel="共有"
              accessibilityRole="button"
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
              onPress={() => guard(() => setShowReport(true), "通報")}
              accessibilityLabel="通報・その他"
              accessibilityRole="button"
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
              <Ellipsis size={17} color={t.sub} />
            </Pressable>
          </View>

        </View>

        {/* ═══ コンテンツ ═══ */}
        <View style={{ padding: SPACE.xl }}>
          {/* タイトル + 距離バッジ（横並び） */}
          <View style={{ flexDirection: "row", alignItems: "flex-start", gap: SPACE.md, marginBottom: SPACE.xl }}>
            <Text style={{ flex: 1, fontSize: fs.xxl, fontWeight: WEIGHT.extrabold, color: t.text, lineHeight: 30 }}>
              {post.title}
            </Text>
            <View style={{ alignItems: "center", backgroundColor: isDark ? t.surface2 : "#F0EFEB", borderRadius: RADIUS.lg, paddingHorizontal: SPACE.md, paddingVertical: SPACE.sm + 2, borderWidth: 1, borderColor: t.border, minWidth: 60 }}>
              <Text style={{ fontSize: fs.xl, fontWeight: WEIGHT.extrabold, color: t.text }}>{distLabel(post.distance_m ?? 0)}</Text>
              <Text style={{ fontSize: fs.xxs, color: t.muted }}>{walkTime(post.distance_m ?? 0)}</Text>
            </View>
          </View>

          {/* ═══ 発信者情報 ═══ */}
          <Pressable
            onPress={() => setShowProfile(true)}
            onLongPress={() => router.push(`/profile/${post.author_id}` as any)}
            delayLongPress={500}
            accessibilityLabel={`発信者: ${post.author?.display_name ?? "匿名"}のプロフィールを表示`}
            accessibilityRole="button"
            style={({ pressed }) => ({
              flexDirection: "row",
              alignItems: "center",
              gap: SPACE.md,
              marginBottom: SPACE.xxl,
              opacity: pressed ? 0.7 : 1,
            })}
          >
            <Image source={{ uri: post.author?.avatar_url ?? undefined }} style={{ width: 44, height: 44, borderRadius: 22, borderWidth: 1.5, borderColor: t.border }} contentFit="cover" />
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: fs.xs, color: t.muted, marginBottom: 2 }}>発信者</Text>
              <View style={{ flexDirection: "row", alignItems: "center", gap: SPACE.xs }}>
                <Text style={{ fontSize: fs.base, fontWeight: WEIGHT.bold, color: t.text }}>{post.author?.display_name ?? "匿名"}</Text>
                {post.author?.is_verified && (
                  <View style={{ width: 16, height: 16, borderRadius: 8, backgroundColor: t.blue, alignItems: "center", justifyContent: "center" }}>
                    <UserCheck size={9} color="#fff" />
                  </View>
                )}
              </View>
            </View>
            <View style={{ flexDirection: "row", alignItems: "center", gap: SPACE.xs }}>
              <Clock size={13} color={t.muted} />
              <Text style={{ fontSize: fs.sm, color: t.muted }}>{timeAgo(post.created_at)}</Text>
            </View>
          </Pressable>

          {/* ═══ 概要 ═══ */}
          <Text style={{ fontSize: fs.xs, fontWeight: WEIGHT.semibold, color: t.muted, marginBottom: SPACE.sm, letterSpacing: 0.5 }}>概要</Text>
          <Text style={{ fontSize: fs.base, color: t.text, lineHeight: 24, marginBottom: SPACE.xxl }}>
            {post.content ?? post.title}
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
            <Text style={{ fontSize: fs.xs, fontWeight: WEIGHT.semibold, color: t.amber, marginBottom: SPACE.xs }}>締め切り</Text>
            <View style={{ flexDirection: "row", alignItems: "center", gap: SPACE.sm }}>
              <Clock size={20} color={t.amber} />
              <Text style={{ fontSize: fs.xl, fontWeight: WEIGHT.extrabold, color: t.text }}>
                {deadlineLabel(timeLeft)}
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
                <Text style={{ fontSize: fs.sm, fontWeight: WEIGHT.bold, color: t.accent }}>必要な持ち物</Text>
              </View>
              {items.map((item) => (
                <View key={item} style={{ flexDirection: "row", alignItems: "center", gap: SPACE.md, marginBottom: SPACE.md }}>
                  <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: t.accent }} />
                  <Text style={{ fontSize: fs.base, fontWeight: WEIGHT.semibold, color: t.text }}>{item}</Text>
                </View>
              ))}
            </View>
          )}

          {/* ═══ いいね + 削除 アクションバー ═══ */}
          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: SPACE.md, paddingTop: SPACE.lg, borderTopWidth: 1, borderTopColor: t.border }}>
            <Pressable
              onPress={handleLike}
              accessibilityLabel={isLiked ? `いいね済み、${post.likes_count}件` : `いいねする、${post.likes_count}件`}
              accessibilityRole="button"
              style={({ pressed }) => ({ flexDirection: "row", alignItems: "center", gap: SPACE.sm, opacity: pressed ? 0.7 : 1 })}
            >
              <Heart size={22} fill={isLiked ? t.red : "none"} color={isLiked ? t.red : t.sub} />
              <Text style={{ fontSize: fs.base, fontWeight: WEIGHT.semibold, color: isLiked ? t.red : t.sub }}>
                {post.likes_count}
              </Text>
            </Pressable>

            {isOwner && (
              <Pressable
                onPress={handleDelete}
                accessibilityLabel="投稿を削除"
                accessibilityRole="button"
                style={({ pressed }) => ({ flexDirection: "row", alignItems: "center", gap: SPACE.xs, opacity: pressed ? 0.7 : 1 })}
              >
                <Trash2 size={18} color={t.red} />
                <Text style={{ fontSize: fs.sm, fontWeight: WEIGHT.semibold, color: t.red }}>削除</Text>
              </Pressable>
            )}
          </View>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>

      <ReportModal
        visible={showReport}
        onClose={() => setShowReport(false)}
        t={t}
        targetType="feed"
        targetId={post.id}
      />

      <ProfilePopover
        profile={post.author ?? null}
        visible={showProfile}
        onClose={() => setShowProfile(false)}
        t={t}
      />
    </View>
  );
}
