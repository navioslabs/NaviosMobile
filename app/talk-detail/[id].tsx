import { useState } from "react";
import { View, Text, ScrollView, Pressable, TextInput, ActivityIndicator, Alert, RefreshControl } from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { Image } from "expo-image";
import { getUserMessage } from "@/lib/appError";
import {
  ChevronLeft,
  Heart,
  MessageCircle,
  Share,
  MapPin,
  Send,
  Ellipsis,
  Trash2,
} from "@/lib/icons";
import ReportModal from "@/components/ui/ReportModal";
import { LinearGradient } from "expo-linear-gradient";
import { useTalk, useCreateReply, useDeleteTalk } from "@/hooks/useTalks";
import { useToggleLike, useIsLiked } from "@/hooks/useLikes";
import { useAuth } from "@/hooks/useAuth";
import { timeAgo } from "@/lib/adapters";
import { useAppStyles } from "@/hooks/useAppStyles";
import { WEIGHT, SPACE, RADIUS } from "@/lib/styles";

/** Talk詳細画面（返信スレッド） */
export default function TalkDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { s, t, fs } = useAppStyles();
  const { user } = useAuth();

  const { data, isLoading, isFetching, refetch } = useTalk(id!);
  const createReplyMutation = useCreateReply(id!);
  const deleteTalkMutation = useDeleteTalk();
  const { data: isLiked = false } = useIsLiked("talk", id);
  const toggleLike = useToggleLike();
  const [replyText, setReplyText] = useState("");
  const [showReport, setShowReport] = useState(false);

  const talk = data;
  const replies = data?.replies ?? [];
  const isOwner = !!user && !!talk && user.id === talk.author_id;

  const handleLike = () => {
    if (!id) return;
    toggleLike.mutate({ targetType: "talk", targetId: id });
  };

  const handleDelete = () => {
    Alert.alert("投稿を削除", "このひとことを削除しますか？この操作は取り消せません。", [
      { text: "キャンセル", style: "cancel" },
      {
        text: "削除",
        style: "destructive",
        onPress: async () => {
          try {
            await deleteTalkMutation.mutateAsync(id!);
            router.back();
          } catch (e: unknown) {
            Alert.alert("エラー", getUserMessage(e));
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

  if (!talk) {
    return (
      <View style={[s.screen, { alignItems: "center", justifyContent: "center" }]}>
        <Text style={s.textSubheading}>投稿が見つかりません</Text>
        <Pressable onPress={() => router.back()} style={{ marginTop: SPACE.lg }}>
          <Text style={{ color: t.accent, fontSize: fs.base, fontWeight: WEIGHT.bold }}>戻る</Text>
        </Pressable>
      </View>
    );
  }

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
        <Text style={[s.textHeading, { flex: 1 }]}>スレッド</Text>
        {isOwner && (
          <Pressable
            onPress={handleDelete}
            style={({ pressed }) => ({ width: 40, height: 40, borderRadius: 20, alignItems: "center", justifyContent: "center", opacity: pressed ? 0.7 : 1 })}
          >
            <Trash2 size={20} color={t.red} />
          </Pressable>
        )}
        <Pressable
          onPress={() => setShowReport(true)}
          style={({ pressed }) => ({ width: 40, height: 40, borderRadius: 20, alignItems: "center", justifyContent: "center", opacity: pressed ? 0.7 : 1 })}
        >
          <Ellipsis size={22} color={t.sub} />
        </Pressable>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
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
        {/* 元投稿 */}
        <View style={{ padding: SPACE.xl, borderBottomWidth: 1, borderBottomColor: t.border }}>
          <View style={{ flexDirection: "row", gap: SPACE.md }}>
            <Pressable onPress={() => router.push(`/profile/${talk.author_id}` as any)}>
              <Image source={{ uri: talk.author?.avatar_url ?? undefined }} style={{ width: 48, height: 48, borderRadius: 24 }} contentFit="cover" />
            </Pressable>
            <View style={{ flex: 1 }}>
              <View style={{ flexDirection: "row", alignItems: "center", gap: SPACE.sm, marginBottom: SPACE.xs }}>
                <Text style={{ fontSize: fs.lg, fontWeight: WEIGHT.bold, color: t.text }}>@{talk.author?.display_name ?? "匿名"}</Text>
                <Text style={{ fontSize: fs.sm, color: t.muted }}>{timeAgo(talk.created_at)}</Text>
              </View>

              {/* 位置情報バッジ */}
              {talk.location_text && (
                <View style={{ alignSelf: "flex-start", flexDirection: "row", alignItems: "center", gap: 3, borderRadius: RADIUS.full, paddingHorizontal: SPACE.sm, paddingVertical: 3, marginBottom: SPACE.sm, backgroundColor: t.accent + "12" }}>
                  <MapPin size={11} color={t.accent} />
                  <Text style={{ fontSize: fs.xs, fontWeight: WEIGHT.semibold, color: t.accent }}>{talk.location_text}</Text>
                </View>
              )}
            </View>
          </View>

          {/* メッセージ本文 */}
          <Text style={{ fontSize: fs.xl, color: t.text, lineHeight: 28, marginTop: SPACE.md }}>
            {talk.message}
          </Text>

          {/* 画像 */}
          {talk.image_url && (
            <View style={{ width: "100%", height: 200, borderRadius: RADIUS.lg, overflow: "hidden", marginTop: SPACE.lg, borderWidth: 1, borderColor: t.border }}>
              <Image source={{ uri: talk.image_url }} style={{ width: "100%", height: "100%" }} contentFit="cover" />
            </View>
          )}

          {/* アクションバー */}
          <View style={{ flexDirection: "row", alignItems: "center", gap: SPACE.xxxl, marginTop: SPACE.xl, paddingTop: SPACE.md, borderTopWidth: 1, borderTopColor: t.border }}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: SPACE.sm }}>
              <MessageCircle size={20} color={t.sub} />
              <Text style={{ fontSize: fs.base, fontWeight: WEIGHT.semibold, color: t.sub }}>{replies.length}</Text>
            </View>
            <Pressable
              onPress={handleLike}
              style={({ pressed }) => ({ flexDirection: "row", alignItems: "center", gap: SPACE.sm, opacity: pressed ? 0.7 : 1 })}
            >
              <Heart size={20} fill={isLiked ? t.red : "none"} color={isLiked ? t.red : t.sub} />
              <Text style={{ fontSize: fs.base, fontWeight: WEIGHT.semibold, color: isLiked ? t.red : t.sub }}>
                {talk.likes_count}
              </Text>
            </Pressable>
            <Pressable style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}>
              <Share size={20} color={t.sub} />
            </Pressable>
          </View>
        </View>

        {/* 返信セクション */}
        <View style={{ paddingHorizontal: SPACE.xl, paddingTop: SPACE.lg }}>
          <Text style={[s.textLabel, { marginBottom: SPACE.lg }]}>返信 {replies.length}件</Text>

          {replies.map((reply, index) => (
            <View key={reply.id} style={{ flexDirection: "row", gap: SPACE.md, marginBottom: SPACE.lg, paddingBottom: SPACE.lg, borderBottomWidth: index < replies.length - 1 ? 1 : 0, borderBottomColor: t.border }}>
              <Pressable onPress={() => router.push(`/profile/${reply.author_id}` as any)}>
                <Image source={{ uri: reply.author?.avatar_url ?? undefined }} style={{ width: 36, height: 36, borderRadius: 18 }} contentFit="cover" />
              </Pressable>
              <View style={{ flex: 1 }}>
                <View style={{ flexDirection: "row", alignItems: "center", gap: SPACE.sm, marginBottom: SPACE.xs }}>
                  <Text style={{ fontSize: fs.sm, fontWeight: WEIGHT.bold, color: t.text }}>@{reply.author?.display_name ?? "匿名"}</Text>
                  <Text style={{ fontSize: fs.xs, color: t.muted }}>{timeAgo(reply.created_at)}</Text>
                </View>
                <Text style={{ fontSize: fs.base, color: t.text, lineHeight: 22 }}>{reply.body}</Text>
                <Pressable
                  style={({ pressed }) => ({ flexDirection: "row", alignItems: "center", gap: SPACE.xs, marginTop: SPACE.sm, opacity: pressed ? 0.7 : 1 })}
                >
                  <Heart size={14} color={t.muted} />
                  <Text style={{ fontSize: fs.xs, color: t.muted }}>{reply.likes_count}</Text>
                </Pressable>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>

      {/* 返信入力バー */}
      <View style={{ position: "absolute", bottom: 0, left: 0, right: 0, flexDirection: "row", alignItems: "center", gap: SPACE.sm, paddingHorizontal: SPACE.lg, paddingVertical: SPACE.md, paddingBottom: 34, backgroundColor: t.surface, borderTopWidth: 1, borderTopColor: t.border }}>
        <TextInput
          value={replyText}
          onChangeText={setReplyText}
          placeholder="返信を入力..."
          placeholderTextColor={t.muted}
          style={{ flex: 1, fontSize: fs.base, color: t.text, backgroundColor: t.surface2, borderRadius: RADIUS.full, paddingHorizontal: SPACE.lg, paddingVertical: SPACE.sm + 2, borderWidth: 1, borderColor: t.border }}
        />
        <Pressable
          style={({ pressed }) => ({ opacity: pressed && replyText.length > 0 ? 0.7 : 1 })}
          onPress={async () => {
            if (replyText.length === 0) return;
            try {
              await createReplyMutation.mutateAsync(replyText.trim());
              setReplyText("");
            } catch (e: unknown) {
              Alert.alert("エラー", getUserMessage(e));
            }
          }}
        >
          <LinearGradient
            colors={replyText.length > 0 ? [t.accent, t.blue] : [t.surface2, t.surface2]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{ width: 40, height: 40, borderRadius: 20, alignItems: "center", justifyContent: "center" }}
          >
            <Send size={18} color={replyText.length > 0 ? "#000" : t.muted} />
          </LinearGradient>
        </Pressable>
      </View>

      <ReportModal
        visible={showReport}
        onClose={() => setShowReport(false)}
        t={t}
        targetType="talk"
        targetId={talk.id}
      />
    </View>
  );
}
