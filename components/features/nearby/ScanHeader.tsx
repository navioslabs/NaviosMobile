import { useEffect } from "react";
import { View, Text } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  Easing,
} from "react-native-reanimated";
import { Radio, Eye, Clock, Flame, Zap } from "@/lib/icons";
import type { ThemeTokens } from "@/constants/theme";
import { WEIGHT, SPACE, RADIUS, getScaledFontSize } from "@/lib/styles";
import { useFontSizeStore } from "@/stores/fontSizeStore";

interface ScanHeaderProps {
  t: ThemeTokens;
  isDark: boolean;
  postCount: number;
  closeCount?: number;
  recentCount?: number;
  urgentCount?: number;
  dataUpdatedAt?: number;
  isWatching?: boolean;
  /** スコアバーのアニメーションスタイル（新着パルス用） */
  scoreBarAnimStyle?: any;
}

// ─── スコア帯の定義 ─────────────────────────────────

interface ScoreTier {
  label: string;
  badge: string | null;
  bgOpacity: number;
  pulsePeriod: number;
  icon: typeof Radio;
}

function getScoreTier(score: number): ScoreTier {
  if (score >= 80) return { label: "かなり活発です！", badge: "VERY HOT", bgOpacity: 0.15, pulsePeriod: 1000, icon: Flame };
  if (score >= 60) return { label: "盛り上がっています", badge: "HOT", bgOpacity: 0.10, pulsePeriod: 1200, icon: Zap };
  if (score >= 30) return { label: "周辺をスキャン中", badge: null, bgOpacity: 0.07, pulsePeriod: 1600, icon: Radio };
  return { label: "静かなエリアです", badge: null, bgOpacity: 0.03, pulsePeriod: 2000, icon: Radio };
}

// ─── 脈動アニメーション ─────────────────────────────

function usePulse(periodMs: number, intensity = 1.08) {
  const half = periodMs / 2;
  const pulse = useSharedValue(1);

  useEffect(() => {
    requestAnimationFrame(() => {
      pulse.value = withRepeat(
        withSequence(
          withTiming(intensity, { duration: half, easing: Easing.inOut(Easing.ease) }),
          withTiming(1.0, { duration: half, easing: Easing.inOut(Easing.ease) }),
        ),
        -1,
        true,
      );
    });
  }, [periodMs, intensity]);

  const style = useAnimatedStyle(() => ({
    transform: [{ scale: pulse.value }],
    opacity: 0.85 + (pulse.value - 1.0) * 1.875,
  }));

  return style;
}

// ─── Pulse スコア算出 ───────────────────────────────

function calcPulseScore(postCount: number, closeCount: number, recentCount: number, urgentCount: number = 0): number {
  if (postCount === 0) return 0;
  const n = Math.max(postCount, 1);
  return Math.min(100, Math.round(
    (Math.min(postCount, 20) / 20) * 30 +
    (closeCount / n) * 25 +
    (recentCount / n) * 25 +
    (urgentCount / n) * 20
  ));
}

// ─── スコアバーコンポーネント ───────────────────────

function ScoreBar({ score, t, animStyle }: { score: number; t: ThemeTokens; animStyle?: any }) {
  const barColor = score >= 80 ? "#FF6B35" : score >= 60 ? t.accent : score >= 30 ? t.accent + "80" : t.surface3;
  return (
    <View style={{ flex: 1, height: 4, borderRadius: 2, backgroundColor: t.surface3, overflow: "hidden" }}>
      <Animated.View style={[{ width: `${score}%`, height: "100%", borderRadius: 2, backgroundColor: barColor }, animStyle]} />
    </View>
  );
}

// ─── メインコンポーネント ───────────────────────────

