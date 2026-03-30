import { useEffect, useRef } from "react";
import { Text, Pressable, useWindowDimensions, Animated } from "react-native";
import { AlertCircle, Check, X } from "@/lib/icons";
import { useToastStore } from "@/stores/toastStore";
import { useAppStyles } from "@/hooks/useAppStyles";
import { WEIGHT, SPACE, RADIUS } from "@/lib/styles";

/** グローバルトースト通知（横からポンッ） */
export default function Toast() {
  const { message, type, visible, hide } = useToastStore();
  const { t, fs } = useAppStyles();
  const { width } = useWindowDimensions();
  const translateX = useRef(new Animated.Value(width)).current;
  const scale = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    if (visible) {
      // 右からスライドイン + バウンス
      Animated.spring(translateX, { toValue: 0, damping: 16, stiffness: 180, useNativeDriver: true }).start();
      Animated.sequence([
        Animated.spring(scale, { toValue: 1.05, damping: 12, stiffness: 200, useNativeDriver: true }),
        Animated.spring(scale, { toValue: 1, damping: 14, stiffness: 150, useNativeDriver: true }),
      ]).start();
      // 3秒後に右へスライドアウト
      setTimeout(() => {
        Animated.timing(translateX, { toValue: width, duration: 250, useNativeDriver: true }).start(() => {
          hide();
        });
      }, 3000);
    } else {
      translateX.setValue(width);
      scale.setValue(0.8);
    }
  }, [visible, message]);

  if (!visible) return null;

  const isError = type === "error";
  const bgColor = isError ? t.red + "15" : t.accent + "15";
  const borderColor = isError ? t.red + "40" : t.accent + "40";
  const iconColor = isError ? t.red : t.accent;
  const Icon = isError ? AlertCircle : Check;

  return (
    <Animated.View
      accessibilityRole="alert"
      accessibilityLiveRegion="assertive"
      style={[
        {
          transform: [
            { translateX },
            { scale },
          ],
        },
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
          Animated.timing(translateX, { toValue: width, duration: 200, useNativeDriver: true }).start(() => hide());
        }}
        accessibilityLabel="通知を閉じる"
        accessibilityRole="button"
        hitSlop={8}
      >
        <X size={14} color={t.muted} />
      </Pressable>
    </Animated.View>
  );
}
