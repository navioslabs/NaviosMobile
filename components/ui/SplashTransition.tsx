import { useEffect, useRef } from "react";
import { View, Text, Dimensions, StyleSheet, Animated, Easing } from "react-native";
import Svg, { Rect, Polygon, G } from "react-native-svg";
import * as SplashScreen from "expo-splash-screen";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { makeTokens } from "@/constants/theme";
import { useThemeStore } from "@/stores/themeStore";
import { SPACE, WEIGHT } from "@/lib/styles";

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get("window");

/** ヘッダー上のロゴ最終位置・サイズ */
const HEADER_LOGO_SIZE = 32;
const HEADER_LOGO_X = SPACE.xl;

/** スプラッシュ時のロゴサイズ */
const SPLASH_LOGO_SIZE = 96;

interface SplashTransitionProps {
  /** 初期化完了フラグ（true になったらアニメーション開始） */
  ready: boolean;
  /** アニメーション完了コールバック */
  onFinish: () => void;
}

/**
 * スプラッシュ → ホームのシームレス遷移アニメーション
 * ロゴが画面中央から縮小しながらヘッダー位置へ移動する
 */
export default function SplashTransition({ ready, onFinish }: SplashTransitionProps) {
  const insets = useSafeAreaInsets();
  const { isDark } = useThemeStore();
  const t = makeTokens(isDark);

  /** ロゴの最終 Y 位置（ヘッダー内） */
  const headerLogoY = insets.top + SPACE.sm + 6;

  // --- アニメーション値 ---
  const logoScale = useRef(new Animated.Value(1)).current;
  const logoX = useRef(new Animated.Value(SCREEN_W / 2)).current;
  const logoY = useRef(new Animated.Value(SCREEN_H / 2 - 40)).current;
  const overlayOpacity = useRef(new Animated.Value(1)).current;
  const textOpacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (!ready) return;

    // Expo のネイティブスプラッシュを非表示にする
    SplashScreen.hideAsync();

    const MOVE_DURATION = 600;
    const easing = Easing.bezier(0.4, 0, 0.2, 1);

    // ロゴテキストをフェードアウト
    Animated.timing(textOpacity, { toValue: 0, duration: 200, easing, useNativeDriver: true }).start();

    // ロゴを縮小しながらヘッダー位置へ移動（150ms 遅延）
    setTimeout(() => {
      Animated.parallel([
        Animated.timing(logoScale, { toValue: HEADER_LOGO_SIZE / SPLASH_LOGO_SIZE, duration: MOVE_DURATION, easing, useNativeDriver: true }),
        Animated.timing(logoX, { toValue: HEADER_LOGO_X + HEADER_LOGO_SIZE / 2, duration: MOVE_DURATION, easing, useNativeDriver: true }),
        Animated.timing(logoY, { toValue: headerLogoY + HEADER_LOGO_SIZE / 2, duration: MOVE_DURATION, easing, useNativeDriver: true }),
      ]).start();
    }, 150);

    // 背景オーバーレイをフェードアウト（400ms 遅延）
    setTimeout(() => {
      Animated.timing(overlayOpacity, { toValue: 0, duration: 400, easing, useNativeDriver: true }).start(({ finished }) => {
        if (finished) onFinish();
      });
    }, 400);
  }, [ready]);

  // --- アニメーションスタイル ---
  const logoStyle = {
    transform: [
      { translateX: Animated.subtract(logoX, SCREEN_W / 2) },
      { translateY: Animated.subtract(logoY, SCREEN_H / 2 - 40) },
      { scale: logoScale },
    ],
  };

  const overlayStyle = {
    opacity: overlayOpacity,
  };

  const textStyle = {
    opacity: textOpacity,
  };

  return (
    <Animated.View
      style={[styles.overlay, overlayStyle, { backgroundColor: t.bg }]}
      pointerEvents="none"
    >
      {/* ロゴ（中央から移動） */}
      <Animated.View style={[styles.logoContainer, logoStyle]}>
        <Svg width={SPLASH_LOGO_SIZE} height={SPLASH_LOGO_SIZE} viewBox="0 0 640 640">
          <Rect x={0} y={0} width={640} height={640} rx={160} fill={t.accent} />
          <G transform="translate(320, 320)">
            <Polygon points="-120,-160 -60,-160 -60,160 -120,160" fill="rgba(255,255,255,0.85)" />
            <Polygon points="-60,-160 -120,-160 60,160 120,160" fill="rgba(255,255,255,0.6)" />
            <Polygon points="60,-160 120,-160 120,160 60,160" fill="rgba(255,255,255,0.85)" />
          </G>
        </Svg>
      </Animated.View>

      {/* ロゴテキスト（フェードアウト） */}
      <Animated.View style={[styles.textContainer, textStyle]}>
        <Text style={[styles.logoText, { color: t.text }]}>
          navi<Text style={{ color: t.accent }}>os</Text>
        </Text>
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 9999,
    alignItems: "center",
    justifyContent: "center",
  },
  logoContainer: {
    position: "absolute",
    top: SCREEN_H / 2 - 40 - SPLASH_LOGO_SIZE / 2,
    left: SCREEN_W / 2 - SPLASH_LOGO_SIZE / 2,
  },
  textContainer: {
    position: "absolute",
    top: SCREEN_H / 2 - 40 + SPLASH_LOGO_SIZE / 2 + 16,
    alignItems: "center",
  },
  logoText: {
    fontSize: 32,
    fontWeight: "800",
    letterSpacing: -0.8,
  },
});
