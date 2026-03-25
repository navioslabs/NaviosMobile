import { useState } from "react";
import { View, Text, ScrollView, Pressable, TextInput } from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { Image } from "expo-image";
import {
  ChevronLeft,
  Heart,
  MessageCircle,
  Share,
  MapPin,
  Send,
  Ellipsis,
} from "@/lib/icons";
import ReportModal from "@/components/ui/ReportModal";
import { LinearGradient } from "expo-linear-gradient";
import { CHAT_ROOMS } from "@/data/mockData";
import { useAppStyles } from "@/hooks/useAppStyles";
import { WEIGHT, SPACE, RADIUS } from "@/lib/styles";

/** モック返信データ */
const MOCK_REPLIES = [
  { id: 1, user: "neighbor_01", avatar: "https://i.pravatar.cc/100?img=41", text: "わかります！私も昨日行きました", time: "3分前", likes: 2 },
  { id: 2, user: "local_papa", avatar: "https://i.pravatar.cc/100?img=42", text: "情報助かります、ありがとう！", time: "8分前", likes: 5 },
  { id: 3, user: "morning_run", avatar: "https://i.pravatar.cc/100?img=43", text: "今度一緒に行きましょう！", time: "15分前", likes: 1 },
  { id: 4, user: "cafe_lover", avatar: "https://i.pravatar.cc/100?img=44", text: "ここの周辺いいですよね〜", time: "22分前", likes: 3 },
];

/** Talk詳細画面（返信スレッド） */
export default function TalkDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { s, t, fs } = useAppStyles();

  const chat = CHAT_ROOMS.find((c) => c.id === Number(id));
  const [isLiked, setIsLiked] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [showReport, setShowReport] = useState(false);

  if (!chat) {
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
        <Pressable
          onPress={() => setShowReport(true)}
          style={({ pressed }) => ({ width: 40, height: 40, borderRadius: 20, alignItems: "center", justifyContent: "center", opacity: pressed ? 0.7 : 1 })}
        >
          <Ellipsis size={22} color={t.sub} />
        </Pressable>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
        {/* 元投稿 */}
        <View style={{ padding: SPACE.xl, borderBottomWidth: 1, borderBottomColor: t.border }}>
          <View style={{ flexDirection: "row", gap: SPACE.md }}>
            <Pressable onPress={() => router.push(`/profile/${chat.id}` as any)}>
              <Image source={{ uri: chat.avatar }} style={{ width: 48, height: 48, borderRadius: 24 }} contentFit="cover" />
            </Pressable>
            <View style={{ flex: 1 }}>
              <View style={{ flexDirection: "row", alignItems: "center", gap: SPACE.sm, marginBottom: SPACE.xs }}>
                <Text style={{ fontSize: fs.lg, fontWeight: WEIGHT.bold, color: t.text }}>@{chat.user}</Text>
                <Text style={{ fontSize: fs.sm, color: t.muted }}>{chat.time}</Text>
              </View>

              {/* 位置情報バッジ */}
              <View style={{ alignSelf: "flex-start", flexDirection: "row", alignItems: "center", gap: 3, borderRadius: RADIUS.full, paddingHorizontal: SPACE.sm, paddingVertical: 3, marginBottom: SPACE.sm, backgroundColor: t.accent + "12" }}>
                <MapPin size={11} color={t.accent} />
                <Text style={{ fontSize: fs.xs, fontWeight: WEIGHT.semibold, color: t.accent }}>{chat.location}</Text>
              </View>
            </View>
          </View>

          {/* メッセージ本文 */}
          <Text style={{ fontSize: fs.xl, color: t.text, lineHeight: 28, marginTop: SPACE.md }}>
            {chat.msg}
          </Text>

          {/* 画像 */}
          {chat.image && (
            <View style={{ width: "100%", height: 200, borderRadius: RADIUS.lg, overflow: "hidden", marginTop: SPACE.lg, borderWidth: 1, borderColor: t.border }}>
              <Image source={{ uri: chat.image }} style={{ width: "100%", height: "100%" }} contentFit="cover" />
            </View>
          )}

          {/* アクションバー */}
          <View style={{ flexDirection: "row", alignItems: "center", gap: SPACE.xxxl, marginTop: SPACE.xl, paddingTop: SPACE.md, borderTopWidth: 1, borderTopColor: t.border }}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: SPACE.sm }}>
              <MessageCircle size={20} color={t.sub} />
              <Text style={{ fontSize: fs.base, fontWeight: WEIGHT.semibold, color: t.sub }}>{chat.count + MOCK_REPLIES.length}</Text>
            </View>
            <Pressable
              onPress={() => setIsLiked(!isLiked)}
              style={({ pressed }) => ({ flexDirection: "row", alignItems: "center", gap: SPACE.sm, opacity: pressed ? 0.7 : 1 })}
            >
              <Heart size={20} fill={isLiked ? t.red : "none"} color={isLiked ? t.red : t.sub} />
              <Text style={{ fontSize: fs.base, fontWeight: WEIGHT.semibold, color: isLiked ? t.red : t.sub }}>
                {chat.likes + (isLiked ? 1 : 0)}
              </Text>
            </Pressable>
            <Pressable style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}>
              <Share size={20} color={t.sub} />
            </Pressable>
          </View>
        </View>

        {/* 返信セクション */}
        <View style={{ paddingHorizontal: SPACE.xl, paddingTop: SPACE.lg }}>
          <Text style={[s.textLabel, { marginBottom: SPACE.lg }]}>返信 {MOCK_REPLIES.length}件</Text>

          {MOCK_REPLIES.map((reply, index) => (
            <View key={reply.id} style={{ flexDirection: "row", gap: SPACE.md, marginBottom: SPACE.lg, paddingBottom: SPACE.lg, borderBottomWidth: index < MOCK_REPLIES.length - 1 ? 1 : 0, borderBottomColor: t.border }}>
              <Pressable onPress={() => router.push(`/profile/${reply.id}` as any)}>
                <Image source={{ uri: reply.avatar }} style={{ width: 36, height: 36, borderRadius: 18 }} contentFit="cover" />
              </Pressable>
              <View style={{ flex: 1 }}>
                <View style={{ flexDirection: "row", alignItems: "center", gap: SPACE.sm, marginBottom: SPACE.xs }}>
                  <Text style={{ fontSize: fs.sm, fontWeight: WEIGHT.bold, color: t.text }}>@{reply.user}</Text>
                  <Text style={{ fontSize: fs.xs, color: t.muted }}>{reply.time}</Text>
                </View>
                <Text style={{ fontSize: fs.base, color: t.text, lineHeight: 22 }}>{reply.text}</Text>
                <Pressable
                  style={({ pressed }) => ({ flexDirection: "row", alignItems: "center", gap: SPACE.xs, marginTop: SPACE.sm, opacity: pressed ? 0.7 : 1 })}
                >
                  <Heart size={14} color={t.muted} />
                  <Text style={{ fontSize: fs.xs, color: t.muted }}>{reply.likes}</Text>
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
          onPress={() => { if (replyText.length > 0) setReplyText(""); }}
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
        targetId={chat.id}
      />
    </View>
  );
}
