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
  label?: string;
}

/** タップ感のあるアニメーション付き投稿ボタン */
export default function AnimatedSubmitButton({ onPress, disabled, isPending, canSubmit, t, fs, label = "投稿する" }: AnimatedSubmitButtonProps) {
  const btnScale = useRef(new Animated.Value(1)).current;
  const btnOpacity = useRef(new Animated.Value(1)).current;

  const animStyle = {
    transform: [{ scale: btnScale }],
    opacity: btnOpacity,
  };

  const handlePressIn = () => {
    if (disabled) return;
    Animated.parallel([
      Animated.spring(btnScale, { toValue: 0.88, damping: 20, stiffness: 400, useNativeDriver: true }),
      Animated.timing(btnOpacity, { toValue: 0.7, duration: 80, useNativeDriver: true }),
    ]).start();
  };
  const handlePressOut = () => {
    Animated.parallel([
      Animated.spring(btnScale, { toValue: 1, damping: 12, stiffness: 350, useNativeDriver: true }),
      Animated.timing(btnOpacity, { toValue: 1, duration: 150, useNativeDriver: true }),
    ]).start();
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
            <Text style={{ color: canSubmit ? "#000" : t.muted, fontWeight: WEIGHT.extrabold, fontSize: fs.lg + 1 }}>{label}</Text>
          )}
        </LinearGradient>
      </Pressable>
    </Animated.View>
  );
}
