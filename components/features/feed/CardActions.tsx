import { useState } from "react";
import { View, Text, Pressable } from "react-native";
import { Heart, MessageSquare } from "@/lib/icons";
import type { ThemeTokens } from "@/constants/theme";
import { FONT_SIZE, WEIGHT, SPACE } from "@/lib/styles";

interface CardActionsProps {
  likes: number;
  t: ThemeTokens;
}

/** カードアクション（いいね + コメント） */
export default function CardActions({ likes, t }: CardActionsProps) {
  const [isLiked, setIsLiked] = useState(false);

  return (
    <View style={{ flexDirection: "row", alignItems: "center", gap: SPACE.xl, marginTop: SPACE.md, paddingTop: SPACE.md, borderTopWidth: 1, borderTopColor: "rgba(255,255,255,0.12)" }}>
      <Pressable onPress={() => setIsLiked(!isLiked)} style={({ pressed }) => ({ flexDirection: "row" as const, alignItems: "center" as const, gap: 6, padding: SPACE.xs, opacity: pressed ? 0.7 : 1 })}>
        <Heart size={22} fill={isLiked ? t.red : "none"} color={isLiked ? t.red : "rgba(255,255,255,.7)"} />
        <Text style={{ fontSize: FONT_SIZE.base, fontWeight: WEIGHT.semibold, color: isLiked ? t.red : "rgba(255,255,255,.7)" }}>
          {likes + (isLiked ? 1 : 0)}
        </Text>
      </Pressable>
      <Pressable style={({ pressed }) => ({ flexDirection: "row" as const, alignItems: "center" as const, gap: 6, padding: SPACE.xs, opacity: pressed ? 0.7 : 1 })}>
        <MessageSquare size={22} color="rgba(255,255,255,.7)" />
      </Pressable>
    </View>
  );
}
