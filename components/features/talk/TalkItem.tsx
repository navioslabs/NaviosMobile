import { memo } from "react";
import { View, Text, Pressable } from "react-native";
import Animated, { FadeInUp } from "react-native-reanimated";
import { Image } from "expo-image";
import { router } from "expo-router";
import { MapPin, MessageCircle, Heart, Share } from "@/lib/icons";
import type { ThemeTokens } from "@/constants/theme";
import type { Talk } from "@/types";
import { timeAgo } from "@/lib/adapters";
import { WEIGHT, SPACE, RADIUS, getScaledFontSize } from "@/lib/styles";
import { useFontSizeStore } from "@/stores/fontSizeStore";
import { useToggleLike, useIsLiked } from "@/hooks/useLikes";

interface TalkItemProps {
  talk: Talk;
  t: ThemeTokens;
}

/** Talk タイムラインアイテム（SNSフロー型） */
function TalkItem({ talk, t }: TalkItemProps) {
  const { scale } = useFontSizeStore();
  const fs = getScaledFontSize(scale);
  const { data: isLiked = false } = useIsLiked("talk", talk.id);
  const toggleLike = useToggleLike();

  if (!talk?.id) return null;

  const handleLike = () => {
    toggleLike.mutate({ targetType: "talk", targetId: talk.id });
  };

  return (
    <Animated.View entering={FadeInUp.duration(300).springify()}>
      <Pressable
        onPress={() => router.push(`/talk-detail/${talk.id}` as any)}
        style={({ pressed }) => ({
          paddingHorizontal: SPACE.xl,
          paddingVertical: SPACE.md,
          opacity: pressed ? 0.9 : 1,
          borderBottomWidth: 1,
          borderBottomColor: t.border,
        })}
      >
        {/* ヘッダー: アバター + 名前 + 時刻 + 位置 */}
        <View style={{ flexDirection: "row", alignItems: "center", gap: SPACE.sm }}>
          <Pressable onPress={() => router.push(`/profile/${talk.author_id}` as any)}>
            <Image
              source={{ uri: talk.author?.avatar_url ?? "https://i.pravatar.cc/100" }}
              style={{ width: 40, height: 40, borderRadius: 20 }}
              contentFit="cover"
            />
          </Pressable>
          <View style={{ flex: 1 }}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
              <Text style={{ fontSize: fs.sm, fontWeight: WEIGHT.bold, color: t.text }}>
                {talk.author?.display_name ?? "ユーザー"}
              </Text>
              {talk.author?.is_verified && (
                <View style={{ width: 14, height: 14, borderRadius: 7, backgroundColor: t.blue, alignItems: "center", justifyContent: "center" }}>
                  <Text style={{ fontSize: 8, color: "#fff", fontWeight: WEIGHT.bold }}>✓</Text>
                </View>
              )}
              <Text style={{ fontSize: fs.xxs, color: t.muted }}>{timeAgo(talk.created_at)}</Text>
            </View>
            {talk.location_text ? (
              <View style={{ flexDirection: "row", alignItems: "center", gap: 3, marginTop: 1 }}>
                <MapPin size={10} color={t.accent} />
                <Text style={{ fontSize: fs.xxs, color: t.accent }}>{talk.location_text}</Text>
              </View>
            ) : null}
          </View>
        </View>

        {/* 本文 */}
        <Text style={{ fontSize: fs.base, lineHeight: 22, color: t.text, marginTop: SPACE.sm, marginLeft: 40 + SPACE.sm }}>
          {talk.message}
        </Text>

        {/* 画像 */}
        {talk.image_url && (
          <View style={{ marginTop: SPACE.sm, marginLeft: 40 + SPACE.sm, borderRadius: RADIUS.md, overflow: "hidden", borderWidth: 1, borderColor: t.border }}>
            <Image source={{ uri: talk.image_url }} style={{ width: "100%", height: 180 }} contentFit="cover" />
          </View>
        )}

        {/* アクション */}
        <View style={{ flexDirection: "row", alignItems: "center", gap: SPACE.xxl, marginTop: SPACE.sm, marginLeft: 40 + SPACE.sm }}>
          <Pressable
            onPress={() => router.push(`/talk-detail/${talk.id}` as any)}
            style={({ pressed }) => ({ flexDirection: "row" as const, alignItems: "center" as const, gap: 5, opacity: pressed ? 0.6 : 1 })}
          >
            <MessageCircle size={16} color={t.muted} />
            <Text style={{ fontSize: fs.xs, color: t.muted }}>{talk.replies_count || ""}</Text>
          </Pressable>

          <Pressable
            onPress={handleLike}
            style={({ pressed }) => ({ flexDirection: "row" as const, alignItems: "center" as const, gap: 5, opacity: pressed ? 0.6 : 1 })}
          >
            <Heart size={16} fill={isLiked ? t.red : "none"} color={isLiked ? t.red : t.muted} />
            <Text style={{ fontSize: fs.xs, color: isLiked ? t.red : t.muted }}>
              {talk.likes_count || ""}
            </Text>
          </Pressable>

          <Pressable style={({ pressed }) => ({ opacity: pressed ? 0.6 : 1 })}>
            <Share size={16} color={t.muted} />
          </Pressable>
        </View>
      </Pressable>
    </Animated.View>
  );
}

export default memo(TalkItem);
