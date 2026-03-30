import { useEffect, useRef } from "react";
import { View, Animated, Easing, StyleSheet } from "react-native";
import { Radio } from "@/lib/icons";
import type { ThemeTokens } from "@/constants/theme";

/** パルスリング1つ分 */
function PulseRing({ delay, t, active }: { delay: number; t: ThemeTokens; active: boolean }) {
  const progress = useRef(new Animated.Value(0)).current;
  const animRef = useRef<Animated.CompositeAnimation | null>(null);

  useEffect(() => {
    if (active) {
      progress.setValue(0);
      animRef.current = Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(progress, {
            toValue: 1,
            duration: 1200,
            easing: Easing.out(Easing.ease),
            useNativeDriver: true,
          }),
        ])
      );
      animRef.current.start();
    } else {
      animRef.current?.stop();
      Animated.timing(progress, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start();
    }
    return () => { animRef.current?.stop(); };
  }, [active]);

  const scale = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [0.5, 2.5],
    extrapolate: "clamp",
  });

  const opacity = progress.interpolate({
    inputRange: [0, 0.3, 1],
    outputRange: [0, 0.6, 0],
    extrapolate: "clamp",
  });

  return (
    <Animated.View
      style={[
        styles.ring,
        {
          transform: [{ scale }],
          opacity,
          borderColor: t.accent,
        },
      ]}
    />
  );
}

interface PulseRefreshProps {
  refreshing: boolean;
  t: ThemeTokens;
}

/**
 * 電波パルス型リフレッシュインジケーター
 * RefreshControl の代わりにリスト上部に配置する
 */
export default function PulseRefresh({ refreshing, t }: PulseRefreshProps) {
  if (!refreshing) return null;

  const iconScale = useRef(new Animated.Value(1)).current;
  const containerOpacity = useRef(new Animated.Value(0)).current;
  const iconAnimRef = useRef<Animated.CompositeAnimation | null>(null);

  useEffect(() => {
    if (refreshing) {
      Animated.timing(containerOpacity, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }).start();
      iconAnimRef.current = Animated.loop(
        Animated.sequence([
          Animated.timing(iconScale, {
            toValue: 1.15,
            duration: 400,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(iconScale, {
            toValue: 1,
            duration: 400,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ])
      );
      iconAnimRef.current.start();
    } else {
      Animated.timing(containerOpacity, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
      iconAnimRef.current?.stop();
      Animated.timing(iconScale, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }).start();
    }
    return () => { iconAnimRef.current?.stop(); };
  }, [refreshing]);

  return (
    <Animated.View style={[styles.container, { opacity: containerOpacity }]}>
      {/* パルスリング3層 */}
      <PulseRing delay={0} t={t} active={refreshing} />
      <PulseRing delay={400} t={t} active={refreshing} />
      <PulseRing delay={800} t={t} active={refreshing} />

      {/* 中央アイコン */}
      <Animated.View style={[styles.iconWrap, { backgroundColor: t.accent + "20", transform: [{ scale: iconScale }] }]}>
        <Radio size={18} color={t.accent} />
      </Animated.View>
    </Animated.View>
  );
}

const RING_SIZE = 60;

const styles = StyleSheet.create({
  container: {
    height: 64,
    alignItems: "center",
    justifyContent: "center",
  },
  ring: {
    position: "absolute",
    width: RING_SIZE,
    height: RING_SIZE,
    borderRadius: RING_SIZE / 2,
    borderWidth: 2,
  },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
});
