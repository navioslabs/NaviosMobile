import { useState } from "react";
import { View, Text, Pressable } from "react-native";
import { Image } from "expo-image";
import { MapPin, MessageCircle, Heart, Share } from "@/lib/icons";
import type { ThemeTokens } from "@/constants/theme";
import type { ChatRoom } from "@/types";
import { FONT_SIZE, WEIGHT, SPACE, RADIUS } from "@/lib/styles";

interface TalkItemProps {
  chat: ChatRoom;
  t: ThemeTokens;
}

/** Talk タイムラインアイテム */
export default function TalkItem({ chat, t }: TalkItemProps) {
  const [isLiked, setIsLiked] = useState(false);

  return (
    <View style={{ flexDirection: "row", gap: SPACE.sm + 2, paddingVertical: SPACE.lg, paddingHorizontal: SPACE.xl, borderBottomWidth: 1, borderBottomColor: t.border }}>
      <Image source={{ uri: chat.avatar }} style={{ width: 44, height: 44, borderRadius: 22 }} contentFit="cover" />
      <View style={{ flex: 1 }}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 3 }}>
          <Text style={{ fontSize: FONT_SIZE.base, fontWeight: WEIGHT.bold, color: t.text }}>@{chat.user}</Text>
          <Text style={{ fontSize: FONT_SIZE.sm, color: t.muted }}>•</Text>
          <Text style={{ fontSize: FONT_SIZE.sm, color: t.muted }}>{chat.time}</Text>
        </View>

        <View style={{ alignSelf: "flex-start", flexDirection: "row", alignItems: "center", gap: 3, borderRadius: RADIUS.full, paddingHorizontal: SPACE.sm, paddingVertical: 3, marginBottom: 6, backgroundColor: t.accent + "12" }}>
          <MapPin size={10} color={t.accent} />
          <Text style={{ fontSize: FONT_SIZE.xs, fontWeight: WEIGHT.semibold, color: t.accent }}>{chat.location}</Text>
        </View>

        <Text style={{ fontSize: FONT_SIZE.lg, lineHeight: 22, color: t.text }}>{chat.msg}</Text>

        {chat.image && (
          <View style={{ width: "100%", height: 140, borderRadius: RADIUS.lg, overflow: "hidden", marginTop: SPACE.sm + 2, borderWidth: 1, borderColor: t.border }}>
            <Image source={{ uri: chat.image }} style={{ width: "100%", height: "100%" }} contentFit="cover" />
          </View>
        )}

        <View style={{ flexDirection: "row", alignItems: "center", gap: SPACE.xl, marginTop: SPACE.sm }}>
          <Pressable style={({ pressed }) => ({ flexDirection: "row" as const, alignItems: "center" as const, gap: 5, padding: SPACE.xs, opacity: pressed ? 0.7 : 1 })}>
            <MessageCircle size={20} color={t.muted} />
            <Text style={{ fontSize: FONT_SIZE.sm, fontWeight: WEIGHT.semibold, color: t.muted }}>{chat.count}</Text>
          </Pressable>
          <Pressable onPress={() => setIsLiked(!isLiked)} style={({ pressed }) => ({ flexDirection: "row" as const, alignItems: "center" as const, gap: 5, padding: SPACE.xs, opacity: pressed ? 0.7 : 1 })}>
            <Heart size={20} fill={isLiked ? t.red : "none"} color={isLiked ? t.red : t.muted} />
            <Text style={{ fontSize: FONT_SIZE.sm, fontWeight: WEIGHT.semibold, color: isLiked ? t.red : t.muted }}>
              {chat.likes + (isLiked ? 1 : 0)}
            </Text>
          </Pressable>
          <Pressable style={({ pressed }) => ({ flexDirection: "row" as const, alignItems: "center" as const, gap: 5, padding: SPACE.xs, opacity: pressed ? 0.7 : 1 })}>
            <Share size={20} color={t.muted} />
          </Pressable>
        </View>
      </View>
    </View>
  );
}
