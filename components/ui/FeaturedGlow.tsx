import { useEffect } from "react";
import { View, StyleSheet } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSequence,
  withDelay,
  Easing,
  interpolate,
  interpolateColor,
} from "react-native-reanimated";
import { LinearGradient } from "expo-linear-gradient";
import type { ReactNode } from "react";

interface FeaturedGlowProps {
  children: ReactNode;
  borderRadius: number;
  accentColor?: string;
  blueColor?: string;
  isDark?: boolean;
}

/**
 * HOT投稿用のグローアニメーション
 * 3層のグローが時差で脈動し、ボーダーが赤→アクセント→青で色変化する
 */
export default function FeaturedGlow({
  children,
  borderRadius,
  accentColor = "#00D4A1",
  blueColor = "#4A9EFF",
  isDark = true,
}: FeaturedGlowProps) {
  const pulse = useSharedValue(0);
  const pulse2 = useSharedValue(0);

  useEffect(() => {
    // メインパルス: 速めのサイクルでインパクト
    pulse.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 1200, easing: Easing.inOut(Easing.ease) }),
        withTiming(0, { duration: 1200, easing: Easing.inOut(Easing.ease) }),
      ),
      -1,
      false,
    );
    // セカンドパルス: 少し遅れて波紋のように追従
    pulse2.value = withDelay(
      400,
      withRepeat(
        withSequence(
          withTiming(1, { duration: 1400, easing: Easing.inOut(Easing.ease) }),
          withTiming(0, { duration: 1400, easing: Easing.inOut(Easing.ease) }),
        ),
        -1,
        false,
      ),
    );
  }, [pulse, pulse2]);

  // ボーダーが赤→アクセント→青に色変化
  const borderStyle = useAnimatedStyle(() => {
    const color = interpolateColor(
      pulse.value,
      [0, 0.5, 1],
      ["#F0425C", accentColor, blueColor],
    );
    const width = interpolate(pulse.value, [0, 1], [2, 3]);
    return {
      borderColor: color,
      borderWidth: width,
    };
  });

  // 内側グロー: 強めの発光
  const innerGlowStyle = useAnimatedStyle(() => {
    const opacity = interpolate(pulse.value, [0, 1], [0.15, 0.5]);
    return { opacity };
  });

  // 外側グロー（シャドウ代わり）: 時差で大きく広がる
  const outerGlowStyle = useAnimatedStyle(() => {
    const opacity = interpolate(pulse2.value, [0, 1], [0.1, 0.45]);
    const scale = interpolate(pulse2.value, [0, 1], [1, 1.03]);
    return {
      opacity,
      transform: [{ scale }],
    };
  });

  return (
    <View style={{ position: "relative" }}>
      {/* 外側グロー（カードの外に広がる発光） */}
      <Animated.View
        style={[
          {
            position: "absolute",
            top: -6,
            left: -6,
            right: -6,
            bottom: -6,
            borderRadius: borderRadius + 6,
            backgroundColor: "transparent",
          },
          outerGlowStyle,
        ]}
      >
        <LinearGradient
          colors={["#F0425C80", accentColor + "70", blueColor + "60", "#8B6FC060"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[StyleSheet.absoluteFill, { borderRadius: borderRadius + 6 }]}
        />
      </Animated.View>

      {/* メインカード */}
      <Animated.View style={[{ borderRadius, overflow: "hidden" }, borderStyle]}>
        {/* 内側グロー（上辺と下辺にグラデーション） */}
        <Animated.View
          style={[
            StyleSheet.absoluteFill,
            { borderRadius, overflow: "hidden", zIndex: 1, pointerEvents: "none" },
            innerGlowStyle,
          ]}
        >
          <LinearGradient
            colors={[
              isDark ? "#F0425C50" : "#F0425C30",
              "transparent",
              "transparent",
              isDark ? blueColor + "40" : blueColor + "25",
            ]}
            locations={[0, 0.25, 0.75, 1]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={StyleSheet.absoluteFill}
          />
        </Animated.View>

        {children}
      </Animated.View>
    </View>
  );
}
