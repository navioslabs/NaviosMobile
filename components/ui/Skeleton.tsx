import React, { useEffect } from "react";
import { StyleSheet, View, ViewStyle } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
} from "react-native-reanimated";
import type { ThemeTokens } from "@/constants/theme";
import { SPACE, RADIUS } from "@/lib/styles";

// ═══════════════════════════════════════════════════════════════
// SkeletonBox — 汎用パルスアニメーション付きプレースホルダー
// ═══════════════════════════════════════════════════════════════

interface SkeletonBoxProps {
  width: number | `${number}%`;
  height: number;
  borderRadius?: number;
  t: ThemeTokens;
  style?: ViewStyle;
}

/** パルスアニメーションで点滅するスケルトンブロック */
export function SkeletonBox({ width, height, borderRadius = RADIUS.sm, t, style }: SkeletonBoxProps) {
  const opacity = useSharedValue(0.4);

  useEffect(() => {
    opacity.value = withRepeat(
      withTiming(1, { duration: 800, easing: Easing.inOut(Easing.ease) }),
      -1,
      true,
    );
  }, []);

  const animStyle = useAnimatedStyle(() => ({ opacity: opacity.value }));

  return (
    <Animated.View
      style={[
        { width, height, borderRadius, backgroundColor: t.surface3 },
        animStyle,
        style,
      ]}
    />
  );
}

// ═══════════════════════════════════════════════════════════════
// PostCardSkeleton — フィード投稿カードのスケルトン
// ═══════════════════════════════════════════════════════════════

/** フィード投稿カードの読み込みプレースホルダー */
export function PostCardSkeleton({ t }: { t: ThemeTokens }) {
  return (
    <View style={[styles.card, { backgroundColor: t.surface, borderColor: t.border }]}>
      <SkeletonBox width={100} height={100} borderRadius={RADIUS.md} t={t} />
      <View style={styles.cardBody}>
        <SkeletonBox width="80%" height={14} t={t} />
        <SkeletonBox width="60%" height={12} t={t} />
        <SkeletonBox width="40%" height={12} t={t} />
      </View>
    </View>
  );
}

// ═══════════════════════════════════════════════════════════════
// TalkItemSkeleton — トークタイムラインのスケルトン
// ═══════════════════════════════════════════════════════════════

/** トークタイムライン項目の読み込みプレースホルダー */
export function TalkItemSkeleton({ t }: { t: ThemeTokens }) {
  return (
    <View style={[styles.talkRow, { borderColor: t.border }]}>
      <SkeletonBox width={40} height={40} borderRadius={RADIUS.full} t={t} />
      <View style={styles.talkBody}>
        <SkeletonBox width="50%" height={12} t={t} />
        <SkeletonBox width="90%" height={12} t={t} />
        <SkeletonBox width="70%" height={12} t={t} />
      </View>
    </View>
  );
}

// ═══════════════════════════════════════════════════════════════
// DetailSkeleton — 投稿詳細画面のスケルトン
// ═══════════════════════════════════════════════════════════════

/** 投稿詳細画面の読み込みプレースホルダー */
export function DetailSkeleton({ t }: { t: ThemeTokens }) {
  return (
    <View style={styles.detail}>
      <SkeletonBox width="100%" height={220} borderRadius={RADIUS.lg} t={t} />
      <SkeletonBox width="70%" height={18} t={t} style={{ marginTop: SPACE.lg }} />
      <SkeletonBox width="100%" height={12} t={t} style={{ marginTop: SPACE.md }} />
      <SkeletonBox width="100%" height={12} t={t} style={{ marginTop: SPACE.sm }} />
      <SkeletonBox width="85%" height={12} t={t} style={{ marginTop: SPACE.sm }} />
      <SkeletonBox width="60%" height={12} t={t} style={{ marginTop: SPACE.sm }} />
    </View>
  );
}

// ═══════════════════════════════════════════════════════════════
// スタイル
// ═══════════════════════════════════════════════════════════════

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    borderRadius: RADIUS.xl,
    borderWidth: 1,
    padding: SPACE.md,
    gap: SPACE.md,
  },
  cardBody: {
    flex: 1,
    gap: SPACE.sm,
    justifyContent: "center",
  },
  talkRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    paddingVertical: SPACE.md,
    paddingHorizontal: SPACE.lg,
    gap: SPACE.md,
    borderBottomWidth: 1,
  },
  talkBody: {
    flex: 1,
    gap: SPACE.sm,
  },
  detail: {
    padding: SPACE.lg,
  },
});
