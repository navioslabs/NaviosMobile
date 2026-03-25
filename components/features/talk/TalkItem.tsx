import { useState } from "react";
import { View, Text, Pressable } from "react-native";
import { Image } from "expo-image";
import { router } from "expo-router";
import { MapPin, MessageCircle, Heart, Share } from "@/lib/icons";
import type { ThemeTokens } from "@/constants/theme";
import type { Talk } from "@/types";
import { timeAgo } from "@/lib/adapters";
import { WEIGHT, SPACE, RADIUS, getScaledFontSize } from "@/lib/styles";
import { useFontSizeStore } from "@/stores/fontSizeStore";

interface TalkItemProps {
  talk: Talk;
  t: ThemeTokens;
}

/** Talk タイムラインアイテム（吹き出し風） */
export default function TalkItem({ talk, t }: TalkItemProps) {
  const { scale } = useFontSizeStore();
  const fs = getScaledFontSize(scale);
  const [isLiked, setIsLiked] = useState(false);

  if (!talk?.id) return null;

  return (
    <Pressable
      onPress={() => router.push(`/talk-detail/${talk.id}` as any)}
      style={({ pressed }) => ({
        flexDirection: "row" as const,
        gap: SPACE.sm + 2,
        paddingVertical: SPACE.md,
        paddingHorizontal: SPACE.xl,
        opacity: pressed ? 0.9 : 1,
      })}
    >
      {/* アバター */}
      <Pressable onPress={() => router.push(`/profile/${talk.id}` as any)}>
        <Image source={{ uri: talk.author?.avatar_url ?? "https://i.pravatar.cc/100" }} style={{ width: 40, height: 40, borderRadius: 20 }} contentFit="cover" />
      </Pressable>

      <View style={{ flex: 1 }}>
        {/* ヘッダー */}
        <View style={{ flexDirection: "row", alignItems: "center", gap: 6, marginBottom: SPACE.xs }}>
          <Text style={{ fontSize: fs.sm, fontWeight: WEIGHT.bold, color: t.text }}>@{talk.author?.display_name ?? "ユーザー"}</Text>
          <Text style={{ fontSize: fs.xs, color: t.muted }}>{timeAgo(talk.created_at)}</Text>
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
            <Text style={{ fontSize: fs.xxs, fontWeight: WEIGHT.semibold, color: t.accent }}>{talk.location_text ?? ""}</Text>
          </View>

          {/* メッセージ */}
          <Text style={{ fontSize: fs.base, lineHeight: 22, color: t.text }}>{talk.message}</Text>

          {/* 画像 */}
          {talk.image_url && (
            <View style={{ width: "100%", height: 140, borderRadius: RADIUS.md, overflow: "hidden", marginTop: SPACE.sm, borderWidth: 1, borderColor: t.border }}>
              <Image source={{ uri: talk.image_url }} style={{ width: "100%", height: "100%" }} contentFit="cover" />
            </View>
          )}
        </View>

        {/* アクション */}
        <View style={{ flexDirection: "row", alignItems: "center", gap: SPACE.xl, paddingLeft: SPACE.xs }}>
          <Pressable
            onPress={() => router.push(`/talk-detail/${talk.id}` as any)}
            style={({ pressed }) => ({ flexDirection: "row" as const, alignItems: "center" as const, gap: 5, padding: SPACE.xs, opacity: pressed ? 0.7 : 1 })}
          >
            <MessageCircle size={18} color={t.muted} />
            <Text style={{ fontSize: fs.xs, fontWeight: WEIGHT.semibold, color: t.muted }}>{talk.replies_count}</Text>
          </Pressable>
          <Pressable onPress={() => setIsLiked(!isLiked)} style={({ pressed }) => ({ flexDirection: "row" as const, alignItems: "center" as const, gap: 5, padding: SPACE.xs, opacity: pressed ? 0.7 : 1 })}>
            <Heart size={18} fill={isLiked ? t.red : "none"} color={isLiked ? t.red : t.muted} />
            <Text style={{ fontSize: fs.xs, fontWeight: WEIGHT.semibold, color: isLiked ? t.red : t.muted }}>
              {talk.likes_count + (isLiked ? 1 : 0)}
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
