import { Text, Pressable, ActivityIndicator } from "react-native";
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from "react-native-reanimated";
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
  const btnScale = useSharedValue(1);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: btnScale.value }],
  }));

  const handlePressIn = () => {
    if (!disabled) btnScale.value = withSpring(0.95, { damping: 15, stiffness: 300 });
  };
  const handlePressOut = () => {
    btnScale.value = withSpring(1, { damping: 15, stiffness: 300 });
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
