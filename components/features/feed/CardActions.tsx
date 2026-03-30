import { useRef } from "react";
import { View, Text, Pressable, Animated } from "react-native";
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
  const heartScale = useRef(new Animated.Value(1)).current;
  const heartRotate = useRef(new Animated.Value(0)).current;

  const handleLike = () => {
    const willLike = !isLiked;
    toggleLike.mutate({ targetType, targetId });

    if (willLike) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } else {
      Haptics.selectionAsync();
    }

    // ハートアニメーション: バウンス + 傾き
    Animated.parallel([
      Animated.sequence([
        Animated.spring(heartScale, { toValue: 1.3, damping: 6, stiffness: 400, useNativeDriver: true }),
        Animated.spring(heartScale, { toValue: 1, damping: 10, stiffness: 200, useNativeDriver: true }),
      ]),
      Animated.sequence([
        Animated.timing(heartRotate, { toValue: -15, duration: 120, useNativeDriver: true }),
        Animated.spring(heartRotate, { toValue: 0, damping: 8, stiffness: 200, useNativeDriver: true }),
      ]),
    ]).start();
  };

  return (
    <View style={{ flexDirection: "row", alignItems: "center", gap: SPACE.xl, marginTop: SPACE.md, paddingTop: SPACE.md, borderTopWidth: 1, borderTopColor: "rgba(255,255,255,0.12)" }}>
      <Pressable onPress={handleLike} accessibilityLabel={isLiked ? "いいね済み" : "いいね"} accessibilityRole="button" style={({ pressed }) => ({ flexDirection: "row" as const, alignItems: "center" as const, gap: 6, padding: SPACE.xs, opacity: pressed ? 0.7 : 1 })}>
        <Animated.View style={{ transform: [{ scale: heartScale }, { rotate: heartRotate.interpolate({ inputRange: [-15, 0], outputRange: ["-15deg", "0deg"] }) }] }}>
          <Heart size={22} fill={isLiked ? t.red : "none"} color={isLiked ? t.red : "rgba(255,255,255,.7)"} />
        </Animated.View>
        <Text style={{ fontSize: fs.base, fontWeight: WEIGHT.semibold, color: isLiked ? t.red : "rgba(255,255,255,.7)" }}>
          {likes}
        </Text>
      </Pressable>
      <Pressable accessibilityLabel="コメント" accessibilityRole="button" style={({ pressed }) => ({ flexDirection: "row" as const, alignItems: "center" as const, gap: 6, padding: SPACE.xs, opacity: pressed ? 0.7 : 1, transform: [{ scale: pressed ? 0.92 : 1 }] })}>
        <MessageSquare size={22} color="rgba(255,255,255,.7)" />
      </Pressable>
    </View>
  );
}
