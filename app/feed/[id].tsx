import { useState, useCallback, useRef } from "react";
import { View, Text, ScrollView, Pressable, RefreshControl, Alert, Share as RNShare, Animated, Linking, Platform } from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { Image } from "expo-image";
import {
  ChevronLeft,
  Share,
  Navigation,
  Clock,
  UserCheck,
  Timer,
  Ellipsis,
  Heart,
  Trash2,
  MessageCircle,
} from "@/lib/icons";
import ReportModal from "@/components/ui/ReportModal";
import ProfilePopover from "@/components/ui/ProfilePopover";
import CommentSection from "@/components/features/feed/CommentSection";
import { CAT_CONFIG } from "@/constants/categories";
import { useThemeStore } from "@/stores/themeStore";
import { usePost, useDeletePost } from "@/hooks/usePosts";
import { useComments, useCreateComment } from "@/hooks/useComments";
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
import CatPlaceholder from "@/components/ui/CatPlaceholder";
import ImageGallery from "@/components/ui/ImageGallery";
import { DetailSkeleton } from "@/components/ui/Skeleton";
import HashtagText from "@/components/ui/HashtagText";
import LazyMapView from "@/components/ui/LazyMapView";

/** 徒歩時間の概算（80m/分） */
const walkTime = (d: number) => `徒歩${Math.max(1, Math.round(d / 80))}分`;

