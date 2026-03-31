import { View, Text, Pressable } from "react-native";
import { router } from "expo-router";
import { MessageSquare, Trophy, ThumbsUp } from "@/lib/icons";
import { WEIGHT, SPACE, RADIUS } from "@/lib/styles";
import { timeAgo } from "@/lib/adapters";
import type { Talk } from "@/types";
import type { ThemeTokens } from "@/constants/theme";

interface Props {
  talk: Talk;
  t: ThemeTokens;
  fs: Record<string, number>;
}

/** ひとこと検索結果カード */
export default function TalkSearchCard({ talk, t, fs }: Props) {
  return (
    <Pressable
      onPress={() => router.push(`/talk-detail/${talk.id}` as any)}
      style={({ pressed }) => ({
        flexDirection: "row",
        gap: SPACE.md,
        padding: SPACE.md,
        borderRadius: RADIUS.lg,
        backgroundColor: t.surface,
        borderWidth: 1,
        borderColor: t.border,
        opacity: pressed ? 0.7 : 1,
      })}
    >
      <View
        style={{
          width: 40,
          height: 40,
          borderRadius: 20,
          backgroundColor: t.blue + "15",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <MessageSquare size={18} color={t.blue} />
      </View>
      <View style={{ flex: 1 }}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: SPACE.xs, marginBottom: SPACE.xs }}>
          <Text style={{ fontSize: fs.sm, fontWeight: WEIGHT.bold, color: t.text }} numberOfLines={1}>
            {talk.author?.display_name ?? "ユーザー"}
          </Text>
          {talk.is_hall_of_fame && (
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 2,
                borderRadius: RADIUS.sm,
                paddingHorizontal: 4,
                paddingVertical: 1,
                backgroundColor: "#FFD700" + "20",
              }}
            >
              <Trophy size={9} color="#FFD700" />
            </View>
          )}
          <Text style={{ fontSize: fs.xxs, color: t.muted }}>{timeAgo(talk.created_at)}</Text>
        </View>
        <Text style={{ fontSize: fs.base, color: t.text, lineHeight: 20 }} numberOfLines={2}>
          {talk.message}
        </Text>
        {talk.likes_count > 0 && (
          <View style={{ flexDirection: "row", alignItems: "center", gap: 3, marginTop: SPACE.xs }}>
            <ThumbsUp size={12} color={t.muted} />
            <Text style={{ fontSize: fs.xxs, color: t.muted }}>{talk.likes_count}</Text>
          </View>
        )}
      </View>
    </Pressable>
  );
}
