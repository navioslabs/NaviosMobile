import { View, Text, Pressable } from "react-native";
import { Image } from "expo-image";
import { router } from "expo-router";
import { Heart, MessageSquare, Radio, Trophy } from "@/lib/icons";
import type { ThemeTokens } from "@/constants/theme";
import type { StreetHistoryItem } from "@/types";
import { CAT_CONFIG } from "@/constants/categories";
import { timeAgo } from "@/lib/adapters";
import { WEIGHT, SPACE, RADIUS, getScaledFontSize } from "@/lib/styles";
import { useFontSizeStore } from "@/stores/fontSizeStore";

interface StreetHistoryCardProps {
  item: StreetHistoryItem;
  t: ThemeTokens;
  isDark: boolean;
}

/** 街の記憶カード */
export default function StreetHistoryCard({ item, t, isDark }: StreetHistoryCardProps) {
  const { scale } = useFontSizeStore();
  const fs = getScaledFontSize(scale);

  const isTalk = item.item_type === "talk";
  const route = isTalk ? `/talk-detail/${item.id}` : `/feed/${item.id}`;

  return (
    <Pressable
      onPress={() => router.push(route as any)}
      style={({ pressed }) => ({
        flexDirection: "row",
        gap: SPACE.md,
        padding: SPACE.md,
        marginBottom: SPACE.sm,
        borderRadius: RADIUS.lg,
        backgroundColor: t.surface,
        borderWidth: 1,
        borderColor: t.border,
        opacity: pressed ? 0.7 : 1,
      })}
    >
      {/* アバター */}
      <Image
        source={{ uri: item.author_avatar_url ?? "https://i.pravatar.cc/100" }}
        style={{ width: 40, height: 40, borderRadius: 20 }}
        contentFit="cover"
      />

      <View style={{ flex: 1 }}>
        {/* ヘッダー */}
        <View style={{ flexDirection: "row", alignItems: "center", gap: SPACE.xs, marginBottom: SPACE.xs }}>
          {/* 種別アイコン */}
          <View style={{
            width: 18, height: 18, borderRadius: 9,
            alignItems: "center", justifyContent: "center",
            backgroundColor: isTalk ? t.blue + "20" : t.accent + "20",
          }}>
            {isTalk ? <Radio size={10} color={t.blue} /> : <MessageSquare size={10} color={t.accent} />}
          </View>
          <Text style={{ fontSize: fs.sm, fontWeight: WEIGHT.bold, color: t.text }} numberOfLines={1}>
            {item.author_display_name}
          </Text>
          {item.author_is_verified && (
            <View style={{ width: 12, height: 12, borderRadius: 6, backgroundColor: t.blue, alignItems: "center", justifyContent: "center" }}>
              <Text style={{ fontSize: 7, color: "#fff", fontWeight: WEIGHT.bold }}>✓</Text>
            </View>
          )}
          <Text style={{ fontSize: fs.xxs, color: t.muted }}>{timeAgo(item.created_at)}</Text>
        </View>

        {/* 本文 */}
        <Text style={{ fontSize: fs.base, color: t.text, lineHeight: 20 }} numberOfLines={2}>
          {item.title ?? item.message}
        </Text>

        {/* 画像サムネイル */}
        {item.image_url && (
          <View style={{ marginTop: SPACE.sm, borderRadius: RADIUS.sm, overflow: "hidden", borderWidth: 1, borderColor: t.border }}>
            <Image source={{ uri: item.image_url }} style={{ width: "100%", height: 120 }} contentFit="cover" />
          </View>
        )}

        {/* フッター */}
        <View style={{ flexDirection: "row", alignItems: "center", gap: SPACE.lg, marginTop: SPACE.sm }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 3 }}>
            <Heart size={13} color={t.muted} />
            <Text style={{ fontSize: fs.xs, color: t.muted }}>{item.likes_count}</Text>
          </View>

          {isTalk && (
            <View style={{ flexDirection: "row", alignItems: "center", gap: 3, borderRadius: RADIUS.sm, paddingHorizontal: 4, paddingVertical: 1, backgroundColor: "#FFD700" + "20" }}>
              <Trophy size={10} color="#FFD700" />
              <Text style={{ fontSize: fs.xxs, fontWeight: WEIGHT.bold, color: "#FFD700" }}>殿堂入り</Text>
            </View>
          )}

          {item.location_text && (
            <Text style={{ fontSize: fs.xxs, color: t.muted }} numberOfLines={1}>{item.location_text}</Text>
          )}
        </View>
      </View>
    </Pressable>
  );
}
