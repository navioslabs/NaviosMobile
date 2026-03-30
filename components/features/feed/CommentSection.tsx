import { View, Text, TextInput, Pressable } from "react-native";
import { Image } from "expo-image";
import { router } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { Send } from "@/lib/icons";
import { WEIGHT, SPACE, RADIUS } from "@/lib/styles";
import { timeAgo } from "@/lib/adapters";
import type { Comment } from "@/types";
import type { ThemeTokens } from "@/constants/theme";

interface Props {
  comments: Comment[];
  commentText: string;
  onChangeText: (text: string) => void;
  onSubmit: () => void;
  isPending: boolean;
  t: ThemeTokens;
  fs: Record<string, number>;
}

/** コメント一覧 + コメント入力バー */
export default function CommentSection({ comments, commentText, onChangeText, onSubmit, isPending, t, fs }: Props) {
  const hasText = commentText.trim().length > 0;

  return (
    <>
      {/* コメント一覧 */}
      <View style={{ paddingHorizontal: SPACE.xl, paddingTop: SPACE.lg, borderTopWidth: 1, borderTopColor: t.border }}>
        <Text style={{ fontSize: fs.sm, fontWeight: WEIGHT.bold, color: t.sub, marginBottom: SPACE.md }}>
          コメント {comments.length}件
        </Text>

        {comments.map((c, index) => (
          <View
            key={c.id}
            style={{
              flexDirection: "row",
              gap: SPACE.sm,
              marginBottom: SPACE.md,
              paddingBottom: SPACE.md,
              borderBottomWidth: index < comments.length - 1 ? 1 : 0,
              borderBottomColor: t.border,
            }}
          >
            <Pressable onPress={() => router.push(`/profile/${c.author_id}` as any)}>
              <Image
                source={{ uri: c.author?.avatar_url ?? undefined }}
                style={{ width: 32, height: 32, borderRadius: 16 }}
                contentFit="cover"
              />
            </Pressable>
            <View style={{ flex: 1 }}>
              <View style={{ flexDirection: "row", alignItems: "center", gap: SPACE.sm, marginBottom: 2 }}>
                <Text style={{ fontSize: fs.sm, fontWeight: WEIGHT.bold, color: t.text }}>
                  {c.author?.display_name ?? "匿名"}
                </Text>
                <Text style={{ fontSize: fs.xxs, color: t.muted }}>{timeAgo(c.created_at)}</Text>
              </View>
              <Text style={{ fontSize: fs.base, color: t.text, lineHeight: 20 }}>{c.body}</Text>
            </View>
          </View>
        ))}

        {comments.length === 0 && (
          <Text style={{ fontSize: fs.sm, color: t.muted, textAlign: "center", paddingVertical: SPACE.lg }}>
            まだコメントがありません
          </Text>
        )}
      </View>

      <View style={{ height: 80 }} />

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
            borderColor: t.border,
          }}
        />
        <Pressable
          onPress={onSubmit}
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
