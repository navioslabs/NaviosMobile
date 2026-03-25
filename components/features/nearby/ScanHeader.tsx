import { useEffect } from "react";
import { View, Text } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  Easing,
} from "react-native-reanimated";
import { Radio, Eye, Clock } from "@/lib/icons";
import type { ThemeTokens } from "@/constants/theme";
import { WEIGHT, SPACE, RADIUS, getScaledFontSize } from "@/lib/styles";
import { useFontSizeStore } from "@/stores/fontSizeStore";

interface ScanHeaderProps {
  t: ThemeTokens;
  isDark: boolean;
  postCount: number;
}

/** 脈動アニメーション hook */
function usePulse(periodMs: number) {
  const half = periodMs / 2;
  const pulse = useSharedValue(1);

  useEffect(() => {
    pulse.value = withRepeat(
      withSequence(
        withTiming(1.08, { duration: half, easing: Easing.inOut(Easing.ease) }),
        withTiming(1.0, { duration: half, easing: Easing.inOut(Easing.ease) }),
      ),
      -1,
      true,
    );
  }, []);

  const style = useAnimatedStyle(() => ({
    transform: [{ scale: pulse.value }],
    opacity: 0.85 + (pulse.value - 1.0) * 1.875,
  }));

  return style;
}

/** スキャンヘッダー（Pulseスコア + 更新時刻） */
export default function ScanHeader({ t, isDark, postCount }: ScanHeaderProps) {
  const { scale } = useFontSizeStore();
  const fs = getScaledFontSize(scale);
  const now = new Date();
  const timeStr = `${now.getHours()}:${String(now.getMinutes()).padStart(2, "0")}`;

  const livePulse = usePulse(1600);
  const hotPulse = usePulse(1400);

  return (
    <View style={{ paddingVertical: SPACE.lg, paddingHorizontal: SPACE.xl, backgroundColor: isDark ? "rgba(0,212,161,0.05)" : "rgba(0,212,161,0.07)", borderBottomWidth: 1, borderBottomColor: t.border }}>
      <View style={{ flexDirection: "row", alignItems: "center", gap: SPACE.sm + 2 }}>
        <View style={{ width: 42, height: 42, borderRadius: RADIUS.lg, alignItems: "center", justifyContent: "center", backgroundColor: t.accent + "18" }}>
          <Radio size={20} color={t.accent} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: fs.lg, fontWeight: WEIGHT.bold, color: t.text }}>周辺をスキャン中</Text>
          <Text style={{ fontSize: fs.sm, marginTop: 2, color: t.sub }}>{postCount}件のイベントを検出 • 越谷市周辺</Text>
        </View>
        <Animated.View style={[livePulse, { flexDirection: "row", alignItems: "center", gap: 3, borderRadius: RADIUS.sm + 2, paddingHorizontal: SPACE.sm + 2, paddingVertical: 5, backgroundColor: t.accent }]}>
          <Eye size={12} color="#000" />
          <Text style={{ fontSize: fs.sm, fontWeight: WEIGHT.extrabold, color: "#000" }}>LIVE</Text>
        </Animated.View>
      </View>

      {/* Pulseスコア + 更新時刻 */}
      <View style={{ flexDirection: "row", alignItems: "center", gap: SPACE.sm, marginTop: SPACE.md, paddingTop: SPACE.sm, borderTopWidth: 1, borderTopColor: t.accent + "15" }}>
        <Text style={{ fontSize: fs.sm, fontWeight: WEIGHT.semibold, color: t.sub }}>盛り上がり度</Text>
        <Text style={{ fontSize: fs.base, fontWeight: WEIGHT.bold, color: t.text }}>82 / 100</Text>
        <Animated.View style={[hotPulse, { borderRadius: RADIUS.sm, paddingHorizontal: SPACE.sm, paddingVertical: 2, backgroundColor: t.accent }]}>
          <Text style={{ fontSize: fs.xxs, fontWeight: WEIGHT.extrabold, color: "#000" }}>HOT</Text>
        </Animated.View>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 3, marginLeft: "auto" }}>
          <Clock size={11} color={t.muted} />
          <Text style={{ fontSize: fs.xxs, color: t.muted }}>{timeStr} 更新</Text>
        </View>
      </View>
    </View>
  );
}
