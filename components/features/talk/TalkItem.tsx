import { useState, memo } from "react";
import { View, Text, Pressable } from "react-native";
import Animated, { FadeInLeft, FadeInRight } from "react-native-reanimated";
import { Image } from "expo-image";
import { router } from "expo-router";
import { MapPin, MessageCircle, Heart, Share } from "@/lib/icons";
import type { ThemeTokens } from "@/constants/theme";
import type { Talk } from "@/types";
import { useAuth } from "@/hooks/useAuth";
import { timeAgo } from "@/lib/adapters";
import { WEIGHT, SPACE, getScaledFontSize } from "@/lib/styles";
import { useFontSizeStore } from "@/stores/fontSizeStore";

interface TalkItemProps {
  talk: Talk;
  t: ThemeTokens;
}

/** Talk タイムラインアイテム（チャット吹き出し） */
function TalkItem({ talk, t }: TalkItemProps) {
  const { scale } = useFontSizeStore();
  const fs = getScaledFontSize(scale);
  const { user } = useAuth();
  const [isLiked, setIsLiked] = useState(false);

  if (!talk?.id) return null;

  const isMine = user?.id === talk.author_id;

  /** アクションバー */
  const Actions = (
    <View style={{ flexDirection: "row", alignItems: "center", gap: SPACE.lg + 4, justifyContent: isMine ? "flex-end" : "flex-start" }}>
      <Pressable
        onPress={() => router.push(`/talk-detail/${talk.id}` as any)}
        style={({ pressed }) => ({ flexDirection: "row" as const, alignItems: "center" as const, gap: 4, paddingVertical: 2, opacity: pressed ? 0.6 : 1 })}
      >
        <MessageCircle size={15} color={t.muted} />
        <Text style={{ fontSize: fs.xxs, fontWeight: WEIGHT.semibold, color: t.muted }}>{talk.replies_count || ""}</Text>
      </Pressable>
      <Pressable
        onPress={() => setIsLiked(!isLiked)}
        style={({ pressed }) => ({ flexDirection: "row" as const, alignItems: "center" as const, gap: 4, paddingVertical: 2, opacity: pressed ? 0.6 : 1 })}
      >
        <Heart size={15} fill={isLiked ? t.red : "none"} color={isLiked ? t.red : t.muted} />
        <Text style={{ fontSize: fs.xxs, fontWeight: WEIGHT.semibold, color: isLiked ? t.red : t.muted }}>{(talk.likes_count + (isLiked ? 1 : 0)) || ""}</Text>
      </Pressable>
      <Pressable style={({ pressed }) => ({ paddingVertical: 2, opacity: pressed ? 0.6 : 1 })}>
        <Share size={15} color={t.muted} />
      </Pressable>
    </View>
  );

  /** 吹き出しバブル */
  const Bubble = (
    <View style={{
      backgroundColor: isMine ? t.accent + "18" : t.surface,
      borderRadius: 18,
      borderTopLeftRadius: isMine ? 18 : 4,
      borderTopRightRadius: isMine ? 4 : 18,
      paddingHorizontal: SPACE.md + 2,
      paddingVertical: SPACE.sm + 2,
      borderWidth: 1,
      borderColor: isMine ? t.accent + "30" : t.border,
      marginBottom: SPACE.xs + 2,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.04,
      shadowRadius: 3,
      elevation: 1,
    }}>
      <Text style={{ fontSize: fs.base, lineHeight: 22, color: t.text }}>{talk.message}</Text>
      {talk.image_url && (
        <View style={{ width: "100%", height: 150, borderRadius: 12, overflow: "hidden", marginTop: SPACE.sm }}>
          <Image source={{ uri: talk.image_url }} style={{ width: "100%", height: "100%" }} contentFit="cover" />
        </View>
      )}
    </View>
  );

  /** アバター */
  const Avatar = (
    <Pressable onPress={() => router.push(`/profile/${talk.author_id}` as any)}>
      <Image
        source={{ uri: talk.author?.avatar_url ?? "https://i.pravatar.cc/100" }}
        style={{ width: 36, height: 36, borderRadius: 18, marginTop: 2 }}
        contentFit="cover"
      />
    </Pressable>
  );

  // ── 自分の投稿（右寄せ） ──
  if (isMine) {
    return (
      <Animated.View entering={FadeInRight.duration(400).springify()}>
        <Pressable
          onPress={() => router.push(`/talk-detail/${talk.id}` as any)}
          style={({ pressed }) => ({
            flexDirection: "row" as const,
            gap: SPACE.sm,
            paddingVertical: SPACE.sm + 2,
            paddingHorizontal: SPACE.xl,
            opacity: pressed ? 0.9 : 1,
          })}
        >
          <View style={{ flex: 1, alignItems: "flex-end" }}>
            {/* 時刻 + 位置 */}
            <View style={{ flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 3 }}>
              {talk.location_text ? (
                <View style={{ flexDirection: "row", alignItems: "center", gap: 2 }}>
                  <MapPin size={9} color={t.accent} />
                  <Text style={{ fontSize: fs.xxs, color: t.accent }}>{talk.location_text}</Text>
                </View>
              ) : null}
              <Text style={{ fontSize: fs.xxs, color: t.muted }}>{timeAgo(talk.created_at)}</Text>
            </View>
            {Bubble}
            {Actions}
          </View>
          {Avatar}
        </Pressable>
      </Animated.View>
    );
  }

  // ── 他人の投稿（左寄せ） ──
  return (
    <Animated.View entering={FadeInLeft.duration(400).springify()}>
      <Pressable
        onPress={() => router.push(`/talk-detail/${talk.id}` as any)}
        style={({ pressed }) => ({
          flexDirection: "row" as const,
          gap: SPACE.sm,
          paddingVertical: SPACE.sm + 2,
          paddingHorizontal: SPACE.xl,
          opacity: pressed ? 0.9 : 1,
        })}
      >
        {Avatar}
        <View style={{ flex: 1 }}>
          {/* ユーザー名 + 時刻 */}
          <View style={{ flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 3 }}>
            <Text style={{ fontSize: fs.sm, fontWeight: WEIGHT.bold, color: t.text }}>
              {talk.author?.display_name ?? "ユーザー"}
            </Text>
            <Text style={{ fontSize: fs.xxs, color: t.muted }}>{timeAgo(talk.created_at)}</Text>
            {talk.location_text ? (
              <View style={{ flexDirection: "row", alignItems: "center", gap: 2, marginLeft: "auto" }}>
                <MapPin size={9} color={t.accent} />
                <Text style={{ fontSize: fs.xxs, color: t.accent }}>{talk.location_text}</Text>
              </View>
            ) : null}
          </View>
          {Bubble}
          {Actions}
        </View>
      </Pressable>
    </Animated.View>
  );
}

export default memo(TalkItem);