/** スキャンヘッダー（スコア帯でUI変化） */
export default function ScanHeader({
  t,
  isDark,
  postCount,
  closeCount = 0,
  recentCount = 0,
  urgentCount = 0,
  dataUpdatedAt,
  isWatching = false,
  scoreBarAnimStyle,
}: ScanHeaderProps) {
  const { scale } = useFontSizeStore();
  const fs = getScaledFontSize(scale);

  const pulseScore = calcPulseScore(postCount, closeCount, recentCount, urgentCount);
  const tier = getScoreTier(pulseScore);
  const TierIcon = tier.icon;

  const updatedDate = dataUpdatedAt ? new Date(dataUpdatedAt) : new Date();
  const timeStr = `${updatedDate.getHours()}:${String(updatedDate.getMinutes()).padStart(2, "0")}`;

  const livePulse = usePulse(tier.pulsePeriod);
  const badgePulse = usePulse(tier.pulsePeriod - 200, pulseScore >= 80 ? 1.12 : 1.08);

  // スコア帯に応じた背景色
  const bgColor = isDark
    ? `rgba(0,212,161,${tier.bgOpacity})`
    : `rgba(0,212,161,${tier.bgOpacity})`;

  // VERY HOT 時はグラデーション背景
  const isVeryHot = pulseScore >= 80;

  const headerContent = (
    <>
      {/* メイン行 */}
      <View style={{ flexDirection: "row", alignItems: "center", gap: SPACE.sm + 2 }}>
        <View style={{
          width: 42,
          height: 42,
          borderRadius: RADIUS.lg,
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: isVeryHot ? "#FF6B35" + "25" : t.accent + "18",
        }}>
          <TierIcon size={20} color={isVeryHot ? "#FF6B35" : t.accent} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: fs.lg, fontWeight: WEIGHT.bold, color: t.text }}>
            {tier.label}
          </Text>
          <Text style={{ fontSize: fs.sm, marginTop: 2, color: t.sub }}>
            {postCount}件のイベントを検出{isWatching ? " • リアルタイム" : ""}
          </Text>
        </View>
        <Animated.View style={[livePulse, {
          flexDirection: "row",
          alignItems: "center",
          gap: 3,
          borderRadius: RADIUS.sm + 2,
          paddingHorizontal: SPACE.sm + 2,
          paddingVertical: 5,
          backgroundColor: isVeryHot ? "#FF6B35" : t.accent,
        }]}>
          <Eye size={12} color="#000" />
          <Text style={{ fontSize: fs.sm, fontWeight: WEIGHT.extrabold, color: "#000" }}>LIVE</Text>
        </Animated.View>
      </View>

      {/* スコア行 */}
      <View style={{ marginTop: SPACE.md, paddingTop: SPACE.sm, borderTopWidth: 1, borderTopColor: (isVeryHot ? "#FF6B35" : t.accent) + "15" }}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: SPACE.sm }}>
          <Text style={{ fontSize: fs.sm, fontWeight: WEIGHT.semibold, color: t.sub }}>盛り上がり度</Text>
          <Text style={{ fontSize: fs.base, fontWeight: WEIGHT.bold, color: isVeryHot ? "#FF6B35" : t.text }}>
            {pulseScore}
          </Text>

          {tier.badge && (
            <Animated.View style={[badgePulse, {
              borderRadius: RADIUS.sm,
              paddingHorizontal: SPACE.sm,
              paddingVertical: 2,
              backgroundColor: isVeryHot ? "#FF6B35" : t.accent,
            }]}>
              <Text style={{ fontSize: fs.xxs, fontWeight: WEIGHT.extrabold, color: "#000" }}>{tier.badge}</Text>
            </Animated.View>
          )}

          <View style={{ flexDirection: "row", alignItems: "center", gap: 3, marginLeft: "auto" }}>
            <Clock size={11} color={t.muted} />
            <Text style={{ fontSize: fs.xxs, color: t.muted }}>{timeStr} 更新</Text>
          </View>
        </View>

        {/* スコアバー */}
        <View style={{ flexDirection: "row", alignItems: "center", gap: SPACE.sm, marginTop: SPACE.sm }}>
          <ScoreBar score={pulseScore} t={t} animStyle={scoreBarAnimStyle} />
          <Text style={{ fontSize: fs.xxs, color: t.muted, width: 30, textAlign: "right" }}>{pulseScore}%</Text>
        </View>
      </View>
    </>
  );

  // VERY HOT: グラデーション背景
  if (isVeryHot) {
    return (
      <LinearGradient
        colors={isDark ? ["rgba(255,107,53,0.12)", "rgba(0,212,161,0.05)"] : ["rgba(255,107,53,0.08)", "rgba(0,212,161,0.04)"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{ paddingVertical: SPACE.lg, paddingHorizontal: SPACE.xl, borderBottomWidth: 1, borderBottomColor: t.border }}
      >
        {headerContent}
      </LinearGradient>
    );
  }

  // 通常: 固定背景
  return (
    <View style={{
      paddingVertical: SPACE.lg,
      paddingHorizontal: SPACE.xl,
      backgroundColor: bgColor,
      borderBottomWidth: 1,
      borderBottomColor: t.border,
    }}>
      {headerContent}
    </View>
  );
}
