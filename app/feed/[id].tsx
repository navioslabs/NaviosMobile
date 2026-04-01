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
  ThumbsUp,
  Trash2,
  MessageCircle,
  Edit3,
  MapPin,
} from "@/lib/icons";
import ReportModal from "@/components/ui/ReportModal";
import ProfilePopover from "@/components/ui/ProfilePopover";
import CommentSection from "@/components/features/feed/CommentSection";
import { CAT_CONFIG } from "@/constants/categories";
import { useThemeStore } from "@/stores/themeStore";
import { usePost, useDeletePost } from "@/hooks/usePosts";
import { useComments, useCreateComment, useDeleteComment } from "@/hooks/useComments";
import { useToggleLike, useIsLiked } from "@/hooks/useLikes";
import { useAuth } from "@/hooks/useAuth";
import { timeAgo, calcTimeLeft } from "@/lib/adapters";
import { distLabel } from "@/lib/utils";
import { useLocation } from "@/hooks/useLocation";
import { getUserMessage } from "@/lib/appError";
import { useAppStyles } from "@/hooks/useAppStyles";
import { useGuestGuard } from "@/hooks/useGuestGuard";
import { useToastStore } from "@/stores/toastStore";
import { WEIGHT, SPACE, RADIUS } from "@/lib/styles";
import CatPlaceholder from "@/components/ui/CatPlaceholder";
import ImageGallery from "@/components/ui/ImageGallery";
import { DetailSkeleton } from "@/components/ui/Skeleton";
import HashtagText from "@/components/ui/HashtagText";
import LazyMapView from "@/components/ui/LazyMapView";

const walkTime = (d: number) => `徒歩${Math.max(1, Math.round(d / 80))}分`;

const deadlineLabel = (timeLeft: number, category?: string) => {
  const prefix = category === "event" ? "開催まで" : "掲載終了まで";
  if (timeLeft <= 0) return "掲載終了";
  if (timeLeft < 60) return `${prefix}あと${Math.ceil(timeLeft)}分`;
  if (timeLeft < 1440) return `${prefix}あと${Math.floor(timeLeft / 60)}時間`;
  return `${prefix}あと${Math.floor(timeLeft / 1440)}日`;
};

const urgencyColor = (timeLeft: number, t: any) => {
  if (timeLeft <= 0) return t.muted;
  if (timeLeft <= 60) return t.red;
  if (timeLeft <= 360) return t.amber;
  return t.muted;
};

