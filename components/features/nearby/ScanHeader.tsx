import { useEffect, useRef } from "react";
import { View, Text, Animated, Easing } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Radio, MapPin, Clock, Flame, Zap } from "@/lib/icons";
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
  placeName?: string | null;
  scoreBarAnimStyle?: any;
}

// ─── スコア帯 ──────────────────────────────────────

interface ScoreTier {
  label: string;
  badge: string | null;
  bgOpacity: number;
  pulsePeriod: number;
  icon: typeof Radio;
}

function getScoreTier(score: number): ScoreTier {
  if (score >= 80) return { label: "かなり活発", badge: "VERY HOT", bgOpacity: 0.15, pulsePeriod: 1000, icon: Flame };
  if (score >= 60) return { label: "盛り上がっています", badge: "HOT", bgOpacity: 0.10, pulsePeriod: 1200, icon: Zap };
  if (score >= 30) return { label: "スキャン中", badge: null, bgOpacity: 0.07, pulsePeriod: 1600, icon: Radio };
  return { label: "静かなエリア", badge: null, bgOpacity: 0.03, pulsePeriod: 2000, icon: Radio };
}

// ─── 脈動（RN Animated版） ──────────────────────────

function usePulse(periodMs: number, intensity = 1.08) {
  const pulse = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: intensity,
          duration: periodMs / 2,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulse, {
          toValue: 1.0,
          duration: periodMs / 2,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ]),
    );
    animation.start();
    return () => animation.stop();
  }, [periodMs, intensity]);

  const opacity = pulse.interpolate({
    inputRange: [1.0, intensity],
    outputRange: [0.85, 1.0],
  });

  return { transform: [{ scale: pulse }], opacity };
}

// ─── Pulse スコア ──────────────────────────────────

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

// ─── スコアバー ────────────────────────────────────

function ScoreBar({ score, t }: { score: number; t: ThemeTokens }) {
  const barColor = score >= 80 ? "#FF6B35" : score >= 60 ? t.accent : score >= 30 ? t.accent + "80" : t.surface3;
  return (
    <View style={{ flex: 1, height: 4, borderRadius: 2, backgroundColor: t.surface3, overflow: "hidden" }}>
      <View style={{ width: `${score}%`, height: "100%", borderRadius: 2, backgroundColor: barColor }} />
    </View>
  );
}

// ─── メイン ────────────────────────────────────────

/** スキャンヘッダー（地名表示 + スコア帯） */
export default function ScanHeader({
  t,
  isDark,
  postCount,
  closeCount = 0,
  recentCount = 0,
  urgentCount = 0,
  dataUpdatedAt,
  isWatching = false,
  placeName,
}: ScanHeaderProps) {
  const { scale } = useFontSizeStore();
  const fs = getScaledFontSize(scale);

  const pulseScore = calcPulseScore(postCount, closeCount, recentCount, urgentCount);
  const tier = getScoreTier(pulseScore);
  const TierIcon = tier.icon;
  const isVeryHot = pulseScore >= 80;

  const updatedDate = dataUpdatedAt ? new Date(dataUpdatedAt) : new Date();
  const timeStr = `${updatedDate.getHours()}:${String(updatedDate.getMinutes()).padStart(2, "0")}`;

  const livePulse = usePulse(tier.pulsePeriod);
  const badgePulse = usePulse(tier.pulsePeriod - 200, isVeryHot ? 1.12 : 1.08);

  const bgColor = `rgba(0,212,161,${tier.bgOpacity})`;

  const headerContent = (
    <>
      {/* 地名 + LIVE */}
      <View style={{ flexDirection: "row", alignItems: "center", gap: SPACE.sm, marginBottom: SPACE.md }}>
        <MapPin size={16} color={t.accent} />
        <Text style={{ fontSize: fs.xl, fontWeight: WEIGHT.extrabold, color: t.text, flex: 1 }} numberOfLines={1}>
          {placeName ?? "現在地を取得中..."}
        </Text>
        <Animated.View style={[livePulse, {
          flexDirection: "row",
          alignItems: "center",
          gap: 3,
          borderRadius: RADIUS.sm + 2,
          paddingHorizontal: SPACE.sm + 2,
          paddingVertical: 4,
          backgroundColor: isVeryHot ? "#FF6B35" : t.accent,
        }]}>
          <Radio size={10} color="#000" />
          <Text style={{ fontSize: 9, fontWeight: WEIGHT.extrabold, color: "#000" }}>LIVE</Text>
        </Animated.View>
      </View>

      {/* ステータス行 */}
      <View style={{ flexDirection: "row", alignItems: "center", gap: SPACE.sm }}>
        <View style={{
          width: 36,
          height: 36,
          borderRadius: RADIUS.md,
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: isVeryHot ? "#FF6B35" + "25" : t.accent + "18",
        }}>
          <TierIcon size={18} color={isVeryHot ? "#FF6B35" : t.accent} />
        </View>

        <View style={{ flex: 1 }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: SPACE.sm }}>
            <Text style={{ fontSize: fs.sm, fontWeight: WEIGHT.bold, color: t.text }}>
              {tier.label}
            </Text>
            {tier.badge && (
              <Animated.View style={[badgePulse, {
                borderRadius: RADIUS.sm,
                paddingHorizontal: SPACE.xs + 2,
                paddingVertical: 1,
                backgroundColor: isVeryHot ? "#FF6B35" : t.accent,
              }]}>
                <Text style={{ fontSize: 9, fontWeight: WEIGHT.extrabold, color: "#000" }}>{tier.badge}</Text>
              </Animated.View>
            )}
          </View>
          <Text style={{ fontSize: fs.xxs, color: t.muted, marginTop: 1 }}>
            {postCount}件の情報{isWatching ? " • リアルタイム更新中" : ""} • {timeStr}
          </Text>
        </View>

        {/* スコア数値 */}
        <View style={{ alignItems: "center" }}>
          <Text style={{ fontSize: fs.xl, fontWeight: WEIGHT.extrabold, color: isVeryHot ? "#FF6B35" : t.accent }}>
            {pulseScore}
          </Text>
          <Text style={{ fontSize: 8, fontWeight: WEIGHT.bold, color: t.muted }}>PULSE</Text>
          <Text style={{ fontSize: 7, color: t.muted, marginTop: 1 }}>エリア活性度</Text>
        </View>
      </View>

      {/* スコアバー */}
      <View style={{ flexDirection: "row", alignItems: "center", gap: SPACE.sm, marginTop: SPACE.sm }}>
        <ScoreBar score={pulseScore} t={t} />
      </View>
    </>
  );

  if (isVeryHot) {
    return (
      <LinearGradient
        colors={isDark ? ["rgba(255,107,53,0.12)", "rgba(0,212,161,0.05)"] : ["rgba(255,107,53,0.08)", "rgba(0,212,161,0.04)"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{ paddingVertical: SPACE.md, paddingHorizontal: SPACE.xl, borderBottomWidth: 1, borderBottomColor: t.border }}
      >
        {headerContent}
      </LinearGradient>
    );
  }

  return (
    <View style={{
      paddingVertical: SPACE.md,
      paddingHorizontal: SPACE.xl,
      backgroundColor: bgColor,
      borderBottomWidth: 1,
      borderBottomColor: t.border,
    }}>
      {headerContent}
    </View>
  );
}
