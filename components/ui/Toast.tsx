import { useEffect } from "react";
import { Text, Pressable } from "react-native";
import Animated, { useSharedValue, useAnimatedStyle, withTiming, withDelay, runOnJS } from "react-native-reanimated";
import { AlertCircle, Check, X } from "@/lib/icons";
import { useToastStore } from "@/stores/toastStore";
import { useAppStyles } from "@/hooks/useAppStyles";
import { WEIGHT, SPACE, RADIUS } from "@/lib/styles";

/** グローバルトースト通知 */
export default function Toast() {
  const { message, type, visible, hide } = useToastStore();
  const { t, fs } = useAppStyles();
  const translateY = useSharedValue(-100);

  useEffect(() => {
    if (visible) {
      translateY.value = withTiming(0, { duration: 250 });
      // 3秒後に自動非表示
      translateY.value = withDelay(
        3000,
        withTiming(-100, { duration: 200 }, () => runOnJS(hide)()),
      );
    }
  }, [visible, message]);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  if (!visible) return null;

  const isError = type === "error";
  const bgColor = isError ? t.red + "15" : t.accent + "15";
  const borderColor = isError ? t.red + "40" : t.accent + "40";
  const iconColor = isError ? t.red : t.accent;
  const Icon = isError ? AlertCircle : Check;

  return (
    <Animated.View
      style={[
        animStyle,
        {
          position: "absolute",
          top: 52,
          left: SPACE.lg,
          right: SPACE.lg,
          zIndex: 9999,
          flexDirection: "row",
          alignItems: "center",
          gap: SPACE.sm,
          padding: SPACE.md,
          paddingHorizontal: SPACE.lg,
          borderRadius: RADIUS.lg,
          backgroundColor: bgColor,
          borderWidth: 1,
          borderColor: borderColor,
        },
      ]}
    >
      <Icon size={18} color={iconColor} />
      <Text style={{ flex: 1, fontSize: fs.sm, fontWeight: WEIGHT.semibold, color: t.text }}>
        {message}
      </Text>
      <Pressable
        onPress={() => {
          translateY.value = withTiming(-100, { duration: 150 }, () => runOnJS(hide)());
        }}
        hitSlop={8}
      >
        <X size={14} color={t.muted} />
      </Pressable>
    </Animated.View>
  );
}
