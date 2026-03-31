import { useCallback } from "react";
import { View, Text, TextInput, Pressable, Alert } from "react-native";
import { Image } from "expo-image";
import { router } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { Send, ThumbsUp, MessageCircle, Trash2 } from "@/lib/icons";
import { WEIGHT, SPACE, RADIUS } from "@/lib/styles";
import { timeAgo } from "@/lib/adapters";
import type { Comment } from "@/types";
import type { ThemeTokens } from "@/constants/theme";

interface Props {
  comments: Comment[];
  commentText: string;
  onChangeText: (text: string) => void;
  onSubmit: () => void;
  onDeleteComment?: (commentId: string) => void;
  onLikeComment?: (commentId: string) => void;
  likedCommentIds?: Set<string>;
  isPending: boolean;
  currentUserId?: string;
  postAuthorId?: string;
  t: ThemeTokens;
  fs: Record<string, number>;
}

/** コメント一覧 + コメント入力バー */
export default function CommentSection({
  comments, commentText, onChangeText, onSubmit,
  onDeleteComment, onLikeComment, likedCommentIds,
  isPending, currentUserId, postAuthorId, t, fs,
}: Props) {
  const hasText = commentText.trim().length > 0;

  const handleLongPress = useCallback((comment: Comment) => {
    if (!currentUserId) return;
    const isMyComment = comment.author_id === currentUserId;
    if (!isMyComment) return;

    Alert.alert("コメント", undefined, [
      {
        text: "削除",
        style: "destructive",
        onPress: () => onDeleteComment?.(comment.id),
      },
      { text: "キャンセル", style: "cancel" },
    ]);
  }, [currentUserId, onDeleteComment]);

  return (
    <>
      {/* コメント一覧 */}
      <View style={{ paddingHorizontal: SPACE.xl, paddingTop: SPACE.lg }}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: SPACE.sm, marginBottom: SPACE.lg }}>
          <MessageCircle size={16} color={t.sub} />
          <Text style={{ fontSize: fs.sm, fontWeight: WEIGHT.bold, color: t.sub }}>
            コメント {comments.length}件
          </Text>
        </View>

        {comments.length === 0 && (
          <View style={{ alignItems: "center", paddingVertical: SPACE.xxl }}>
            <MessageCircle size={32} color={t.border} />
            <Text style={{ fontSize: fs.sm, color: t.muted, marginTop: SPACE.sm }}>
              まだコメントがありません
            </Text>
            <Text style={{ fontSize: fs.xs, color: t.muted, marginTop: SPACE.xs }}>
              最初のコメントを書いてみましょう
            </Text>
          </View>
        )}

        {comments.map((c) => {
          const isPostAuthor = c.author_id === postAuthorId;
          const isLiked = likedCommentIds?.has(c.id) ?? false;

          return (
            <Pressable
              key={c.id}
              onLongPress={() => handleLongPress(c)}
              delayLongPress={400}
              style={({ pressed }) => ({
                flexDirection: "row",
                gap: SPACE.sm,
                marginBottom: SPACE.md,
                padding: SPACE.sm,
                borderRadius: RADIUS.lg,
                backgroundColor: pressed ? t.surface2 : "transparent",
              })}
            >
              <Pressable onPress={() => router.push(`/profile/${c.author_id}` as any)}>
                <Image
                  source={{ uri: c.author?.avatar_url ?? undefined }}
                  style={{ width: 36, height: 36, borderRadius: 18, borderWidth: 1, borderColor: t.border }}
                  contentFit="cover"
                />
              </Pressable>
              <View style={{ flex: 1 }}>
                <View style={{ flexDirection: "row", alignItems: "center", gap: SPACE.xs, marginBottom: 3 }}>
                  <Text style={{ fontSize: fs.sm, fontWeight: WEIGHT.bold, color: t.text }}>
                    {c.author?.display_name ?? "匿名"}
                  </Text>
                  {isPostAuthor && (
                    <View style={{ backgroundColor: t.accent + "20", borderRadius: RADIUS.full, paddingHorizontal: 6, paddingVertical: 1 }}>
                      <Text style={{ fontSize: fs.xxs, fontWeight: WEIGHT.bold, color: t.accent }}>投稿者</Text>
                    </View>
                  )}
                  <Text style={{ fontSize: fs.xxs, color: t.muted, marginLeft: "auto" }}>{timeAgo(c.created_at)}</Text>
                </View>
                <Text style={{ fontSize: fs.base, color: t.text, lineHeight: 20 }}>{c.body}</Text>
                {/* コメントいいね */}
                {onLikeComment && (
                  <Pressable
                    onPress={() => onLikeComment(c.id)}
                    style={{ flexDirection: "row", alignItems: "center", gap: 4, marginTop: SPACE.xs, alignSelf: "flex-start" }}
                  >
                    <ThumbsUp size={14} fill={isLiked ? t.accent : "none"} color={isLiked ? t.accent : t.muted} />
                  </Pressable>
                )}
              </View>
            </Pressable>
          );
        })}
      </View>

      <View style={{ height: 90 }} />

      {/* コメント入力バー（固定フッター） */}
      <View
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          flexDirection: "row",
          alignItems: "center",
          gap: SPACE.sm,
          paddingHorizontal: SPACE.lg,
          paddingVertical: SPACE.md,
          paddingBottom: 34,
          backgroundColor: t.surface,
          borderTopWidth: 1,
          borderTopColor: t.border,
        }}
      >
        <TextInput
          value={commentText}
          onChangeText={onChangeText}
          placeholder="コメントを入力..."
          placeholderTextColor={t.muted}
          style={{
            flex: 1,
            fontSize: fs.base,
            color: t.text,
            backgroundColor: t.surface2,
            borderRadius: RADIUS.full,
            paddingHorizontal: SPACE.lg,
            paddingVertical: SPACE.sm + 2,
            borderWidth: 1,
            borderColor: hasText ? t.accent + "40" : t.border,
          }}
        />
        <Pressable
          onPress={onSubmit}
          disabled={!hasText || isPending}
          style={({ pressed }) => ({ opacity: pressed && hasText ? 0.7 : 1 })}
        >
          <LinearGradient
            colors={hasText ? [t.accent, t.blue] : [t.surface2, t.surface2]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{ width: 40, height: 40, borderRadius: 20, alignItems: "center", justifyContent: "center" }}
          >
            <Send size={18} color={hasText ? "#000" : t.muted} />
          </LinearGradient>
        </Pressable>
      </View>
    </>
  );
}