/** 掲載期限の表示テキスト */
const deadlineLabel = (timeLeft: number) => {
  if (timeLeft <= 0) return "終了";
  if (timeLeft < 60) return `あと${Math.ceil(timeLeft)}分`;
  if (timeLeft < 1440) return `あと${Math.floor(timeLeft / 60)}時間`;
  return `あと${Math.floor(timeLeft / 1440)}日`;
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
  const [commentText, setCommentText] = useState("");
  const { data: comments = [] } = useComments(id!);
  const createCommentMutation = useCreateComment(id!);

  const guard = useGuestGuard();
  const toast = useToastStore((s) => s.show);
  const isOwner = !!user && !!post && user.id === post.author_id;

  const likeScale = useRef(new Animated.Value(1)).current;
  const likeAnimatedStyle = { transform: [{ scale: likeScale }] };

  const handleLike = useCallback(() => {
    if (!id) return;
    Animated.sequence([
      Animated.spring(likeScale, { toValue: 1.3, damping: 4, stiffness: 300, useNativeDriver: true }),
      Animated.spring(likeScale, { toValue: 1, damping: 6, stiffness: 200, useNativeDriver: true }),
    ]).start();
    guard(() => toggleLike.mutate({ targetType: "post", targetId: id }), "いいね");
  }, [id, guard, toggleLike, likeScale]);

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

  const handleCommentSubmit = useCallback(() => {
    if (commentText.trim().length === 0) return;
    guard(async () => {
      try {
        await createCommentMutation.mutateAsync(commentText.trim());
        setCommentText("");
        toast("コメントを投稿しました", "success");
      } catch (e: unknown) {
        toast(getUserMessage(e), "error");
      }
    }, "コメント");
  }, [commentText, guard, createCommentMutation, toast]);

  if (isLoading) {
    return (
      <View style={s.screen}>
        <DetailSkeleton t={t} />
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
  const timeLeft = calcTimeLeft(post.deadline);
  const isUrgent = timeLeft <= 60;
  const imageUrls = post.image_urls?.length ? post.image_urls : post.image_url ? [post.image_url] : [];
  const hasImages = imageUrls.length > 0;

  return (
    <View style={s.screen}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={isFetching} onRefresh={() => refetch()} tintColor={t.accent} colors={[t.accent]} progressBackgroundColor={t.surface} />
        }
      >
        {/* ヘッダーバー */}
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: SPACE.lg, paddingTop: 52, paddingBottom: SPACE.sm, backgroundColor: t.surface }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: SPACE.sm }}>
            <Pressable onPress={() => router.back()} accessibilityLabel="戻る" accessibilityRole="button" style={({ pressed }) => [s.iconButton, { opacity: pressed ? 0.7 : 1 }]}>
              <ChevronLeft size={20} color={t.text} />
            </Pressable>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 4, borderRadius: RADIUS.full, paddingHorizontal: 10, paddingVertical: 5, backgroundColor: catConfig.color + "18" }}>
              <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: catConfig.color }} />
              <Text style={{ fontSize: fs.xxs, fontWeight: WEIGHT.extrabold, color: catConfig.color }}>{catConfig.label}</Text>
            </View>
            {isUrgent && (
              <View style={{ flexDirection: "row", alignItems: "center", gap: 4, borderRadius: RADIUS.full, paddingHorizontal: 10, paddingVertical: 5, backgroundColor: t.red + "18" }}>
                <Timer size={12} color={t.red} />
                <Text style={{ fontSize: fs.xxs, fontWeight: WEIGHT.extrabold, color: t.red }}>急ぎ</Text>
              </View>
            )}
          </View>
          <View style={{ flexDirection: "row", gap: SPACE.sm }}>
            <Pressable
              onPress={() => {
                RNShare.share({
                  message: `${post.title}${post.content ? "\n" + post.content : ""}\n\n📍 ${post.location_text ?? ""}${post.deadline ? "\n⏰ 掲載期限: " + new Date(post.deadline).toLocaleString("ja-JP") : ""}`,
                });
              }}
              accessibilityLabel="共有" accessibilityRole="button"
              style={({ pressed }) => [s.iconButton, { opacity: pressed ? 0.7 : 1 }]}
            >
              <Share size={17} color={t.sub} />
            </Pressable>
            <Pressable onPress={() => guard(() => setShowReport(true), "通報")} accessibilityLabel="通報・その他" accessibilityRole="button" style={({ pressed }) => [s.iconButton, { opacity: pressed ? 0.7 : 1 }]}>
              <Ellipsis size={17} color={t.sub} />
            </Pressable>
          </View>
        </View>

        {/* 画像エリア */}
        {hasImages ? (
          <View style={{ backgroundColor: t.bg }}>
            <ImageGallery urls={imageUrls} height={280} t={t} />
          </View>
        ) : (
          <View style={{ height: 160 }}>
            <CatPlaceholder category={post.category} size="lg" />
          </View>
        )}

        {/* コンテンツ */}
        <View style={{ padding: SPACE.xl }}>
          <View style={{ flexDirection: "row", alignItems: "flex-start", gap: SPACE.md, marginBottom: SPACE.xl }}>
            <Text style={{ flex: 1, fontSize: fs.xxl, fontWeight: WEIGHT.extrabold, color: t.text, lineHeight: 30 }}>{post.title}</Text>
            <View style={{ alignItems: "center", backgroundColor: isDark ? t.surface2 : "#F0EFEB", borderRadius: RADIUS.lg, paddingHorizontal: SPACE.md, paddingVertical: SPACE.sm + 2, borderWidth: 1, borderColor: t.border, minWidth: 60 }}>
              <Text style={{ fontSize: fs.xl, fontWeight: WEIGHT.extrabold, color: t.text }}>{distLabel(post.distance_m ?? 0)}</Text>
              <Text style={{ fontSize: fs.xxs, color: t.muted }}>{walkTime(post.distance_m ?? 0)}</Text>
            </View>
          </View>

          {/* 発信者情報 */}
          <Pressable
            onPress={() => setShowProfile(true)}
            onLongPress={() => router.push(`/profile/${post.author_id}` as any)}
            delayLongPress={500}
            accessibilityLabel={`発信者: ${post.author?.display_name ?? "匿名"}のプロフィールを表示`}
            accessibilityRole="button"
            style={({ pressed }) => ({ flexDirection: "row", alignItems: "center", gap: SPACE.md, marginBottom: SPACE.xxl, opacity: pressed ? 0.7 : 1 })}
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

          {/* 概要 */}
          <Text style={{ fontSize: fs.xs, fontWeight: WEIGHT.semibold, color: t.muted, marginBottom: SPACE.sm, letterSpacing: 0.5 }}>概要</Text>
          <HashtagText style={{ fontSize: fs.base, color: t.text, lineHeight: 24, marginBottom: SPACE.xxl }} t={t}>
            {post.content ?? post.title}
          </HashtagText>

          {/* 締め切りカード */}
          <View style={{ borderRadius: RADIUS.xl, padding: SPACE.lg, marginBottom: SPACE.lg, backgroundColor: isDark ? "#1A1A2E" : "#F5F0E8", borderWidth: 1, borderColor: t.amber + "30" }}>
            <Text style={{ fontSize: fs.xs, fontWeight: WEIGHT.semibold, color: t.amber, marginBottom: SPACE.xs }}>締め切り</Text>
            <View style={{ flexDirection: "row", alignItems: "center", gap: SPACE.sm }}>
              <Clock size={20} color={t.amber} />
              <Text style={{ fontSize: fs.xl, fontWeight: WEIGHT.extrabold, color: t.text }}>{deadlineLabel(timeLeft)}</Text>
            </View>
          </View>

          {/* 場所 */}
          {post.location_text && (
            <LazyMapView lat={post.lat ?? 0} lng={post.lng ?? 0} locationText={post.location_text} t={t} />
          )}

          {/* ここに行くボタン */}
          {post.lat && post.lng && post.lat !== 0 && post.lng !== 0 && (
            <Pressable
              onPress={() => {
                const url = Platform.select({
                  ios: `maps:?daddr=${post.lat},${post.lng}`,
                  default: `https://www.google.com/maps/dir/?api=1&destination=${post.lat},${post.lng}`,
                });
                Linking.openURL(url);
              }}
              accessibilityLabel="ここに行く（地図アプリで開く）"
              accessibilityRole="button"
              style={({ pressed }) => ({
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
                gap: SPACE.sm,
                paddingVertical: SPACE.md,
                borderRadius: RADIUS.lg,
                backgroundColor: t.accent,
                marginBottom: SPACE.lg,
                opacity: pressed ? 0.8 : 1,
              })}
            >
              <Navigation size={16} color="#000" />
              <Text style={{ fontSize: fs.base, fontWeight: WEIGHT.bold, color: "#000" }}>ここに行く</Text>
            </Pressable>
          )}

          {/* アクションバー */}
          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: SPACE.md, paddingTop: SPACE.lg, borderTopWidth: 1, borderTopColor: t.border }}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: SPACE.xl }}>
              <Pressable
                onPress={handleLike}
                accessibilityLabel={isLiked ? `いいね済み、${post.likes_count}件` : `いいねする、${post.likes_count}件`}
                accessibilityRole="button"
                style={({ pressed }) => ({ flexDirection: "row", alignItems: "center", gap: SPACE.sm, minHeight: 44, opacity: pressed ? 0.7 : 1 })}
              >
                <Animated.View style={likeAnimatedStyle}>
                  <Heart size={22} fill={isLiked ? t.red : "none"} color={isLiked ? t.red : t.sub} />
                </Animated.View>
                <Text style={{ fontSize: fs.base, fontWeight: WEIGHT.semibold, color: isLiked ? t.red : t.sub }}>{post.likes_count}</Text>
              </Pressable>
              <View style={{ flexDirection: "row", alignItems: "center", gap: SPACE.sm }}>
                <MessageCircle size={20} color={t.sub} />
                <Text style={{ fontSize: fs.base, fontWeight: WEIGHT.semibold, color: t.sub }}>{comments.length}</Text>
              </View>
            </View>
            {isOwner && (
              <Pressable onPress={handleDelete} accessibilityLabel="投稿を削除" accessibilityRole="button" style={({ pressed }) => ({ flexDirection: "row", alignItems: "center", gap: SPACE.xs, opacity: pressed ? 0.7 : 1 })}>
                <Trash2 size={18} color={t.red} />
                <Text style={{ fontSize: fs.sm, fontWeight: WEIGHT.semibold, color: t.red }}>削除</Text>
              </Pressable>
            )}
          </View>
        </View>

        {/* コメントセクション */}
        <CommentSection
          comments={comments}
          commentText={commentText}
          onChangeText={setCommentText}
          onSubmit={handleCommentSubmit}
          isPending={createCommentMutation.isPending}
          t={t}
          fs={fs}
        />
      </ScrollView>

      <ReportModal visible={showReport} onClose={() => setShowReport(false)} t={t} targetType="feed" targetId={post.id} />
      <ProfilePopover profile={post.author ?? null} visible={showProfile} onClose={() => setShowProfile(false)} t={t} />
    </View>
  );
}
