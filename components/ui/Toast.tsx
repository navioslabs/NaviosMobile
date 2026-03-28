import { useEffect } from "react";
import { Text, Pressable, useWindowDimensions } from "react-native";
import Animated, { useSharedValue, useAnimatedStyle, withSpring, withDelay, withTiming, withSequence, runOnJS } from "react-native-reanimated";
import { AlertCircle, Check, X } from "@/lib/icons";
import { useToastStore } from "@/stores/toastStore";
import { useAppStyles } from "@/hooks/useAppStyles";
import { WEIGHT, SPACE, RADIUS } from "@/lib/styles";

/** グローバルトースト通知（横からポンッ） */
export default function Toast() {
  const { message, type, visible, hide } = useToastStore();
  const { t, fs } = useAppStyles();
  const { width } = useWindowDimensions();
  const translateX = useSharedValue(width);
  const scale = useSharedValue(0.8);

  useEffect(() => {
    if (visible) {
      // 右からスライドイン + バウンス
      translateX.value = withSpring(0, { damping: 16, stiffness: 180 });
      scale.value = withSequence(
        withSpring(1.05, { damping: 12, stiffness: 200 }),
        withSpring(1, { damping: 14, stiffness: 150 }),
      );
      // 3秒後に右へスライドアウト
      translateX.value = withDelay(
        3000,
        withTiming(width, { duration: 250 }, () => {
          runOnJS(hide)();
        }),
      );
    } else {
      translateX.value = width;
      scale.value = 0.8;
    }
  }, [visible, message]);

  const animStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { scale: scale.value },
    ],
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
          shadowColor: "#000",
          shadowOffset: { width: -2, height: 4 },
          shadowOpacity: 0.15,
          shadowRadius: 12,
          elevation: 6,
        },
      ]}
    >
      <Icon size={18} color={iconColor} />
      <Text style={{ flex: 1, fontSize: fs.sm, fontWeight: WEIGHT.semibold, color: t.text }}>
        {message}
      </Text>
      <Pressable
        onPress={() => {
          translateX.value = withTiming(width, { duration: 200 }, () => runOnJS(hide)());
        }}
        hitSlop={8}
      >
        <X size={14} color={t.muted} />
      </Pressable>
    </Animated.View>
  );
}
