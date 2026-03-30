import { useRef } from "react";
import { Text, Pressable, ActivityIndicator, Animated } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { WEIGHT, SPACE, RADIUS } from "@/lib/styles";
import type { ThemeTokens } from "@/constants/theme";

interface AnimatedSubmitButtonProps {
  onPress: () => void;
  disabled: boolean;
  isPending: boolean;
  canSubmit: boolean;
  t: ThemeTokens;
  fs: { lg: number };
}

/** タップ感のあるアニメーション付き投稿ボタン */
export default function AnimatedSubmitButton({ onPress, disabled, isPending, canSubmit, t, fs }: AnimatedSubmitButtonProps) {
  const btnScale = useRef(new Animated.Value(1)).current;

  const animStyle = {
    transform: [{ scale: btnScale }],
  };

  const handlePressIn = () => {
    if (!disabled) Animated.spring(btnScale, { toValue: 0.95, damping: 15, stiffness: 300, useNativeDriver: true }).start();
  };
  const handlePressOut = () => {
    Animated.spring(btnScale, { toValue: 1, damping: 15, stiffness: 300, useNativeDriver: true }).start();
  };

  return (
    <Animated.View style={animStyle}>
      <Pressable
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled}
      >
        <LinearGradient
          colors={canSubmit ? [t.accent, t.blue] : [t.surface2, t.surface2]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{ borderRadius: RADIUS.lg, padding: SPACE.lg, alignItems: "center" }}
        >
          {isPending ? (
            <ActivityIndicator color="#000" />
          ) : (
            <Text style={{ color: canSubmit ? "#000" : t.muted, fontWeight: WEIGHT.extrabold, fontSize: fs.lg + 1 }}>投稿する</Text>
          )}
        </LinearGradient>
      </Pressable>
    </Animated.View>
  );
}