/** 投稿詳細画面 */
export default function FeedDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { isDark } = useThemeStore();
  const { s, t, fs } = useAppStyles();
  const { user } = useAuth();

  const { lat: userLat, lng: userLng, isLoading: locLoading } = useLocation();
  const { data: post, isLoading, isFetching, refetch } = usePost(id!, userLat, userLng, !locLoading);
  const { data: isLiked = false } = useIsLiked("post", id);
  const toggleLike = useToggleLike();
  const deletePostMutation = useDeletePost();
  const [showReport, setShowReport] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [commentText, setCommentText] = useState("");
  const { data: comments = [] } = useComments(id!);
  const createCommentMutation = useCreateComment(id!);
  const deleteCommentMutation = useDeleteComment(id!);

  const guard = useGuestGuard();
  const toast = useToastStore((s) => s.show);
  const isOwner = !!user && !!post && user.id === post.author_id;

  const likeScale = useRef(new Animated.Value(1)).current;

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

  const handleDeleteComment = useCallback((commentId: string) => {
    Alert.alert("コメントを削除", "このコメントを削除しますか？", [
      { text: "キャンセル", style: "cancel" },
      { text: "削除", style: "destructive", onPress: () => deleteCommentMutation.mutate(commentId) },
    ]);
  }, [deleteCommentMutation]);

  const handleLikeComment = useCallback((commentId: string) => {
    guard(() => toggleLike.mutate({ targetType: "comment", targetId: commentId }), "いいね");
  }, [guard, toggleLike]);

  if (isLoading) return <View style={s.screen}><DetailSkeleton t={t} /></View>;

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
  const isExpired = timeLeft <= 0;
  const imageUrls = post.image_urls?.length ? post.image_urls : post.image_url ? [post.image_url] : [];
  const hasImages = imageUrls.length > 0;
  const hasCoords = post.lat != null && post.lng != null && post.lat !== 0 && post.lng !== 0;
  const dlColor = urgencyColor(timeLeft, t);

  return (
    <View style={s.screen}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={isFetching} onRefresh={() => refetch()} tintColor={t.accent} colors={[t.accent]} progressBackgroundColor={t.surface} />}
      >
        {/* ━━ ヒーロー画像 ━━ */}
        <View>
          {hasImages ? (
            <ImageGallery urls={imageUrls} height={340} t={t} />
          ) : (
            <View style={{ height: 180 }}>
              <CatPlaceholder category={post.category} size="lg" />
            </View>
          )}
          {/* フローティングナビ */}
          <View style={{ position: "absolute", top: 50, left: SPACE.md, right: SPACE.md, flexDirection: "row", justifyContent: "space-between" }}>
            <Pressable onPress={() => router.back()} style={({ pressed }) => ({ width: 38, height: 38, borderRadius: 19, backgroundColor: "rgba(0,0,0,0.35)", alignItems: "center", justifyContent: "center", opacity: pressed ? 0.7 : 1 })}>
              <ChevronLeft size={20} color="#fff" />
            </Pressable>
            <View style={{ flexDirection: "row", gap: SPACE.sm }}>
              <Pressable onPress={() => RNShare.share({ message: `${post.title}\n${post.content ?? ""}\n📍 ${post.location_text ?? ""}` })} style={({ pressed }) => ({ width: 38, height: 38, borderRadius: 19, backgroundColor: "rgba(0,0,0,0.35)", alignItems: "center", justifyContent: "center", opacity: pressed ? 0.7 : 1 })}>
                <Share size={16} color="#fff" />
              </Pressable>
              <Pressable onPress={() => guard(() => setShowReport(true), "通報")} style={({ pressed }) => ({ width: 38, height: 38, borderRadius: 19, backgroundColor: "rgba(0,0,0,0.35)", alignItems: "center", justifyContent: "center", opacity: pressed ? 0.7 : 1 })}>
                <Ellipsis size={16} color="#fff" />
              </Pressable>
            </View>
          </View>
        </View>

        {/* ━━ メインコンテンツ ━━ */}
        <View style={{ paddingHorizontal: SPACE.xl }}>

          {/* カテゴリ + 時刻 */}
          <View style={{ flexDirection: "row", alignItems: "center", gap: SPACE.sm, paddingTop: SPACE.lg, marginBottom: SPACE.md }}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 4, backgroundColor: catConfig.color + "15", borderRadius: RADIUS.full, paddingHorizontal: 10, paddingVertical: 4 }}>
              <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: catConfig.color }} />
              <Text style={{ fontSize: fs.xxs, fontWeight: WEIGHT.extrabold, color: catConfig.color }}>{catConfig.label}</Text>
            </View>
            <Text style={{ fontSize: fs.xxs, color: t.muted }}>{timeAgo(post.created_at)}</Text>
          </View>

          {/* タイトル */}
          <Text style={{ fontSize: fs.xxl + 2, fontWeight: WEIGHT.extrabold, color: t.text, lineHeight: 34, marginBottom: SPACE.lg }}>{post.title}</Text>

          {/* 距離・締切インライン */}
          <View style={{ flexDirection: "row", alignItems: "center", gap: SPACE.lg, marginBottom: SPACE.xl }}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: SPACE.xs }}>
              <Navigation size={14} color={t.accent} />
              <Text style={{ fontSize: fs.sm, fontWeight: WEIGHT.bold, color: t.text }}>{distLabel(post.distance_m ?? 0)}</Text>
              <Text style={{ fontSize: fs.xs, color: t.muted }}>({walkTime(post.distance_m ?? 0)})</Text>
            </View>
            <View style={{ width: 1, height: 14, backgroundColor: t.border }} />
            <View style={{ flexDirection: "row", alignItems: "center", gap: SPACE.xs }}>
              <Timer size={14} color={dlColor} />
              <Text style={{ fontSize: fs.sm, fontWeight: WEIGHT.bold, color: isExpired ? t.muted : t.text }}>{deadlineLabel(timeLeft, post.category)}</Text>
            </View>
          </View>

          {/* 発信者 */}
          <Pressable
            onPress={() => setShowProfile(true)}
            onLongPress={() => router.push(`/profile/${post.author_id}` as any)}
            delayLongPress={500}
            style={({ pressed }) => ({ flexDirection: "row", alignItems: "center", gap: SPACE.md, marginBottom: SPACE.xl, opacity: pressed ? 0.8 : 1 })}
          >
            <Image source={{ uri: post.author?.avatar_url ?? undefined }} style={{ width: 42, height: 42, borderRadius: 21, borderWidth: 1.5, borderColor: t.border }} contentFit="cover" />
            <View style={{ flex: 1 }}>
              <View style={{ flexDirection: "row", alignItems: "center", gap: SPACE.xs }}>
                <Text style={{ fontSize: fs.base, fontWeight: WEIGHT.bold, color: t.text }}>{post.author?.display_name ?? "匿名"}</Text>
                {post.author?.is_verified && (
                  <View style={{ width: 16, height: 16, borderRadius: 8, backgroundColor: t.blue, alignItems: "center", justifyContent: "center" }}>
                    <UserCheck size={9} color="#fff" />
                  </View>
                )}
              </View>
              <Text style={{ fontSize: fs.xxs, color: t.muted }}>発信者</Text>
            </View>
          </Pressable>

          {/* 本文 */}
          {post.content && (
            <HashtagText style={{ fontSize: fs.base, color: t.text, lineHeight: 26, marginBottom: SPACE.xl }} t={t}>
              {post.content}
            </HashtagText>
          )}

          {/* 薄い区切り線 */}
          <View style={{ height: 1, backgroundColor: t.border, marginBottom: SPACE.lg }} />

          {/* 場所 */}
          {post.location_text && (
            <View style={{ marginBottom: SPACE.md }}>
              <LazyMapView lat={post.lat ?? 0} lng={post.lng ?? 0} locationText={post.location_text} t={t} />
            </View>
          )}

          {/* ここに行く */}
          {hasCoords && (
            <Pressable
              onPress={() => {
                const url = Platform.select({
                  ios: `maps:?daddr=${post.lat},${post.lng}`,
                  default: `https://www.google.com/maps/dir/?api=1&destination=${post.lat},${post.lng}`,
                });
                Linking.openURL(url);
              }}
              style={({ pressed }) => ({
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
                gap: SPACE.sm,
                paddingVertical: SPACE.md,
                borderRadius: RADIUS.lg,
                backgroundColor: t.accent,
                marginBottom: SPACE.lg,
                opacity: pressed ? 0.85 : 1,
              })}
            >
              <Navigation size={16} color="#000" />
              <Text style={{ fontSize: fs.base, fontWeight: WEIGHT.bold, color: "#000" }}>ここに行く</Text>
            </Pressable>
          )}

          {/* アクションバー */}
          <View style={{ flexDirection: "row", alignItems: "center", paddingVertical: SPACE.md, marginBottom: SPACE.sm }}>
            <Pressable onPress={handleLike} style={({ pressed }) => ({ flexDirection: "row", alignItems: "center", gap: SPACE.xs, marginRight: SPACE.lg, opacity: pressed ? 0.7 : 1 })}>
              <Animated.View style={{ transform: [{ scale: likeScale }] }}>
                <ThumbsUp size={22} fill={isLiked ? t.like : "none"} color={isLiked ? t.like : t.sub} />
              </Animated.View>
              <Text style={{ fontSize: fs.sm, fontWeight: WEIGHT.semibold, color: isLiked ? t.like : t.sub }}>{post.likes_count}</Text>
            </Pressable>
            <View style={{ flexDirection: "row", alignItems: "center", gap: SPACE.xs, marginRight: SPACE.lg }}>
              <MessageCircle size={20} color={t.sub} />
              <Text style={{ fontSize: fs.sm, fontWeight: WEIGHT.semibold, color: t.sub }}>{comments.length}</Text>
            </View>
            {isOwner && (
              <View style={{ flexDirection: "row", alignItems: "center", gap: SPACE.md, marginLeft: "auto" }}>
                <Pressable onPress={() => router.push({ pathname: "/feed-edit", params: { id } } as any)} style={({ pressed }) => ({ flexDirection: "row", alignItems: "center", gap: 4, opacity: pressed ? 0.7 : 1 })}>
                  <Edit3 size={16} color={t.accent} />
                  <Text style={{ fontSize: fs.xs, fontWeight: WEIGHT.semibold, color: t.accent }}>編集</Text>
                </Pressable>
                <Pressable onPress={handleDelete} style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}>
                  <Trash2 size={16} color={t.red} />
                </Pressable>
              </View>
            )}
          </View>
        </View>

        {/* ━━ コメント ━━ */}
        <View style={{ borderTopWidth: 1, borderTopColor: t.border }}>
          <CommentSection
            comments={comments}
            commentText={commentText}
            onChangeText={setCommentText}
            onSubmit={handleCommentSubmit}
            onDeleteComment={handleDeleteComment}
            onLikeComment={handleLikeComment}
            isPending={createCommentMutation.isPending}
            currentUserId={user?.id}
            postAuthorId={post.author_id}
            t={t}
            fs={fs}
          />
        </View>
      </ScrollView>

      <ReportModal visible={showReport} onClose={() => setShowReport(false)} t={t} targetType="feed" targetId={post.id} />
      <ProfilePopover profile={post.author ?? null} visible={showProfile} onClose={() => setShowProfile(false)} t={t} />
    </View>
  );
}
