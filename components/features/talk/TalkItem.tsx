import { useState } from "react";
import { View, Text, Pressable } from "react-native";
import { Image } from "expo-image";
import { router } from "expo-router";
import { MapPin, MessageCircle, Heart, Share } from "@/lib/icons";
import type { ThemeTokens } from "@/constants/theme";
import type { ChatRoom } from "@/types";
import { WEIGHT, SPACE, RADIUS, getScaledFontSize } from "@/lib/styles";
import { useFontSizeStore } from "@/stores/fontSizeStore";

interface TalkItemProps {
  chat: ChatRoom;
  t: ThemeTokens;
}

/** Talk タイムラインアイテム（吹き出し風） */
export default function TalkItem({ chat, t }: TalkItemProps) {
  const { scale } = useFontSizeStore();
  const fs = getScaledFontSize(scale);
  const [isLiked, setIsLiked] = useState(false);

  return (
    <Pressable
      onPress={() => router.push(`/talk-detail/${chat.id}` as any)}
      style={({ pressed }) => ({
        flexDirection: "row" as const,
        gap: SPACE.sm + 2,
        paddingVertical: SPACE.md,
        paddingHorizontal: SPACE.xl,
        opacity: pressed ? 0.9 : 1,
      })}
    >
      {/* アバター */}
      <Pressable onPress={() => router.push(`/profile/${chat.id}` as any)}>
        <Image source={{ uri: chat.avatar }} style={{ width: 40, height: 40, borderRadius: 20 }} contentFit="cover" />
      </Pressable>

      <View style={{ flex: 1 }}>
        {/* ヘッダー */}
        <View style={{ flexDirection: "row", alignItems: "center", gap: 6, marginBottom: SPACE.xs }}>
          <Text style={{ fontSize: fs.sm, fontWeight: WEIGHT.bold, color: t.text }}>@{chat.user}</Text>
          <Text style={{ fontSize: fs.xs, color: t.muted }}>{chat.time}</Text>
        </View>

        {/* 吹き出しバブル */}
        <View style={{
          backgroundColor: t.surface,
          borderRadius: RADIUS.xl,
          borderTopLeftRadius: SPACE.xs,
          padding: SPACE.md,
          borderWidth: 1,
          borderColor: t.border,
          marginBottom: SPACE.sm,
        }}>
          {/* 位置情報バッジ */}
          <View style={{ alignSelf: "flex-start", flexDirection: "row", alignItems: "center", gap: 3, borderRadius: RADIUS.full, paddingHorizontal: SPACE.sm, paddingVertical: 2, marginBottom: SPACE.sm, backgroundColor: t.accent + "12" }}>
            <MapPin size={10} color={t.accent} />
            <Text style={{ fontSize: fs.xxs, fontWeight: WEIGHT.semibold, color: t.accent }}>{chat.location}</Text>
          </View>

          {/* メッセージ */}
          <Text style={{ fontSize: fs.base, lineHeight: 22, color: t.text }}>{chat.msg}</Text>

          {/* 画像 */}
          {chat.image && (
            <View style={{ width: "100%", height: 140, borderRadius: RADIUS.md, overflow: "hidden", marginTop: SPACE.sm, borderWidth: 1, borderColor: t.border }}>
              <Image source={{ uri: chat.image }} style={{ width: "100%", height: "100%" }} contentFit="cover" />
            </View>
          )}
        </View>

        {/* アクション */}
        <View style={{ flexDirection: "row", alignItems: "center", gap: SPACE.xl, paddingLeft: SPACE.xs }}>
          <Pressable
            onPress={() => router.push(`/talk-detail/${chat.id}` as any)}
            style={({ pressed }) => ({ flexDirection: "row" as const, alignItems: "center" as const, gap: 5, padding: SPACE.xs, opacity: pressed ? 0.7 : 1 })}
          >
            <MessageCircle size={18} color={t.muted} />
            <Text style={{ fontSize: fs.xs, fontWeight: WEIGHT.semibold, color: t.muted }}>{chat.count}</Text>
          </Pressable>
          <Pressable onPress={() => setIsLiked(!isLiked)} style={({ pressed }) => ({ flexDirection: "row" as const, alignItems: "center" as const, gap: 5, padding: SPACE.xs, opacity: pressed ? 0.7 : 1 })}>
            <Heart size={18} fill={isLiked ? t.red : "none"} color={isLiked ? t.red : t.muted} />
            <Text style={{ fontSize: fs.xs, fontWeight: WEIGHT.semibold, color: isLiked ? t.red : t.muted }}>
              {chat.likes + (isLiked ? 1 : 0)}
            </Text>
          </Pressable>
          <Pressable style={({ pressed }) => ({ padding: SPACE.xs, opacity: pressed ? 0.7 : 1 })}>
            <Share size={18} color={t.muted} />
          </Pressable>
        </View>
      </View>
    </Pressable>
  );
}
