import { useCallback } from "react";
import { View, Text, Pressable } from "react-native";
import Animated, { useSharedValue, useAnimatedStyle, withSequence, withSpring } from "react-native-reanimated";
import * as Haptics from "expo-haptics";
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
  const heartScale = useSharedValue(1);

  const handleLike = useCallback(() => {
    if (isLiked) {
      Haptics.selectionAsync();
    } else {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      heartScale.value = withSequence(
        withSpring(1.35, { damping: 8, stiffness: 400 }),
        withSpring(1, { damping: 10, stiffness: 200 }),
      );
    }
    toggleLike.mutate({ targetType, targetId });
  }, [isLiked, targetType, targetId]);

  const heartAnimStyle = useAnimatedStyle(() => ({
    transform: [{ scale: heartScale.value }],
  }));

  return (
    <View style={{ flexDirection: "row", alignItems: "center", gap: SPACE.xl, marginTop: SPACE.md, paddingTop: SPACE.md, borderTopWidth: 1, borderTopColor: "rgba(255,255,255,0.12)" }}>
      <Pressable
        onPress={handleLike}
        hitSlop={8}
        style={({ pressed }) => ({ flexDirection: "row" as const, alignItems: "center" as const, gap: 6, padding: SPACE.xs, opacity: pressed ? 0.85 : 1, transform: [{ scale: pressed ? 0.92 : 1 }] })}
      >
        <Animated.View style={heartAnimStyle}>
          <Heart size={22} fill={isLiked ? t.red : "none"} color={isLiked ? t.red : "rgba(255,255,255,.7)"} />
        </Animated.View>
        <Text style={{ fontSize: fs.base, fontWeight: WEIGHT.semibold, color: isLiked ? t.red : "rgba(255,255,255,.7)" }}>
          {likes}
        </Text>
      </Pressable>
      <Pressable
        hitSlop={8}
        style={({ pressed }) => ({ flexDirection: "row" as const, alignItems: "center" as const, gap: 6, padding: SPACE.xs, opacity: pressed ? 0.85 : 1, transform: [{ scale: pressed ? 0.92 : 1 }] })}
      >
        <MessageSquare size={22} color="rgba(255,255,255,.7)" />
      </Pressable>
    </View>
  );
}
