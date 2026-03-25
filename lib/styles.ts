import { StyleSheet, TextStyle, ViewStyle } from "react-native";
import type { ThemeTokens } from "@/constants/theme";

// ═══════════════════════════════════════════════════════════════
// フォントサイズ定数
// ═══════════════════════════════════════════════════════════════

export const FONT_SIZE = {
  /** 極小 (バッジ内等) */
  xxs: 12,
  /** 小 (キャプション、補助ラベル) */
  xs: 12,
  /** やや小 (メタ情報、時刻等) */
  sm: 13,
  /** 標準 (チップ、ラベル) */
  md: 14,
  /** 本文 (投稿文、メッセージ等) */
  base: 15,
  /** やや大 (小見出し、カード名) */
  lg: 16,
  /** 中見出し */
  xl: 17,
  /** セクションタイトル */
  xxl: 20,
  /** 画面タイトル */
  xxxl: 22,
  /** ヒーロー (AI画面ロゴ等) */
  hero: 28,
} as const;

/** スケール適用済みフォントサイズを返す */
export function getScaledFontSize(scale: number) {
  return {
    xxs: Math.round(FONT_SIZE.xxs * scale),
    xs: Math.round(FONT_SIZE.xs * scale),
    sm: Math.round(FONT_SIZE.sm * scale),
    md: Math.round(FONT_SIZE.md * scale),
    base: Math.round(FONT_SIZE.base * scale),
    lg: Math.round(FONT_SIZE.lg * scale),
    xl: Math.round(FONT_SIZE.xl * scale),
    xxl: Math.round(FONT_SIZE.xxl * scale),
    xxxl: Math.round(FONT_SIZE.xxxl * scale),
    hero: Math.round(FONT_SIZE.hero * scale),
  };
}

export type ScaledFontSize = ReturnType<typeof getScaledFontSize>;

// ═══════════════════════════════════════════════════════════════
// フォントウェイト
// ═══════════════════════════════════════════════════════════════

export const WEIGHT = {
  normal: "400" as const,
  medium: "500" as const,
  semibold: "600" as const,
  bold: "700" as const,
  extrabold: "800" as const,
};

// ═══════════════════════════════════════════════════════════════
// スペーシング
// ═══════════════════════════════════════════════════════════════

export const SPACE = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
} as const;

// ═══════════════════════════════════════════════════════════════
// 角丸
// ═══════════════════════════════════════════════════════════════

export const RADIUS = {
  sm: 8,
  md: 12,
  lg: 14,
  xl: 16,
  xxl: 18,
  full: 9999,
} as const;

// ═══════════════════════════════════════════════════════════════
// テーマ対応スタイルファクトリ
// ═══════════════════════════════════════════════════════════════

/**
 * テーマトークンからベーススタイルを生成する
 * @example
 * const s = createStyles(t);
 * <Text style={s.textTitle}>タイトル</Text>
 * <View style={s.card}>...</View>
 */
export const createStyles = (t: ThemeTokens, scale = 1) => {
  const f = getScaledFontSize(scale);
  return StyleSheet.create({
    // ── テキスト ──────────────────────────────────────
    /** ヒーロー見出し (28px, 800) */
    textHero: {
      fontSize: f.hero,
      fontWeight: WEIGHT.extrabold,
      color: t.text,
      letterSpacing: -0.5,
    },
    /** 画面タイトル (22px, 800) */
    textScreenTitle: {
      fontSize: f.xxxl,
      fontWeight: WEIGHT.extrabold,
      color: t.text,
    },
    /** セクションタイトル (20px, 800) */
    textSectionTitle: {
      fontSize: f.xxl,
      fontWeight: WEIGHT.extrabold,
      color: t.text,
    },
    /** 見出し (17px, 700) */
    textHeading: {
      fontSize: f.xl,
      fontWeight: WEIGHT.bold,
      color: t.text,
    },
    /** 小見出し / カード名 (15px, 700) */
    textSubheading: {
      fontSize: f.lg,
      fontWeight: WEIGHT.bold,
      color: t.text,
    },
    /** 本文 (14px, 400) */
    textBody: {
      fontSize: f.base,
      color: t.text,
      lineHeight: Math.round(20 * scale),
    },
    /** 本文太字 (14px, 700) */
    textBodyBold: {
      fontSize: f.base,
      fontWeight: WEIGHT.bold,
      color: t.text,
    },
    /** ラベル (13px, 600) */
    textLabel: {
      fontSize: f.md,
      fontWeight: WEIGHT.semibold,
      color: t.sub,
    },
    /** メタ情報 (12px, 400) */
    textMeta: {
      fontSize: f.sm,
      color: t.muted,
    },
    /** メタ情報太字 (12px, 600) */
    textMetaBold: {
      fontSize: f.sm,
      fontWeight: WEIGHT.semibold,
      color: t.muted,
    },
    /** キャプション (11px, 600) */
    textCaption: {
      fontSize: f.xs,
      fontWeight: WEIGHT.semibold,
      color: t.sub,
    },
    /** 極小ラベル (10px, 700) */
    textBadge: {
      fontSize: f.xxs,
      fontWeight: WEIGHT.bold,
      color: t.sub,
    },
    /** セクションヘッダーラベル (12px, 700, uppercase) */
    textSectionLabel: {
      fontSize: f.sm,
      fontWeight: WEIGHT.bold,
      letterSpacing: 0.5,
      color: t.sub,
    },

    // ── レイアウト ────────────────────────────────────
    /** 画面ルート */
    screen: {
      flex: 1,
      backgroundColor: t.bg,
    },
    /** 横並び中央揃え */
    row: {
      flexDirection: "row" as const,
      alignItems: "center" as const,
    },
    /** 横並び中央揃え + 均等配置 */
    rowBetween: {
      flexDirection: "row" as const,
      alignItems: "center" as const,
      justifyContent: "space-between" as const,
    },

    // ── カード ────────────────────────────────────────
    /** 基本カード */
    card: {
      backgroundColor: t.surface,
      borderRadius: RADIUS.xl,
      borderWidth: 1,
      borderColor: t.border,
      padding: SPACE.lg,
    },
    /** 強調カード（ボーダー付き） */
    cardAccent: {
      backgroundColor: t.surface,
      borderRadius: RADIUS.xl,
      borderWidth: 1.5,
      borderColor: t.accent + "35",
      padding: SPACE.lg,
    },

    // ── 入力 ─────────────────────────────────────────
    /** テキスト入力 */
    input: {
      backgroundColor: t.surface,
      borderWidth: 1,
      borderColor: t.border,
      borderRadius: RADIUS.md,
      padding: SPACE.md,
      fontSize: FONT_SIZE.lg,
      color: t.text,
    },

    // ── ボタン ────────────────────────────────────────
    /** アイコンボタン（丸） */
    iconButton: {
      width: 38,
      height: 38,
      borderRadius: 19,
      alignItems: "center" as const,
      justifyContent: "center" as const,
      backgroundColor: t.surface2,
      borderWidth: 1,
      borderColor: t.border,
    },

    // ── 区切り ────────────────────────────────────────
    /** セクション間のサーフェス背景 */
    surfaceSection: {
      backgroundColor: t.surface,
      borderTopWidth: 1,
      borderTopColor: t.border,
      borderBottomWidth: 1,
      borderBottomColor: t.border,
    },
  });
};

// ═══════════════════════════════════════════════════════════════
// 型エクスポート
// ═══════════════════════════════════════════════════════════════

export type AppStyles = ReturnType<typeof createStyles>;
