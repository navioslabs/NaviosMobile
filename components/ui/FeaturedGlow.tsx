import { useEffect, useRef } from "react";
import { View, StyleSheet, Animated, Easing } from "react-native";
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
 * 脈動するボーダーとグロー（RN Animated版）
 */
export default function FeaturedGlow({
  children,
  borderRadius,
  accentColor = "#00D4A1",
  blueColor = "#4A9EFF",
  isDark = true,
}: FeaturedGlowProps) {
  const pulse = useRef(new Animated.Value(0)).current;
  const pulse2 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const anim1 = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1, duration: 1200, easing: Easing.inOut(Easing.ease), useNativeDriver: false }),
        Animated.timing(pulse, { toValue: 0, duration: 1200, easing: Easing.inOut(Easing.ease), useNativeDriver: false }),
      ]),
    );
    anim1.start();

    const timer = setTimeout(() => {
      const anim2 = Animated.loop(
        Animated.sequence([
          Animated.timing(pulse2, { toValue: 1, duration: 1400, easing: Easing.inOut(Easing.ease), useNativeDriver: false }),
          Animated.timing(pulse2, { toValue: 0, duration: 1400, easing: Easing.inOut(Easing.ease), useNativeDriver: false }),
        ]),
      );
      anim2.start();
    }, 400);

    return () => {
      anim1.stop();
      clearTimeout(timer);
    };
  }, []);

  const borderColor = pulse.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: ["#F0425C", accentColor, blueColor],
  });

  const borderWidth = pulse.interpolate({
    inputRange: [0, 1],
    outputRange: [2, 3],
  });

  const innerOpacity = pulse.interpolate({
    inputRange: [0, 1],
    outputRange: [0.15, 0.5],
  });

  const outerOpacity = pulse2.interpolate({
    inputRange: [0, 1],
    outputRange: [0.1, 0.45],
  });

  const outerScale = pulse2.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.03],
  });

  return (
    <View style={{ position: "relative" }}>
      {/* 外側グロー */}
      <Animated.View
        style={{
          position: "absolute",
          top: -6,
          left: -6,
          right: -6,
          bottom: -6,
          borderRadius: borderRadius + 6,
          backgroundColor: "transparent",
          opacity: outerOpacity,
          transform: [{ scale: outerScale }],
        }}
      >
        <LinearGradient
          colors={["#F0425C80", accentColor + "70", blueColor + "60", "#8B6FC060"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[StyleSheet.absoluteFill, { borderRadius: borderRadius + 6 }]}
        />
      </Animated.View>

      {/* メインカード */}
      <Animated.View style={{ borderRadius, overflow: "hidden", borderColor, borderWidth }}>
        {/* 内側グロー */}
        <Animated.View
          style={[
            StyleSheet.absoluteFill,
            { borderRadius, overflow: "hidden", zIndex: 1, pointerEvents: "none", opacity: innerOpacity },
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
