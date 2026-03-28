import { View, Text, Pressable } from "react-native";
import { Heart, MessageSquare } from "@/lib/icons";
import type { ThemeTokens } from "@/constants/theme";
import { WEIGHT, SPACE, getScaledFontSize } from "@/lib/styles";
import { useFontSizeStore } from "@/stores/fontSizeStore";
import { useToggleLike, useIsLiked } from "@/hooks/useLikes";

interface CardActionsProps {
  likes: number;
  t: ThemeTokens;
  targetType: "post" | "talk";
  targetId: string;
}

/** カードアクション（いいね + コメント） */
export default function CardActions({ likes, t, targetType, targetId }: CardActionsProps) {
  const { scale } = useFontSizeStore();
  const fs = getScaledFontSize(scale);
  const { data: isLiked = false } = useIsLiked(targetType, targetId);
  const toggleLike = useToggleLike();

  const handleLike = () => {
    toggleLike.mutate({ targetType, targetId });
  };

  return (
    <View style={{ flexDirection: "row", alignItems: "center", gap: SPACE.xl, marginTop: SPACE.md, paddingTop: SPACE.md, borderTopWidth: 1, borderTopColor: "rgba(255,255,255,0.12)" }}>
      <Pressable onPress={handleLike} style={({ pressed }) => ({ flexDirection: "row" as const, alignItems: "center" as const, gap: 6, padding: SPACE.xs, opacity: pressed ? 0.7 : 1 })}>
        <Heart size={22} fill={isLiked ? t.red : "none"} color={isLiked ? t.red : "rgba(255,255,255,.7)"} />
        <Text style={{ fontSize: fs.base, fontWeight: WEIGHT.semibold, color: isLiked ? t.red : "rgba(255,255,255,.7)" }}>
          {likes}
        </Text>
      </Pressable>
      <Pressable style={({ pressed }) => ({ flexDirection: "row" as const, alignItems: "center" as const, gap: 6, padding: SPACE.xs, opacity: pressed ? 0.7 : 1 })}>
        <MessageSquare size={22} color="rgba(255,255,255,.7)" />
      </Pressable>
    </View>
  );
}
